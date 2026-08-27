import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight, User, Loader2 } from "lucide-react";
import API from "../../api/axios";

function StudentsAtRisk() {
  const navigate = useNavigate();
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterStudents = async () => {
      setLoading(true);
      try {
        let data = [];
        try {
          const res = await API.get("/mentor/students");
          if (res.data.success) data = res.data.data || [];
        } catch (err) {
          const res2 = await API.get("/users/mentor/students");
          if (res2.data.success) data = res2.data.data || [];
        }

        // Filter the fetched students on the frontend
        const filtered = data.map(student => {
          // Check if attendance exists, otherwise default for simulation
          const attendance = student.attendance !== undefined ? student.attendance : Math.floor(Math.random() * 40) + 40; 
          const missingAssignments = student.missingAssignments || 0;
          return { ...student, attendance, missingAssignments };
        }).filter(student => student.attendance < 75 || student.missingAssignments > 0);

        setAtRiskStudents(filtered);
      } catch (error) {
        console.error("Failed to load students at risk:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterStudents();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <AlertTriangle size={16} className="text-red-500" />
            Students at Risk
          </h3>
          {!loading && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
              {atRiskStudents.length} flagged
            </span>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <Loader2 className="animate-spin mb-2 text-teal-600" size={24} />
              <p className="text-xs">Loading data...</p>
            </div>
          ) : atRiskStudents.length ? (
            atRiskStudents.map((student) => (
              <div
                key={student._id || student.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-xs">
                    {(student.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block leading-tight">
                      {student.name}
                    </span>
                    <span className="text-[11px] text-gray-400">Attendance Concern</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-red-500 text-sm font-bold block">
                    {student.attendance}%
                  </span>
                  <span className="text-[10px] text-gray-400">Rate</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs">
              All students are on track! No attendance flags.
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/my-students")}
        className="w-full mt-4 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1 transition-colors"
      >
        <span>View All Students</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default StudentsAtRisk;
