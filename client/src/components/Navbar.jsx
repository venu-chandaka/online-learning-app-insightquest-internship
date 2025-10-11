import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  return (
    <nav className="main-navbar">
      <img src="isqLogo.png" className="navbar-logo" alt="Logo" />
      <ul className="navbar-menu">
        <li><Link to="/courses">Courses</Link></li>
        <li><Link to="/code">Practice</Link></li>
        <li><Link to="/mentors">Mentors</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <Link to="/login" className="navbar-login">
        Log in <span className="arrow">→</span>
      </Link>
    </nav>
  );
}
