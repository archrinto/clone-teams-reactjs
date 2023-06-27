import { IChat } from "../../models/chat";
import Avatar from "../general/Avatar";
import ChatMessageGroupHeader from "./ChatMessageGroupHeader";
import { ChevronDownIcon, ChevronUpIcon, PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ChatMessageParticipantMenu from "./ChatMessageParticipantMenu";
import { IUser } from "../../models/user";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { Combobox } from "@headlessui/react";
import { setDraftChat, updateDraftChat } from "../../slices/chatSlice";
import { useLazyFetchUsersQuery } from "../../slices/apiSlice";

const ChatMessageHeader = ({ chat, currentUser }: { chat: IChat, currentUser: IUser }) => {
    const popupMeetingWindow = useRef<Window | null>(null);

    const handleCall = () => {
        if (popupMeetingWindow.current && !popupMeetingWindow.current.closed) {
            popupMeetingWindow.current.close();
        }

        const width = Math.floor(window.innerWidth * 0.7);
        const height = Math.floor(window.innerHeight * 0.8);
        const left = Math.floor((window.innerWidth - width) / 2);
        const top = Math.floor((window.innerHeight - height) / 2);

        popupMeetingWindow.current = window.open(`/meeting/${chat?._id}`, '_blank', `width=${width}, height=${height}, left=${left}, top=${top}`);
    }

    if (chat._id === 'new') {
        return <ChatMessageNewChatHeader 
            chat={chat}
        />
    }

    return (
        <div className="flex justify-between items-center w-full text-gray-600 h-14 px-4 py-2.5 border-b">
            <div className="flex items-center gap-3">
                { chat?.chatType === 'single' ?
                    <ChatMessageUserHeader 
                        userId={chat?.participants?.[0]?._id}
                    /> :
                    <ChatMessageGroupHeader 
                        chat={chat}
                    />
                }
            </div>
            <div>
                <div className="flex gap-4 items-center">
                    <div>
                        <button className="border p-1 rounded-md block shadow-sm border-gray-300" onClick={handleCall}>
                            <PhoneIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div>
                        <ChatMessageParticipantMenu
                            chat={chat}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

const ChatMessageUserHeader = ({ userId }: { userId: string}) => {
    const user = useAppSelector(state => state.users.userMap[userId]);

    return (
        <div className="flex gap-2 items-center">
            <Avatar 
                status={user?.profileStatus}
                src={user?.avatar} 
                alt={user?.name}
            />
            <div>
                <span className="font-bold">{ user?.name || 'User' }</span>
            </div>
        </div>
    )
}

const ChatMessageNewChatHeader = ({ chat }: any) => {
    let searchTimeout: any = null;
    const debounce = 500;
    const [getPeople, { isLoading, data: people }] = useLazyFetchUsersQuery();
    const [keyword, setKeyword] = useState('');
    const [isGroupName, setIsGroupName] = useState(false);
    const dispatch = useAppDispatch();

    const updateChat = (partial: object) => {
        const newChat = {
            ...chat,
            ...partial
        }
        if (newChat.name || chat?.participants?.length > 1) {
            newChat.chatType = 'group';
        } else {
            newChat.chatType = 'single';
        }
        dispatch(updateDraftChat(newChat));
    }

    const handleRemovePerson = (index: number) => {
        const participants  = [...chat?.participants];
        if (participants?.[index]) {
            participants.splice(index, 1);
            updateChat({ participants });
        }
    }

    const handleChangeName = (name: string) => {
        updateChat({ name: name.trim() });
    }

    const handelPeopleChange = (value: IUser[]) => {
        setKeyword('');
        updateChat({ participants: value });
    }

    const handleToggleGroupName = () => {
        setIsGroupName(!isGroupName);
        if (isGroupName) updateChat({ name: '' })
    }

    useEffect(() => {
        if (keyword.trim()) {
            searchTimeout = setTimeout(() => {
                if (keyword.trim()) {
                    getPeople({
                        search: keyword.trim()
                    });
                }
            }, debounce);
        }

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        }
    }, [keyword]);
      
    return (
        <div className="flex text-sm justify-between flex-col items-center w-full text-gray-600 bg-white px-4 min-h-[56px] border-b">
            { isGroupName ?
                <div className="flex gap-2 w-full h-14 border-b py-2 items-center">
                    <span>Group name: </span>
                    <input 
                        type="text"
                        className="border-none p-0 text-sm focus:ring-0 flex-grow"
                        placeholder="Enter group name"
                        value={chat?.name || ''}
                        onChange={(e) => handleChangeName(e.target.value) }
                    />
                </div> : null
            }
            <div className="flex items-center w-full">
                <div className="flex flex-grow gap-2 w-full py-3">
                    <span className="mt-1">To: </span>
                    <div className="flex-grow flex items-center gap-2">
                        <Combobox
                            value={chat?.participants || []}
                            onChange={handelPeopleChange}
                            // @ts-ignore
                            multiple={true}
                            // @ts-ignore
                            nullable={true}
                        >
                            <ul className="flex flex-wrap gap-2 items-center w-full">
                                {chat?.participants?.map((person: IUser, index: number) => (
                                    <li 
                                        key={person._id}
                                        className="bg-white rounded-full border flex items-center gap-1 pr-2 flex-none"
                                    >
                                        <Avatar
                                            hideStatus={true}
                                        />
                                        <span className="px-1 whitespace-nowrap">{person.name}</span>
                                        <button 
                                            className="hover:text-indigo-600"
                                            onClick={() => handleRemovePerson(index)}
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <Combobox.Button as='div' className="flex items-center w-full">
                                        <Combobox.Input
                                            className="text-sm border-none bg-transparent focus:outline-0 focus:ring-0 px-0 py-1 w-full" 
                                            placeholder="Enter name or email"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                    </Combobox.Button>
                                </li>
                            </ul>
                            <Combobox.Options className="absolute top-full left-6 right-6 bg-white shadow-md rounded-b px-2 py-2 max-h-56 overflow-y-auto">
                                {people?.map((person) => (
                                    !chat?.participants?.includes(person) ?
                                        <Combobox.Option 
                                            key={person._id} value={person}
                                            className="px-2 py-1.5 flex gap-2 cursor-pointer items-center hover:bg-gray-100 rounded-sm"
                                        >
                                            <Avatar 
                                                src={person.avatar}
                                                hideStatus={true}
                                            />
                                            {person.name}
                                        </Combobox.Option> : null
                                ))}
                            </Combobox.Options>
                        </Combobox>
                    </div>
                </div>
                <button 
                    onClick={handleToggleGroupName}
                    className="hover:text-indigo-600 w-auto"
                >
                    { isGroupName ?
                        <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />
                    }
                </button>
            </div>
        </div>
    )
}        

export default ChatMessageHeader;