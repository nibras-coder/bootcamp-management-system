function StudentsAtRisk({ students = [] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">
        Students at Risk
      </h3>

      {students.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-400">
            No students currently at risk
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student._id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                    {student.name
                      ?.charAt(0)
                      .toUpperCase() || "S"}
                  </div>
                )}

                <span className="text-sm text-gray-800">
                  {student.name}
                </span>
              </div>

              <span className="text-red-500 text-sm font-medium">
                {student.attendancePercentage}%
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        className="w-full mt-4 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        View All
      </button>
    </div>
  );
}

export default StudentsAtRisk;