import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AttendanceChart({ data }) {
  const chartData =
    data && data.length > 0
      ? data
      : [
          {
            day: "No data",
            value: 0,
          },
        ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">
        Attendance Overview
      </h3>

      <ResponsiveContainer
        width="100%"
        height={250}
      >
        <LineChart data={chartData}>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#eee"
          />

          <XAxis
            dataKey="day"
            tick={{
              fontSize: 12,
            }}
          />

          <YAxis
            domain={[0, 100]}
            tick={{
              fontSize: 12,
            }}
            tickFormatter={(value) =>
              `${value}%`
            }
          />

          <Tooltip
            formatter={(value) => [
              `${value}%`,
              "Attendance",
            ]}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#0f766e"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#0f766e",
            }}
            activeDot={{
              r: 6,
            }}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AttendanceChart;