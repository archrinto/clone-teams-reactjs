import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { IMessage, IMessageRequestParams, useLazyFetchChatMessagesQuery } from "../slices/apiSlice";
import { selectCurrentUser } from "../slices/authSlice";
import { addChatMessage, selectActiveChat, setChatMarkAsRead, setChatMessages } from "../slices/chatSlice";
import ChatMessagePrompt from "./ChatMessagePrompt";
import emptyUserAvatar from '../assets/images/empty-user-avatar.jpeg';
import { selectUserMap } from "../slices/userSlice";
import ChatMessageItem from "./ChatMessageItem";

export interface Message {
    type?: string,
    content?: string,
    sender?: any
}

interface Chat {
    _id?: string,
    avatar?: string,
    name?: string,
}

interface ChatMessageContainerProps {
}

const UserChatHeader = ({ user }: any) => {
    return (
        <div className="flex gap-4">
            <img 
                src={user?.avatar || emptyUserAvatar} 
                className="w-6 h-6 rounded-full bg-gray-200"
                onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = emptyUserAvatar;
                }}
            />
            <div>
                <span className="font-bold">{ user?.name || 'User' }</span>
            </div>
        </div>
    )
}

const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({ }) => {
    const currentUser = useAppSelector(selectCurrentUser);
    const activeChat = useAppSelector(selectActiveChat);
    const [getChatMessages, chatMessagesResult] = useLazyFetchChatMessagesQuery();
    const dispatch = useAppDispatch();
    const userMap = useAppSelector(selectUserMap);
    const chatId = activeChat?._id || null;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadChatMessage = async () => {
        if (activeChat?._id && activeChat) {
            const result = await getChatMessages({
                chat_id: activeChat._id,
                limit: 10,
                before: ''
            }, true);
            dispatch(setChatMessages({chatId: activeChat._id, messages: result.data || [] }))
            setTimeout(() => {
                // scrollToBottom()
            }, 50)
        }
    }

    const handleMessagesAreaClicked = () => {
        dispatch(setChatMarkAsRead(activeChat));
    }

    const scrollToBottom = (options: any = {}) => {
        messagesEndRef.current?.scrollIntoView(options)
    }

    const renderMessages = (messages: IMessage[]) => {
        let senderBefore = '';
        return messages?.map(message => {
            const inBundle = senderBefore === message.sender?._id;
            senderBefore = message.sender?._id || '';

            return (
                <ChatMessageItem 
                    key={message._id}
                    isMine={message.sender?._id === currentUser?._id}
                    message={message}
                    sender={message.sender ? userMap[message.sender._id] : null}
                />
            )
        })
    }

    useEffect(() => {
        loadChatMessage();
        console.log('loading message')
    }, [chatId])

    return (
        <div className="flex flex-col h-full absolute left-0 right-0 top-0 bottom-0">
            <div className="mb-auto top-0 w-full px-6 py-4 border-b shrink-0">
                { activeChat?.type === 'single' ?
                    <UserChatHeader 
                        user={userMap[activeChat?.participants?.[0]._id]}
                    /> :
                    <div className="flex gap-4">
                        <img 
                            src={activeChat?.avatar || emptyUserAvatar} 
                            className="w-6 h-6 rounded-full bg-gray-200"
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src = emptyUserAvatar;
                            }}
                        />
                        <div>
                            <span className="font-bold">{ activeChat?.name || 'User' }</span>
                        </div>
                    </div>
                }
            </div>
            <div 
                onClick={handleMessagesAreaClicked}
                className="h-full overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch px-6 space-y-2"
            >
                { renderMessages(activeChat?.messages || []) }
            </div>
            <div className="mt-auto bottom-0 w-full px-10 py-4 border-t shrink-0">
                <ChatMessagePrompt />
            </div>
        </div>
    )
}

export default ChatMessageContainer;