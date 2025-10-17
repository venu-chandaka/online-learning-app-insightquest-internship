# Online Learning App – Week 1 Task

## Overview
This project is part of the InsightQuest internship where I developed a foundational online learning platform. Week 1 focuses on user authentication, backend setup, and email-based verification workflows.

---

## Week 1 Deliverables
- User Registration and Login (Students and Mentors) with password hashing.
- Password reset using OTP sent via email.
- Welcome email sent to new users on registration.
- API and frontend integration for authentication and profile dashboards.
- MongoDB database models and routes.
- React frontend with login, dashboard, and profile views.

---

## Password Reset via OTP
- Endpoint to request OTP at `/api/auth/st-send-reset-otp`
- Endpoint to verify OTP and reset password at `/api/auth/st-reset-password`
- Emails OTP code for secure password reset.
- OTP expires after 10 minutes.

---

## Welcome Email
- Sends a welcome message to user email upon successful registration.
- Configured with NodeMailer using environment variables for email service credentials.

---
## Week 2 Deliveries

- Implemented **Student Dashboard** with:
  - Course listing (enrolled and available)
  - Enrollment functionality integrated with backend API
  - View course details and lessons with video playback support
  - Responsive UI with dynamic button states for enroll/view actions
  - User authentication check for protected operations
  - Smooth transitions using Framer Motion animations

- Completed backend endpoints for:
  - Fetching student data and enrolled courses
  - Enrolling students in courses with validation and user verification
  - Serving course and lesson content with proper authorization

- Fixed critical bugs:
  - Unique keys added in React lists to prevent warnings
  - React hooks called only at top-level avoiding order issues
  - Line-ending warnings addressed for cross-platform compatibility
  - Improved error handling and toast notifications

- Updated GitHub repo with latest code for frontend and backend.

**Next Steps:**

- Enhance course progress tracking and completion rates.
- Add comment and feedback features for courses.
- Refactor UI components for better maintainability.
- Prepare demo deployment and documentation for project showcase.
