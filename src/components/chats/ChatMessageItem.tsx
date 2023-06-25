import Avatar from "../general/Avatar";
import ChatMessageItemReply from "./ChatMessageItemReply";
import { formatDateTime } from "../../utils/DateHelper";
import { IMessage } from '../../models/chat';
import { IUser } from '../../models/user';
import { useAppSelector } from "../../hooks/hooks";

interface IChatMessageItemProps {
    message: IMessage,
    sender?: IUser | null,
    isMine?: boolean,
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, message: IMessage) => void,
}

const ChatMessageItem = ({ message, onContextMenu }: IChatMessageItemProps) => {
    const currentUserId = useAppSelector(state => state.auth.user?._id);
    const isMine = message.sender?._id === currentUserId;
    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, message: IMessage) => {
        if (onContextMenu) {
            onContextMenu(event, message);
        }
    }

    return (
        (isMine) ?
        <div className="" key={message._id}>
            <div className="flex items-end justify-end">
                <div 
                    className="flex flex-col space-y-2 text-sm max-w-md mx-2 order-1 items-end"
                    onContextMenu={(event) => {
                        handleContextMenu(event, message)
                    }}
                >
                    <div className="px-3 py-1.5 rounded-lg inline-block bg-indigo-100 text-left">
                        <div className="text-xs flex gap-4">
                            <span className="text-gray-500">{ formatDateTime(message?.createdAt || '') }</span>
                        </div>
                        { message?.replyTo ? 
                            <div className="mt-1">
                                <ChatMessageItemReply 
                                    canCancel={false}
                                    message={message.replyTo}
                                /> 
                            </div> : null
                        }
                        {message.content}
                    </div>
                </div>
            </div>
        </div> :
        <div className="" key={message._id}>
            <ChatMessageItemUser 
                message={message}
                onContextMenu={handleContextMenu}
            />
        </div>
    )
}

const ChatMessageItemUser = ({ message, onContextMenu }: IChatMessageItemProps) => {
    const sender = message?.sender;
    const userStatus = useAppSelector(state => state.users.userMap[sender?._id ?? '']);
    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, message: IMessage) => {
        if (onContextMenu) {
            onContextMenu(event, message);
        }
    }

    return (
        <div className="flex items-end">
            <div 
                className="flex flex-col space-y-2 text-sm max-w-md mx-2 order-2 items-start"
                onContextMenu={(event) => {
                    handleContextMenu(event, message)
                }}
            >
                <div className="px-3 py-1.5 rounded-lg inline-block bg-white text-gray-600">
                    <div className=" text-xs flex gap-4">
                        <span className="font-semibold">{ message?.sender?.name }</span>
                        <span className="text-gray-400">{ formatDateTime(message?.createdAt || '') }</span>
                    </div>
                    { message?.replyTo ? 
                        <div className="mt-1">
                            <ChatMessageItemReply 
                                canCancel={false}
                                message={message.replyTo}
                            /> 
                        </div> : null
                    }
                    <div>{message.content}</div>
                </div>
            </div>
            <Avatar 
                status={userStatus?.profileStatus || sender?.profileStatus}
                src={userStatus?.avatar || sender?.avatar}
                alt={userStatus?.profileStatus || sender?.name}
            />
        </div>
    )
}

export default ChatMessageItem;