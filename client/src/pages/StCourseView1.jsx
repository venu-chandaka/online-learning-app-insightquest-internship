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

  // ✅ Fetch course + completed lessons
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const [courseRes, completedRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/course/${courseId}`, {
            withCredentials: true,
          }),
          axios.get(`http://localhost:4000/api/student/get-completed-lessons/${courseId}`, {
            withCredentials: true,
          }),
        ]);

        setCourse(courseRes.data.course);
        setCompletedLessons(completedRes.data.completedLessonIds || []);
      } catch (err) {
        console.error("Error fetching course/progress:", err);
        setInfo("⚠️ Failed to load course or progress.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndProgress();
  }, [courseId]);

  // ✅ Mark lesson as completed
  const markLessonCompleted = async (lessonId) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/student/complete-lesson",
        { courseId, lessonId },
        { withCredentials: true }
      );

      if (res.data.success) {
        setCompletedLessons((prev) =>
          prev.includes(lessonId) ? prev : [...prev, lessonId]
        );
        setInfo("✅ Lesson marked as completed!");
      }
    } catch (err) {
      console.error("Error marking complete:", err);
      setInfo("❌ Could not mark as completed.");
    }
  };

  const handleNextLesson = async () => {
    const current = course.lessons[currentLesson];
    await markLessonCompleted(current._id);

    if (currentLesson < course.lessons.length - 1) {
      setCurrentLesson((prev) => prev + 1);
    }
  };

  if (loading) return <div style={styles.loading}>Loading course...</div>;
  if (!course) return <div style={styles.loading}>Course not found.</div>;

  const lesson = course.lessons[currentLesson];
  const isCompleted = completedLessons.includes(lesson._id);
  const canGoNext =
    isCompleted || completedLessons.includes(course.lessons[currentLesson - 1]?._id);

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
                background:
                  idx === currentLesson
                    ? "rgba(99,102,241,0.12)"
                    : "rgba(255,255,255,0.03)",
              }}
              onClick={() => {
                if (idx === 0 || completedLessons.includes(course.lessons[idx - 1]._id)) {
                  setCurrentLesson(idx);
                }
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
          <video
            src={lesson.contentUrl}
            controls
            style={styles.video}
          />
        ) : (
          <p>{lesson.contentUrl}</p>
        )}

        <div style={styles.btnRow}>
          <button
            onClick={() => markLessonCompleted(lesson._id)}
            style={isCompleted ? styles.completedBtn : styles.primaryBtn}
            disabled={isCompleted}
          >
            {isCompleted ? "✅ Completed" : "Mark as Completed"}
          </button>

          <button
            onClick={handleNextLesson}
            style={canGoNext ? styles.primaryBtn : styles.disabledBtn}
            disabled={!canGoNext}
          >
            Next Lesson →
          </button>
        </div>
      </main>
      {info && (
        <div style={styles.toast}>
          {info}
          <button
            style={styles.toastClose}
            onClick={() => setInfo("")}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
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
