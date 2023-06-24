import { useEffect, useState } from "react";
import Avatar from "../general/Avatar"
import { useLazyFetchUsersQuery } from "../../slices/apiSlice";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IUser } from "../../models/user";

interface ChatMessageAddParticipantProps {
    onCancel: () => void
    onSubmit: (participants: IUser[]) => void
}

const ChatMessageAddParticipant = ({ onCancel, onSubmit }: ChatMessageAddParticipantProps) => {
    let searchTimeout: any = null;
    const debounce = 500;
    const [keyword, setKeyword] = useState('');
    const [participants, setParticipants] = useState<IUser[]>([]);
    const [getUsers, { isLoading, data: users }] = useLazyFetchUsersQuery();

    const handleCancelAddPeople = () => {
        if (onCancel) {
            onCancel();
        }
        setKeyword('');
        setParticipants([]);
    }
    const doSearch = async (search: string) => {
        getUsers({ search, limit: 0 });
    }
    const handleUserClick = (user: IUser) => {
        setKeyword('');
        setParticipants([
            ...participants,
            user
        ]);
    }
    const handleRemoveUser = (user: IUser) => {
        setParticipants((current) => {
            return current.filter(item => item._id !== user._id);
        })
    }

    const handleAddParticipant = async () => {
        if (onSubmit) {
            onSubmit(participants);
        }
        setKeyword('');
        setParticipants([]);
    }

    useEffect(() => {
        if (keyword.trim()) {
            searchTimeout = setTimeout(() => {
                doSearch(keyword.trim())
            }, debounce);
        }

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        }
    }, [keyword])

    return (
        <div className="absolute z-40 right-4 top-14 shadow-lg bg-white border w-80 rounded-md text-sm py-3 px-4">
            <div className="mb-3">
                <label className="mb-1 block">Add</label>
                <div className="mb-1 space-y-1">
                    { participants?.map((item, index) =>
                        <div key={item._id} className="w-full flex items-center justify-between gap-2 px-3 py-2 group bg-bray-100 border rounded-md">
                            <div className="flex items-center">
                                <Avatar
                                    src={''}
                                    hideStatus={true}
                                />
                                <span>{item?.name}</span>
                            </div>
                            <button onClick={() => handleRemoveUser(item)} className="">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter name or email"
                        className="text-sm w-full border-none rounded-md bg-gray-100"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    { keyword.trim() ?
                        <div className="z-50 absolute top-10 shadow-md py-2 bg-white right-0 left-0 rounded-md border">
                            {users && users?.length > 0 ? users?.map(item =>
                                <button
                                    key={item._id}
                                    onClick={() => handleUserClick(item)}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-1 hover:bg-gray-100 group"
                                >
                                    <div className="flex items-center">
                                        <Avatar
                                            src={''}
                                            hideStatus={true}
                                        />
                                        <span>{item.name}</span>
                                    </div>
                                </button>) :
                                <div className="text-gray-700 text-center">
                                    { isLoading ? 'Loading...' : 'Can\'t find any matches' }
                                </div>
                            }
                        </div> : null
                    }
                </div>
            </div>
            <div className="flex justify-end gap-3">
                <button onClick={handleCancelAddPeople} className="border py-1 px-4 shadow-sm rounded-md hover:bg-gray-100">
                    Cancel
                </button>
                <button 
                    disabled={participants.length == 0} 
                    onClick={handleAddParticipant}
                    className="border py-1 px-4 shadow-sm rounded-md hover:bg-gray-100 disabled:bg-gray-100"
                >
                    Add
                </button>
            </div>
        </div>
    )
}

export default ChatMessageAddParticipant;