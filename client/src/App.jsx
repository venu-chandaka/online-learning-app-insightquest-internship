import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import HomePage from "./pages/Home.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import MentorDashboard from "./pages/MentorDashboard.jsx";
import CourseView from "./pages/CourseView";
import StCourseView from "./pages/StCourseView.jsx";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/stdashboard" element={<StudentDashboard />} />
          <Route path="/course/:id" element={<CourseView />} />
          <Route path="/mentordashboard" element={<MentorDashboard />} />
          <Route path="/student/course/:id" element={<StCourseView />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
