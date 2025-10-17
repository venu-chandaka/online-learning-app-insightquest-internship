// CourseView.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CourseView({ match }) {
  // If using React Router v6, use useParams instead of match
  const courseId = match?.params?.id; // If using useParams: const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get(`http://localhost:4000/api/course/${courseId}`, {
          withCredentials: true,
        });
        setCourse(res.data.course);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found.</div>;

  return (
    <div style={{ padding: 40, color: "#e6eef8", background: "#0f172a", minHeight: "100vh" }}>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      {/* Lessons */}
      <div>
        {course.lessons?.map(lesson => (
          <div key={lesson._id} style={{ margin: "12px 0", padding: 10, borderRadius: 8, background: "#1e293b" }}>
            <div>{lesson.title}</div>
            {lesson.contentType === "video" ? (
              <video controls width={500} src={lesson.contentUrl} />
            ) : (
              <div>{lesson.contentUrl}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
