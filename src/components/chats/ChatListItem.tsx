import { Fragment, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { IChat, IMessage } from '../../models/chat';
import { IUser } from '../../models/user';
import { getChatDateTime, getChatName, getChatSingleUser } from '../../utils/ChatHelper';
import Avatar from '../general/Avatar';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import { leaveChat } from '../../slices/chatSlice';
import { useLeaveChatMutation } from '../../slices/apiSlice';
import { toast } from 'react-toastify';

export interface IChatListItemProps {
    chat: IChat,
    user?: IUser,
    isActive: boolean,
    onClick: any | void,
    currentUserId?: string
}

const ChatListItem = ({chat, isActive, onClick, currentUserId}: IChatListItemProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const handleClick = (chat: IChat) => {
        onClick(chat);
    };

    if (!currentUserId) return null;

    return (
        <li
            key={chat._id}
            className={`p-2 cursor-pointer rounded-md hover:bg-white ${
                isActive ? 'bg-white' : ''
            }`}
            onClick={() => handleClick(chat)}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
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
                        showMenu={showMenu}
                    /> :
                    <ChatListItemGroup
                        chat={chat}
                        currentUserId={currentUserId}
                        showMenu={showMenu}
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
                <div className="flex gap-0 items-center justify-between text-gray-600">
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
    currentUserId,
    showMenu
}: { currentUserId: string, chat: IChat, showMenu: boolean}) => {
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
            <div className={'flex-grow overflow-hidden flex ' + (chat?.unreadCount ? 'font-semibold text-gray-800' : 'text-gray-600')}>
                <div className="flex-grow flex gap-0 flex-col">
                    <span className="truncate">{ user?.name }</span>
                    <p className="text-sm truncate">
                        { currentUserId && lastMessage?.sender?._id === currentUserId ? 
                            'You: ' : (chat.chatType !== 'single' ? lastMessage?.sender?.name?.split(' ')?.[0] + ': ' : '')
                        }
                        {lastMessage?.content || (!chat._id ? <i>Draft</i> : <i>No message</i>) }
                    </p>
                </div>
                <div className="flex">
                    { showMenu ? 
                        <ChatItemMenu
                            chat={chat}
                        /> :
                        <div>
                            <span className="text-sm whitespace-nowrap">
                                { getChatDateTime(chat) }
                            </span>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export const ChatListItemGroup = ({ 
    chat,
    currentUserId,
    showMenu
}: { currentUserId: string, chat: IChat, showMenu: boolean}) => {
    const lastMessage = chat?.messages?.[0] || null;
    const chatName = getChatName(chat);

    return (
        <div className="flex items-center gap-2">
            <Avatar
                src={chat?.avatar}
                alt={chatName}
                hideStatus={true}
            />
            <div className={'flex-grow flex ' + (chat?.unreadCount ? 'font-semibold text-gray-800' : 'text-gray-600')}>
                <div className="flex flex-grow gap-0 flex-col overflow-hidden">
                    <span className="truncate">{ chatName }</span>
                    <p className="text-sm truncate">
                        { currentUserId && lastMessage?.sender?._id === currentUserId ? 
                            'You: ' : lastMessage?.sender?.name?.split(' ')?.[0] + ': '
                        }
                        {lastMessage?.content || (!chat._id ? <i>Draft</i> : <i>No message</i>) }
                    </p>
                </div>
                <div className="flex">
                    { showMenu ? 
                        <ChatItemMenu
                            chat={chat}
                        /> :
                        <div>
                            <span className="text-sm whitespace-nowrap">
                                { getChatDateTime(chat) }
                            </span>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

const ChatItemMenu = ({ chat } : {chat: IChat}) => {
    const dispatch = useAppDispatch();
    const [doLeaveChat, result] = useLeaveChatMutation();

    const handleLeave = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, chatId: string) => {
        event.stopPropagation();
        doLeaveChat(chatId)
            .then(() => {
                dispatch(leaveChat(chatId));
            })
            .catch(err => {
                console.log(err);
                toast.error('Leave chat failed');
            })
    }

    return (
        <div className=" self-center">
            <Menu as="div" className="h-full">
                <Menu.Button 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 hover:text-indigo-700 text-sm hover:font-bold p-1"
                >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items
                        className="absolute z-50 right-auto top-auto shadow-md bg-white border w-48 rounded text-sm py-1"
                    >
                        <Menu.Item>
                            <button 
                                onClick={(e) => handleLeave(e, chat._id)}
                                className="w-full flex items-center gap-2 px-3 py-1 hover:bg-gray-100"
                            >
                                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                                <span>Leave</span>
                            </button>
                        </Menu.Item>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    )
}

export default ChatListItem;