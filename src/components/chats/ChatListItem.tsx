import { useAppSelector } from '../../hooks/hooks';
import { IChat, IMessage } from '../../models/chat';
import { IUser } from '../../models/user';
import { getChatDateTime, getChatName, getChatSingleUser } from '../../utils/ChatHelper';
import Avatar from '../general/Avatar';

export interface IChatListItemProps {
    chat: IChat,
    user?: IUser,
    isActive: boolean,
    onClick: any | void,
    currentUserId?: string
}

const ChatListItem = ({chat, isActive, onClick, currentUserId}: IChatListItemProps) => {
    const handleClick = (chat: IChat) => {
        onClick(chat);
    };

    if (!currentUserId) return null;

    return (
        <li
            key={chat._id}
            className={`p-2 cursor-pointer rounded-md ${
                isActive ? 'bg-white' : ''
            }`}
            onClick={() => handleClick(chat)}
        >
            { chat._id === 'new' ? 
                <ChatListItemNew 
                    chat={chat}
                    currentUserId={currentUserId}
                /> :
                ( chat.chatType === 'single' ?
                    <ChatListItemUser 
                        chat={chat}
                        currentUserId={currentUserId}
                    /> :
                    <ChatListItemGroup
                        chat={chat}
                        currentUserId={currentUserId}
                    />
                )
            }
        </li>
    )
}

export const ChatListItemNew = ({ 
    chat,
    currentUserId 
}: { currentUserId: string, chat: IChat}) => {
    return (
        <div className="flex items-center gap-2">
            <Avatar
                hideStatus={true}
                alt="New chat"
            />
            <div className="flex-grow overflow-hidden">
                <div className="flex gap-1 items-center justify-between text-gray-600">
                    <span className="truncate">New chat</span>
                    <span className='text-sm whitespace-nowrap'>
                    </span>
                </div>
            </div>
        </div>
    )
}

export const ChatListItemUser = ({ 
    chat,
    currentUserId 
}: { currentUserId: string, chat: IChat}) => {
    const lastMessage = chat?.messages?.[0] || null;
    const defaultUser = getChatSingleUser(chat);

    const user = useAppSelector(state => state.users.userMap[defaultUser?._id || '']);

    return (
        <div className="flex items-center gap-2">
            <Avatar
                status={user?.profileStatus || ''}
                src={user?.avatar}
                alt={user?.name}
            />
            <div className={'flex-grow overflow-hidden ' + (chat?.unreadCount ? 'font-semibold text-gray-800' : 'text-gray-600')}>
                <div className="flex gap-1 items-center justify-between">
                    <span className="truncate">{ user?.name }</span>
                    <span className='text-sm whitespace-nowrap'>
                        { getChatDateTime(chat) }
                    </span>
                </div>
                <p className="text-sm truncate">
                    { currentUserId && lastMessage?.sender?._id === currentUserId ? 
                        'You: ' : (chat.chatType !== 'single' ? lastMessage?.sender?.name?.split(' ')?.[0] + ': ' : '')
                    }
                    {lastMessage?.content || (!chat._id ? <i>Draft</i> : <i>No message</i>) }
                </p>
            </div>
        </div>
    )
}

export const ChatListItemGroup = ({ 
    chat,
    currentUserId 
}: { currentUserId: string, chat: IChat}) => {
    const lastMessage = chat?.messages?.[0] || null;
    const chatName = getChatName(chat);

    return (
        <div className="flex items-center gap-2">
            <Avatar
                src={chat?.avatar}
                alt={chatName}
                hideStatus={true}
            />
            <div className={'flex-grow overflow-hidden ' + (chat?.unreadCount ? 'font-semibold text-gray-800' : 'text-gray-600')}>
                <div className="flex gap-1 items-center justify-between">
                    <span className="truncate">{ chatName }</span>
                    <span className='text-sm whitespace-nowrap'>
                        { getChatDateTime(chat) }
                    </span>
                </div>
                <p className="text-sm truncate">
                    { currentUserId && lastMessage?.sender?._id === currentUserId ? 
                        'You: ' : lastMessage?.sender?.name?.split(' ')?.[0] + ': '
                    }
                    {lastMessage?.content || (!chat._id ? <i>Draft</i> : <i>No message</i>) }
                </p>
            </div>
        </div>
    )
}

export default ChatListItem;