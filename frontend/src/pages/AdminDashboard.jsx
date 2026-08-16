import React from "react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome to the ASTU MSJ Bootcamp Management System.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Total Students
            </p>

            <h2 className="text-3xl font-bold text-teal-700 mt-2">
              0
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Total Mentors
            </p>

            <h2 className="text-3xl font-bold text-teal-700 mt-2">
              0
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Active Batches
            </p>

            <h2 className="text-3xl font-bold text-teal-700 mt-2">
              0
            </h2>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;