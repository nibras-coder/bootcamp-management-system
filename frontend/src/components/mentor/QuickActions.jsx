import { useNavigate } from "react-router-dom";
import { Calendar, FileText, Megaphone, BookOpen, Users, Award } from "lucide-react";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: "Mark Attendance", icon: Calendar, path: "/attendance", color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60" },
    { label: "Review Submissions", icon: Award, path: "/grading", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60" },
    { label: "Create Announcement", icon: Megaphone, path: "/announcements", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60" },
    { label: "Share Resources", icon: BookOpen, path: "/resources", color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h3>
        <div className="space-y-2.5">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition-all group"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${action.color} transition-transform group-hover:scale-105`}>
                <action.icon size={15} />
              </div>
              <span className="text-left flex-1">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;