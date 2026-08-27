import React from "react";

const UsersTable = () => {
  // Placeholder data for your presentation
  const mockUsers = [
    {
      id: 1,
      name: "Hanan Mohammed",
      email: "hanan@gmail.com",
      role: "Student",
      batch: "Web Dev Trach 2",
      status: "Active",
    },
    {
      id: 2,
      name: "Ahmed Yassin",
      email: "ahmed@gmail.com",
      role: "Student",
      batch: "UI/UX Track 1",
      status: "Active",
    },
    {
      id: 3,
      name: "Samiya Fuad",
      email: "samiya@gmail.com",
      role: "Mentor",
      batch: "Web Dev Track 2",
      status: "Active",
    },
    {
      id: 4,
      name: "Abdullah Isa",
      email: "abdullah@gmail.com",
      role: "Student",
      batch: "Data Science 1",
      status: "Inactive",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 mt-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Table Header Section */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Recent Users
        </h2>
        <button className="bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          + Add New User
        </button>
      </div>

      {/* The Actual Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Track</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:bg-gray-800">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                {/* User Info Column */}
                <div className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Role Column */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === "Mentor"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Batch Column */}
                <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                  {user.batch}
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 text-right">
                  <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium text-sm mr-3">
                    Edit
                  </button>
                  <button className="text-red-500 hover:text-red-700 font-medium text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
