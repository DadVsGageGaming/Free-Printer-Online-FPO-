# Free Printer Online — MVP scaffold

This repository contains a working MVP scaffold for "Free Printer Online" — users can upload up to 5 images, create an order (guest checkout), images are QC-checked automatically, and an admin dashboard shows orders and QC results. Theme is purple → blue.

What's included
- Frontend: React + TypeScript (Vite). Upload form with direct S3 presigned uploads.
- Backend: Node.js + TypeScript + Express. Presign endpoints, order creation, admin endpoints.
- Background QC worker: Node queue (BullMQ) that calls a Python QC script for each image.
- Python QC script: uses Pillow + OpenCV to compute resolution and Laplacian variance (blur).
- Database: Postgres schema provided.
- Queue: Redis (BullMQ).
- Docker Compose: runs Postgres, Redis, backend, frontend, qc worker.

Quickstart (Docker)
1. Copy .env.example to .env and fill values.
2. docker compose up --build
3. Frontend UI: http://localhost:5173
4. Admin UI: http://localhost:5173/admin (login with ADMIN_USERNAME / ADMIN_PASSWORD from .env)

Local dev (without Docker)
- Start Postgres and Redis separately.
- Follow install steps for backend and frontend in respective folders.

Notes
- This is an MVP. Replace stubs (SendGrid, shipping label integrations) before production.
- Tuning QC thresholds is required in production.
- Admin auth uses simple env-provided credentials (bcrypt hash). Replace with a proper user system + 2FA for production.
