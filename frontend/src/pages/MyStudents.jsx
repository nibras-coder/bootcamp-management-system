import Sidebar from "../components/mentor/Sidebar";

const students = [
  {
    name: "Abel Tesfaye",
    email: "abel@gmailcom",
    attendance: 55,
    progress: "In Progress",
  },
  {
    name: "Mekdes Alemu",
    email: "mekdes@gmailcom",
    attendance: 60,
    progress: "In Progress",
  },
  {
    name: "Daniel Worku",
    email: "daniel@gmailcom",
    attendance: 62,
    progress: "Needs Improvement",
  },
  {
    name: "Sara Ali",
    email: "sara@gmailcom",
    attendance: 91,
    progress: "Completed",
  },
];

function MyStudents() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Students</h1>
        <p className="text-gray-500 text-sm mb-6">
          Students assigned to your Track.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-normal">Name</th>
                <th className="pb-3 font-normal">Email</th>
                <th className="pb-3 font-normal">Attendance</th>
                <th className="pb-3 font-normal">Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.email}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 text-gray-800">{student.name}</td>
                  <td className="py-3 text-gray-600">{student.email}</td>
                  <td className="py-3">
                    <span
                      className={
                        student.attendance < 65
                          ? "text-red-500"
                          : "text-teal-700"
                      }
                    >
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{student.progress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default MyStudents;
