import { Chat, IUser } from '../slices/apiSlice';
import Avatar from './Avatar';

export interface IChatListItemProps {
    chat: Chat,
    user?: IUser,
    isActive: boolean,
    onClick: any | void,
    currentUserId?: string
}

const ChatListItem = ({chat, user, isActive, onClick, currentUserId}: IChatListItemProps) => {
    const handleClick = (chat: Chat) => {
        onClick(chat);
    };

    const lastMessage = chat?.messages?.[chat?.messages?.length - 1] || null;

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

    let defaultChatName = '';
    if (chat?.chatType !== 'single' && !chat?.name) {
        defaultChatName = chat?.participants?.map(item => item.name?.split(' ')?.[0] || '').join(', ') || '';
    }

    return (
        <li
            key={chat._id}
            className={`flex items-center p-2 cursor-pointer rounded-md ${
                isActive ? 'bg-white' : ''
            }`}
            onClick={() => handleClick(chat)}
        >
            <Avatar
                status={user?.profileStatus || ''}
                src={user?.avatar || chat.avatar}
                alt={user?.name || chat.name || defaultChatName}
            />
            <div className={'flex-grow overflow-hidden ' + (chat?.unreadCount ? 'font-semibold text-gray-800' : 'text-gray-600')}>
                <div className="flex gap-1 items-center justify-between">
                    <span className="truncate">{ user ? user?.name : (chat?.name || defaultChatName) }</span>
                    <span className='text-sm'>
                        { getChatDatetime(chat) }
                    </span>
                </div>
                <p className="text-sm truncate">
                    { currentUserId && lastMessage?.sender?._id === currentUserId ? 'You: ' : '' } {lastMessage?.content || <i>No message</i>}
                </p>
            </div>
        </li>
    )
}

export default ChatListItem;