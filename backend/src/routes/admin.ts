import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Pool } from "pg";
import adminAuth from "../utils/adminAuth";

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();

// Simple admin list orders (requires basic auth header checked by middleware)
router.use(adminAuth);

router.get("/orders", async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT o.*, json_agg(json_build_object(
        'id', i.id, 's3_key', i.s3_key, 'filename', i.filename, 'qc_status', i.qc_status, 'qc_notes', i.qc_notes
      ) ORDER BY i.created_at) as images
      FROM orders o
      LEFT JOIN images i ON i.order_id=o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  } finally {
    client.release();
  }
});

export default router;
