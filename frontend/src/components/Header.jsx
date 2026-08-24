import React, { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, User } from 'lucide-react';
import API from '../api/axios';


const Header = ({ title, subtitle, userProfile = null }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await API.get("/announcements/all");
        
        if (response.data.success) {
          const userObj = JSON.parse(localStorage.getItem("user") || "{}");
          const userId = userObj.id || userObj._id;
          
          // Filter announcements that are not read by this user
          const unread = response.data.data.filter(a => !a.readBy?.includes(userId));
          setNotifications(unread);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    
    fetchNotifications();
  }, []);

  const unreadCount = notifications.length;

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
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await API.patch(`/announcements/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications.map(n => markAsRead(n._id)));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        
        
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-sm text-gray-600 dark:text-gray-300">
          <Calendar size={16} />
          <span>{dateString}</span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                <span onClick={markAllAsRead} className="text-xs text-teal-600 font-medium cursor-pointer hover:underline">Mark all as read</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? notifications.map((notif) => (
                  <div key={notif._id} onClick={(e) => markAsRead(notif._id, e)} className="p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{notif.title || notif.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.publishDate).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                )}
              </div>
              <div className="p-3 text-center border-t border-gray-100 dark:border-gray-700">
                <button className="text-sm font-medium text-teal-600 hover:text-teal-700">View All Announcements</button>
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
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center text-gray-500">
              <User size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
