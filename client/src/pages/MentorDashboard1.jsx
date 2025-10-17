// src/pages/MentorDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './loginpage.css'; // Keep your neon glass theme

export default function MentorDashboard() {
  const [mentor, setMentor] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMentorData() {
      setLoading(true);
      setError("");
      try {
        // Critical: withCredentials for cookie-based auth!
        const res = await axios.get(
          'http://localhost:4000/api/mentor/get-data',
          { withCredentials: true }
        );
        // DEBUG: See the real API response structure in the console
        console.log("mentor API result:", res.data);

        // Use whatever key your backend provides (mentorData, mentor, etc)
        const mentorObj = res.data.mentorData || res.data.mentor || {};
        const courseArr =
          res.data.courses ||
          mentorObj.courses || // sometimes courses inside mentorData
          [];
        setMentor(mentorObj);
        setCourses(Array.isArray(courseArr) ? courseArr : []);
      } catch (err) {
        // Show the full backend error in console
        console.log(
          "mentor API error:",
          err?.response?.data || err.message || err
        );
        let msg =
          err?.response?.data?.message ||
          err?.message ||
          "Unknown error loading mentor data";
        // Special case: 401 Unauthorized
        if (
          err?.response?.status === 401 ||
          msg.toLowerCase().includes("unauthorized")
        ) {
          msg =
            "You are not logged in or your session expired. Please log in again as a mentor.";
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchMentorData();
  }, []);

  if (loading) return <div style={{color:'#0ac6e7'}}>Loading Mentor Dashboard...</div>;
  if (error)
    return (
      <div style={{ color: "tomato", textAlign: "center", marginTop: 50 }}>
        <b>Error:</b> {error}
        <br />
        <button
          onClick={() => window.location.href = "/login"}
          style={{
            background: "#161B57",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 26px",
            marginTop: 18,
            border: "none",
            fontWeight: 700,
            fontSize: "1rem",
            boxShadow: "0 2px 12px #0ac6e744",
            cursor: "pointer"
          }}
        >Go to Login</button>
      </div>
    );

  return (
    <div className="login-bg">
      <div className="login-glass-card">
        <h1 className="login-title">Mentor Dashboard</h1>
        <div style={{ marginBottom: "2rem" }}>
          <strong>Name:</strong> {mentor.name || "N/A"} <br />
          <strong>Email:</strong> {mentor.email || "N/A"} <br />
          <strong>Expertise:</strong>{" "}
          {Array.isArray(mentor.expertise)
            ? mentor.expertise.join(", ")
            : mentor.expertise || "N/A"}
          <br />
          {mentor.experience !== undefined && (
            <>
              <strong>Experience:</strong> {mentor.experience} yrs <br />
            </>
          )}
        </div>
        <h2>Courses Created: {courses.length}</h2>
        <ul>
          {courses.length === 0 && <li>No courses created yet.</li>}
          {courses.map((course) => (
            <li key={course._id}>
              <strong>{course.title}</strong>
              <br />
              {course.description}
              <br />
              Students Enrolled:{" "}
              {Array.isArray(course.enrolledStudents)
                ? course.enrolledStudents.length
                : 0}
              <br />
            </li>
          ))}
        </ul>
        {/* Add actions (Create/Edit/Delete Course) here */}
      </div>
      <div className="login-bg-glass"></div>
    </div>
  );
}
