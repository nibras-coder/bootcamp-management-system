import React, { useState, useRef, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
import API from '../api/axios';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ title, subtitle, userProfile = null }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Get current date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        <NotificationDropdown />
        
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-sm text-gray-600 dark:text-gray-300">
          <Calendar size={16} />
          <span>{dateString}</span>
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
