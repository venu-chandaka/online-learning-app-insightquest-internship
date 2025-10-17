
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import "./loginpage.css";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleLogin = async e => {
  e.preventDefault();
  console.log("Login button clicked", form, role);
  setError(null);
  try {
    const data = await login(role, form.email, form.password);
    if (data && data.success) {
      // optional: store user data if server returns it
      alert("Login successful!");
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      if(role === "student"){
        navigate('/stdashboard');
      }
      else{
        navigate('/mentordashboard');
      } 
    } else {
      setError(data?.message || 'Login failed');
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
        <h2 className="login-title">{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder={role === "student" ? "Student Email" : "Mentor Email"}
            value={form.email}
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="login-input"
          />
          <button className="login-btn" type="submit">Log In</button>
          {error && <p style={{ color: "tomato", marginTop: "10px" }}>{error}</p>}
        </form>

        <div className="login-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span> | </span>
          <Link to="/register">Register</Link>
        </div>
      </div>
      <div className="login-bg-glass"></div>
    </div>
  );
}
