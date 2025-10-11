import React, { useState } from "react";
import "../index.css";

export default function AuthCard({ onSubmit, type = "login", isMentor }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: isMentor ? "mentor" : "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="auth-card">
      <h2>{type === "login" ? "Login" : "Register"} {isMentor ? "Mentor" : "Student"}</h2>
      <form onSubmit={handleSubmit}>
        {type === "register" && (
          <input
            className="auth-input"
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          className="auth-input"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="auth-btn" type="submit">
          {type === "login" ? "Login" : "Register"}
        </button>
      </form>
    </div>
  );
}
