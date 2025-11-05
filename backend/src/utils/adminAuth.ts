import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export default function adminAuth(req: Request, res: Response, next: NextFunction) {
  // Expect Authorization: Basic base64(username:password)
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) return res.status(401).json({ error: "unauthorized" });
  const b = Buffer.from(header.split(" ")[1], "base64").toString("utf8");
  const [user, pass] = b.split(":");
  if (!user || !pass) return res.status(401).json({ error: "unauthorized" });

  const adminUser = process.env.ADMIN_USERNAME;
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  if (user !== adminUser) return res.status(401).json({ error: "unauthorized" });

  // compare provided password with bcrypt hash in env
  bcrypt.compare(pass, hash).then(ok => {
    if (!ok) return res.status(401).json({ error: "unauthorized" });
    next();
  }).catch(err => {
    console.error("bcrypt compare failed", err);
    res.status(500).json({ error: "server error" });
  });
}
