import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
  const location = useLocation();
  
  // A simple way to get titles based on the route
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return { title: 'Admin Dashboard', subtitle: "Welcome back, Admin! Here's what's happening in the bootcamp." };
      case '/admin/batches':
        return { title: 'Batches Management', subtitle: 'View and manage all bootcamp cohorts' };
      case '/admin/mentors':
        return { title: 'Mentors', subtitle: 'Manage instructors and teaching assistants' };
      case '/admin/students':
        return { title: 'Students', subtitle: 'Student directory and performance' };
      case '/admin/attendance':
        return { title: 'Attendance', subtitle: 'Track and review daily attendance' };
      case '/admin/assignments':
        return { title: 'Assignments', subtitle: 'Manage tasks, projects, and grading' };
      case '/admin/announcements':
        return { title: 'Announcements', subtitle: 'Broadcast messages to batches' };
      case '/admin/reports':
        return { title: 'Reports & Analytics', subtitle: 'Detailed statistics and data exports' };
      case '/admin/settings':
        return { title: 'Settings', subtitle: 'System preferences and configurations' };
      default:
        return { title: 'Admin Dashboard', subtitle: 'Bootcamp Management System' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <Header title={title} subtitle={subtitle} />
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
