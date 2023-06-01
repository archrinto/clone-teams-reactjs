import { IMessage, IUser } from "../slices/apiSlice";
import emptyUserAvatar from '../assets/images/empty-user-avatar.jpeg';
import Avatar from "./Avatar";

interface IChatMessageItemProps {
    message: IMessage,
    sender?: IUser | null,
    isMine?: boolean,
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, message: IMessage) => void,
}

const ChatMessageItem = ({ message, sender, isMine, onContextMenu }: IChatMessageItemProps) => {

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
                    className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end"
                    onContextMenu={(event) => {
                        handleContextMenu(event, message)
                    }}
                >
                    <span className="px-4 py-2 rounded-lg inline-block bg-indigo-200 text-left">
                        {message.content}
                    </span>
                </div>
            </div>
        </div> :
        <div className="" key={message._id}>
            <div className="flex items-end">
                <div 
                    className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start"
                    onContextMenu={(event) => {
                        handleContextMenu(event, message)
                    }}
                >
                    <span className="px-4 py-2 rounded-lg inline-block bg-white text-gray-600">
                        {message.content}
                    </span>
                </div>
                <Avatar 
                    status={sender?.profileStatus}
                    src={sender?.avatar}
                    alt={sender?.name}
                />
            </div>
        </div>
    )
}

export default ChatMessageItem;