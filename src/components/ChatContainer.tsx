import { useState } from "react";
import ChatList from "./ChatList";
import ChatMessageContainer, { Message } from "./ChatMessageContainer";

const ChatContainer = () => {
    const [activeChat, setActiveChat] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);

    const handleChatIdChange = (chatId: string) => {
        setActiveChat(chatId);
    }
    const handleSendMessage = (message: Message) => {
        setMessages([
            ...messages,
            message
        ])
    }

    return (
        <div className="flex h-screen">
            <div className="">
                <ChatList onChange={handleChatIdChange} activeChat={activeChat} />
            </div>
            <div className="flex-grow bg-gray-100 relative">
                <ChatMessageContainer messages={messages} chat={{}} onSend={handleSendMessage}/>
            </div>
        </div>
    )
}

export default ChatContainer;