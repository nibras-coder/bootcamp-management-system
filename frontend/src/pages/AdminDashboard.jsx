import React, { useMemo } from "react";
import {
  Users,
  UserSquare2,
  Layers,
  TrendingUp,
  Clock,
  CalendarDays,
  FileEdit,
  Mic,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  // Generate last 7 days dynamically
  const attendanceData = useMemo(() => {
    const data = [];
    const baseRates = [82, 84, 81, 86, 85, 88, 85.6]; // Using provided base mock values

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const name = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      data.push({ name, pv: baseRates[6 - i] });
    }
    return data;
  }, []);

  const batchData = [
    { name: "Web Dev", value: 92 },
    { name: "Mobile Dev", value: 58 },
    { name: "UI/UX Design", value: 48 },
    { name: "Data Science", value: 30 },
    { name: "Other", value: 20 },
  ];

  const COLORS = ["#134e4a", "#14b8a6", "#0f766e", "#5eead4", "#ccfbf1"];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">248</h3>
            <p className="text-xs font-medium text-green-500 mt-2">
              +12 this week
            </p>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <Users size={24} />
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Mentors</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">18</h3>
            <p className="text-xs font-medium text-green-500 mt-2">
              +2 this week
            </p>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <UserSquare2 size={24} />
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Tracks</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">6</h3>
            <p className="text-xs font-medium text-gray-400 mt-2">No change</p>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <Layers size={24} />
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Attendance (Avg.)
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">85.6%</h3>
            <p className="text-xs font-medium text-green-500 mt-2">
              +4.3% this week
            </p>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-800">
              Attendance Overview
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  domain={[0, 100]}
                  dx={-10}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [`${value}%`, "Attendance"]}
                />
                <Line
                  type="monotone"
                  dataKey="pv"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "#fff",
                    stroke: "#0f766e",
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#0f766e",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-gray-800 mb-2">
            Students by Track
          </h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={batchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {batchData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-800 leading-none">
                  248
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1">
                  Total
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {batchData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">
              Recent Announcements
            </h3>
            <button
              onClick={() => (window.location.href = "/admin/announcements")}
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View All
            </button>
          </div>
          <div className="p-5 flex-1 space-y-5">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                <Mic size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800">
                  Weekly Experience Sharing
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  Guest speaker from Google joining us this Friday to share
                  insights.
                </p>
                <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400 font-medium">
                  <Clock size={12} />
                  <span>2 hours ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mt-0.5">
                <FileEdit size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800">
                  DSA Weekly Contest
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  Codeforces round #842 is now open for all competitive
                  programming students.
                </p>
                <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400 font-medium">
                  <Clock size={12} />
                  <span>5 hours ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mt-0.5">
                <CalendarDays size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800">
                  Bootcamp Regular Sessions
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  Reminder: We have 3 regular sessions this week starting
                  Monday.
                </p>
                <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400 font-medium">
                  <Clock size={12} />
                  <span>1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">
              Recent Assignments
            </h3>
            <button
              onClick={() => (window.location.href = "/admin/assignments")}
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View All
            </button>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-medium border-b border-gray-100">
                  <th className="py-3 px-5">Title</th>
                  <th className="py-3 px-5">Track</th>
                  <th className="py-3 px-5">Submissions</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-5">
                    <span className="font-medium text-gray-800">
                      Codeforces Div 2
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-600">DSA & CP</td>
                  <td className="py-3 px-5 text-gray-600">72/92</td>
                  <td className="py-3 px-5">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      Active
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-5">
                    <span className="font-medium text-gray-800">
                      API Integration
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-600">Mobile Dev</td>
                  <td className="py-3 px-5 text-gray-600">58/58</td>
                  <td className="py-3 px-5">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                      Grading
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-5">
                    <span className="font-medium text-gray-800">
                      Figma Prototype
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-600">UI/UX Design</td>
                  <td className="py-3 px-5 text-gray-600">48/48</td>
                  <td className="py-3 px-5">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-5">
                    <span className="font-medium text-gray-800">
                      Data Cleaning
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-600">Data Science</td>
                  <td className="py-3 px-5 text-gray-600">14/30</td>
                  <td className="py-3 px-5">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      In Progress
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
