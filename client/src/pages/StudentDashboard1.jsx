import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [newLesson, setNewLesson] = useState({ title: "", type: "video", contentUrl: "" });
  const [selectedCourse, setSelectedCourse] = useState("");
  const [showAlert, setShowAlert] = useState(false); // 👈 Modal toggle

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorRes = await axios.get("http://localhost:4000/api/mentor/get-data", { withCredentials: true });
        const courseRes = await axios.get("http://localhost:4000/api/course/mycources", { withCredentials: true });
        const mentorObj = mentorRes.data.mentorData || mentorRes.data.mentor || {};
        setMentor(mentorObj);
        setCourses(courseRes.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/api/mentor/logout", {}, { withCredentials: true });
      window.location.href = "/mentor-login";
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async () => {
    if (!mentor?.isAccountVerified) return setShowAlert(true);
    if (!newCourse.title || !newCourse.description) return alert("Fill all fields");
    try {
      const res = await axios.post(
        "http://localhost:4000/api/course/create",
        { ...newCourse },
        { withCredentials: true }
      );
      alert("Course created successfully!");
      setCourses([...courses, res.data.course]);
      setNewCourse({ title: "", description: "" });
    } catch (err) {
      alert("Failed to create course");
    }
  };

  const handleAddLesson = async () => {
    if (!mentor?.isAccountVerified) return setShowAlert(true);
    if (!selectedCourse || !newLesson.title || !newLesson.contentUrl)
      return alert("Fill all fields");
    try {
      await axios.post(
        "http://localhost:4000/api/lesson/add",
        { courseId: selectedCourse, ...newLesson },
        { withCredentials: true }
      );
      alert("Lesson added!");
      setNewLesson({ title: "", type: "video", contentUrl: "" });
    } catch (err) {
      alert("Failed to add lesson");
    }
  };
  if (loading)
    return <div style={{ color: "#fff", textAlign: "center", marginTop: "60px",  }}>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      {/* Navbar */}
      <motion.nav style={styles.navbar} initial={{ y: -60 }} animate={{ y: 0 }} transition={{ duration: 0.8 }}>
        <div style={styles.logoContainer}>
          <img src="/isqlogo.svg" alt="logo" style={styles.logoImg} />
          <span style={styles.logoText}>InsightQuestLearner</span>
        </div>
        <div style={styles.navLinks}>
          {["Dashboard", "Courses", "Profile"].map((nav) => (
            <motion.a
              key={nav}
              href="#"
              whileHover={{ scale: 1.1, color: "#a5b4fc" }}
              style={styles.link}
            >
              {nav}
            </motion.a>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.05 }} onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </motion.button>
      </motion.nav>

      {/* Profile */}
      <motion.section style={styles.profileCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 style={styles.name}>{mentor?.name || "N/A"}</h2>
        <p style={styles.email}>{mentor?.email}</p>
        <p style={styles.detail}>Expertise: {mentor.expertise?.join(", ") || "N/A"}</p>
        <p style={styles.detail}>Students: {mentor.students?.length || 0}</p>

        {mentor.isAccountVerified ? (
          <div style={styles.verifiedBadge}>✔ Verified Mentor</div>
        ) : (
          <div style={styles.notVerifiedBadge}>❌ Not Verified</div>
        )}
      </motion.section>

      {/* Create Course */}
      <section style={styles.section}>
        <h3 style={styles.heading}>Create Course</h3>
        <input
          style={styles.input}
          placeholder="Course Title"
          value={newCourse.title}
          onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
        />
        <textarea
          style={styles.textarea}
          placeholder="Course Description"
          value={newCourse.description}
          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
        />
        <button style={styles.createBtn} onClick={handleCreateCourse}>
          Create
        </button>
      </section>

      {/* Add Lesson */}
      <section style={styles.section}>
        <h3 style={styles.heading}>Add Lesson</h3>
        <select style={styles.input} onChange={(e) => setSelectedCourse(e.target.value)} value={selectedCourse}>
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
        <input
          style={styles.input}
          placeholder="Lesson Title"
          value={newLesson.title}
          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
        />
        <select
          style={styles.input}
          value={newLesson.type}
          onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}
        >
          <option value="video">Video</option>
          <option value="text">Text</option>
        </select>
        <input
          style={styles.input}
          placeholder="Lesson URL or Text"
          value={newLesson.contentUrl}
          onChange={(e) => setNewLesson({ ...newLesson, contentUrl: e.target.value })}
        />
        <button style={styles.createBtn} onClick={handleAddLesson}>
          Add
        </button>
      </section>

      {/* Courses */}
      <motion.section style={styles.courseList} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 style={styles.heading}>Your Courses</h3>
        <div style={styles.grid}>
          {courses.map((c) => (
            <motion.div key={c._id} style={styles.courseCard} whileHover={{ scale: 1.03 }}>
              <h4 style={styles.courseTitle}>{c.title}</h4>
              <p style={styles.courseDesc}>{c.description}</p>
              <p style={styles.courseStudents}>Students: {c.enrolledStudents?.length || 0}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 🧊 Verification Modal */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            style={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.modalBox}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ color: "#a5b4fc", marginBottom: "10px" }}>Account Verification Required</h3>
              <p style={{ color: "#cbd5e1" }}>
                You must verify your mentor account before creating or modifying courses.
              </p>
              <button onClick={() => setShowAlert(false)} style={styles.modalBtn}>
                Okay
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.85))",
    color: "#fff",
    fontFamily: "'Poppins', sans-serif",
    backdropFilter: "blur(15px)",
    paddingBottom: "80px",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(15px)",
  },
  logoContainer: { display: "flex", alignItems: "center", gap: "10px" },
  logoImg: { width: "40px" },
  logoText: { fontSize: "1.5rem", color: "#a5b4fc", fontWeight: "700" },
  navLinks: { display: "flex", gap: "25px" },
  link: { color: "#cbd5e1", textDecoration: "none", fontWeight: "500" },
  logoutBtn: {
    background: "#6366f1",
    border: "none",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  profileCard: {
    textAlign: "center",
    background: "rgba(255,255,255,0.05)",
    margin: "40px auto",
    width: "70%",
    padding: "25px",
    borderRadius: "20px",
  },
  name: { fontSize: "1.8rem", fontWeight: "700" },
  email: { color: "#94a3b8" },
  detail: { color: "#a5b4fc", marginTop: "5px" },
  verifiedBadge: {
    marginTop: "10px",
    background: "rgba(99,102,241,0.2)",
    padding: "5px 15px",
    borderRadius: "10px",
    color: "#a5b4fc",
  },
  notVerifiedBadge: {
    marginTop: "10px",
    background: "rgba(239,68,68,0.15)",
    padding: "5px 15px",
    borderRadius: "10px",
    color: "#f87171",
  },
  section: {
    width: "70%",
    margin: "30px auto",
    background: "rgba(255,255,255,0.05)",
    padding: "25px",
    borderRadius: "15px",
  },
  heading: { color: "#a5b4fc", fontWeight: "600", marginBottom: "15px" },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    minHeight: "80px",
  },
  createBtn: {
    background: "#6366f1",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  courseList: { width: "80%", margin: "50px auto" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  courseCard: {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "10px",
  },
  courseTitle: { fontWeight: "600", color: "#a5b4fc" },
  courseDesc: { color: "#94a3b8", fontSize: "0.9rem", margin: "10px 0" },
  courseStudents: { fontSize: "0.85rem", color: "#818cf8" },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  modalBox: {
    background: "rgba(30,41,59,0.9)",
    border: "1px solid rgba(129,140,248,0.3)",
    padding: "30px 40px",
    borderRadius: "15px",
    textAlign: "center",
    width: "400px",
    boxShadow: "0 0 25px rgba(99,102,241,0.2)",
  },
  modalBtn: {
    marginTop: "20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};
