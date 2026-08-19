import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Download,
  Loader,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const mockReports = {
  totalStudents: 156,
  activeBatches: 4,
  averageAttendance: 92.5,
  completionRate: 88,
  topPerformers: [
    { name: "Hayat Abdulfetah", batch: "Web Dev Bootcamp", score: 98 },
    { name: "Muna Esmael", batch: "DSA & CP", score: 96 },
    { name: "Ruba Kedir", batch: "DSA & CP", score: 95 },
    { name: "Asmau Usman", batch: "Web Dev Bootcamp", score: 95 },
  ],
};

const dsaScoresData = [
  { batch: "DSA Cohort 1", score: 85 },
  { batch: "DSA Cohort 2", score: 78 },
  { batch: "CP Advanced", score: 92 },
  { batch: "Beginners CP", score: 65 },
];

const genderData = [
  { name: "Male", value: 94 },
  { name: "Female", value: 62 },
];
const GENDER_COLORS = ["#0f766e", "#14b8a6"];

const ReportsPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);
    // Simulate generating report PDF
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {exportSuccess && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm font-medium flex items-center">
          <CheckCircle size={16} className="mr-2" />
          Report exported successfully to PDF!
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Reports & Analytics</h2>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {isExporting ? (
            <Loader className="animate-spin" size={18} />
          ) : (
            <Download size={18} />
          )}
          <span>Export PDF</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Total Students
            </h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {mockReports.totalStudents}
          </p>
          <p className="text-xs text-green-500 flex items-center mt-2">
            <TrendingUp size={12} className="mr-1" /> +12% this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Average Attendance
            </h3>
            <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
              <BarChart3 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {mockReports.averageAttendance}%
          </p>
          <p className="text-xs text-green-500 flex items-center mt-2">
            <TrendingUp size={12} className="mr-1" /> +2.1% from last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Completion Rate
            </h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Award size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {mockReports.completionRate}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Overall across all batches
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Active Batches
            </h3>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {mockReports.activeBatches}
          </p>
          <p className="text-xs text-gray-500 mt-2">Currently running</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-6">
            Average DSA Contest Scores by Batch
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dsaScoresData}
                margin={{ top: 5, right: 20, bottom: 25, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="batch"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  domain={[0, 100]}
                  dx={-10}
                />
                <RechartsTooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-6">
            Student Gender Distribution
          </h3>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-bold text-gray-800">156</span>
              <span className="text-xs text-gray-500 font-medium mt-1">
                Total Students
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">
          Top Performing Students
        </h3>
        <ul className="space-y-4 max-w-2xl">
          {mockReports.topPerformers.map((student, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.batch}</p>
                </div>
              </div>
              <div className="font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                {student.score}%
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportsPage;
