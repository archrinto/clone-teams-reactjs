import ChatList from "./ChatList";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { Outlet } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { setActiveChat, setDraftChat } from "../../slices/chatSlice";
import { IChat } from "../../models/chat";

const ChatContainer = () => {
    const sidebarActive = useAppSelector((state) => state.ui.sidebarActive);
    const dispatch = useAppDispatch();

    const handleNewChat = () => {
        const newChat = {
            _id: 'new',
            name: '',
            messages: [],
            participants: [],
            chatType: 'single',
        }
        dispatch(setDraftChat(newChat));
        dispatch(setActiveChat(newChat));
    }

    return (
        <div className="flex h-full relative">
            <div className={`w-72 border-r bg-gradient-to-r from-[97%] from-gray-100 to-gray-200 relative ${sidebarActive ? 'sm:absolute z-20' : 'sm:hidden' } bottom-0 top-0 left-0`}>
                <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-col">
                    <div className="flex p-3 shrink-0 h-14 border-b justify-between items-center">
                        <h2 className="text-xl font-bold">Chat</h2>
                        <button 
                            onClick={handleNewChat}
                            className="text-gray-600" 
                            title="Create new chat"
                        >
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <ChatList />
                </div>
            </div>
            <div className="flex-grow bg-gray-100 relative">
                <Outlet />
            </div>
        </div>
    )
}

export default ChatContainer;