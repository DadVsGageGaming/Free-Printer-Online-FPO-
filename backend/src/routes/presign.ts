import express from "express";
import { createPresignedPost } from "../services/s3";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// GET /api/presign?count=3
router.get("/", async (req, res) => {
  const count = Math.min(Math.max(parseInt((req.query.count as string) || "1"), 1), 5);
  try {
    const posts = [];
    for (let i = 0; i < count; i++) {
      const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
      const post = await createPresignedPost(key);
      posts.push({ key, post });
    }
    res.json({ uploads: posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create presigned posts" });
  }
});

export default router;
