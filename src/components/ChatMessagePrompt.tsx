import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useEffect } from "react";
import { Message } from "./ChatMessageContainer";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { addChatMessage, addNewChat, selectActiveChat, setActiveChat, setChatList, setChatMarkAsRead, setDraftChat, setReplyMessage } from "../slices/chatSlice";
import { IMessage, useCreateChatMutation, useSendChatMessageMutation } from "../slices/apiSlice";
import { selectCurrentUser } from "../slices/authSlice";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ChatMessageItemReply from "./ChatMessageItemReply";
import { useCreateChatFromDraft } from "../hooks/useCreateChatFromDraft";

interface IMessagePromptProps {
    onMessageSent?: (message: IMessage) => void
}

const MessagePrompt: React.FC<IMessagePromptProps> = ({ onMessageSent }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [value, setValue] = useState<string>('');
    const [type, settype] = useState<string>('');
    const activeChat = useAppSelector(selectActiveChat);
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();
    const [sendMessage, { isLoading }] = useSendChatMessageMutation();
    const [createChat, { isLoading: isLoadingCreateChat }] = useCreateChatMutation();
    const replyMessage = useAppSelector(state => state.chat.replyMessage);
    const createChatFromDraft = useCreateChatFromDraft();

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
            const newChat = await createChatFromDraft(activeChat);
            if (!newChat) return;

            chatId = newChat._id;
        }

        const messageData = {
            sender: { _id: currentUser?._id || '' },
            chat: chatId,
            messageType: type || 'text',
            content: value,
            replyTo: replyMessage
        };

        setValue('');

        // set timeout to prevent duplicated message if chat not created before
        setTimeout(async () => {
            const message = await sendMessage(messageData).unwrap();
            if (typeof onMessageSent != 'undefined') onMessageSent(message);
            if (replyMessage) dispatch(setReplyMessage(null));
            dispatch(setChatMarkAsRead())
        }, 100)
    }

    const handleCancelReply = () => {
        dispatch(setReplyMessage(null));
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
                    { replyMessage ? 
                        <ChatMessageItemReply 
                            onCancel={handleCancelReply}
                            canCancel={true}
                            message={replyMessage}
                        /> : null
                    }
                    <textarea
                        ref={textareaRef}
                        className="w-full text-sm bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    <div className="flex items-center">
                        <button type="button" className="p-1 hover:text-indigo-700" onClick={() => console.log('send message') }>
                            <PaperClipIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex items-center justify-end ml-auto">
                        <button type="button" className="p-1 hover:text-indigo-700" onClick={() => handleSendMessage() }>
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default MessagePrompt;