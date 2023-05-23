import './App.css';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import LoginContainer from './components/LoginContainer';
import { Routes, Route } from 'react-router-dom';
import { PrivateOutlet } from './utils/PrivateOutlet';
import { useEffect } from 'react';
import { socket } from './socket';
import { addChatMessage } from './slices/chatSlice';

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    socket.on('connect', () => {
      console.log('connecting')
    })

    socket.on('new_message', (message) => {
      dispatch(addChatMessage({ chatId: message.chat, message }));
    })

    return () => {
      socket.off('new_message');
      socket.off('connect');
    }

  }, []);

  return (
    <div className="App">
        <Routes>
          <Route path="/login" element={<LoginContainer />} />
          <Route path="*" element={<PrivateOutlet />}>
            <Route index element={
              <div className="flex h-screen">
                <div className="bg-gray-900 text-gray-100 w-20 flex flex-col items-center">
                  <Sidebar />
                </div>
                <div className="flex flex-col flex-grow">
                  <ChatContainer />
                </div>
            </div>
            } />
          </Route>
        </Routes>    
    </div>
  );
}

export default App;
