import React, { useState } from 'react';
import { HomeIcon, InboxIcon, UserIcon } from '@heroicons/react/24/solid';

const Sidebar: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<String>('home');

    const handleMenuClick = (menu: String) => {
        setActiveMenu(menu);
    };

    return (
        <div className="sidebar py-3">
            <button
                className={`w-full flex flex-col items-center justify-center mb-3 ${
                activeMenu === 'home' ? 'bg-gray-700' : ''
                }`}
                onClick={() => handleMenuClick('home')}
            >
                <HomeIcon className="w-6 h-6 text-white" />
                <span className="text-xs">Home</span>
            </button>
            <button
                className={`w-full flex flex-col items-center justify-center mb-3 ${
                activeMenu === 'inbox' ? 'bg-gray-700' : ''
                }`}
                onClick={() => handleMenuClick('inbox')}
            >
                <InboxIcon className="w-6 h-6 text-white" />
                <span className="text-xs">Inbox</span>
            </button>
            <button
                className={`w-full flex flex-col items-center justify-center mb-3 ${
                activeMenu === 'profile' ? 'bg-gray-700' : ''
                }`}
                onClick={() => handleMenuClick('profile')}
            >
                <UserIcon className="w-6 h-6 text-white" />
                <span className="text-xs">Profile</span>
            </button>
        </div>
    );
};

export default Sidebar;