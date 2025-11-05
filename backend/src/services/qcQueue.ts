import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { Pool } from "pg";

dotenv.config();
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");
const queue = new Queue("qc", { connection });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initQueue() {
  // Start a worker in-process to run QC by calling the Python script
  const worker = new Worker("qc", async job => {
    const { imageId, orderId, s3Key } = job.data;
    console.log("QC worker processing", imageId, s3Key);

    // call python qc script with s3Key (we'll download from S3 within script)
    // For simplicity we assume s3:// URLs are not used; the Python script accepts s3_key and environment vars
    return await runPythonQC(s3Key, imageId);
  }, { connection });
  worker.on("completed", async (job, result) => {
    console.log("QC job completed", job.id);
    const { imageId } = job.data as any;
    // Save QC results in DB
    const client = await pool.connect();
    try {
      const qc = result as any;
      await client.query(
        "UPDATE images SET width=$1, height=$2, qc_status=$3, qc_notes=$4 WHERE id=$5",
        [qc.width, qc.height, qc.qc_status, JSON.stringify(qc.qc_notes || {}), imageId]
      );
      // Optionally update order status when all images done (left as exercise)
    } catch (err) {
      console.error("DB update failed", err);
    } finally {
      client.release();
    }
  });
  worker.on("failed", (job, err) => {
    console.error("QC job failed", job?.id, err);
  });
}

export async function addImageToQueue(payload: { imageId: string; orderId: string; s3Key: string; }) {
  await queue.add("qc-job", payload);
}

function runPythonQC(s3Key: string, imageId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const py = spawn("python3", ["qc/qc_wrapper.py", s3Key]);
    let out = "";
    let err = "";
    py.stdout.on("data", d => (out += d.toString()));
    py.stderr.on("data", d => (err += d.toString()));
    py.on("close", code => {
      if (code !== 0) {
        return reject(new Error(`QC python exited ${code}: ${err}`));
      }
      try {
        const json = JSON.parse(out);
        return resolve(json);
      } catch (e) {
        return reject(e);
      }
    });
  });
}
