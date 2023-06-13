import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { IMessage, IMessageRequestParams, useLazyFetchChatMessagesQuery } from "../slices/apiSlice";
import { selectCurrentUser } from "../slices/authSlice";
import { selectActiveChat, setChatMarkAsRead, setChatMessages } from "../slices/chatSlice";
import ChatMessagePrompt from "./ChatMessagePrompt";
import { selectUserMap } from "../slices/userSlice";
import ChatMessageItem from "./ChatMessageItem";
import { ArrowUpOnSquareStackIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Avatar from "./Avatar";
import useOnOutsideClick from "../hooks/useOnOutsideClick";
import ChatMessageContextMenu from "./ChatMessageContextMenu";
import ChatMessageParticipantMenu from "./ChatMessageParticipantMenu";
import GroupChatHeader from "./GroupChatHeader";
import { Link, useNavigate } from "react-router-dom";

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

interface IContextMenuState {
    show: boolean,
    pageX: Number,
    pageY: Number
}

const initialContextMenuState = { 
    show: false, 
    pageX: 0, 
    pageY: 0 
}

const UserChatHeader = ({ user }: any) => {
    return (
        <div className="flex gap-2 items-center">
            <Avatar 
                status={user?.profileStatus}
                src={user?.avatar} 
                alt={user?.name}
            />
            <div>
                <span className="font-bold">{ user?.name || 'User' }</span>
            </div>
        </div>
    )
}

const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({ }) => {
    const popupMeetingWindow = useRef<Window | null>(null);
    const currentUser = useAppSelector(selectCurrentUser);
    const activeChat = useAppSelector(selectActiveChat);
    const [getChatMessages, chatMessagesResult] = useLazyFetchChatMessagesQuery();
    const dispatch = useAppDispatch();
    const userMap = useAppSelector(selectUserMap);
    const chatId = activeChat?._id || null;
    const messagesAreaRef = useRef<HTMLDivElement>(null);
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null)
    const [messageContextMenu, setMessageContextMenu] = useState<IContextMenuState>(initialContextMenuState);
    const messageContextMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const loadChatMessage = async () => {
        if (activeChat?._id && activeChat) {
            const result = await getChatMessages({
                chat_id: activeChat._id,
                limit: 10,
                before: ''
            });
            dispatch(setChatMessages({chatId: activeChat._id, messages: result.data || [] }))
            setTimeout(() => {
                scrollToBottom()
            }, 50)
        }
    }

    const closeMessageContextMenu = () => {
        setSelectedMessage(null);
        setMessageContextMenu({
            show: false,
            pageX: 0,
            pageY: 0
        })
    }

    const handleMessagesAreaClicked = () => {
        dispatch(setChatMarkAsRead(activeChat));
    }

    const scrollToBottom = (options: any = {}) => {
        if (messagesAreaRef.current) {
            messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
        }
    }

    const handleMessageSent = () => {
        scrollToBottom();
    }

    const handleMessageContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, message: IMessage) => {
        event.preventDefault();
        setSelectedMessage(message)

        const windowWidth = messagesAreaRef.current?.getBoundingClientRect().right || window.innerWidth
        const windowHeight = messagesAreaRef.current?.getBoundingClientRect().bottom || window.innerHeight

        const menuWidth = 160; // Width of the context menu
        const menuHeight = 200; // Height of the context menu

        // Adjust the position if the menu exceeds the window boundaries
        const adjustedPosX = event.pageX + menuWidth > windowWidth ? windowWidth - (menuWidth + 60): event.pageX;
        const adjustedPosY = event.pageY + menuHeight > windowHeight ? windowHeight - (menuHeight): event.pageY;

        setMessageContextMenu({
            show: true,
            pageX: adjustedPosX,
            pageY: adjustedPosY
        });
    }

    const handleCall = () => {
        if (popupMeetingWindow.current && !popupMeetingWindow.current.closed) {
            popupMeetingWindow.current.close();
        }

        const width = Math.floor(window.innerWidth * 0.8);
        const height = Math.floor(window.innerHeight * 0.8);
        const left = Math.floor((window.innerWidth - width) / 2);
        const top = Math.floor((window.innerHeight - height) / 2);

        popupMeetingWindow.current = window.open(`/meeting/${activeChat?._id}`, '_blank', `width=${width}, height=${height}, left=${left}, top=${top}`);
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
                    onContextMenu={handleMessageContextMenu}
                />
            )
        })
    }

    useOnOutsideClick(messageContextMenuRef, closeMessageContextMenu);

    useEffect(() => {
        loadChatMessage();
        console.log('loading message')
    }, [chatId])

    if (!activeChat) {
        return (
            <div className="flex flex-col h-full absolute left-0 right-0 top-0 bottom-0 justify-center items-center">
                <div className="text-center">
                    <h3 className="text-gray-700 text-lg">
                        Start new conversation
                    </h3>
                    <p className="text-gray-400">
                        Select a user or create a group chat to start a conversation
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full absolute left-0 right-0 top-0 bottom-0">
            <div className="flex justify-between items-center mb-auto top-0 w-full px-4 py-3 border-b shrink-0 text-gray-600">
                { activeChat?.chatType === 'single' ?
                    <UserChatHeader 
                        user={userMap[activeChat?.participants?.[0]._id]}
                    /> :
                    <GroupChatHeader 
                        chat={activeChat}
                    />
                }
                <div className="flex gap-4 items-center">
                    <div>
                        <button className="border p-1 rounded-md block shadow-sm border-gray-300" onClick={handleCall}>
                            <PhoneIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div>
                        <ChatMessageParticipantMenu
                            chat={activeChat}
                            currentUser={currentUser}
                        />
                    </div>
                    <div>
                        <button className="flex items-center gap-1 hover:text-indigo-700 text-sm">
                            <ArrowUpOnSquareStackIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
            <div 
                ref={messagesAreaRef}
                onClick={handleMessagesAreaClicked}
                className="h-full overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch px-6 py-4"
            >
                <div className="space-y-2">
                    { renderMessages(activeChat?.messages || []) }
                </div>

                { messageContextMenu.show && selectedMessage ? (
                    <ChatMessageContextMenu 
                        pageX={messageContextMenu.pageX}
                        pageY={messageContextMenu.pageY}
                        ref={messageContextMenuRef}
                        message={selectedMessage}
                        isMine={selectedMessage?.sender?._id === currentUser?._id}
                        onClickAction={closeMessageContextMenu}
                    />
                ) : null }
            </div>
            <div className="mt-auto bottom-0 w-full px-10 py-4 border-t shrink-0">
                <ChatMessagePrompt 
                    onMessageSent={handleMessageSent}
                />
            </div>
        </div>
    )
}

export default ChatMessageContainer;