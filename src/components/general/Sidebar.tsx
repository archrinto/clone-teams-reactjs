import React, { useEffect, useRef, useState } from 'react';
import { ChatBubbleOvalLeftEllipsisIcon, InboxIcon, UserIcon, UserGroupIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { useAppDispatch } from '../../hooks/hooks';
import { toggleSidebar } from '../../slices/uiSlice';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const activeMenu = useRef<string>('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = (menu: string) => {
        if (menu !== activeMenu.current) {
            navigate(`/${menu}`);
        }
        if (menu === activeMenu.current) {
            dispatch(toggleSidebar());
        }
        activeMenu.current = menu
    };

    useEffect(() => {
        if (!activeMenu.current) {
            handleMenuClick('chats');
        }
    }, [])

    const isMenuActive = (menuPath: string) => {
        return location.pathname.startsWith(menuPath);
    };

    return (
        <div className="sidebar py-3 w-full ml-0.5 text-gray-400">
            <button
                className={`w-full flex flex-col items-center justify-center mb-4 ${
                isMenuActive('/chats') ? 'text-indigo-700 border-l-2 border-indigo-700' : 'border-l-2 border-transparent'
                }`}
                onClick={() => handleMenuClick('chats')}
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-inherit" />
                <span className="text-xs">Chat</span>
            </button>
            <button
                className={`w-full flex flex-col items-center justify-center mb-4 ${
                isMenuActive('/teams') ? 'text-indigo-700 border-l-2 border-indigo-700' : 'border-l-2 border-transparent'
                }`}
                onClick={() => handleMenuClick('teams')}
            >
                <UserGroupIcon className="w-6 h-6" />
                <span className="text-xs">Teams</span>
            </button>
            <button
                className={`w-full flex flex-col items-center justify-center mb-4 ${
                isMenuActive('/calendar')  ? 'text-indigo-700 border-l-2 border-indigo-700' : 'border-l-2 border-transparent'
                }`}
                onClick={() => handleMenuClick('calendar')}
            >
                <CalendarDaysIcon className="w-6 h-6" />
                <span className="text-xs">Calendar</span>
            </button>
        </div>
    );
};

export default Sidebar;