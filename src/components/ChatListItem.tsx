import emptyUserAvatar from '../assets/images/empty-user-avatar.jpeg';
import { useAppDispatch } from '../hooks/hooks';
import { Chat, IUser } from '../slices/apiSlice';
import { setActiveChat } from '../slices/chatSlice';

export interface IChatListItemProps {
    chat: Chat,
    user?: IUser,
    isActive: boolean,
    onClick: any | void
}

const ChatListItem = ({chat, user, isActive, onClick}: IChatListItemProps) => {
    const handleClick = (chat: Chat) => {
        onClick(chat);
    };

    const formatDateTime = (utcDateString: string) => {
        const utcDate = new Date(utcDateString);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const sameYear = utcDate.getFullYear() === currentDate.getFullYear();
        if (!sameYear) {
            return utcDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
        }

        if (utcDate.getDate() == currentDate.getDate() && utcDate.getMonth() == currentDate.getMonth()) {
            return utcDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'});
        }

        return utcDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
    }

    const getChatDatetime = (chat: Chat) => {
        let strDate = chat?.createdAt || '';
        if (chat?.messages && chat.messages.length > 0) {
            strDate = chat.messages?.[chat?.messages?.length - 1].createdAt || '';
        }

        return strDate ? formatDateTime(strDate) : '';
    }

    return (
        <li
            key={chat._id}
            className={`flex items-center p-2 cursor-pointer rounded-md ${
                isActive ? 'bg-gray-100' : ''
            }`}
            onClick={() => handleClick(chat)}
        >
            <img
                src={chat.avatar || emptyUserAvatar}
                alt={chat.name}
                className="w-8 h-8 rounded-full mr-2"
                onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = emptyUserAvatar;
                }}
            />
            <div className={'flex-grow ' + (chat?.unreadCount ? 'font-semibold text-gray-800' : 'text-gray-600')}>
                <div className="flex items-center justify-between leading-none">
                    <span className="">{ user ? user?.name : chat?.name }</span>
                    <span className='text-sm'>
                        { getChatDatetime(chat) }
                    </span>
                </div>
                <p className="text-sm leading-none">
                    {chat?.messages?.[chat?.messages?.length - 1]?.content || <i>No message</i>}
                </p>
            </div>
        </li>
    )
}

export default ChatListItem;