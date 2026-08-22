function StudentsAtRisk({ students }) {
  const list = students || [];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Students at Risk</h3>
      {list.length === 0 ? (
        <p className="text-gray-400 text-sm">No students at risk right now.</p>
      ) : (
        <div className="space-y-4">
          {list.map((student) => (
            <div key={student.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <span className="text-sm text-gray-800">{student.name}</span>
              </div>
              <span className="text-red-500 text-sm font-medium">{student.attendance}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentsAtRisk;
