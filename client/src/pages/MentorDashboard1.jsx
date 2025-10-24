import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

/**
 * MentorDashboard.jsx
 * - Glassy EduLearn-style mentor dashboard
 * - Internal CSS only
 * - Shows profile, stats, courses, create course, add lesson
 * - Blocks create/edit/add-lesson actions if mentor.isAccountVerified === false
 */

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI form state
  const [courseForm, setCourseForm] = useState({ title: "", description: "" });
  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    title: "",
    type: "video",
    contentUrl: "",
  });

  // modal / alerts
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  // fetch mentor data + courses
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          axios.get("http://localhost:4000/api/mentor/get-data", {
            withCredentials: true,
          }),
          axios.get("http://localhost:4000/api/course/mycources", {
            withCredentials: true,
          }),
        ]);

        if (!mounted) return;

        // ✅ FIXED RESPONSE HANDLING
        if (mRes.data?.mentorData) {
          setMentor(mRes.data.mentorData);
        } else if (mRes.data?.mentor) {
          setMentor(mRes.data.mentor); // fallback if backend uses `mentor` key
        }

        if (cRes.data?.courses) setCourses(cRes.data.courses);
      } catch (err) {
        console.error("fetchAll error:", err);
        setInfoMessage("Failed to load data. Check auth or server.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // computed stats
  const totalStudents =
    mentor?.students?.length ||
    courses.reduce(
      (acc, c) => acc + (c.enrolledStudents?.length || 0),
      0
    );
  const activeCourses = courses.length;
  const avgRating = (() => {
    const rated = courses.filter((c) => typeof c.rating === "number");
    if (rated.length === 0) return 0;
    const sum = rated.reduce((s, c) => s + c.rating, 0);
    return Math.round((sum / rated.length) * 10) / 10;
  })();

  // logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/mentorauth/logout",
        {},
        { withCredentials: true }
      );
      window.location.href = "/";
    } catch (err) {
      console.error("logout failed", err);
      setInfoMessage("Logout failed");
    }
  };

  // create course
  const createCourse = async () => {
    if (!mentor) return;
    if (!mentor.isAccountVerified) return setShowVerifyModal(true);
    if (!courseForm.title || !courseForm.description)
      return setInfoMessage("Please fill course title and description.");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/course/create",
        {
          ...courseForm,
          price: 0,
        },
        { withCredentials: true }
      );
      if (res.data?.course) {
        setCourses((prev) => [res.data.course, ...prev]);
        setCourseForm({ title: "", description: "" });
        setInfoMessage("Course created");
      } else {
        setInfoMessage("Course creation failed");
      }
    } catch (err) {
      console.error("createCourse error", err);
      setInfoMessage(err?.response?.data?.message || "Failed to create course");
    }
  };

  // add lesson
  const addLesson = async () => {
    if (!mentor) return;
    if (!mentor.isAccountVerified) return setShowVerifyModal(true);
    if (!lessonForm.courseId || !lessonForm.title || !lessonForm.contentUrl)
      return setInfoMessage("Fill all lesson fields");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/lesson/add",
        {
          courseId: lessonForm.courseId,
          title: lessonForm.title,
          contentType: lessonForm.type,
          contentUrl: lessonForm.contentUrl,
        },
        { withCredentials: true }
      );

      setCourses((prev) =>
        prev.map((c) =>
          c._id === lessonForm.courseId
            ? {
                ...c,
                lessons: [
                  ...(c.lessons || []),
                  res.data?.lesson?._id || "new",
                ],
              }
            : c
        )
      );
      setLessonForm({
        courseId: "",
        title: "",
        type: "video",
        contentUrl: "",
      });
      setInfoMessage("Lesson added");
    } catch (err) {
      console.error("addLesson error", err);
      setInfoMessage(err?.response?.data?.message || "Failed to add lesson");
    }
  };

  // edit course
  const updateCourse = async (courseId, updates) => {
    if (!mentor) return;
    if (!mentor.isAccountVerified) return setShowVerifyModal(true);

    try {
      const res = await axios.put(
        "http://localhost:4000/api/course/update",
        { courseId, ...updates },
        { withCredentials: true }
      );
      if (res.data?.course) {
        setCourses((prev) =>
          prev.map((c) => (c._id === courseId ? res.data.course : c))
        );
        setInfoMessage("Course updated");
      } else {
        setInfoMessage("Update failed");
      }
    } catch (err) {
      console.error("updateCourse error", err);
      setInfoMessage(err?.response?.data?.message || "Failed to update course");
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingText}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrap}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <img src="/isqLogo.png" alt="logo" style={styles.brandLogo} />
          <div>
            <div style={styles.brandTitle}>InsightQuestLearner</div>
            <div style={styles.roleSmall}>Instructor</div>
          </div>
        </div>

        <nav style={styles.sideNav}>
          <a href="#" style={{ ...styles.sideLink, ...styles.activeSideLink }}>
            Dashboard
          </a>
          <a href="#" style={styles.sideLink}>
            My Courses
          </a>
          <a href="#" style={styles.sideLink}>
            Create Course
          </a>
          <a href="#" style={styles.sideLink}>
            Students
          </a>
          <a href="#" style={styles.sideLink}>
            Analytics
          </a>
          <a href="#" style={styles.sideLink}>
            Settings
          </a>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.smallMuted}>Signed in as</div>
          <div style={styles.sidebarName}>{mentor?.name || "Mentor"}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <div style={styles.welcomeTitle}>
              Welcome back,{" "}
              <span style={styles.mentorName}>{mentor?.name || ""}</span>
            </div>
            <div style={styles.welcomeSub}>
              Ready to inspire more students?
            </div>
          </div>

          <div style={styles.topbarRight}>
            <div style={styles.verifiedWrap}>
              {mentor?.isAccountVerified ? (
                <div style={styles.verifiedBadge}>✔ Verified</div>
              ) : (
                <div style={styles.notVerifiedBadge}>Not Verified</div>
              )}
            </div>
            <button onClick={handleLogout} style={styles.topLogoutBtn}>
              Logout
            </button>
          </div>
        </header>

        {/* Stats */}
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.heroCardGradient}>
              <h2 style={styles.heroTitle}>
                Your courses are performing great.
              </h2>
              <p style={styles.heroSub}>
                Create, manage and monitor your courses from here.
              </p>
              <button
                onClick={() => {
                  if (!mentor?.isAccountVerified) setShowVerifyModal(true);
                  else window.scrollTo({ top: 600, behavior: "smooth" });
                }}
                style={styles.ctaBtn}
              >
                + Create New Course
              </button>
            </div>
          </div>

          <div style={styles.statsRow}>
            <motion.div style={styles.statCard} whileHover={{ y: -6 }}>
              <div style={styles.statTitle}>Total Students</div>
              <div style={styles.statValue}>{totalStudents}</div>
            </motion.div>

            <motion.div style={styles.statCard} whileHover={{ y: -6 }}>
              <div style={styles.statTitle}>Active Courses</div>
              <div style={styles.statValue}>{activeCourses}</div>
            </motion.div>

            <motion.div style={styles.statCard} whileHover={{ y: -6 }}>
              <div style={styles.statTitle}>Avg Rating</div>
              <div style={styles.statValue}>{avgRating || "-"}</div>
            </motion.div>
          </div>
        </section>
        <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Create Course</h3>
          <div style={styles.formRow}>
            <input
              placeholder="Course Title"
              value={courseForm.title}
              onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
              style={styles.input}
            />
            <textarea
              placeholder="Short description"
              value={courseForm.description}
              onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
              style={{ ...styles.input, height: 100 }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={createCourse} style={mentor?.isAccountVerified ? styles.primaryBtn : styles.primaryBtnDisabled}>
                Create Course
              </button>
              {!mentor?.isAccountVerified && <button onClick={() => setShowVerifyModal(true)} style={styles.secondaryBtn}>Why blocked?</button>}
            </div>
          </div>
        </section>

        {/* Add Lesson */}
        <section style={styles.section}>
           <h3 style={styles.sectionTitle}>Add Lesson (Quick)</h3>
          <div style={styles.formRow}>
            <select value={lessonForm.courseId} onChange={(e) => setLessonForm(prev => ({ ...prev, courseId: e.target.value }))} style={styles.input}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <input placeholder="Lesson Title" value={lessonForm.title} onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))} style={styles.input} />
            <select value={lessonForm.type} onChange={(e) => setLessonForm(prev => ({ ...prev, type: e.target.value }))} style={styles.input}>
              <option value="video">Video</option>
              <option value="text">Text</option>
            </select>
            <input placeholder="Video URL or text content" value={lessonForm.contentUrl} onChange={(e) => setLessonForm(prev => ({ ...prev, contentUrl: e.target.value }))} style={styles.input} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={addLesson} style={mentor?.isAccountVerified ? styles.primaryBtn : styles.primaryBtnDisabled}>Add Lesson</button>
              {!mentor?.isAccountVerified && <button onClick={() => setShowVerifyModal(true)} style={styles.secondaryBtn}>Why blocked?</button>}
            </div>
          </div>
        </section>
        {/* Mentor's Courses List */}
          {/* Mentor's Courses List */}
