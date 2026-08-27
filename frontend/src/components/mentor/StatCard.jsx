function StatCard({ label, value, sublabel, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{sublabel}</p>
    </div>
  );
}

export default StatCard;