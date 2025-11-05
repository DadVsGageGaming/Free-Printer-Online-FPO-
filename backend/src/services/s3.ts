import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.S3_REGION;
const bucket = process.env.S3_BUCKET;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
});

export async function createPresignedPost(key: string) {
  if (!bucket) throw new Error("S3 bucket not configured");
  const post = await createPresignedPost(s3, {
    Bucket: bucket,
    Key: key,
    Conditions: [
      ["content-length-range", 1, Number(process.env.MAX_FILE_SIZE_BYTES || 20971520)]
    ],
    Expires: 3600
  });
  return post;
}
