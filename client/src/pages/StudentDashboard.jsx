import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [infoMessage, setInfoMessage] = useState("");
  const [student, setStudent] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentRes = await axios.get(
          "http://localhost:4000/api/student/get-data",
          { withCredentials: true }
        );
        const studentObj = studentRes.data.stData || {};
        if (mounted) setStudent(studentObj);

        const coursesRes = await axios.get(
          "http://localhost:4000/api/course/all",
          { withCredentials: true }
        );
        if (mounted) setAllCourses(coursesRes.data.courses || []);

        const myCoursesRes = await axios.get(
          "http://localhost:4000/api/student/enrolled-courses",
          { withCredentials: true }
        );
        if (mounted) setMyCourses(myCoursesRes.data.courses || []);
      } catch (err) {
        setInfoMessage("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // For comparing ObjectIds as strings
  const isEnrolled = (courseId) =>
    myCourses.some(c => String(c._id) === String(courseId));

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
        // Immediate local update
        const enrolledCourse = allCourses.find(c => String(c._id) === String(courseId));
        if (enrolledCourse) setMyCourses(prev => [...prev, enrolledCourse]);
      } else {
        setInfoMessage(res.data?.message || "Enroll failed");
      }
    } catch (err) {
      setInfoMessage(err?.response?.data?.message || "Enroll failed");
    }
  };

  // Main content
  if (loading) return <div style={styles.loadingWrap}>Loading...</div>;

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
              Welcome back, <span style={styles.mentorName}>{student?.name}</span>
            </div>
            <div style={styles.welcomeSub}>Keep learning and growing 🚀</div>
          </div>
          <div style={styles.topbarRight}>
            {student?.isAccountVerified ?
              <div style={styles.verifiedBadge}>✔ Verified</div> :
              <div style={styles.notVerifiedBadge}>Not Verified</div>}
            <button style={styles.topLogoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {/* Stats */}
        <section style={styles.hero}>
          <div style={styles.statsRow}>
            <motion.div style={styles.statCard} whileHover={{ y: -6 }}>
              <div style={styles.statTitle}>My Courses</div>
              <div style={styles.statValue}>{myCourses.length}</div>
            </motion.div>
            <motion.div style={styles.statCard} whileHover={{ y: -6 }}>
              <div style={styles.statTitle}>Available</div>
              <div style={styles.statValue}>{allCourses.length}</div>
            </motion.div>
          </div>
        </section>

        {/* Enrolled Courses */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>My Courses</h3>
          {selectedLesson ? (
            <LessonViewer lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />
          ) : selectedCourse ? (
            <CourseViewer 
              course={myCourses.find(c => c._id === selectedCourse)}
              onViewLesson={setSelectedLesson}
              onBack={() => setSelectedCourse(null)}
            />
          ) : myCourses.length === 0 ? (
            <div style={{ color: "#cbd5e1" }}>Not Enrolled in any courses.</div>
          ) : (
            <div style={styles.coursesList}>
              {myCourses.map(course => (
                <div key={course._id} style={styles.courseRow}>
                  <div style={styles.courseLeft} onClick={() => setSelectedCourse(course._id)}>
                    <div style={styles.courseThumbWrap}>
                      <img src={course.thumbnail || "/default_course.png"} alt={course.title} style={styles.courseThumb} />
                    </div>
                    <div>
                      <div style={styles.courseTitle}>{course.title}</div>
                      <div style={styles.courseMeta}>{course.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Courses */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Available Courses</h3>
          <div style={styles.coursesList}>
            {allCourses.filter(c => !isEnrolled(c._id)).map(course => {
              const enrolled = isEnrolled(course._id);
              return (
                <div key={course._id} style={styles.courseRow}>
                  <div style={styles.courseLeft}>
                    <div style={styles.courseThumbWrap}>
                      <img src={course.thumbnail || "/default_course.png"} alt={course.title} style={styles.courseThumb} />
                    </div>
                    <div>
                      <div style={styles.courseTitle}>{course.title}</div>
                      <div style={styles.courseMeta}>{course.description}</div>
                    </div>
                  </div>
                  <div style={styles.courseActions}>
                    <button
                      style={enrolled ? styles.primaryBtnDisabled : styles.primaryBtn}
                      disabled={enrolled || !student?.isAccountVerified}
                      onClick={() => enrollCourse(course._id)}
                    >
                      {enrolled ? "Enrolled" : "Enroll"}
                    </button>
                    <button
                      style={styles.viewBtn}
                      disabled={!enrolled}
                      onClick={() => enrolled && navigate(`/student/course/${course._id}`)}
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

      {/* Verify Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div style={styles.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={styles.modalBox} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 style={{ color: "#e6e9ff" }}>Verification required</h3>
              <p style={{ color: "#cbd5e1" }}>
                Verify your account before enrolling in courses.
              </p>
              <button onClick={() => setShowVerifyModal(false)} style={styles.modalBtn}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {infoMessage && (
          <motion.div style={styles.toast} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
            <div>{infoMessage}</div>
            <button onClick={() => setInfoMessage("")} style={styles.toastClose}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponent for course details and lessons
function CourseViewer({ course, onViewLesson, onBack }) {
  if (!course) return <div>Course not found.</div>;
  return (
    <div style={styles.courseViewer}>
      <h2>{course.title}</h2>
      <p style={{ color: "#9aa9c7" }}>{course.description}</p>
      <div style={styles.lessonList}>
        {(course.lessons || []).map((lesson, idx) => (
          <div
            key={lesson._id || idx} // <-- Uses lesson._id or idx as fallback
            style={styles.lessonItem}
            onClick={() => onViewLesson(lesson)}
          >
            {lesson.title} {lesson.contentType === "video" && "🎬"}
          </div>
        ))}
      </div>
      <button style={styles.secondaryBtn} onClick={onBack}>Back to My Courses</button>
    </div>
  );
}

// Subcomponent for lesson viewer
function LessonViewer({ lesson, onBack }) {
  if (!lesson) return null;
  return (
    <div style={styles.lessonViewer}>
      <h3>{lesson.title}</h3>
      {lesson.contentType === "video" ? (
        <video controls width={650} src={lesson.contentUrl} style={{ margin: "18px 0" }}>
          Your browser does not support video.
        </video>
      ) : (
        <div style={{ color: "#dbeafe", padding: "16px 0" }}>
          {lesson.contentUrl}
        </div>
      )}
      <button style={styles.secondaryBtn} onClick={onBack}>Back to Course</button>
    </div>
  );
}

const styles = {
  pageWrap: { display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#0b1220,#0f172a)", color: "#e6eef8", fontFamily: "Inter, sans-serif" },
  sidebar: { width: 240, padding: 20, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" },
  brand: { display: "flex", gap: 10, alignItems: "center" },
  brandLogo: { width: 42 },
  brandTitle: { fontWeight: 700, color: "#c7d2fe" },
  roleSmall: { fontSize: 12, color: "#94a3b8" },
  sideNav: { marginTop: 20, display: "flex", flexDirection: "column", gap: 8 },
  sideLink: { padding: "8px 10px", color: "#cbd5e1", textDecoration: "none", borderRadius: 6 },
  activeSideLink: { background: "rgba(99,102,241,0.12)", color: "#e6e9ff", padding: "8px 10px", borderRadius: 6 },
  sidebarFooter: { marginTop: "auto", fontSize: 13, color: "#94a3b8" },
  sidebarName: { marginTop: 4, fontWeight: 700, color: "#e6eef8" },
  main: { flex: 1, padding: 24, overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  welcomeTitle: { fontSize: 20, fontWeight: 700, color: "#eef2ff" },
  mentorName: { color: "#c7d2fe" },
  welcomeSub: { fontSize: 13, color: "#9aa9c7" },
  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  verifiedBadge: { background: "rgba(99,102,241,0.15)", color: "#c7d2fe", padding: "6px 10px", borderRadius: 999 },
  notVerifiedBadge: { background: "rgba(239,68,68,0.12)", color: "#fca5a5", padding: "6px 10px", borderRadius: 999 },
  topLogoutBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", padding: "8px 12px", borderRadius: 8, cursor: "pointer" },
  hero: { marginBottom: 20 },
  statsRow: { display: "flex", gap: 12 },
  statCard: { background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" },
  statTitle: { fontSize: 13, color: "#9aa9c7" },
  statValue: { fontSize: 20, fontWeight: 700 },
  section: { background: "rgba(255,255,255,0.02)", padding: 18, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#e6e9ff", marginBottom: 12 },
  coursesList: { display: "flex", flexDirection: "column", gap: 10 },
  courseRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" },
  courseLeft: { display: "flex", gap: 12, alignItems: "center" },
  courseThumbWrap: { width: 80, height: 60, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.05)" },
  courseThumb: { width: "100%", height: "100%", objectFit: "cover" },
  courseTitle: { fontWeight: 700, fontSize: 15 },
  courseMeta: { fontSize: 13, color: "#9aa9c7" },
  courseActions: { display: "flex", gap: 8 },
  primaryBtn: { background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "#fff", padding: "8px 14px", border: "none", borderRadius: 8, cursor: "pointer" },
  primaryBtnDisabled: { background: "rgba(255,255,255,0.03)", color: "#9aa9c7", padding: "8px 14px", borderRadius: 8, cursor: "not-allowed" },
  enrolledBtn: { background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(34,197,94,0.3)", fontWeight: 700 },
  secondaryBtn: { background: "transparent", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: 8 },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(6px)" },
  modalBox: { background: "#0f172a", borderRadius: 10, padding: 20, border: "1px solid rgba(99,102,241,0.2)" },
  modalBtn: { background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" },
  toast: { position: "fixed", right: 20, bottom: 20, background: "rgba(15,23,42,0.95)", color: "#e6eef8", padding: "10px 14px", borderRadius: 8, display: "flex", gap: 12 },
  toastClose: { background: "transparent", color: "#cbd5e1", border: "none", cursor: "pointer" },
  loadingWrap: { minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" },
};
