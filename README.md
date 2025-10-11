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

## Setup Instructions

1. Clone the repository:
