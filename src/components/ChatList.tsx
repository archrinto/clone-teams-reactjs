import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { Chat, IUser, useFetchChatsQuery, useLazyFetchChatMessagesQuery, useLazyFetchChatsQuery } from '../slices/apiSlice';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setActiveChat, setChatList, setChatMessages } from '../slices/chatSlice';
import ChatListItem from './ChatListItem';
import { selectUserMap, setUserMap } from '../slices/userSlice';
import { selectCurrentUser } from '../slices/authSlice';
import { toggleSidebar } from '../slices/uiSlice';

interface ChatListProps {
}

const ChatList: React.FC<ChatListProps> = ({ }) => {  
    const [ getChats, results ] = useLazyFetchChatsQuery();
    const chatList = useAppSelector((state) => state.chat.list);
    const draftChat = useAppSelector((state) => state.chat.draftChat);
    const activeChat = useAppSelector((state) => state.chat.activeChat);
    const [getChatMessages, chatMessagesResult] = useLazyFetchChatMessagesQuery();
    const userMap = useAppSelector(selectUserMap);
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();
    const users: IUser[] = [];

    const handleClick = async (chat: Chat) => {
        dispatch(setActiveChat(chat));
        dispatch(toggleSidebar());
    };

    useEffect(() => {
        if (results && results?.data) {
            results?.data?.forEach((item) => {
                item?.participants?.forEach((p) => {
                    users.push(p);
                })
            });
            dispatch(setChatList(results?.data));
            dispatch(setUserMap(users));
        }
    }, [results])

    useEffect(() => {
        getChats();
        console.log('run')
    }, []);

    return (
        <div className="w-72">
            <div className="p-4">
                <h2 className="text-xl font-bold">Chat</h2>
            </div>
            <ul className="p-1.5">
                { draftChat ?
                    <ChatListItem 
                        key="draft"
                        chat={draftChat} 
                        isActive={activeChat?._id == draftChat._id} 
                        onClick={handleClick}
                    /> : null
                }
                {chatList.map((chat) => (
                    <ChatListItem 
                        key={chat._id}
                        chat={chat} 
                        user={chat.chatType == 'single' ? userMap[chat?.participants?.[0]?._id] : null}
                        isActive={activeChat?._id == chat._id} 
                        currentUserId={currentUser?._id}
                        onClick={handleClick}
                    />
                ))}
            </ul>
        </div>
    );
}

export default ChatList;
