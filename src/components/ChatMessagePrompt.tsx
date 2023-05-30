import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useState, useRef } from "react";
import { Message } from "./ChatMessageContainer";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { addChatMessage, addNewChat, selectActiveChat, setActiveChat, setChatList, setDraftChat } from "../slices/chatSlice";
import { IMessage, useCreateChatMutation, useSendChatMessageMutation } from "../slices/apiSlice";
import { selectCurrentUser } from "../slices/authSlice";

interface IMessagePromptProps {
}

const MessagePrompt: React.FC<IMessagePromptProps> = ({ }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [value, setValue] = useState<string>('');
    const [type, settype] = useState<string>('');
    const activeChat = useAppSelector(selectActiveChat);
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();
    const [sendMessage, { isLoading }] = useSendChatMessageMutation();
    const [createChat, { isLoading: isLoadingCreateChat }] = useCreateChatMutation();

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
        adjustTextAreaHeight();
    };

    const handleSendMessage = async () => {
        const content = value.trim();
        
        if (!content || !activeChat) return;

        // check if chat is exists or not
        let chatId = activeChat?._id || '';
        if (!chatId) {
            const newChatData = {
                name: null,
                type: activeChat?.type || 'singel',
                participants: activeChat?.participants?.map(item => item._id) || [],
            }
            const newChat = await createChat(newChatData).unwrap();
            
            dispatch(addNewChat(newChat));
            dispatch(setActiveChat(newChat));
            dispatch(setDraftChat(null));

            chatId = newChat._id;
        }

        const messageData = {
            sender: {
                _id: currentUser?._id || '',
            },
            chat: chatId,
            type,
            content: value
        };

        setValue('');

        // set timeout to prevent duplicated message if chat not created before
        setTimeout(async () => {
            const message = await sendMessage(messageData).unwrap();
        }, 100)
    }

    const adjustTextAreaHeight = () => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    return (
        <div>
            <form onSubmit={(event) => { event.preventDefault(); } } ref={formRef}>
                <div className="">
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={1}
                        placeholder="Enter your text here..."
                        value={value}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                            if(e.key == 'Enter' && e.shiftKey == false) {
                              e.preventDefault();
                              handleSendMessage();
                            }}
                        }
                    />
                </div>
                <div className="flex items-center text-gray-500">
                    <div></div>
                    <div className="flex items-end ml-auto">
                        <button type="button" className="p-1" onClick={() => handleSendMessage() }>
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default MessagePrompt;