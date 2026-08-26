import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function RecentAssignments({ assignments = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          Recent Assignments to Grade
        </h3>
        <button
          onClick={() => navigate("/grading")}
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-0.5"
        >
          <span>Open Grading</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {assignments.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700 text-xs">
                <th className="pb-2 font-medium">Student</th>
                <th className="pb-2 font-medium">Assignment</th>
                <th className="pb-2 font-medium">Submitted</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {assignments.map((item, index) => (
                <tr key={item._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">{item.student}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">{item.title}</td>
                  <td className="py-3 text-xs text-gray-400">{item.date}</td>
                  <td className="py-3 text-right">
                    <span className="bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs px-2.5 py-1 rounded-full font-medium">
                      {item.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400 text-xs">
          No pending assignments to grade. You're all caught up!
        </div>
      )}
    </div>
  );
}

export default RecentAssignments;
