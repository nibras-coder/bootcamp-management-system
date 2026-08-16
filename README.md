## Bootcamp Management System
# 🎓 ASTU MSJ Bootcamp Management System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

A web-based platform designed for managing the ASTU MSJ Summer Bootcamp in one centralized system. 

This platform replaces manual spreadsheets, paper attendance, and scattered communication with a unified, streamlined application for admins, mentors, and students.

---

## 🚀 Features

*   **🔐 Authentication:** Secure JWT Authentication & Role-Based Access Control
*   **👥 User Management:** Complete Student & Mentor tracking and assignment
*   **📚 Batch Management:** Organize and track cohorts efficiently
*   **📊 Analytics:** Real-time Attendance & Progress Tracking
*   **📝 Assignments:** Seamless Assignment distribution & Submissions
*   **🎯 Grading:** Direct Grading & actionable Feedback loops
*   **📢 Communication:** System-wide Announcements & Notifications
*   **📈 Dashboards:** Customized, Role-specific UI views

---

## 👤 User Roles & Capabilities

### 👑 Admin
*   Manage all users and educational batches.
*   Assign mentors to specific students or groups.
*   Broadcast system-wide announcements.
*   View high-level system statistics and health metrics.

### 🧑‍🏫 Mentor
*   Manage and monitor assigned students.
*   Log and track student attendance and overall progress.
*   Create, distribute, and grade assignments.
*   Provide direct, actionable feedback to students.

### 👨‍🎓 Student
*   Access a personalized learning dashboard.
*   Track personal attendance and course progress.
*   Upload and submit assignments.
*   View received grades, mentor feedback, and announcements.

---

## 🛠 Tech Stack & Architecture

**Architecture:** REST API + MERN Stack

| Environment | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, React Router, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js, JWT, bcrypt |
| **Database** | MongoDB, Mongoose |

---

## 📁 Core Modules

*   Authentication & Users
*   Batches & Dashboards
*   Attendance & Progress
*   Assignments & Submissions
*   Announcements

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### 1. Clone the repository
```bash
git clone https://github.com/nibras-coder/bootcamp-management-system.git
cd bootcamp-management-system
```
### 2. Setup the Backend
Open a terminal and navigate to your backend folder to start the API:

```bash
cd backend
npm install
npm run dev
```
### 3. Setup the Frontend
Open a new terminal window and navigate to your frontend folder to start the React app:

```bash
cd frontend
npm install
npm run dev
```
