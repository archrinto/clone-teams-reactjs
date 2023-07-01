import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useLazyFetchChatMessagesQuery } from "../../slices/apiSlice";
import { selectCurrentUser } from "../../slices/authSlice";
import { selectActiveChat, setChatMarkAsRead, setChatMessages } from "../../slices/chatSlice";
import ChatMessagePrompt from "./ChatMessagePrompt";
import { selectUserMap } from "../../slices/userSlice";
import ChatMessageItem from "./ChatMessageItem";
import { ArrowUpOnSquareStackIcon, PhoneIcon } from "@heroicons/react/24/outline";
import useOnOutsideClick from "../../hooks/useOnOutsideClick";
import ChatMessageContextMenu from "./ChatMessageContextMenu";
import ChatMessageParticipantMenu from "./ChatMessageParticipantMenu";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { IMessage } from "../../models/chat";
import ChatMessageHeader from "./ChatMessageHeader";
import ChatMessageGroupHeader from "./ChatMessageGroupHeader";

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

const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({ }) => {
    const { chatId } = useParams()
    const refLoadMore = useRef({
        chatId: '',
        lastMessageDate: new Date().toISOString(),
        isFetching: false,
        hasMore: true,
        lastScrollHeight: 0,
    })
    const popupMeetingWindow = useRef<Window | null>(null);
    const currentUser = useAppSelector(selectCurrentUser);
    const activeChat = useAppSelector(selectActiveChat);
    const [getChatMessages, chatMessagesResult] = useLazyFetchChatMessagesQuery();
    const dispatch = useAppDispatch();
    const messagesAreaRef = useRef<HTMLDivElement>(null);
    const messageListRef = useRef<HTMLDivElement>(null);
    const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null)
    const [messageContextMenu, setMessageContextMenu] = useState<IContextMenuState>(initialContextMenuState);
    const messageContextMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const loadChatMessage = async () => {
        if (!activeChat) return;
        if (activeChat?._id === 'draft' || activeChat?._id === 'new') {
            return;
        }

        try {
            refLoadMore.current.isFetching = true;
            refLoadMore.current.lastScrollHeight = messagesAreaRef?.current?.scrollHeight || 0;

            getChatMessages({
                chatId: activeChat._id,
                limit: 5,
                skip: activeChat.messages?.length || 0,
                before: refLoadMore.current.lastMessageDate
            }).then(result => {
                dispatch(setChatMessages({
                    chatId: activeChat._id,
                    messages: [
                        ...(activeChat.messages || []),
                        ...(result.data || [])
                    ]
                }));

                const lastMessage = result?.data?.[result.data?.length - 1] || null;
                
                if (lastMessage && lastMessage.createdAt) {
                    refLoadMore.current.lastMessageDate = lastMessage.createdAt;
                }

                refLoadMore.current.isFetching = false;
                refLoadMore.current.hasMore = Boolean(lastMessage);

                setTimeout(() => {
                    if (!messagesAreaRef.current) return;
                    messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight - refLoadMore.current.lastScrollHeight;
                }, 50);
            }).catch(err => {
                console.error(err);
                toast.error('Load messages failed.')
                refLoadMore.current.isFetching = false;
            });
        } catch (error) {
            toast.error('Load messages failed.')
            refLoadMore.current.isFetching = false;
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

    const handleScroll = async (event: any) => {
        if (!activeChat) return;
        if (event.target.scrollTop === 0 && refLoadMore.current.hasMore) {
            if (!refLoadMore.current.isFetching) {
                loadChatMessage();
            }
        }
    }


    const renderMessages = (messages: IMessage[]) => {
        let senderBefore = '';
        return messages?.map(message => {
            const inBundle = senderBefore === message.sender?._id;
            senderBefore = message.sender?._id || '';

            return (
                <ChatMessageItem 
                    key={message._id}
                    message={message}
                    onContextMenu={handleMessageContextMenu}
                />
            )
        })
    }

    useOnOutsideClick(messageContextMenuRef, closeMessageContextMenu);

    useEffect(() => {        
        if (messagesAreaRef.current && activeChat?._id) {
            const sameChat = refLoadMore.current.chatId == activeChat._id;
            if (!sameChat) {
                refLoadMore.current.chatId = activeChat._id;
                refLoadMore.current.hasMore = true;
                scrollToBottom();
            }
            if (messagesAreaRef.current.clientHeight >= messagesAreaRef.current.scrollHeight && 
                (refLoadMore.current.hasMore || !sameChat)
            ) {
                loadChatMessage();
            }
        }
    }, [activeChat])

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

    if (!currentUser) return null;

    return (
        <div className="flex flex-col h-full absolute left-0 right-0 top-0 bottom-0">
            <div className="mb-auto top-0 w-full shrink-0 relative flex items-center">
                <ChatMessageHeader
                    chat={activeChat}
                    currentUser={currentUser}
                />
            </div>
            <div 
                ref={messagesAreaRef}
                onClick={handleMessagesAreaClicked}
                onScroll={handleScroll}
                className="h-full overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch px-6 py-4"
            >
                <div ref={messageListRef} className="space-y-2 space-y-reverse flex flex-col-reverse">
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
                    activeChat={activeChat}
                />
            </div>
        </div>
    )
}

export default ChatMessageContainer;