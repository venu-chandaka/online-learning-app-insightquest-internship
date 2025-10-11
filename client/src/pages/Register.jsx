import React from "react";
import AuthCard from "../components/AuthCard.jsx";
import { register } from "../api/auth.js";
import "../index.css";

export default function RegisterPage() {
  const handleRegister = async (form) => {
    try {
      await register(form);
      window.location.href = "/login";
    } catch (e) {
      alert(e.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-bg">
      <div className="form-grouped">
        <AuthCard onSubmit={handleRegister} type="register" isMentor={false} />
        <AuthCard onSubmit={handleRegister} type="register" isMentor={true} />
      </div>
    </div>
  );
}
