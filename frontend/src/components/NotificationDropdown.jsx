import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import API from '../api/axios';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userObj = JSON.parse(sessionStorage.getItem("user") || '{}');
        const role = userObj.role || 'student';
        const userId = userObj.id || userObj._id;
        
        let url = '/student/announcements';
        if (role === 'admin') url = '/announcements/all';
        else if (role === 'mentor') url = '/announcements';

        const response = await API.get(url);
        if (response.data.success) {
          const unread = response.data.data.filter(a => !a.readBy?.includes(userId));
          setNotifications(unread);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    
    fetchNotifications();
  }, []);

  const unreadCount = notifications.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await API.patch(`/announcements/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications.map(n => API.patch(`/announcements/${n._id}/read`)));
      setNotifications([]);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif._id} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group relative">
                  <p className="text-sm text-gray-800 dark:text-gray-200 pr-16">{notif.title || notif.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notif.publishDate || notif.createdAt || Date.now()).toLocaleDateString()}</p>
                  <button 
                    onClick={(e) => markAsRead(notif._id, e)} 
                    className="absolute right-4 top-4 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    Set as read
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center justify-center">
                <Bell className="mb-2 text-gray-300 dark:text-gray-600" size={32} />
                <p>No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
