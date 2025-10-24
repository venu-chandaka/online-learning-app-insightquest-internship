import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseForm, setCourseForm] = useState({ title: "", description: "" });
  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    title: "",
    type: "video",
    contentUrl: "",
  });
  const [quizForm, setQuizForm] = useState({
    courseId: "",
    passingMarks: "",
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
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
        setMentor(mRes.data.mentorData || mRes.data.mentor);
        setCourses(cRes.data.courses || []);
      } catch (err) {
        console.error("fetchAll error:", err);
        setInfoMessage("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalStudents =
    mentor?.students?.length ||
    courses.reduce(
      (acc, c) => acc + (c.enrolledStudents?.length || 0),
      0
    );
  const activeCourses = courses.length;

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/mentorauth/logout",
        {},
        { withCredentials: true }
      );
      window.location.href = "/";
    } catch {
      setInfoMessage("Logout failed");
    }
  };

  const createCourse = async () => {
    if (!mentor?.isAccountVerified) return setShowVerifyModal(true);
    if (!courseForm.title || !courseForm.description)
      return setInfoMessage("Fill all fields");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/course/create",
        courseForm,
        { withCredentials: true }
      );
      if (res.data.course) {
        setCourses((prev) => [res.data.course, ...prev]);
        setCourseForm({ title: "", description: "" });
        setInfoMessage("Course created successfully!");
      }
    } catch (err) {
      console.error(err);
      setInfoMessage("Failed to create course");
    }
  };

  const addLesson = async () => {
    if (!mentor?.isAccountVerified) return setShowVerifyModal(true);
    if (!lessonForm.courseId || !lessonForm.title || !lessonForm.contentUrl)
      return setInfoMessage("Fill all lesson fields");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/lesson/add",
        lessonForm,
        { withCredentials: true }
      );
      setInfoMessage("Lesson added successfully!");
      setLessonForm({
        courseId: "",
        title: "",
        type: "video",
        contentUrl: "",
      });
    } catch (err) {
      console.error(err);
      setInfoMessage("Failed to add lesson");
    }
  };

  // ✅ Quiz logic
  const addQuestionToList = () => {
    if (
      !currentQuestion.questionText ||
      currentQuestion.options.some((o) => !o) ||
      !currentQuestion.correctAnswer
    )
      return setInfoMessage("Please fill all question fields");

    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, currentQuestion],
    }));
    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
    setInfoMessage("Question added");
  };

  const uploadQuiz = async () => {
    if (!mentor?.isAccountVerified) return setShowVerifyModal(true);
    if (!quizForm.courseId || quizForm.questions.length === 0)
      return setInfoMessage("Add at least one question");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/quiz/create",
        quizForm,
        { withCredentials: true }
      );
      if (res.data.success) {
        setInfoMessage("Quiz uploaded successfully!");
        setQuizForm({ courseId: "", passingMarks: "", questions: [] });
      } else {
        setInfoMessage("Failed to upload quiz");
      }
    } catch (err) {
      console.error(err);
      setInfoMessage("Quiz upload error");
    }
  };

  if (loading) return <div style={styles.loadingWrap}>Loading...</div>;

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
          <a style={{ ...styles.sideLink, ...styles.activeSideLink }}>
            Dashboard
          </a>
          <a style={styles.sideLink}>My Courses</a>
          <a style={styles.sideLink}>Add Lesson</a>
          <a style={styles.sideLink}>Add Quiz</a>
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
              Welcome back, <span style={styles.mentorName}>{mentor?.name}</span>
            </div>
            <div style={styles.welcomeSub}>Manage your courses & quizzes</div>
          </div>

          <div style={styles.topbarRight}>
            {mentor?.isAccountVerified ? (
              <div style={styles.verifiedBadge}>✔ Verified</div>
            ) : (
              <div style={styles.notVerifiedBadge}>Not Verified</div>
            )}
            <button style={styles.topLogoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Create Course */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Create Course</h3>
          <input
            style={styles.input}
            placeholder="Course Title"
            value={courseForm.title}
            onChange={(e) =>
              setCourseForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <textarea
            style={styles.input}
            placeholder="Course Description"
            value={courseForm.description}
            onChange={(e) =>
              setCourseForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <button style={styles.primaryBtn} onClick={createCourse}>
            Create
          </button>
        </section>

        {/* Add Lesson */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Add Lesson</h3>
          <select
            style={styles.input}
            value={lessonForm.courseId}
            onChange={(e) =>
              setLessonForm((prev) => ({ ...prev, courseId: e.target.value }))
            }
          >
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
            value={lessonForm.title}
            onChange={(e) =>
              setLessonForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <select
            style={styles.input}
            value={lessonForm.type}
            onChange={(e) =>
              setLessonForm((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            <option value="video">Video</option>
            <option value="text">Text</option>
          </select>
          <input
            style={styles.input}
            placeholder="Lesson URL or Content"
            value={lessonForm.contentUrl}
            onChange={(e) =>
              setLessonForm((prev) => ({
                ...prev,
                contentUrl: e.target.value,
              }))
            }
          />
          <button style={styles.primaryBtn} onClick={addLesson}>
            Add Lesson
          </button>
        </section>

        {/* 🧩 Add Quiz Section */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Add Quiz</h3>

          <div style={styles.formRow}>
            <select
              style={styles.input}
              value={quizForm.courseId}
              onChange={(e) =>
                setQuizForm((prev) => ({
                  ...prev,
                  courseId: e.target.value,
                }))
              }
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>

            <input
              style={{ ...styles.input, width: "120px" }}
              type="number"
              placeholder="Passing Marks"
              value={quizForm.passingMarks}
              onChange={(e) =>
                setQuizForm((prev) => ({
                  ...prev,
                  passingMarks: e.target.value,
                }))
              }
            />
          </div>

          <input
            style={styles.input}
            placeholder="Question Text"
            value={currentQuestion.questionText}
            onChange={(e) =>
              setCurrentQuestion((prev) => ({
                ...prev,
                questionText: e.target.value,
              }))
            }
          />
         <br></br>
          {currentQuestion.options.map((opt, i) => (
            <input
              key={i}
              style={styles.input}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const opts = [...currentQuestion.options];
                opts[i] = e.target.value;
                setCurrentQuestion((prev) => ({ ...prev, options: opts }));
              }}
            />
          ))}

          <input
            style={styles.input}
            placeholder="Correct Answer"
            value={currentQuestion.correctAnswer}
            onChange={(e) =>
              setCurrentQuestion((prev) => ({
                ...prev,
                correctAnswer: e.target.value,
              }))
            }
          />

          <div style={{ display: "flex", gap: 12 }}>
            <button style={styles.primaryBtn} onClick={addQuestionToList}>
              + Add Question
            </button>
            <button style={styles.primaryBtn} onClick={uploadQuiz}>
              🚀 Upload Quiz
            </button>
          </div>

          {quizForm.questions.length > 0 && (
            <div
              style={{
                marginTop: 14,
                background: "rgba(255,255,255,0.03)",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <strong>Questions Added:</strong>
              <ul style={{ color: "#cbd5e1" }}>
                {quizForm.questions.map((q, i) => (
                  <li key={i}>
                    {i + 1}. {q.questionText} ({q.correctAnswer})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

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
      </main>
    </div>
  );
}

const styles = {
  pageWrap: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1220 0%, #0f172a 100%)",
    color: "#e6eef8",
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: 260,
    padding: 24,
    background: "rgba(255,255,255,0.03)",
    borderRight: "1px solid rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandLogo: { width: 40 },
  brandTitle: { fontWeight: 700, color: "#c7d2fe" },
  roleSmall: { fontSize: 12, color: "#94a3b8" },
  sideNav: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 },
  sideLink: { padding: "8px 10px", color: "#cbd5e1" },
  activeSideLink: {
    background: "rgba(99,102,241,0.12)",
    borderRadius: 8,
  },
  sidebarFooter: { marginTop: "auto", fontSize: 13, color: "#94a3b8" },
  sidebarName: { marginTop: 4, fontWeight: 700 },
  main: { flex: 1, padding: 28 },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeTitle: { fontSize: 22, fontWeight: 700 },
  mentorName: { color: "#c7d2fe" },
  welcomeSub: { fontSize: 14, color: "#94a3b8" },
  verifiedBadge: {
    background: "rgba(99,102,241,0.15)",
    padding: "6px 10px",
    borderRadius: 999,
  },
  notVerifiedBadge: {
    background: "rgba(239,68,68,0.12)",
    padding: "6px 10px",
    borderRadius: 999,
  },
  topLogoutBtn: {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "#cbd5e1",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },
  section: {
    background: "rgba(255,255,255,0.02)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
  },
  sectionTitle: { fontWeight: 700, marginBottom: 10 },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: "10px",
    color: "#e6eef8",
    marginBottom: 8,
  },
  primaryBtn: {
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
  },
  toast: {
    position: "fixed",
    right: 20,
    bottom: 20,
    background: "rgba(15,23,42,0.95)",
    padding: "10px 14px",
    borderRadius: 8,
    display: "flex",
    gap: 10,
  },
  toastClose: {
    background: "transparent",
    border: "none",
    color: "#cbd5e1",
    cursor: "pointer",
  },
};
