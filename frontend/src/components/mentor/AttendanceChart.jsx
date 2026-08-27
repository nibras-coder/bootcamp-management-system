import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function AttendanceChart({ data = [] }) {
  const chartData = data && data.length > 0 ? data : [
    { day: "Mon", value: 85 },
    { day: "Tue", value: 88 },
    { day: "Wed", value: 80 },
    { day: "Thu", value: 92 },
    { day: "Fri", value: 87 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 94 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60 min-w-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          Attendance Overview
        </h3>
        <span className="text-xs text-gray-400 font-medium">Last 7 Days</span>
      </div>
      <div className="w-full h-[250px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                borderColor: "#374151",
                color: "#f9fafb",
                borderRadius: "0.75rem",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value}%`, "Attendance Rate"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0d9488"
              strokeWidth={3}
              dot={{ r: 4, fill: "#0d9488" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AttendanceChart;