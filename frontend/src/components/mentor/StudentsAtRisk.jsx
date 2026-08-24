const atRiskStudents = [
  { name: "Hashim Kemal", attendance: 55 },
  { name: "Dana Ayub", attendance: 60 },
  { name: "Suha Kedir", attendance: 62 },
];

function StudentsAtRisk() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Students at Risk</h3>
      <div className="space-y-4">
        {atRiskStudents.map((student) => (
          <div key={student.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <span className="text-sm text-gray-800 dark:text-gray-200">{student.name}</span>
            </div>
            <span className="text-red-500 text-sm font-medium">
              {student.attendance}%
            </span>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50">
        View All
      </button>
    </div>
  );
}

export default StudentsAtRisk;
