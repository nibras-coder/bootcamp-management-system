function StatCard({ label, value, sublabel, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-gray-500 text-sm">{label}</p>
        <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
      <p className="text-gray-400 text-xs mt-1">{sublabel}</p>
    </div>
  );
}

export default StatCard;