import './App.css';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import LoginContainer from './components/LoginContainer';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { PrivateOutlet } from './utils/PrivateOutlet';
import { useEffect } from 'react';
import { socket } from './socket';
import { addChatMessage, addNewChat, updateChat } from './slices/chatSlice';
import { selectCurrentUser, setCredentials, updateCurrentUserStatus } from './slices/authSlice';
import { addUserMap, changeUserStatus, setUserMap } from './slices/userSlice';
import RegisterContainer from './components/RegisterContainer';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import useNotification from './hooks/useNotification';
import MainContainer from './components/MainContainer';
import MeetingContainer from "./components/meetings/MeetingContainer";
import CalendarContainer from "./components/CalendarContainer";
import TeamsContainer from "./components/TeamsContainer";
import ChatContainer from "./components/chats/ChatContainer";
import ChatMessageContainer from './components/chats/ChatMessageContainer';
import ChatActiveEmpty from './components/chats/ChatActiveEmpty';

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

            // if (getCurrentUserId() === user._id) {
            //     dispatch(updateCurrentUserStatus(user.profileStatus));
            // }
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
          <Route path="/" element={<PrivateOutlet />}>
            <Route path="/" element={<MainContainer />}>
                <Route path="chats" element={<ChatContainer />}>
                    <Route index element={<ChatActiveEmpty />} />
                    <Route path=":chatId" element={<ChatMessageContainer />}>
                    </Route>
                </Route>
                <Route path="teams" element={<TeamsContainer />} />
                <Route path="calendar" element={<CalendarContainer />} />
                <Route path="meeting/:roomId" element={<MeetingContainer />} />
            </Route>
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
