import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import presignRouter from "./routes/presign";
import ordersRouter from "./routes/orders";
import adminRouter from "./routes/admin";
import { initQueue } from "./services/qcQueue";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());

app.use("/api/presign", presignRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

const port = process.env.APP_PORT || 4000;
app.listen(port, async () => {
  console.log(`Backend listening on ${port}`);
  await initQueue();
});
