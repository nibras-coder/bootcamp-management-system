import {
  AlertTriangle,
  ChevronRight,
  UserRound,
} from "lucide-react";

function StudentsAtRisk({ students = [] }) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle
                size={18}
                className="text-red-500"
              />
            </div>

            <h2 className="font-bold text-gray-900">
              Students at Risk
            </h2>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Students who may need support
          </p>
        </div>

        {students.length > 0 && (
          <button className="text-xs font-semibold text-teal-700 hover:text-teal-800">
            View all
          </button>
        )}
      </div>

      {/* Students */}
      {students.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
            <UserRound
              size={24}
              className="text-emerald-500"
            />
          </div>

          <p className="text-sm font-semibold text-gray-800 mt-4">
            All students are on track
          </p>

          <p className="text-xs text-gray-400 mt-1">
            No students currently require
            additional attention.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.slice(0, 4).map((student) => (
            <div
              key={student._id}
              className="group rounded-xl border border-red-100 bg-red-50/60 p-4 hover:bg-red-50 transition"
            >
              <div className="flex items-center justify-between gap-3">

                {/* Student */}
                <div className="flex items-center gap-3 min-w-0">

                  {student.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-red-600">
                        {student.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {student.name}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />

                      <span className="text-[11px] font-medium text-red-600">
                        Needs attention
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <button className="w-8 h-8 rounded-lg bg-white border border-red-100 flex items-center justify-center opacity-70 group-hover:opacity-100 transition">
                  <ChevronRight
                    size={15}
                    className="text-red-500"
                  />
                </button>
              </div>

              {/* Attendance */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-gray-500">
                    Attendance
                  </span>

                  <span className="text-xs font-bold text-red-600">
                    {student.attendancePercentage}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-red-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        student.attendancePercentage,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentsAtRisk;