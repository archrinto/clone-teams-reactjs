import './App.css';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import LoginContainer from './components/LoginContainer';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { PrivateOutlet } from './utils/PrivateOutlet';
import { useEffect } from 'react';
import { socket } from './socket';
import { addChatMessage, addNewChat, updateChat } from './slices/chatSlice';
import { selectCurrentUser, setCredentials, updateCurrentUserStatus } from './slices/authSlice';
import Header from './components/Header';
import { addUserMap, changeUserStatus, setUserMap } from './slices/userSlice';
import RegisterContainer from './components/RegisterContainer';
import MeetingContainer from './components/meetings/MeetingContainer';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import useNotification from './hooks/useNotification';

function App() {
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        createMessageNotificaion,
        createMeetingStartNotification
    } = useNotification();

    const getCurrentUserId = () => {
        return currentUser?._id;
    }

    const initializeSocket = () => {
        socket.on('connect', () => {
            console.log('connecting')
        })
    
        socket.on('new_message', (message) => {
            // add current user id to check sender id
            const messageData = { 
                chatId: message.chat._id,
                message, 
                currentUserId: getCurrentUserId()
            }

            if (message?.sender?._id !== getCurrentUserId()) {
                createMessageNotificaion(message);
            }

            dispatch(addChatMessage(messageData));
        })
    
        socket.on('new_chat', (chat) => {
            // add user to user map
            console.log(chat);
            dispatch(setUserMap(chat.participants))
            dispatch(addNewChat(chat));
        })

        socket.on('chat_updated', (chat) => {
            // add user to user map
            console.log(chat);
            dispatch(setUserMap(chat.participants))
            dispatch(updateChat({
                chatId: chat._id,
                chat: chat
            }));
        })

        socket.on('profile_status_change', (user) => {
            dispatch(changeUserStatus({ 
                userId: user._id,
                profileStatus: user.profileStatus 
            }));

            if (getCurrentUserId() === user._id) {
                dispatch(updateCurrentUserStatus(user.profileStatus));
            }
        })

        socket.on('meeting-start', (chat) => {
            console.log('--- meeting call')
            createMeetingStartNotification(chat);
        })

        socket.connect();
    }

    const checkLoggedinUser = async () => {
        const userStr = localStorage.getItem('user') || '';
        const user = userStr ? JSON.parse(userStr) : null;
        const token = localStorage.getItem('token') as string;

        if (!token || !user) return navigate('/login');

        console.log('user loggedin');

        dispatch(setCredentials({
            token,
            user
        }));

        dispatch(addUserMap(user));

        socket.auth = {
            token: token
        };

        navigate(location.pathname);
    }

    useEffect(() => {    
        checkLoggedinUser();

        return () => {
   
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            initializeSocket();
        }

        return () => {
            socket.off('new_message');
            socket.off('new_chat');
            socket.off('connect');
            socket.off('profile_status_change');
            socket.off('chat_updated');
            socket.off('meeting-start');
        }
    }, [currentUser])

  return (
    <div className="App">
        <Routes>
          <Route path="/login" element={<LoginContainer />} />
          <Route path="/register" element={<RegisterContainer />} />
          <Route path="/*" element={<PrivateOutlet />}>
            <Route index element={
              <div className="h-screen flex flex-col">
                <Header />
                <div className="flex flex-grow">
                  <div className="w-20 flex flex-col items-center bg-gray-200 border-right bg-opacity-80 relative">
                    <div className="right-0 absolute top-0 bottom-0 bg-gradient-to-l from-gray-300 to-transparent w-3 z-40 opacity-60"></div>
                    <Sidebar />
                  </div>
                  <div className="flex flex-col flex-grow relative">
                    <ChatContainer />
                  </div>
                </div>
            </div>
            } />
            <Route path="meeting/:roomId" element={<MeetingContainer />} />
          </Route>
        </Routes>   
        <ToastContainer 
            position="top-right"
            theme="light"
        /> 
    </div>
  );
}

export default App;
