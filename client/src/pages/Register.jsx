import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth'; // Your API utility
import "./loginpage.css";

export default function RegisterPage() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [mentorForm, setMentorForm] = useState({ name: "", email: "", password: "", expertise: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Update handlers for both forms
  const handleChange = (e) => {
    if (role === "student") {
      setForm({ ...form, [e.target.name]: e.target.value });
    } else {
      setMentorForm({ ...mentorForm, [e.target.name]: e.target.value });
    }
  };

  // Custom register function to include expertise for mentors
  const handleRegister = async e => {
    e.preventDefault();
    setError(null); setSuccess("");
    try {
      let data;
      if (role === "student") {
        data = await register(role, form.name, form.email, form.password);
      } else {
        // Pass expertise for mentor
        data = await register(role, mentorForm.name, mentorForm.email, mentorForm.password, mentorForm.expertise);
      }
      if (data && data.success) {
        setSuccess("Registration successful! Please log in.");
        setForm({ name: "", email: "", password: "" });
        setMentorForm({ name: "", email: "", password: "", expertise: "" });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err?.message || 'Network error');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-glass-card">
        <div className="login-tabs">
          <button className={role === "student" ? "selected" : ""} onClick={() => setRole("student")}>Student</button>
          <button className={role === "mentor" ? "selected" : ""} onClick={() => setRole("mentor")}>Mentor</button>
        </div>
        <h2 className="login-title">{role.charAt(0).toUpperCase() + role.slice(1)} Registration</h2>

        <form className="login-form" onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder={role === "student" ? "Student Name" : "Mentor Name"}
            value={role === "student" ? form.name : mentorForm.name}
            onChange={handleChange}
            required
            className="login-input"
            autoComplete="off"
          />
          <input
            type="email"
            name="email"
            placeholder={role === "student" ? "Student Email" : "Mentor Email"}
            value={role === "student" ? form.email : mentorForm.email}
            onChange={handleChange}
            required
            className="login-input"
            autoComplete="off"
          />
          {role === "mentor" && (
            <input
              type="text"
              name="expertise"
              placeholder="Expertise (e.g. AI, DSA, Web Dev)"
              value={mentorForm.expertise}
              onChange={handleChange}
              required
              className="login-input"
              autoComplete="off"
            />
          )}
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={role === "student" ? form.password : mentorForm.password}
              onChange={handleChange}
              required
              className="login-input"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              style={{
                position: "absolute",
                right: 16,
                top: 11,
                background: "transparent",
                border: "none",
                fontSize: "1.22rem",
                color: "#7edcf6",
                cursor: "pointer",
                outline: "none",
              }}
              tabIndex={-1}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
          <button className="login-btn" type="submit">Register</button>
          {error && <p style={{ color: "tomato", marginTop: "10px" }}>{error}</p>}
          {success && <p style={{ color: "#16fcc0", marginTop: "10px" }}>{success}</p>}
        </form>
        <div className="login-links">
          <Link to="/login">Already registered? Login</Link>
        </div>
      </div>
      <div className="login-bg-glass"></div>
    </div>
  );
}
