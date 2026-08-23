import { Calendar, FileText, Megaphone } from "lucide-react";

const actions = [
  { label: "Mark Attendance", icon: Calendar },
  { label: "Review Submissions", icon: FileText },
  { label: "Create Announcement", icon: Megaphone },
];

function QuickActions() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="w-full flex items-center gap-3 border border-teal-100 bg-teal-50 text-teal-800 rounded-lg px-4 py-3 text-sm hover:bg-teal-100"
          >
            <action.icon size={16} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;