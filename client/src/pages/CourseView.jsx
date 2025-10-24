// CourseView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ for v6
import axios from "axios";

export default function CourseView() {
  const { id: courseId } = useParams(); // ✅ correct way to access param
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/mentor/course/${courseId}`, // or /api/course for students
          { withCredentials: true }
        );
        setCourse(res.data.course);
      } catch (error) {
        console.error("Error fetching course:", error.message);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) fetchCourse();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found.</div>;

  return (
    <div
      style={{
        padding: 40,
        color: "#e6eef8",
        background: "rgba(15, 23, 42, 0.85)",
        minHeight: "100vh",
        backdropFilter: "blur(10px)",
      }}
    >
      <h2>{course.title}</h2>
      <p>{course.description}</p>

      {/* Lessons */}
      <div>
        {course.lessons?.map((lesson) => (
          <div
            key={lesson._id}
            style={{
              margin: "12px 0",
              padding: 10,
              borderRadius: 8,
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(5px)",
            }}
          >
            <strong>{lesson.title}</strong>
            {lesson.contentType === "video" ? (
              <video
                controls
                width={500}
                src={lesson.contentUrl}
                style={{ marginTop: 8, borderRadius: 10 }}
              />
            ) : (
              <div style={{ marginTop: 8 }}>{lesson.contentUrl}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
