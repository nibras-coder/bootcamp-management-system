# 🎓 ASTU MSJ Bootcamp Management System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

A web-based platform designed for managing the ASTU MSJ Summer Bootcamp in one centralized system.

This platform replaces manual spreadsheets, paper attendance, and scattered communication with a unified, streamlined application for admins, mentors, and students.

---

## 🚀 Features

- **💬 Real-Time Community:** Integrated live chat and forum spaces for seamless collaboration between students and mentors.
- **🔐 Authentication:** Secure JWT Authentication with Role-Based Access Control (Admin, Mentor, Student).
- **📱 App Accessibility:** Direct "Download App" integration on public pages for easy mobile access.
- **👥 User Management:** Complete Student & Mentor tracking, onboarding, and assignment mapping.
- **📚 Track & Phase Management:** Organize cohorts efficiently with dynamic phases and custom form fields.
- **📊 Analytics:** Real-time Attendance tracking and visual Progress metrics.
- **📝 Assignments:** Seamless Assignment distribution, submission handling, and status tracking.
- **🎯 Grading:** Direct Grading system with actionable Feedback loops.
- **📢 Communication:** System-wide Announcements and real-time notification drop-downs.
- **📈 Dashboards:** Customized, Role-specific UI views with secure, independent tab sessions.

---

## 👤 User Roles & Capabilities

### 👑 Admin

- Manage all users, educational tracks, and dynamic application phases.
- Assign mentors to specific students or groups.
- Broadcast system-wide announcements to targeted audiences.
- View high-level system statistics and health metrics.

### 🧑‍🏫 Mentor

- Manage and monitor assigned students' daily activities.
- Log and track student attendance and overall progress.
- Create, distribute, and grade assignments.
- Provide direct, actionable feedback to students.
- **Actively engage and answer questions in the real-time Student-Mentor Community.**

### 👨‍🎓 Student

- Access a personalized learning dashboard based on track enrollment.
- Track personal attendance and phase progress.
- Upload and submit assignments.
- View received grades, mentor feedback, and admin announcements.
- **Collaborate with peers and request help in the live Community space.**

---

## 🛠 Tech Stack & Architecture

**Architecture:** REST API + Real-time WebSockets + MERN Stack

| Environment  | Technologies Used                                       |
| :----------- | :------------------------------------------------------ |
| **Frontend** | React.js, Vite, React Router, Tailwind CSS, Axios       |
| **Backend**  | Node.js, Express.js, Socket.io (Live Chat), JWT, bcrypt |
| **Database** | MongoDB, Mongoose                                       |

---

## 📁 Core Modules

- Authentication & Session Management
- Tracks, Phases & Dashboards
- Attendance & Progress Engine
- Assignments & Submissions
- Announcements & Notifications
- **Live Community Chat (Socket.io)**

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### 1. Clone the repository

```bash
git clone https://github.com/nibras-coder/bootcamp-management-system.git
cd bootcamp-management-system
```

### 2. Setup the Backend

Open a terminal and navigate to your backend folder to install dependencies and start the API:

```Bash
cd backend
npm install
npm run dev
```

(Note: Ensure you have added your .env file containing your MongoDB URI and JWT secrets before running).

### 3. Setup the Frontend

Open a new terminal window and navigate to your frontend folder to start the React app:

```bash
cd frontend
npm install
npm run dev
```
