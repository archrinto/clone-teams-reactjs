import { Outlet } from "react-router-dom";
import Header from "./general/Header"
import Sidebar from "./general/Sidebar"

const MainContainer = () => {
    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="flex flex-grow">
                <div className="w-16 flex flex-col items-center bg-gradient-to-r from-[85%] from-gray-100 to-gray-200 border-right relative pr-1">
                    <Sidebar />
                </div>
                <div className="flex flex-col flex-grow relative">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default MainContainer;