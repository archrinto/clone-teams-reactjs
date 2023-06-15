import { ArrowLeftOnRectangleIcon, UserMinusIcon, UserPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Chat, IUser, useAddChatParticipantMutation, useLazyFetchUsersQuery } from "../slices/apiSlice";
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from "react";
import Avatar from "./Avatar";
import ChatMessageAddParticipant from "./ChatMessageAddParticipant";
import { useAppDispatch } from "../hooks/hooks";
import { updateChat } from "../slices/chatSlice";
import { toast } from "react-toastify";

interface IChatMessageParticipantMenuProps {
    chat: Chat | null,
    currentUser: IUser | null
}

interface IChatParticipantItem {
    user: IUser | null,
    isCurrentUser?: boolean
}


const ChatParticipantItem = ({ user, isCurrentUser }: IChatParticipantItem) => {
    if (!user) return null;

    return (
        <div key={user._id} className="w-full flex items-center justify-between gap-2 px-3 py-1 hover:bg-gray-100 group">
            <div className="flex items-center">
                <Avatar
                    src={''}
                />
                <span>{user?.name} {isCurrentUser ? '(You)' : ''}</span>
            </div>
            <button className="hidden group-hover:inline">
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
    )
}

const ChatMessageParticipantMenu = ({ chat, currentUser }: IChatMessageParticipantMenuProps) => {
    const [isAddParticipant, setIsAddParticipant] = useState<boolean>(false);
    const [addParticipant, addParticipantResults] = useAddChatParticipantMutation();
    const dispatch = useAppDispatch();

    const handleOpenAddParticipant = () => {
        setIsAddParticipant(true);
    }
    const handleCancelAddPeople = () => {
        setIsAddParticipant(false);
    }
    const handleAddParticipant = async (participants: IUser[]) => {
        if (chat && chat?._id) {
            try {
                const data = await addParticipant({
                    chatId: chat?._id,
                    data: {
                        participants: participants.map(item => item._id)
                    }
                }).unwrap();
    
                dispatch(updateChat({
                    chatId: chat._id,
                    chat: {
                        _id: chat._id,
                        chatType: data?.chatType,
                        participants: data?.participants,
                        participantCount: data?.participantCount
                    }
                }))
            } catch(error) {
                console.log(error);
                toast.error('Add participant failed.')
            }
        }
        setIsAddParticipant(false);
    }

    return (
        <div className="h-full relative">
            <Menu as="div" className="relative h-full">
                <Menu.Button className="flex items-center gap-1 hover:text-indigo-700 text-sm hover:font-bold">
                    <UserPlusIcon className="h-5 w-5" />
                    <span>{chat?.participantCount}</span>
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
                        className="absolute z-50 right-0 top-10 shadow-lg bg-white border w-64 rounded-md text-sm py-2"
                    >
                        <Menu.Item>
                            <div className="mb-2 border-b pb-2">
                                <ChatParticipantItem
                                    user={currentUser}
                                    isCurrentUser={true}
                                />
                                {chat?.participants?.map(item =>
                                    <ChatParticipantItem
                                        key={item._id}
                                        user={item}
                                    />
                                )}
                            </div>
                        </Menu.Item>
                        <Menu.Item>
                            <button onClick={handleOpenAddParticipant} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100">
                                <UserPlusIcon className="h-5 w-5" />
                                <span>Add people</span>
                            </button>
                        </Menu.Item>
                        <Menu.Item>
                            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100">
                                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                                <span>Leave</span>
                            </button>
                        </Menu.Item>
                    </Menu.Items>
                </Transition>
            </Menu>

            {isAddParticipant ?
                <ChatMessageAddParticipant
                    onCancel={handleCancelAddPeople}
                    onSubmit={handleAddParticipant}
                /> : null
            }
        </div>
    )
}

export default ChatMessageParticipantMenu;