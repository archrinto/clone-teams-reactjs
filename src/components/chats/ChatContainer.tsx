import ChatList from "./ChatList";
import { useAppSelector } from "../../hooks/hooks";
import { Outlet } from "react-router-dom";

const ChatContainer = () => {
    const sidebarActive = useAppSelector((state) => state.ui.sidebarActive);

    return (
        <div className="flex h-full relative">
            <div className={`border-r bg-gray-100 relative ${sidebarActive ? 'sm:absolute z-20' : 'sm:hidden' } bottom-0 top-0 left-0`}>
                <div className="right-0 absolute top-0 bottom-0 bg-gradient-to-l from-gray-200 to-transparent w-3 z-40 opacity-80"></div>
                <ChatList />
            </div>
            <div className="flex-grow bg-gray-100 relative">
                <Outlet />
            </div>
        </div>
    )
}

export default ChatContainer;