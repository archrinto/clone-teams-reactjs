import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useState, useRef } from "react";
import { Message } from "./ChatMessageContainer";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { addChatMessage, selectActiveChat } from "../slices/chatSlice";
import { IMessage, useSendChatMessageMutation } from "../slices/apiSlice";
import { selectCurrentUser } from "../slices/authSlice";

interface IMessagePromptProps {
}

const MessagePrompt: React.FC<IMessagePromptProps> = ({ }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState<string>('');
    const [type, settype] = useState<string>('');
    const activeChat = useAppSelector(selectActiveChat);
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();
    const [sendMessage, { isLoading }] = useSendChatMessageMutation();

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
        adjustTextAreaHeight();
    };

    const handleSendMessage = async () => {
        const chatId = activeChat?._id || '';
        const messageData = {
            sender: {
                _id: currentUser?._id || '',
            },
            chat: chatId,
            type,
            content: value
        };

        const message = await sendMessage(messageData);
        setValue('');
    }

    const adjustTextAreaHeight = () => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    return (
        <div className="flex gap-3">
            <textarea
                ref={textareaRef}
                className="w-full border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                placeholder="Enter your text here..."
                value={value}
                onChange={handleChange}
            />
            <button
                className="right-1 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 focus:outline-none"
                onClick={handleSendMessage}
            >
                <PaperAirplaneIcon className="w-6 h-6" />
            </button>
        </div>
    )
}

export default MessagePrompt;