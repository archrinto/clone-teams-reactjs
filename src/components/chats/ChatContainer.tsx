import ChatList from "./ChatList";
import { useAppSelector } from "../../hooks/hooks";
import { Outlet } from "react-router-dom";

const ChatContainer = () => {
    const sidebarActive = useAppSelector((state) => state.ui.sidebarActive);

    return (
        <div className="flex h-full relative">
            <div className={`w-72 border-r bg-gradient-to-r from-[97%] from-gray-100 to-gray-200 relative ${sidebarActive ? 'sm:absolute z-20' : 'sm:hidden' } bottom-0 top-0 left-0`}>
                <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-col">
                    <div className="p-3 shrink-0 h-14 border-b">
                        <h2 className="text-xl font-bold">Chat</h2>
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