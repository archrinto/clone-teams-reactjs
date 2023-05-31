import React, { useState } from 'react';
import { ChatBubbleOvalLeftEllipsisIcon, InboxIcon, UserIcon, UserGroupIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';

const Sidebar: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<String>('home');

    const handleMenuClick = (menu: String) => {
        setActiveMenu(menu);
    };

    return (
        <div className="sidebar py-3 w-full ml-1 text-gray-400">
            <button
                className={`w-full flex flex-col items-center justify-center mb-4 ${
                activeMenu === 'home' ? 'text-indigo-700 border-l-2 border-indigo-700' : 'border-l-2 border-transparent'
                }`}
                onClick={() => handleMenuClick('home')}
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-inherit" />
                <span className="text-xs">Chat</span>
            </button>
            <button
                className={`w-full flex flex-col items-center justify-center mb-4 ${
                activeMenu === 'inbox' ? 'text-indigo-700 border-l-2 border-indigo-700' : 'border-l-2 border-transparent'
                }`}
                onClick={() => handleMenuClick('inbox')}
            >
                <UserGroupIcon className="w-6 h-6" />
                <span className="text-xs">Teams</span>
            </button>
            <button
                className={`w-full flex flex-col items-center justify-center mb-4 ${
                activeMenu === 'profile' ? 'text-indigo-700 border-l-2 border-indigo-700' : 'border-l-2 border-transparent'
                }`}
                onClick={() => handleMenuClick('profile')}
            >
                <CalendarDaysIcon className="w-6 h-6" />
                <span className="text-xs">Calendar</span>
            </button>
        </div>
    );
};

export default Sidebar;