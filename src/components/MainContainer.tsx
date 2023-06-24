import { Outlet } from "react-router-dom";
import Header from "./general/Header"
import Sidebar from "./general/Sidebar"

const MainContainer = () => {
    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="flex flex-grow">
                <div className="w-16 flex flex-col items-center bg-gray-200 border-right bg-opacity-80 relative pr-1">
                    <div className="right-0 absolute top-0 bottom-0 bg-gradient-to-l from-gray-300 to-transparent w-3 z-40 opacity-60"></div>
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