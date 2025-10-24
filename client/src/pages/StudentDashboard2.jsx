import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [infoMessage, setInfoMessage] = useState("");
  const [student, setStudent] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, allCoursesRes, myCoursesRes] = await Promise.all([
        axios.get("http://localhost:4000/api/student/get-data", { withCredentials: true }),
        axios.get("http://localhost:4000/api/course/all", { withCredentials: true }),
        axios.get("http://localhost:4000/api/student/enrolled-courses", { withCredentials: true }),
      ]);

      setStudent(studentRes.data.stData || {});
      setAllCourses(allCoursesRes.data.courses || []);
      setMyCourses(myCoursesRes.data.courses || []);
    } catch (err) {
      setInfoMessage("⚠️ Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isEnrolled = (courseId) => myCourses.some((c) => String(c._id) === String(courseId));

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/api/stauth/stlogout", {}, { withCredentials: true });
      window.location.href = "/login";
    } catch {
      setInfoMessage("Logout failed.");
    }
  };

  const enrollCourse = async (courseId) => {
    if (!student?.isAccountVerified) {
      setShowVerifyModal(true);
      setInfoMessage("⚠️ Please verify your account before enrolling.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:4000/api/student/enroll",
        { courseId },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setInfoMessage("✅ Enrolled successfully!");
        await fetchData(); // sync state
      } else {
        setInfoMessage(res.data?.message || "Enroll failed");
      }
    } catch (err) {
      setInfoMessage(err?.response?.data?.message || "Enroll failed");
    }
  };

  if (loading)
    return <div style={styles.loadingWrap}>Loading...</div>;

  return (
    <div style={styles.pageWrap}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <img src="/isqlogo.svg" alt="logo" style={styles.brandLogo} />
          <div>
            <div style={styles.brandTitle}>InsightQuestLearner</div>
            <div style={styles.roleSmall}>Student</div>
          </div>
        </div>
        <nav style={styles.sideNav}>
          <a style={styles.activeSideLink}>Dashboard</a>
          <a style={styles.sideLink}>My Courses</a>
          <a style={styles.sideLink}>Available Courses</a>
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.smallMuted}>Signed in as</div>
          <div style={styles.sidebarName}>{student?.name || "Student"}</div>
        </div>
      </aside>

      {/* Main Section */}
      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <div style={styles.welcomeTitle}>
              Welcome back, <span style={styles.mentorName}>{student?.name}</span>
            </div>
            <div style={styles.welcomeSub}>Keep learning and growing 🚀</div>
          </div>
          <div style={styles.topbarRight}>
            {student?.isAccountVerified ? (
              <div style={styles.verifiedBadge}>✔ Verified</div>
            ) : (
              <div style={styles.notVerifiedBadge}>Not Verified</div>
            )}
            <button style={styles.topLogoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* My Courses */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>My Courses</h3>
          {myCourses.length === 0 ? (
            <div style={{ color: "#cbd5e1" }}>Not Enrolled in any courses.</div>
          ) : (
            <div style={styles.coursesList}>
              {myCourses.map((course) => (
                <div key={course._id} style={styles.courseRow}>
                  <div style={styles.courseLeft}>
                    <div style={styles.courseThumbWrap}>
                      <img
                        src={course.thumbnail || "/default_course.png"}
                        alt={course.title}
                        style={styles.courseThumb}
                      />
                    </div>
                    <div>
                      <div style={styles.courseTitle}>{course.title}</div>
                      <div style={styles.courseMeta}>{course.description}</div>
                    </div>
                  </div>
                  <button
                    style={styles.viewBtn}
                    onClick={() => navigate(`/student/course/${course._id}`)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Courses */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Available Courses</h3>
          <div style={styles.coursesList}>
            {allCourses.map((course) => {
              const enrolled = isEnrolled(course._id);
              return (
                <div key={course._id} style={styles.courseRow}>
                  <div style={styles.courseLeft}>
                    <div style={styles.courseThumbWrap}>
                      <img
                        src={course.thumbnail || "/default_course.png"}
                        alt={course.title}
                        style={styles.courseThumb}
                      />
                    </div>
                    <div>
                      <div style={styles.courseTitle}>{course.title}</div>
                      <div style={styles.courseMeta}>{course.description}</div>
                    </div>
                  </div>
                  <div style={styles.courseActions}>
                    <button
                      style={enrolled ? styles.primaryBtnDisabled : styles.primaryBtn}
                      disabled={enrolled}
                      onClick={() => enrollCourse(course._id)}
                    >
                      {enrolled ? "Enrolled" : "Enroll"}
                    </button>
                    <button
                      style={styles.viewBtn}
                      disabled={!enrolled}
                      onClick={() => navigate(`/student/course/${course._id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Glassy Verify Modal */}
      <AnimatePresence>
        {showVerifyModal && (
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
                Please verify your account before enrolling in courses.
              </p>
              <button
                onClick={() => setShowVerifyModal(false)}
                style={styles.modalBtn}
              >
                Okay
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Message */}
      <AnimatePresence>
        {infoMessage && (
          <motion.div
            style={styles.toast}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
          >
            <div>{infoMessage}</div>
            <button
              onClick={() => setInfoMessage("")}
              style={styles.toastClose}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  pageWrap: { display: "flex", minHeight: "100vh", background: "#0f172a", color: "#e6eef8" },
  sidebar: { width: 240, padding: 20, background: "rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.08)" },
  brand: { display: "flex", gap: 10, alignItems: "center" },
  brandLogo: { width: 42 },
  brandTitle: { fontWeight: 700, color: "#c7d2fe" },
  roleSmall: { fontSize: 12, color: "#94a3b8" },
  sideNav: { marginTop: 20, display: "flex", flexDirection: "column", gap: 8 },
  activeSideLink: { background: "rgba(99,102,241,0.12)", color: "#e6e9ff", padding: "8px 10px", borderRadius: 6 },
  sideLink: { padding: "8px 10px", color: "#cbd5e1" },
  sidebarFooter: { marginTop: "auto", fontSize: 13, color: "#94a3b8" },
  sidebarName: { marginTop: 4, fontWeight: 700 },
  main: { flex: 1, padding: 24 },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  welcomeTitle: { fontSize: 20, fontWeight: 700 },
  mentorName: { color: "#c7d2fe" },
  welcomeSub: { fontSize: 13, color: "#9aa9c7" },
  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  verifiedBadge: { background: "rgba(99,102,241,0.15)", color: "#c7d2fe", padding: "6px 10px", borderRadius: 999 },
  notVerifiedBadge: { background: "rgba(239,68,68,0.12)", color: "#fca5a5", padding: "6px 10px", borderRadius: 999 },
  topLogoutBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", padding: "8px 12px", borderRadius: 8, cursor: "pointer" },
  section: { background: "rgba(255,255,255,0.02)", padding: 18, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
  coursesList: { display: "flex", flexDirection: "column", gap: 10 },
  courseRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" },
  courseLeft: { display: "flex", gap: 12, alignItems: "center" },
  courseThumbWrap: { width: 80, height: 60, borderRadius: 8, overflow: "hidden" },
  courseThumb: { width: "100%", height: "100%", objectFit: "cover" },
  courseTitle: { fontWeight: 700, fontSize: 15 },
  courseMeta: { fontSize: 13, color: "#9aa9c7" },
  courseActions: { display: "flex", gap: 8 },
  primaryBtn: { background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "#fff", padding: "8px 14px", border: "none", borderRadius: 8, cursor: "pointer" },
  primaryBtnDisabled: { background: "rgba(255,255,255,0.03)", color: "#9aa9c7", padding: "8px 14px", borderRadius: 8 },
  viewBtn: { background: "rgba(255,255,255,0.05)", color: "#cbd5e1", padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(10px)" },
  modalBox: { background: "rgba(30,41,59,0.9)", border: "1px solid rgba(129,140,248,0.3)", padding: "30px 40px", borderRadius: "15px", textAlign: "center", width: "400px" },
  modalBtn: { marginTop: "20px", background: "#6366f1", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "10px", cursor: "pointer" },
  toast: { position: "fixed", right: 20, bottom: 20, background: "rgba(15,23,42,0.95)", color: "#e6eef8", padding: "10px 14px", borderRadius: 8, display: "flex", gap: 12 },
  toastClose: { background: "transparent", color: "#cbd5e1", border: "none", cursor: "pointer" },
  loadingWrap: { minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" },
};
