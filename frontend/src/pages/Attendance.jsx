import { useState } from "react";
import Sidebar from "../components/mentor/Sidebar";

const initialStudents = [
  { id: 1, name: "Abel Tesfaye", status: "present" },
  { id: 2, name: "Mekdes Alemu", status: "present" },
  { id: 3, name: "Daniel Worku", status: "absent" },
  { id: 4, name: "Sara Ali", status: "present" },
];

const statusOptions = ["present", "absent", "late", "excused"];

const statusColors = {
  present: "bg-teal-50 text-teal-700",
  absent: "bg-red-50 text-red-600",
  late: "bg-orange-50 text-orange-500",
  excused: "bg-gray-100 text-gray-600",
};

function Attendance() {
  const [students, setStudents] = useState(initialStudents);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleStatusChange = (id, newStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, status: newStatus } : student,
      ),
    );
  };

  const handleSave = () => {
    // TODO: send `students` + `date` to backend via POST /api/attendance
    console.log("Saving attendance for", date, students);
    alert("Attendance saved (not yet connected to backend)");
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const attendancePercent = Math.round((presentCount / students.length) * 100);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-500 text-sm">
              Mark today's attendance for your track.
            </p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <p className="text-sm text-gray-500">
            Present today:{" "}
            <span className="font-semibold text-teal-700">
              {presentCount}/{students.length}
            </span>{" "}
            ({attendancePercent}%)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-normal">Student</th>
                <th className="pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 text-gray-800">{student.name}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleStatusChange(student.id, option)}
                          className={`px-3 py-1 rounded-full text-xs capitalize ${
                            student.status === option
                              ? statusColors[option]
                              : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSave}
            className="mt-5 bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-teal-900"
          >
            Save Attendance
          </button>
        </div>
      </main>
    </div>
  );
}

export default Attendance;
