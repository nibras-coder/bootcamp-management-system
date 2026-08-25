function RecentAssignments({ submissions = [] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">
        Recent Assignments to Grade
      </h3>

      {submissions.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-400">
            No pending assignments
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
              {submissions.map((item, index) => (
                <tr
                  key={item._id || index}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 text-gray-800">
                    {item.student?.name || "Unknown Student"}
                  </td>

                  <td className="py-3 text-gray-600">
                    {item.assignment?.title || "Assignment"}
                  </td>

                  <td className="py-3 text-gray-600">
                    {item.submittedAt
                      ? new Date(
                          item.submittedAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="py-3">
                    <span className="bg-orange-50 text-orange-500 text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentAssignments;