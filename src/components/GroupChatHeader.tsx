import { Chat, useUpdateChatMutation } from "../slices/apiSlice";
import emptyUserAvatar from '../assets/images/empty-user-avatar.jpeg';
import { PencilIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useAppDispatch } from "../hooks/hooks";
import { updateChat } from "../slices/chatSlice";
import { getChatName } from "../utils/ChatHelper";
import { toast } from "react-toastify";

interface IGroupChatHeaderProps {
    chat: Chat | null,
}

const GroupChatHeader = ({ chat }: IGroupChatHeaderProps) => {
    const defaultChatName = chat ? getChatName(chat) : '';
    const [groupName, setGroupName] = useState(defaultChatName);
    const [isChangeName, setIsChangeName] = useState(false);
    const [updateChatMutation, results] = useUpdateChatMutation();
    const dispatch = useAppDispatch()

    const handleCancel = () => {
        setGroupName(chat?.name || '')
        setIsChangeName(false);
    }

    const handleSave = async () => {
        if (!chat) return setIsChangeName(false);

        try {
            const updatedChat = await updateChatMutation({
                chatId: chat._id,
                data: {
                    name: groupName
                }
            }).unwrap();

            dispatch(updateChat({
                chatId: chat._id,
                chat: {
                    _id: chat._id,
                    chatType: chat.chatType,
                    name: updatedChat.name
                }
            }));
            toast.success('Group name changed.');
        } catch (error) {
            toast.error('Change group name failed.');
        }

        setIsChangeName(false);
    }

    return (
        <div className="flex gap-4 items-center relative">
            <img
                src={chat?.avatar || emptyUserAvatar}
                className="w-6 h-6 rounded-full bg-gray-200"
                onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = emptyUserAvatar;
                }}
            />
            <div>
                <span className="font-bold text-gray-800">{defaultChatName}</span>
            </div>
            <div className="flex items-center">
                <button
                    onClick={() => setIsChangeName(true) }
                    className="hover:text-indigo-700"
                >
                    <PencilSquareIcon className="h-5 w-6" />
                </button>
                { isChangeName ? 
                    <div className="absolute z-40 right-0 left-0 top-10 shadow-lg bg-white border w-80 rounded-md text-sm py-3 px-4">
                        <div className="mb-3">
                            <label className="mb-1 block">Group Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type a group name"
                                    className="text-sm w-full border-none rounded-md bg-gray-100"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={handleCancel} className="border py-1 px-4 shadow-sm rounded-md hover:bg-gray-100">
                                Cancel
                            </button>
                            <button
                                disabled={!groupName}
                                onClick={handleSave}
                                className="bg-indigo-800 text-indigo-100 border py-1 px-4 shadow-sm rounded-md hover:bg-indigo-700 disabled:bg-indigo-500 disabled:text-indigo-300"
                            >
                                Save
                            </button>
                        </div>
                    </div> : null
                }
            </div>
        </div>
    )
}

export default GroupChatHeader;