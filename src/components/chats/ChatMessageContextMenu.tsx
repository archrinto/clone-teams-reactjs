import { forwardRef } from "react";
import { ArrowUturnLeftIcon,  EyeSlashIcon,  TagIcon,  TrashIcon } from "@heroicons/react/24/outline";
import { useAppDispatch } from "../../hooks/hooks";
import { setReplyMessage } from "../../slices/chatSlice";
import { IMessage } from "../../models/chat";

interface ChatMessageContextMenuProps {
    pageX: Number,
    pageY: Number,
    message: IMessage | null,
    isMine: boolean,
    onClickAction: () => void
}

const ChatMessageContextMenu = forwardRef(({ pageX, pageY, message, isMine, onClickAction}: ChatMessageContextMenuProps, ref: any) => {
    const dispatch = useAppDispatch();

    const handleReply = () => {
        console.log(message);
        if (!message?.chat) return;
        dispatch(setReplyMessage({
            chatId: message.chat._id || undefined,
            message: message
        }));
        onClickAction();
    }

    return (
            <div
                ref={ref}
                className="fixed bg-white shadow-lg p-2 rounded-md border w-48 text-sm text-gray-800"
                style={{
                    top: pageY + 'px',
                    left: pageX + 'px',
                }}
            >
                <ul>
                    <li>
                        <button
                            className="w-full py-1.5 px-3 hover:text-indigo-600 flex items-center gap-3 hover:bg-gray-100 rounded-md"
                            onClick={handleReply}
                        >
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                            <span>Reply</span>
                        </button>
                    </li>
                    { isMine ?
                        <li>
                            <button className="w-full py-1.5 px-3 hover:text-indigo-600 flex items-center gap-3 hover:bg-gray-100 rounded-md">
                                <TrashIcon className="h-5 w-5" />
                                <span>Delete</span>
                            </button>
                        </li> : null
                    }
                    <li>
                        <button className="w-full py-1.5 px-3 hover:text-indigo-600 flex items-center gap-3 hover:bg-gray-100 rounded-md">
                            <TagIcon className="h-5 w-5" />
                            <span>Pin</span>
                        </button>
                    </li>
                    <li className="border-t w-full my-2"></li>
                    <li>
                        <button className="w-full py-1.5 px-3 hover:text-indigo-600 flex items-center gap-3 hover:bg-gray-100 rounded-md">
                            <EyeSlashIcon className="h-5 w-5" />
                            <span>Mark as unread</span>
                        </button>
                    </li>
                </ul>
            </div>
        )
})

export default ChatMessageContextMenu;
