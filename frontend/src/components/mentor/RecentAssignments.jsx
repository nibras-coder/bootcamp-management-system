function RecentAssignments({ assignments }) {
  const list = assignments || [];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Recent Assignments to Grade</h3>
      {list.length === 0 ? (
        <p className="text-gray-400 text-sm">Nothing to grade right now.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-2 font-normal">Student</th>
              <th className="pb-2 font-normal">Assignment</th>
              <th className="pb-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, index) => (
              <tr key={index} className="border-b border-gray-50 last:border-0">
                <td className="py-3 text-gray-800">{item.student}</td>
                <td className="py-3 text-gray-600">{item.assignment}</td>
                <td className="py-3">
                  <span className="bg-orange-50 text-orange-500 text-xs px-2 py-1 rounded-full capitalize">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RecentAssignments;
