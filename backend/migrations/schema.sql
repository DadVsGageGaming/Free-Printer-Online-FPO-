-- Orders and images schema (Postgres)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  name text,
  address jsonb,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  s3_key text NOT NULL,
  filename text,
  width int,
  height int,
  mime text,
  qc_status text DEFAULT 'pending', -- pending, pass, warn, fail
  qc_notes jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_images_order_id ON images(order_id);
