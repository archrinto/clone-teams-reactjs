import { IChat } from "../../models/chat";
import Avatar from "../general/Avatar";
import ChatMessageGroupHeader from "./ChatMessageGroupHeader";
import { PhoneIcon } from "@heroicons/react/24/outline";
import ChatMessageParticipantMenu from "./ChatMessageParticipantMenu";
import { IUser } from "../../models/user";
import { useRef } from "react";
import { useAppSelector } from "../../hooks/hooks";

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

    return (
        <div className="flex justify-between items-center w-full text-gray-600">
            <div className="flex items-center gap-3">
                { chat?.chatType === 'single' ?
                    <ChatMessageUserHeader 
                        userId={chat?.participants?.[0]._id}
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
            

export default ChatMessageHeader;