<section style={styles.section}>
  <h3 style={styles.sectionTitle}>My Courses</h3>
  {courses.length === 0 ? (
    <div style={{ color: "#cbd5e1", marginTop: 10 }}>
      You haven't created any courses yet.
    </div>
  ) : (
    <div style={styles.coursesList}>
      {courses.map((course) => (
        <div key={course._id} style={styles.courseRow}>
          <div style={styles.courseLeft}>
            <div style={styles.courseThumbWrap}>
              <img
                src={course.thumbnail || "/.png"}
                alt="course"
                style={styles.courseThumb}
              />
            </div>
            <div>
              <div style={styles.courseTitle}>{course.title}</div>
              <div style={styles.courseMeta}>
                {course.description}
                <br />
                <span>
                  {course.isPublished ? "Published" : "Draft"}
                </span>
                {typeof course.rating === "number" && <> &middot; ⭐ {course.rating}</>}
                {course.enrolledStudents && <> &middot; Students: {course.enrolledStudents.length}</>}
              </div>
            </div>
          </div>

          <div style={styles.courseActions}>
            <button
              disabled={!mentor?.isAccountVerified}
              style={course.isPublished ? styles.viewBtn : styles.primaryBtn}
              onClick={async () => {
                try {
                  const res = await axios.put(
                    "http://localhost:4000/api/course/toggle-publish",
                    { courseId: course._id },
                    { withCredentials: true }
                  );
                  setCourses((prev) =>
                    prev.map((c) =>
                      c._id === course._id ? { ...c, isPublished: !c.isPublished } : c
                    )
                  );
                  alert("course publissed");
                } catch (err) {
                  alert("Failed to publish/unpublish course");
                }
              }}
            >
              {course.isPublished ? "Unpublish" : "Publish"}
            </button>

            <button
              style={styles.editBtn}
              onClick={() => updateCourse(course._id, { /* your update data here */ })}
            >
              Edit
            </button>

            <button
              style={styles.viewBtn}
              onClick={() => window.location.href = `../course/${course._id}`}
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>


      </main>
      {/* Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div style={styles.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={styles.modalBox} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 style={{ color: "#e6e9ff", marginBottom: 8 }}>Verification required</h3>
              <p style={{ color: "#cbd5e1", marginBottom: 18, lineHeight: 1.4 }}>
                You must verify your mentor account before creating or editing courses or adding lessons.
                Please check your email for the verification OTP or request a new verification OTP from your profile.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                <button onClick={() => setShowVerifyModal(false)} style={styles.modalBtn}>Close</button>
                <button onClick={() => { setShowVerifyModal(false); window.location.href = "/mentor/profile"; }} style={styles.modalPrimaryBtn}>Go to Profile</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* small info toast */}
      <AnimatePresence>
        {infoMessage && (
          <motion.div style={styles.toast} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div>{infoMessage}</div>
            <button onClick={() => setInfoMessage("")} style={styles.toastClose}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
const styles = {
  pageWrap: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1220 0%, #0f172a 100%)",
    color: "#e6eef8",
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },
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
  brand: { display: "flex", gap: 12, alignItems: "center", marginBottom: 8 },
  brandLogo: { width: 44, height: 44, objectFit: "contain" },
  brandTitle: { fontWeight: 700, color: "#c7d2fe" },
  roleSmall: { fontSize: 12, color: "#94a3b8" },
  main: { flex: 1, padding: 28, overflowY: "auto" },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  welcomeTitle: { fontSize: 22, fontWeight: 700, color: "#eef2ff" },
  mentorName: { color: "#c7d2fe" },
  welcomeSub: { fontSize: 13, color: "#9aa9c7", marginTop: 6 },
  verifiedBadge: {
    background: "rgba(99,102,241,0.15)",
    color: "#c7d2fe",
    padding: "6px 12px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 13,
  },
  notVerifiedBadge: {
    background: "rgba(239,68,68,0.12)",
    color: "#fca5a5",
    padding: "6px 12px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 13,
  },
  topLogoutBtn: {
    background: "transparent",
    color: "#cbd5e1",
    border: "1px solid rgba(255,255,255,0.04)",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  hero: { display: "flex", justifyContent: "space-between", gap: 20 },
  heroCardGradient: {
    background:
      "linear-gradient(90deg, rgba(99,102,241,0.12), rgba(129,140,248,0.06))",
    padding: 20,
    borderRadius: 12,
    border: "1px solid rgba(129,140,248,0.06)",
  },
  heroTitle: { fontSize: 20, color: "#eef2ff" },
  heroSub: { color: "#9aa9c7", marginTop: 8, fontSize: 13 },
  ctaBtn: {
    marginTop: 12,
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  statsRow: { display: "flex", gap: 14, alignItems: "stretch" },
  statCard: {
    background: "rgba(255,255,255,0.02)",
    padding: 14,
    borderRadius: 10,
    minWidth: 140,
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  statTitle: { fontSize: 12, color: "#9aa9c7" },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#eef2ff",
    marginTop: 6,
  },
  loadingWrap: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: "#cbd5e1" },
   pageWrap: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1220 0%, #0f172a 100%)",
    color: "#e6eef8",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },

  /* Sidebar */
  sidebar: {
    width: 260,
    padding: 24,
    background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
    borderRight: "1px solid rgba(255,255,255,0.04)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  brand: { display: "flex", gap: 12, alignItems: "center", marginBottom: 8 },
  brandLogo: { width: 44, height: 44, objectFit: "contain" },
  brandTitle: { fontWeight: 700, color: "#c7d2fe" },
  roleSmall: { fontSize: 12, color: "#94a3b8" },

  sideNav: { display: "flex", flexDirection: "column", gap: 8, marginTop: 10 },
  sideLink: {
    padding: "10px 12px",
    borderRadius: 8,
    color: "#cbd5e1",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
  activeSideLink: {
    background: "linear-gradient(90deg, rgba(99,102,241,0.12), rgba(129,140,248,0.06))",
    color: "#e6e9ff",
  },

  sidebarFooter: { marginTop: "auto", fontSize: 13, color: "#94a3b8" },
  sidebarName: { marginTop: 6, fontWeight: 700, color: "#e6eef8" },

  /* Main */
  main: { flex: 1, padding: 28, overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  topbarLeft: {},
  welcomeTitle: { fontSize: 22, fontWeight: 700, color: "#eef2ff" },
  mentorName: { color: "#c7d2fe" },
  welcomeSub: { fontSize: 13, color: "#9aa9c7", marginTop: 6 },

  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  verifiedWrap: {},
  verifiedBadge: { background: "rgba(99,102,241,0.15)", color: "#c7d2fe", padding: "6px 12px", borderRadius: 999, fontWeight: 600, fontSize: 13 },
  notVerifiedBadge: { background: "rgba(239,68,68,0.12)", color: "#fca5a5", padding: "6px 12px", borderRadius: 999, fontWeight: 600, fontSize: 13 },
  topLogoutBtn: { background: "transparent", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.04)", padding: "8px 12px", borderRadius: 8, cursor: "pointer" },

  /* Hero */
  hero: { display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 24 },
  heroLeft: { flex: 1 },
  heroCardGradient: {
    background: "linear-gradient(90deg, rgba(99,102,241,0.12), rgba(129,140,248,0.06))",
    padding: 20,
    borderRadius: 12,
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(129,140,248,0.06)",
  },
  heroTitle: { fontSize: 20, color: "#eef2ff", margin: 0 },
  heroSub: { color: "#9aa9c7", marginTop: 8, fontSize: 13 },
  ctaBtn: { marginTop: 12, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700 },

  statsRow: { display: "flex", gap: 14, alignItems: "stretch", minWidth: 320 },
  statCard: {
    background: "rgba(255,255,255,0.02)",
    padding: 14,
    borderRadius: 10,
    minWidth: 140,
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  statTitle: { fontSize: 12, color: "#9aa9c7" },
  statValue: { fontSize: 20, fontWeight: 700, color: "#eef2ff", marginTop: 6 },

 section: { background: "rgba(255,255,255,0.02)", padding: 18, borderRadius: 12, marginBottom: 18, border: "1px solid rgba(255,255,255,0.03)" },
  sectionTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#e6e9ff", marginBottom: 12 },

  /* courses list */
  coursesList: { display: "flex", flexDirection: "column", gap: 12 },
  courseRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "rgba(255,255,255,0.01)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.02)" },
  courseLeft: { display: "flex", gap: 12, alignItems: "center" },
  courseThumbWrap: { width: 84, height: 60, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.03)" },
  courseThumb: { width: "100%", height: "100%", objectFit: "cover" },
  courseTitle: { fontWeight: 700, fontSize: 15, color: "#eef2ff" },
  courseMeta: { fontSize: 13, color: "#9aa9c7", marginTop: 6 },

  courseActions: { display: "flex", gap: 8 },
  editBtn: { padding: "8px 12px", borderRadius: 8, background: "transparent", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" },
  viewBtn: { padding: "8px 12px", borderRadius: 8, background: "rgba(99,102,241,0.12)", color: "#e6e9ff", border: "none", cursor: "pointer" },

  /* forms */
  formRow: { display: "flex", flexDirection: "row", gap: 10 },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.03)", background: "rgba(255,255,255,0.01)", color: "#e6eef8", outline: "none" },
  primaryBtn: { background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "#fff", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700 },
  primaryBtnDisabled: { background: "rgba(255,255,255,0.03)", color: "#9aa9c7", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "not-allowed", fontWeight: 700 },
  secondaryBtn: { background: "transparent", color: "#cbd5e1", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.03)", cursor: "pointer" },

  footer: { marginTop: 30, color: "#8b98b0", fontSize: 13 },
  /* Modal */
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 60, backdropFilter: "blur(6px)" },
  modalBox: { width: 480, background: "linear-gradient(180deg,#0f172a,#111827)", borderRadius: 12, padding: 22, border: "1px solid rgba(129,140,248,0.12)", boxShadow: "0 12px 40px rgba(2,6,23,0.6)" },
  modalBtn: { background: "transparent", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.04)", padding: "8px 12px", borderRadius: 8, cursor: "pointer" },
  modalPrimaryBtn: { background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" },

  /* loading */
  loadingWrap: { minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#cbd5e1" },

  /* toast */
  toast: { position: "fixed", right: 20, bottom: 20, background: "linear-gradient(90deg,#111827,#0b1220)", color: "#e6eef8", padding: "10px 14px", borderRadius: 8, display: "flex", gap: 12, alignItems: "center", zIndex: 80, border: "1px solid rgba(255,255,255,0.03)" },
  toastClose: { background: "transparent", color: "#cbd5e1", border: "none", cursor: "pointer" },
};

