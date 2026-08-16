import React from "react";
import AdminLayout from "../components/AdminLayout";
import UsersTable from "../components/UsersTable";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-bootcamp-textLight font-bold uppercase tracking-wider text-xs">
            Total Students
          </h3>
          <p className="text-4xl text-bootcamp-textDark font-extrabold mt-2">
            124
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-bootcamp-textLight font-bold uppercase tracking-wider text-xs">
            Active Batches
          </h3>
          <p className="text-4xl text-bootcamp-textDark font-extrabold mt-2">
            8
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-bootcamp-textLight font-bold uppercase tracking-wider text-xs">
            Avg. Attendance
          </h3>
          <p className="text-4xl text-bootcamp-textDark font-extrabold mt-2">
            92%
          </p>
        </div>
      </div>

      {/* Users Table Component */}
      <UsersTable />
    </AdminLayout>
  );
};

export default AdminDashboard;
