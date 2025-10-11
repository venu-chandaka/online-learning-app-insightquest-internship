import React, { useEffect, useState } from "react";
import { stdetails } from "../api/studentDetails"; // update the path as needed

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await stdetails();
        if (response.success && response.stData) {
          setStudent(response.stData);
        } else {
          setError("No student data found.");
        }
      } catch (err) {
        setError(err?.message || "Request failed.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, []);

  if (loading) return <div style={styles.center}><div className="loader"></div>Loading...</div>;
  if (error) return <div style={styles.center}><p style={{ color: "tomato" }}>{error}</p></div>;
  if (!student) return <div style={styles.center}><p>No student details available.</p></div>;

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <div style={styles.avatar}>{(student.name || "S").charAt(0).toUpperCase()}</div>
        <h2 style={styles.heading}>Welcome, <span style={{color:"#2962ff"}}>{student.name}</span></h2>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.label}>Email:</td>
              <td><a href={`mailto:${student.email}`} style={styles.link}>{student.email}</a></td>
            </tr>
            <tr>
              <td style={styles.label}>Account Verified:</td>
              <td>{student.isAccountVerified ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td style={styles.label}>Roll:</td>
              <td>{student.roll || <span style={styles.na}>N/A</span>}</td>
            </tr>
            <tr>
              <td style={styles.label}>Course:</td>
              <td>{student.course || <span style={styles.na}>N/A</span>}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <style>
        {`
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 2s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}

// CSS-in-JS styles
const styles = {
  outer: {
    minHeight: "100vh",
    background: "#f5f7fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    background: "#fff",
    padding: "2rem 2.5rem",
    borderRadius: "10px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
    minWidth: "325px",
    textAlign: "center"
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#e3e9fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    margin: "0 auto 1rem",
    color: "#2962ff",
    fontWeight: "bold"
  },
  heading: {
    marginBottom: "1.5rem"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    margin: "0 auto"
  },
  label: {
    textAlign: "right",
    fontWeight: "bold",
    paddingRight: "0.75em",
    color: "#607d8b",
    fontSize: "1rem",
    width: "45%"
  },
  link: {
    color: "#2962ff",
    textDecoration: "none"
  },
  na: {
    color: "#aaa"
  },
  center: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.1rem"
  }
};
