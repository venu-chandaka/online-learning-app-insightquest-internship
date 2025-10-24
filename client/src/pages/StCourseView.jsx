import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function StCourseView() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Fetch course, progress, and quiz data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, completedRes, quizRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/course/${courseId}`, { withCredentials: true }),
          axios.get(`http://localhost:4000/api/student/get-completed-lessons/${courseId}`, { withCredentials: true }),
          axios.get(`http://localhost:4000/api/quiz/${courseId}`, { withCredentials: true }),
        ]);
        setCourse(courseRes.data.course);
        setCompletedLessons(completedRes.data.completedLessonIds || []);
        setQuiz(quizRes.data.quiz || null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setInfo("⚠️ Failed to load course data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  // Mark lesson completed
  const markLessonCompleted = async (lessonId) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/student/complete-lesson",
        { courseId, lessonId },
        { withCredentials: true }
      );
      if (res.data.success) {
        setCompletedLessons((prev) => prev.includes(lessonId) ? prev : [...prev, lessonId]);
        setInfo("✅ Lesson marked as completed!");
      }
    } catch (err) {
      setInfo("❌ Could not mark as completed.");
    }
  };

  // Navigate to next lesson or quiz
  const handleNextLesson = async () => {
    const current = course.lessons[currentLesson];
    await markLessonCompleted(current._id);
    
    if (currentLesson < course.lessons.length - 1) {
      setCurrentLesson(prev => prev + 1);
    } else if (quiz) {
      // Reaching end of lessons, prepare quiz
      setCurrentLesson(course.lessons.length);
    }
  };

  // Handle quiz answer selection
  const selectAnswer = (qIdx, answer) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: answer }));
  };

  // Submit quiz answers
  const submitQuiz = async () => {
    if (!quiz) return;
    try {
      const answers = quiz.questions.map((_, i) => quizAnswers[i] || "");
      const res = await axios.post(
        `http://localhost:4000/api/quiz/submit`,
        { courseId, answers },
        { withCredentials: true }
      );
      if (res.data.success) {
        setQuizResult(res.data);
        // if passed, mark course complete by enrolling student or custom call
        if (res.data.passed) {
          // Mark course completed API call here...
          setInfo("🎉 Quiz passed! Course marked complete.");
        } else {
          setInfo("⚠️ Quiz not passed, try again.");
        }
      } else {
        setInfo("❌ Quiz submission failed");
      }
      setQuizSubmitted(true);
    } catch (err) {
      setInfo("❌ Quiz submission error");
    }
  };

  if (loading) return <div style={styles.loading}>Loading course...</div>;
  if (!course) return <div style={styles.loading}>Course not found.</div>;

  // Show lesson unless reached quiz or completed all lessons
  if (currentLesson < course.lessons.length) {
    const lesson = course.lessons[currentLesson];
    const isCompleted = completedLessons.includes(lesson._id);
    const canGoNext = isCompleted || completedLessons.includes(course.lessons[currentLesson - 1]?._id);

    return (
      <div style={styles.page}>
        <aside style={styles.sidebar}>
          <h3 style={styles.title}>{course.title}</h3>
          <div style={styles.lessonList}>
            {course.lessons.map((l, idx) => (
              <div
                key={l._id}
                style={{
                  ...styles.lessonItem,
                  background: idx === currentLesson ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)"
                }}
                onClick={() => {
                  if (idx === 0 || completedLessons.includes(course.lessons[idx - 1]._id)) setCurrentLesson(idx);
                }}
              >
                <span>{l.title}</span>
                {completedLessons.includes(l._id) && <span style={styles.tick}>✔</span>}
              </div>
            ))}
          </div>
        </aside>
        <main style={styles.main}>
          <h2>{lesson.title}</h2>
          {lesson.contentType === "video" ? (
            <video src={lesson.contentUrl} controls style={styles.video} />
          ) : (
            <p>{lesson.contentUrl}</p>
          )}
          <div style={styles.btnRow}>
            <button onClick={() => markLessonCompleted(lesson._id)} disabled={isCompleted} style={isCompleted ? styles.completedBtn : styles.primaryBtn}>
              {isCompleted ? "✅ Completed" : "Mark as Completed"}
            </button>
            <button onClick={handleNextLesson} disabled={!canGoNext} style={canGoNext ? styles.primaryBtn : styles.disabledBtn}>
              Next Lesson →
            </button>
          </div>
        </main>
        {info && (
          <div style={styles.toast}>
            {info}
            <button style={styles.toastClose} onClick={() => setInfo("")} aria-label="Close">✕</button>
          </div>
        )}
      </div>
    );
  }

  // Show Quiz section if lessons complete
  if (quiz) {
    return (
      <div style={styles.page}>
        <aside style={styles.sidebar}>
          <h3 style={styles.title}>{course.title} - Quiz</h3>
        </aside>
        <main style={styles.main}>
          {quiz.questions.map((q, idx) => (
            <div key={idx} style={{ marginBottom: 24 }}>
              <h4>{idx + 1}. {q.questionText}</h4>
              <div>
                {q.options.map((opt, i) => (
                  <label key={i} style={{ display: "block", marginBottom: 6, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={opt}
                      onChange={() => selectAnswer(idx, opt)}
                      disabled={quizSubmitted}
                      checked={quizAnswers[idx] === opt}
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {!quizSubmitted && (
            <button style={styles.primaryBtn} onClick={submitQuiz}>Submit Quiz</button>
          )}
          {quizSubmitted && quizResult && (
            <div style={{ marginTop: 20, fontWeight: "bold", color: quizResult.passed ? "#22c55e" : "#f87171" }}>
              {quizResult.message} Score: {quizResult.score} / {quizResult.total}
            </div>
          )}
        </main>
        {info && (
          <div style={styles.toast}>
            {info}
            <button style={styles.toastClose} onClick={() => setInfo("")} aria-label="Close">✕</button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

const styles = {
  page: {
    display: "flex",
    background: "#0f172a",
    color: "#e6eef8",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
  },
  sidebar: {
    width: 300,
    padding: 20,
    background: "rgba(255,255,255,0.02)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
  },
  title: { color: "#a5b4fc", fontSize: 18, fontWeight: 700, marginBottom: 12 },
  lessonList: { display: "flex", flexDirection: "column", gap: 8 },
  lessonItem: {
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tick: { color: "#22c55e", fontWeight: 700 },
  main: { flex: 1, padding: 30 },
  video: { width: "100%", borderRadius: 10, marginTop: 12 },
  btnRow: { display: "flex", gap: 12, marginTop: 20 },
  primaryBtn: {
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    border: "none",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },
  completedBtn: {
    background: "rgba(34,197,94,0.2)",
    color: "#4ade80",
    border: "1px solid rgba(34,197,94,0.3)",
    padding: "10px 14px",
    borderRadius: 8,
  },
  disabledBtn: {
    background: "rgba(255,255,255,0.05)",
    color: "#9aa9c7",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "not-allowed",
  },
  loading: { color: "#cbd5e1", textAlign: "center", marginTop: 80 },
  toast: {
    position: "fixed",
    bottom: 20,
    right: 20,
    background: "rgba(15,23,42,0.9)",
    color: "#e6eef8",
    padding: "10px 14px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  toastClose: {
    background: "transparent",
    color: "#cbd5e1",
    border: "none",
    marginLeft: 8,
    fontSize: 18,
    cursor: "pointer"
  },
};
