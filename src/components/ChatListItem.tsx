import { Chat, IUser } from '../slices/apiSlice';
import { formatDateTimeShort } from '../utils/DateHelper';
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

    const lastMessage = chat?.messages?.[0] || null;

    const getChatDatetime = (chat: Chat) => {
        let strDate = chat?.createdAt || '';
        if (chat?.messages && chat.messages.length > 0) {
            strDate = chat.messages?.[0].createdAt || '';
        }

        return strDate ? formatDateTimeShort(strDate) : '';
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
                    <span className='text-sm whitespace-nowrap'>
                        { getChatDatetime(chat) }
                    </span>
                </div>
                <p className="text-sm truncate">
                    { currentUserId && lastMessage?.sender?._id === currentUserId ? 
                        'You: ' : (chat.chatType !== 'single' ? lastMessage?.sender?.name?.split(' ')?.[0] + ': ' : '')
                    }
                    {lastMessage?.content || (!chat._id ? <i>Draft</i> : <i>No message</i>) }
                </p>
            </div>
        </li>
    )
}

export default ChatListItem;