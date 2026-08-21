const assignments = [
  { student: "Abel Tesfaye", title: "React Components", date: "May 14, 2026", status: "Pending" },
  { student: "Mekdes Alemu", title: "API Integration", date: "May 13, 2026", status: "Pending" },
  { student: "Daniel Worku", title: "React Components", date: "May 13, 2026", status: "Pending" },
];

function RecentAssignments() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Recent Assignments to Grade</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-100">
            <th className="pb-2 font-normal">Student</th>
            <th className="pb-2 font-normal">Assignment</th>
            <th className="pb-2 font-normal">Submitted</th>
            <th className="pb-2 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((item, index) => (
            <tr key={index} className="border-b border-gray-50 last:border-0">
              <td className="py-3 text-gray-800">{item.student}</td>
              <td className="py-3 text-gray-600">{item.title}</td>
              <td className="py-3 text-gray-600">{item.date}</td>
              <td className="py-3">
                <span className="bg-orange-50 text-orange-500 text-xs px-2 py-1 rounded-full">
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentAssignments;