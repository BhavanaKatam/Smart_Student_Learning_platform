# Smart Student Learning & Placement Management System (SSLPM)

A full-stack MERN application for managing student learning, course tracking, and placement activities in a training institute.

## Tech Stack

- **Frontend:** React.js (Hooks, React Router, Context API), Vite
- **Backend:** Node.js, Express.js (REST APIs)
- **Database:** MongoDB Atlas

## Features

- **Authentication** — Register/Login with roles (Admin, Trainer, Student)
- **Course Management** — Create, enroll, view, edit, delete courses
- **Student Dashboard** — Progress tracking with stats and course progress bars
- **Assignment System** — Create, submit, and grade assignments
- **Job Portal** — Post and apply for jobs

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas connection (configured in `backend/.env`)

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at **http://localhost:5001** (port 5001 avoids conflicts with other apps on 5000)

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

## User Roles

| Role    | Capabilities                                              |
|---------|-----------------------------------------------------------|
| Admin   | Manage users, courses, jobs; full system oversight      |
| Trainer | Create courses & assignments, grade submissions, post jobs |
| Student | Enroll in courses, submit assignments, apply for jobs   |

## API Endpoints

| Method | Endpoint                              | Access          |
|--------|---------------------------------------|-----------------|
| POST   | `/api/auth/register`                  | Public          |
| POST   | `/api/auth/login`                     | Public          |
| GET    | `/api/dashboard/stats`                | Authenticated   |
| GET    | `/api/courses`                        | Authenticated   |
| POST   | `/api/courses`                        | Trainer, Admin  |
| POST   | `/api/courses/:id/enroll`             | Student         |
| GET    | `/api/assignments/course/:courseId`   | Authenticated   |
| POST   | `/api/assignments`                    | Trainer, Admin  |
| POST   | `/api/assignments/:id/submit`         | Student         |
| GET    | `/api/jobs`                           | Authenticated   |
| POST   | `/api/jobs`                           | Trainer, Admin  |
| POST   | `/api/jobs/:id/apply`                 | Student         |
| GET    | `/api/users`                          | Admin           |

## Project Structure

```
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── AuthContext.jsx
        ├── api.js
        └── App.jsx
```
