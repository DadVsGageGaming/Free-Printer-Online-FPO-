import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard({ auth }: { auth: { user: string; pass: string } }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = btoa(`${auth.user}:${auth.pass}`);
        const resp = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/admin/orders`, {
          headers: { Authorization: `Basic ${token}` }
        });
        setOrders(resp.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch orders (check credentials)");
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h3>Admin Dashboard</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        {orders.map(o => (
          <div key={o.id} className="order-card">
            <h4>Order {o.id} — {o.email} — {new Date(o.created_at).toLocaleString()}</h4>
            <p>Status: {o.status}</p>
            <ul>
              {o.images && o.images.map((img: any) => (
                <li key={img.id}>
                  <img src={`https://${import.meta.env.VITE_S3_BUCKET || "freeprints-dev"}.s3.amazonaws.com/${img.s3_key}`} alt={img.filename} style={{ maxWidth: 120 }} />
                  <div>{img.filename} — QC: {img.qc_status}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
