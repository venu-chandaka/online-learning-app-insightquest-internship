import React from "react";
import Navbar from "../components/Navbar.jsx";
import "./homepage.css";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="hero">
        <div className="announcement">
          Join our Fall Coding Challenge! <a href="/code">Start now <span>→</span></a>
        </div>
        <h1 className="hero-title">Master Coding & Algorithms<br /> with InsightQuest</h1>
        <p className="hero-desc">
          Accelerate your learning with competitive programming, expert mentors, and hands-on projects.<br />
          Track your progress, collaborate with peers, and unlock your full potential!
        </p>
        <div className="hero-actions">
          <button className="cta-primary">Get Started</button>
          <button className="cta-secondary">
            Learn More <span className="arrow">→</span>
          </button>
        </div>
      </main>
      <div className="bg-gradients"></div>
    </>
  );
}
