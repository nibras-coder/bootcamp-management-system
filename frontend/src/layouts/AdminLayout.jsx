import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // A simple way to get titles based on the route
  const getPageInfo = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return {
          title: "Admin Dashboard",
          subtitle:
            "Welcome back, Admin! Here's what's happening in the bootcamp.",
        };
      case "/admin-batches":
        return {
          title: "Tracks Management",
          subtitle: "View and manage all bootcamp cohorts",
        };
      case "/admin-mentors":
        return {
          title: "Mentors",
          subtitle: "Manage instructors and teaching assistants",
        };
      case "/admin-students":
        return {
          title: "Students",
          subtitle: "Student directory and performance",
        };
      case "/admin-attendance":
        return {
          title: "Attendance",
          subtitle: "Track and review daily attendance",
        };
      case "/admin-assignments":
        return {
          title: "Assignments",
          subtitle: "Manage tasks, projects, and grading",
        };
      case "/admin-announcements":
        return {
          title: "Announcements",
          subtitle: "Broadcast messages to batches",
        };
      case "/admin-reports":
        return {
          title: "Reports & Analytics",
          subtitle: "Detailed statistics and data exports",
        };
      case "/admin-settings":
        return {
          title: "Settings",
          subtitle: "System preferences and configurations",
        };
      default:
        return {
          title: "Admin Dashboard",
          subtitle: "Bootcamp Management System",
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40">
        <h1 className="text-xl font-bold text-teal-900">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-gray-100 rounded-md text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar - hidden on mobile unless toggled */}
      <div
        className={`${
          sidebarOpen ? "fixed inset-0 z-50 flex" : "hidden"
        } md:flex md:fixed md:w-64`}
      >
        <div className="w-64 h-full" onClick={() => setSidebarOpen(false)}>
          <Sidebar />
        </div>
        {/* Overlay to close sidebar on mobile */}
        {sidebarOpen && (
          <div
            className="flex-1 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen w-full">
        <Header title={title} subtitle={subtitle} />
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
