import { XMarkIcon } from "@heroicons/react/24/solid"
import { IMessage } from "../../models/chat";

interface ChatMessageItemReplyProps {
    canCancel: boolean,
    onCancel?: () => void,
    message: IMessage
}

const ChatMessageItemReply = ({ message, canCancel, onCancel }: ChatMessageItemReplyProps) => {
    return (
        <div className="p-1.5 border bg-gray-50 rounded-md max-w-sm text-sm mb-1 text-gray-700 shadow-sm overflow-hidden">
            <div className="border-l-4 pl-2">
                <div className="flex items-center justify-between text-xs">
                    <div>
                        <span>{message?.sender?.name}</span>
                    </div>
                    { canCancel ? 
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-indigo-600"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button> : <span></span>
                    }
                </div>
                <div className="line-clamp-2">
                    {message.content}
                </div>
            </div>
        </div>
    )
}

export default ChatMessageItemReply;