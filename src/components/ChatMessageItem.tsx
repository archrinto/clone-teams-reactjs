import { IMessage, IUser } from "../slices/apiSlice";
import emptyUserAvatar from '../assets/images/empty-user-avatar.jpeg';
import Avatar from "./Avatar";

interface IChatMessageItemProps {
    message: IMessage,
    sender?: IUser | null,
    isMine?: boolean
}

const ChatMessageItem = ({ message, sender, isMine }: IChatMessageItemProps) => {
    return (
        (isMine) ?
        <div className="" key={message._id}>
            <div className="flex items-end justify-end">
                <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end">
                    <span className="px-4 py-2 rounded-lg inline-block bg-indigo-200 text-left">
                        {message.content}
                    </span>
                </div>
            </div>
        </div> :
        <div className="" key={message._id}>
            <div className="flex items-end">
                <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                    <span className="px-4 py-2 rounded-lg inline-block bg-white text-gray-600">
                        {message.content}
                    </span>
                </div>
                <Avatar 
                    src={sender?.avatar}
                    alt={sender?.name}
                />
            </div>
        </div>
    )
}

export default ChatMessageItem;