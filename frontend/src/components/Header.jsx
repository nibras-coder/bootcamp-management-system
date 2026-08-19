import React, { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, User } from 'lucide-react';

const Header = ({ title, subtitle, userProfile = null }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const dropdownRef = useRef(null);

  const notifications = [
    { id: 1, text: "Reminder: Weekly Experience Sharing at 8 PM", time: "1 hour ago" },
    { id: 2, text: "New Codeforces contest results uploaded", time: "3 hours ago" },
    { id: 3, text: "Bootcamp Regular Session starting soon", time: "5 hours ago" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleNotificationClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setUnreadCount(0); // Clear badge when opened
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600">
          <Calendar size={16} />
          <span>{dateString}</span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center transform translate-x-1 -translate-y-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <span className="text-xs text-teal-600 font-medium cursor-pointer hover:underline">Mark all as read</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-800">{notif.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-100">
                <button className="text-sm font-medium text-teal-600 hover:text-teal-700">View All Notifications</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Header Avatar Fallback */}
        <div className="ml-2">
          {userProfile?.imageUrl ? (
            <img
              src={userProfile.imageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 shadow-sm flex items-center justify-center text-gray-500">
              <User size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
