import {
  FileText,
  Clock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

function formatDate(date) {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatTimeAgo(date) {
  if (!date) return "";

  const now = new Date();
  const submitted = new Date(date);

  const difference =
    now.getTime() - submitted.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  return `${days} days ago`;
}

function RecentAssignments({
  submissions = [],
}) {
  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">

        <div>
          <div className="flex items-center gap-2">

            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <FileText
                size={18}
                className="text-amber-600"
              />
            </div>

            <h2 className="font-bold text-gray-900">
              Recent Assignments to Grade
            </h2>

          </div>

          <p className="text-xs text-gray-500 mt-2">
            Submissions waiting for review
          </p>
        </div>

        {submissions.length > 0 && (
          <button className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1">
            View all
            <ChevronRight size={14} />
          </button>
        )}

      </div>

      {/* Empty state */}
      {submissions.length === 0 ? (
        <div className="py-10 text-center">

          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2
              size={25}
              className="text-emerald-500"
            />
          </div>

          <p className="text-sm font-semibold text-gray-800 mt-4">
            Nothing to grade right now
          </p>

          <p className="text-xs text-gray-400 mt-1">
            You're all caught up! 🎉
          </p>

        </div>
      ) : (

        <div className="space-y-3">

          {submissions
            .slice(0, 5)
            .map((submission) => {

              const student =
                submission.student;

              const assignment =
                submission.assignment;

              return (
                <div
                  key={submission._id}
                  className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-teal-100 hover:bg-teal-50/30 transition"
                >

                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0">

                    {/* Student avatar */}
                    {student?.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-teal-700">
                          {student?.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "S"}
                        </span>
                      </div>
                    )}

                    <div className="min-w-0">

                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {assignment?.title ||
                          "Untitled Assignment"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {student?.name ||
                          "Unknown student"}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1">

                        <Clock
                          size={11}
                          className="text-gray-400"
                        />

                        <span className="text-[10px] text-gray-400">
                          {formatTimeAgo(
                            submission.submittedAt
                          )}
                        </span>

                      </div>

                    </div>
                  </div>

                  {/* Review button */}
                  <button className="shrink-0 px-3 py-2 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition flex items-center gap-1">
                    Review
                    <ChevronRight size={13} />
                  </button>

                </div>
              );
            })}

        </div>
      )}

    </div>
  );
}

export default RecentAssignments;