import { useState } from "react";
import ChatList from "./ChatList";
import ChatMessageContainer, { Message } from "./ChatMessageContainer";

const ChatContainer = () => {
    return (
        <div className="flex h-full">
            <div className="border-r bg-gray-200 bg-opacity-70 relative">
                <div className="right-0 absolute top-0 bottom-0 bg-gradient-to-l from-gray-200 to-transparent w-3 z-40 opacity-80"></div>
                <ChatList />
            </div>
            <div className="flex-grow bg-gray-100 relative">
                <ChatMessageContainer />
            </div>
        </div>
    )
}

export default ChatContainer;