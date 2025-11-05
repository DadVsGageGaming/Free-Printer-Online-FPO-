import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Pool } from "pg";
import dotenv from "dotenv";
import { addImageToQueue } from "../services/qcQueue";

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();

// Create an order after frontend uploads files directly to S3
router.post("/", async (req, res) => {
  const { email, name, address, images } = req.body;
  if (!email || !images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "missing fields" });
  }
  if (images.length > Number(process.env.MAX_UPLOAD_FILES || 5)) {
    return res.status(400).json({ error: "too many images" });
  }
  const client = await pool.connect();
  try {
    const orderId = uuidv4();
    await client.query(
      "INSERT INTO orders(id,email,name,address,status) VALUES($1,$2,$3,$4,'uploaded')",
      [orderId, email, name || null, address || {}]
    );
    for (const img of images) {
      const imageId = uuidv4();
      await client.query(
        "INSERT INTO images(id,order_id,s3_key,filename,mime) VALUES($1,$2,$3,$4,$5)",
        [imageId, orderId, img.key, img.filename || null, img.mime || null]
      );
      // enqueue QC job for image
      await addImageToQueue({ imageId, orderId, s3Key: img.key });
    }
    res.json({ orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create order" });
  } finally {
    client.release();
  }
});

export default router;
