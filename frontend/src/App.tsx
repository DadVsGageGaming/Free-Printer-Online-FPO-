import React from "react";
import UploadForm from "./components/UploadForm";
import AdminLogin from "./components/AdminLogin";

export default function App() {
  return (
    <div className="app">
      <header className="hero">
        <h1>Free Printer Online</h1>
        <p>Upload up to 5 images. We'll print and mail them to you.</p>
      </header>
      <main className="container">
        <UploadForm />
        <hr />
        <AdminLogin />
      </main>
    </div>
  );
}
