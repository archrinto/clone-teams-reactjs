import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { Chat, useFetchChatsQuery, useLazyFetchChatsQuery } from '../slices/apiSlice';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setActiveChat, setChatList } from '../slices/chatSlice';

interface ChatListProps {
    onChange: (chatId: string) => void,
    activeChat: string | null
}

const ChatList: React.FC<ChatListProps> = ({ onChange }) => {  
    const [ getChats, results ] = useLazyFetchChatsQuery();
    const chatList = useAppSelector((state) => state.chat.list);
    const activeChat = useAppSelector((state) => state.chat.activeChat);
    const dispatch = useAppDispatch();

    const handleClick = (chat: Chat) => {
        dispatch(setActiveChat(chat))
    };

    useEffect(() => {
        if (results && results?.data) {
            dispatch(setChatList(results?.data));
        }
    }, [results])

    useEffect(() => {
        getChats();
        console.log('run')
    }, []);

    return (
        <div className="w-64 bg-gray-200">
            <div className="p-4">
                <h2 className="text-xl font-bold">Chat</h2>
            </div>
            <ul className="divide-y divide-gray-300">
                {chatList.map((chat) => (
                    <li
                        key={chat._id}
                        className={`flex items-center p-4 cursor-pointer ${
                            activeChat?._id === chat._id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => handleClick(chat)}
                    >
                    <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-8 h-8 rounded-full mr-2"
                    />
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                        <span className="font-bold">{chat.name}</span>
                        { (chat?.unread_message || 0) > 0 && (
                            <span className="text-sm text-white bg-red-500 rounded-full px-2 py-1">
                            {chat.unread_message}
                            </span>
                        )}
                        </div>
                        <p className="text-sm text-gray-500">{chat.last_message}</p>
                    </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatList;
