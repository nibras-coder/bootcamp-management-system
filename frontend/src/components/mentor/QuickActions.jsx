import React from "react";
import {
  CalendarCheck,
  FileCheck2,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Mark Attendance",
      description: "Record today's student attendance",
      icon: <CalendarCheck size={20} />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      path: "/mentor/attendance",
    },
    {
      title: "Review Submissions",
      description: "Grade pending student work",
      icon: <FileCheck2 size={20} />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      path: "/mentor/grading",
    },
    {
      title: "Create Announcement",
      description: "Send an update to your students",
      icon: <Megaphone size={20} />,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      path: "/mentor/announcements",
    },
  ];

  return (
    <div className="p-5 space-y-3">
      {actions.map((action) => (
        <button
          key={action.title}
          onClick={() => navigate(action.path)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all duration-200 text-left group"
        >
          {/* Icon */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.iconBg} ${action.iconColor} flex-shrink-0`}
          >
            {action.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {action.title}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {action.description}
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all"
          />
        </button>
      ))}
    </div>
  );
}

export default QuickActions;