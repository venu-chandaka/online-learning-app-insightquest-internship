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
        axios.get("http://localhost:4000/api/student/get-data", {
          withCredentials: true,
        }),
        axios.get("http://localhost:4000/api/course/all", {
          withCredentials: true,
        }),
        axios.get("http://localhost:4000/api/student/enrolled-courses", {
          withCredentials: true,
        }),
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

  // 🔹 Fix enrollment check
  const isEnrolled = (courseId) =>
    myCourses.some((c) => String(c._id) === String(courseId));

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/stauth/stlogout",
        {},
        { withCredentials: true }
      );
      window.location.href = "/login";
    } catch {
      setInfoMessage("Logout failed.");
    }
  };

  // 🔹 Enroll
// 🔹 Enroll
const enrollCourse = async (courseId) => {
  if (!student?.isAccountVerified) {
    setShowVerifyModal(true);
      setInfoMessage("⚠️ Please verify your account before enrolling.");
     // tiny delay ensures AnimatePresence renders toast above modal
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
      await fetchData(); // Re-fetch to sync backend state
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

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <div style={styles.welcomeTitle}>
              Welcome back,{" "}
              <span style={styles.mentorName}>{student?.name}</span>
            </div>
            <div style={styles.welcomeSub}>Keep learning and growing 🚀</div>
          </div>
          <div style={styles.topbarRight}>
            {student?.isAccountVerified ? (
              <div style={styles.verifiedBadge}>✔ Verified</div>
            ) : (
              <div style={styles.notVerifiedBadge}>Not Verified</div>
            )}
            <button
              style={styles.topLogoutBtn}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* My Courses */}
       {/* My Courses with Progress */}
<section style={styles.section}>
  <h3 style={styles.sectionTitle}>My Courses</h3>
  {myCourses.length === 0 ? (
    <div style={{ color: "#cbd5e1" }}>Not Enrolled in any courses.</div>
  ) : (
    <div style={styles.courseGrid}>
      {myCourses.map((course) => {
        const completed = student?.completedLessons?.filter(
          (l) => l.courseId === course._id
        ).length || 0;
        const total = course.lessons?.length || 1;
        const percent = Math.round((completed / total) * 100);

        return (
          <div key={course._id} style={styles.courseCard}>
            <div style={styles.courseHeader}>
              <div>
                <div style={styles.courseLabel}>COURSE</div>
                <div style={styles.courseTitle}>{course.title}</div>
              </div>
              <img
                src={course.thumbnail || "/default_course.png"}
                alt=""
                style={styles.courseIcon}
              />
            </div>

            <div style={styles.progressWrap}>
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${percent}%`,
                  }}
                />
              </div>
              <div style={styles.progressText}>
                {percent}% complete — {completed}/{total}
              </div>
            </div>

            {percent === 100 ? (
              <button style={styles.certBtn}>
                ⬇ Download certificate
              </button>
            ) : (
              <button
                style={styles.viewBtn}
                onClick={() =>
                  navigate(`/student/course/${course._id}`)
                }
              >
                Continue Course
              </button>
            )}
          </div>
        );
      })}
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
                      <div style={styles.courseMeta}>
                        {course.description}
                      </div>
                    </div>
                  </div>
                  <div style={styles.courseActions}>
                    <button
                      style={
                        enrolled
                          ? styles.primaryBtnDisabled
                          : styles.primaryBtn
                      }
                      disabled={enrolled || !student?.isAccountVerified}
                      onClick={() => enrollCourse(course._id)}
                    >
                      {enrolled ? "Enrolled" : "Enroll"}
                    </button>
                    <button
                      style={styles.viewBtn}
                      disabled={!enrolled}
                      onClick={() =>
                        enrolled && navigate(`/student/course/${course._id}`)
                      }
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

      {/* ✅ Toast Message */}
     {/* ✅ Info Toast - Fully Working Like Mentor Dashboard */}
<AnimatePresence>
  {infoMessage && (
    <motion.div
      key="toast"
      style={styles.toast}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ duration: 0.25 }}
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
  pageWrap: { display: "flex", minHeight: "100vh", background: "#0f172a", color: "#e6eef8", fontFamily: "Inter, sans-serif" },
sidebar: {
    width: 260,
    padding: 24,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
    borderRight: "1px solid rgba(255,255,255,0.04)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  brand: { display: "flex", gap: 10, alignItems: "center" },
  brandLogo: { width: 42 },
  brandTitle: { fontWeight: 700, color: "#c7d2fe" },
  roleSmall: { fontSize: 12, color: "#94a3b8" },
  sideNav: { marginTop: 20, display: "flex", flexDirection: "column", gap: 8 },
  activeSideLink: { background: "rgba(99,102,241,0.12)", color: "#e6e9ff", padding: "8px 10px", borderRadius: 6 },
  sideLink: { padding: "8px 10px", color: "#cbd5e1" },
sidebarFooter: {
  fontSize: 13,
  color: "#94a3b8",
  marginTop: "auto",
 // ✅ ensures it sticks to bottom even if content is less
},

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
   toast: {
  position: "fixed",
  right: 20,
  bottom: 20,
  background: "linear-gradient(90deg,#111827,#0b1220)",
  color: "#e6eef8",
  padding: "10px 14px",
  borderRadius: 8,
  display: "flex",
  gap: 12,
  alignItems: "center",
  zIndex: 80,
  border: "1px solid rgba(255,255,255,0.03)",
},
toastClose: {
  background: "transparent",
  color: "#cbd5e1",
  border: "none",
  cursor: "pointer",
},
courseGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
},
courseCard: {
  background: "rgba(255,255,255,0.05)",
  borderRadius: 12,
  padding: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "0.3s",
},
courseHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
},
courseLabel: {
  color: "#60a5fa",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.05em",
},
courseIcon: {
  width: 48,
  height: 48,
  borderRadius: 8,
  background: "rgba(255,255,255,0.1)",
  objectFit: "contain",
},
progressWrap: {
  marginBottom: 12,
},
progressBarBg: {
  height: 6,
  background: "rgba(255,255,255,0.1)",
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: 6,
},
progressBarFill: {
  height: "100%",
  background: "#8b5cf6",
  borderRadius: 4,
  transition: "width 0.4s ease",
},
progressText: {
  fontSize: 12,
  color: "#9aa9c7",
},
certBtn: {
  background: "rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
  fontWeight: 600,
},

  loadingWrap: { minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" },
};
