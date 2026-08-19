import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MentorDashboard from "./Pages/MentorDashboard";
import MyStudents from "./Pages/MyStudents";
import Attendance from "./Pages/Attendance";
import Progress from "./Pages/Progress";
import Assignments from "./Pages/Assignments";
import Grading from "./Pages/Grading";
import Announcements from "./Pages/Announcements";
import Profile from "./Pages/Profile";
import Settings from "./Pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* public landing page */}
        <Route path="/" element={<Home />} />
         {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Register page */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        {/* mystudents*/}  
        <Route path="/my-students" element={<MyStudents />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/grading" element={<Grading />} />
        <Route path="/announcements" element={<Announcements />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} /> 

        {/* Any unknown URL goes back to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;