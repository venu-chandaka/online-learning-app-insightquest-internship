import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // update the path as needed
import axios from "axios";
import { stdetails} from "../api/studentDetails";
import { filter } from "framer-motion/client";
export default function StudentDashboard() {
  const [student, setStudentName] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all available courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, courseRes] = await Promise.all([
            stdetails(),
          axios.get("http://localhost:4000/api/course/all", { withCredentials: true }),
        ]);

        if (studentRes.success && studentRes.stData?.name) {
          setStudentName(studentRes.stData.name);
        }

        setCourses(courseRes.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Logout
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/api/stauth/stlogout", {}, { withCredentials: true });
      window.location.href = "/"; // redirect to login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Enroll course
  const handleEnroll = async (courseId) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/student/enroll",
        { courseId },
        { withCredentials: true }
      );
      alert(res.data.message);
    } catch (err) {
      alert("Enrollment failed");
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Navbar */}
      <motion.nav
        style={styles.navbar}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div style={styles.logoContainer}>
          <img src="isqLogo.png" alt="Logo" style={styles.logoImg} />
          <span style={styles.roleTag}>Student</span>
        </div>

        <div style={styles.navLinks}>
          {["Home", "My Courses", "Profile"].map((item, index) => (
            <motion.a
              key={index}
              href="#"
              style={styles.navLink}
              whileHover={{
                scale: 1.1,
                color: "#a5b4fc",
                textShadow: "0px 0px 8px rgba(129,140,248,0.8)",
              }}
            >
              {item}
            </motion.a>
          ))}
        </div>

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.logoutBtn}
        >
          Logout
        </motion.button>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={styles.hero}
      >
        <h1 style={styles.heading}>
          Welcome back, <span style={styles.highlight}>{student} 👋</span>
        </h1>
        <p style={styles.subText}>
          Learn from top mentors and level up your skills. Explore our latest
          courses and start your journey today.
        </p>
      </motion.section>

      {/* Courses */}
      <section style={styles.courseSection}>
        <h2 style={styles.sectionTitle}>Available Courses</h2>
        {loading ? (
          <p style={styles.loading}>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p style={styles.noCourses}>No courses available yet 😕</p>
        ) : (
          <div style={styles.courseGrid}>
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 15px rgba(129,140,248,0.3)",
                }}
                style={styles.courseCard}
              >
                <img
                  src={course.thumbnail || "https://via.placeholder.com/300x200"}
                  alt={course.title}
                  style={styles.courseImg}
                />
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <p style={styles.courseDesc}>{course.description}</p>
                <p style={styles.courseMentor}>
                  By {course.instructor?.name || "Unknown Mentor"}
                </p>
                <div style={styles.btnRow}>
                  <button
                    onClick={() => handleEnroll(course._id)}
                    style={styles.enrollBtn}
                  >
                    Enroll
                  </button>
                  <a href={`/watch/${course._id}`} style={styles.watchLink}>
                    Watch →
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} InsightQuestLearner. All rights reserved.
      </footer>
    </div>
  );
}

// 🎨 Internal CSS Styles
const styles = {
  wrapper: {
    minHeight: "100vh",
    width: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    overflowY: "auto",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 30%,#4b5bf3b8 0%,#141629 100%)",
    color: "#fff",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "calc(100%)",
    padding: "0px 0px 0px 0px",
    background: "rgba(0,0,0,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "0 0 20px 20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoImg: {
    width: "200px",
    filter: "drop-shadow(0 0 6px rgba(0,0,0,0.3))"
  },
  roleTag: {
    background: "rgba(99,102,241,0.2)",
    border: "1px solid rgba(129,140,248,0.4)",
    color: "#a5b4fc",
    padding: "3px 10px",
    borderRadius: "10px",
    fontSize: "0.8rem",
    marginLeft: "8px",
  },
  navLinks: {
    display: "flex",
    gap: "25px",
  },
  navLink: {
    textDecoration: "none",
    color: "#cbd5e1",
    fontWeight: "500",
    fontSize: "1rem",
    transition: "0.3s",
  },
  logoutBtn: {
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    marginRight: "20px",
    transition: "0.3s",
  },
  hero: {
    textAlign: "center",
    marginTop: "70px",
  },
  heading: {
    fontSize: "2.8rem",
    fontWeight: "700",
    marginBottom: "15px",
  },
  highlight: {
    color: "#818cf8",
  },
  subText: {
    color: "#94a3b8",
    fontSize: "1.1rem",
    maxWidth: "650px",
    margin: "0 auto",
  },
  courseSection: {
    padding: "60px 80px",
  },
  sectionTitle: {
    color: "#a5b4fc",
    fontSize: "1.6rem",
    marginBottom: "25px",
  },
  loading: { color: "#cbd5e1" },
  noCourses: { color: "#cbd5e1" },
  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  courseCard: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "15px",
    padding: "20px",
    backdropFilter: "blur(20px)",
    transition: "all 0.3s ease",
  },
  courseImg: {
    width: "100%",
    height: "180px",
    borderRadius: "10px",
    objectFit: "cover",
    marginBottom: "15px",
  },
  courseTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "8px",
  },
  courseDesc: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    marginBottom: "10px",
  },
  courseMentor: {
    color: "#818cf8",
    fontSize: "0.9rem",
    marginBottom: "15px",
  },
  btnRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  enrollBtn: {
    background: "#6366f1",
    border: "none",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
  },
  watchLink: {
    color: "#a5b4fc",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  footer: {
    textAlign: "center",
    padding: "25px",
    fontSize: "0.85rem",
    color: "#64748b",
    borderTop: "1px solid rgba(255,255,255,0.15)",
    marginTop: "80px",
  },
};
