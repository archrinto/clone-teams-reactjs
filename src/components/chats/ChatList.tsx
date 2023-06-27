import React, { useEffect } from 'react';
import { useLazyFetchChatMessagesQuery, useLazyFetchChatsQuery } from '../../slices/apiSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { setActiveChat, setChatList } from '../../slices/chatSlice';
import { selectUserMap, setUserMap } from '../../slices/userSlice';
import { selectCurrentUser } from '../../slices/authSlice';
import { toggleSidebar } from '../../slices/uiSlice';
import { IUser } from '../../models/user';
import { IChat } from '../../models/chat';
import ChatListItem from './ChatListItem';
import { useNavigate } from 'react-router-dom';

interface ChatListProps {
}

const ChatList: React.FC<ChatListProps> = ({ }) => {  
    const [ getChats, results ] = useLazyFetchChatsQuery();
    const chatList = useAppSelector((state) => state.chat.list);
    const draftChat = useAppSelector((state) => state.chat.draftChat);
    const activeChat = useAppSelector((state) => state.chat.activeChat);
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();
    const users: IUser[] = [];
    const navigate = useNavigate();

    const handleClick = async (chat: IChat) => {
        if (!chat?._id) return;
        dispatch(setActiveChat(chat));
        dispatch(toggleSidebar());
        navigate(`/chats/${chat._id || 'draft'}`);
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
        <div className="w-full h-full overflow-y-auto">
            <ul className="p-1.5">
                { draftChat ?
                    <ChatListItem
                        key={draftChat._id}
                        chat={draftChat} 
                        isActive={activeChat?._id === draftChat._id} 
                        currentUserId={currentUser?._id}
                        onClick={handleClick}
                    /> : null
                }
                {chatList.map((chat) => (
                    <ChatListItem 
                        key={chat._id}
                        chat={chat} 
                        user={chat.chatType == 'single' ? chat?.participants?.[0] : undefined}
                        isActive={activeChat?._id === chat._id} 
                        currentUserId={currentUser?._id}
                        onClick={handleClick}
                    />
                ))}
            </ul>
        </div>
    );
}

export default ChatList;
