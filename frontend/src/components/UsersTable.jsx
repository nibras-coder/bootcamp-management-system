import React, { useState, useEffect } from "react";
import axios from "axios";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Grab the admin token from local storage (saved during login)
        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Call the backend API you just built!
        const response = await axios.get(
          "http://localhost:5000/api/users",
          config,
        );

        // Extract the users array from your teammate's response format
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Could not load users. Please check your connection.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-4 font-semibold text-gray-600">Full Name</th>
            <th className="p-4 font-semibold text-gray-600">Email</th>
            <th className="p-4 font-semibold text-gray-600">Role</th>
            <th className="p-4 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b hover:bg-gray-50">
              <td className="p-4">{user.fullName}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4 capitalize">{user.role}</td>
              <td className="p-4">
                <span className="px-2 py-1 text-sm text-green-700 bg-green-100 rounded-full">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
