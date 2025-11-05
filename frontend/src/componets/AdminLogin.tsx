import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";

export default function AdminLogin() {
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  if (logged) return <AdminDashboard auth={{ user, pass }} />;

  return (
    <div>
      <h2>Admin</h2>
      <div>
        <input placeholder="username" value={user} onChange={e => setUser(e.target.value)} />
      </div>
      <div>
        <input placeholder="password" type="password" value={pass} onChange={e => setPass(e.target.value)} />
      </div>
      <div>
        <button className="btn-primary" onClick={() => setLogged(true)}>Login</button>
      </div>
    </div>
  );
}
