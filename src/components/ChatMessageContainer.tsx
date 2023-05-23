import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { IMessage, IMessageRequestParams, useLazyFetchChatMessagesQuery } from "../slices/apiSlice";
import { selectCurrentUser } from "../slices/authSlice";
import { addChatMessage, selectActiveChat, setChatMessages } from "../slices/chatSlice";
import ChatMessagePrompt from "./ChatMessagePrompt";

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
    messages: Message[],
    chat: Chat,
    onSend: (message: Message) => void
}

const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({ onSend }) => {
    const currentUser = useAppSelector(selectCurrentUser);
    const userToken = useAppSelector((state) => state.auth.token);
    const activeChat = useAppSelector(selectActiveChat);
    const [getChatMessages, chatMessagesResult] = useLazyFetchChatMessagesQuery();
    const dispatch = useAppDispatch();

    const loadChatMessage = async () => {
        if (activeChat && !activeChat?.messages) {
            const result = await getChatMessages({
                chat_id: activeChat._id,
                limit: 10,
                before: ''
            });
            dispatch(setChatMessages({chatId: activeChat._id, messages: result.data || [] }))
        }
    }

    useEffect(() => {
        loadChatMessage();
    }, [activeChat])

    const messageList = activeChat?.messages?.map((message: IMessage) =>
        (message.sender === currentUser?._id || message.sender?._id === currentUser?._id) ?
        <div className="">
            <div className="flex items-end justify-end">
                <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end">
                    <span className="px-4 py-2 rounded-lg inline-block bg-blue-600 text-white text-left">
                        {message.content}
                    </span>
                </div>
            </div>
        </div> :
        <div className="">
            <div className="flex items-end">
                <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                    <span className="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600">
                        {message.content}
                    </span>
                </div>
                <img src="" className="w-6 h-6 rounded-full order-1" />
            </div>
        </div>
    )

    return (
        <div className="flex flex-col h-full">
            <div className="mb-auto top-0 w-full px-6 py-4 border-b">
                <div>
                    <img src="" className="w-6 h-6 rounded-full order-1 bg-gray-200" />
                </div>
            </div>
            <div className="h-full overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
                <div className="flex flex-col min-h-full justify-end py-6 px-6 space-y-4">{messageList}</div>
            </div>
            <div className="mt-auto bottom-0 w-full px-10 py-4 border-t">
                <ChatMessagePrompt />
            </div>
        </div>
    )
}

export default ChatMessageContainer;