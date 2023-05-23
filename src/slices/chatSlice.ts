import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Chat, IMessage } from './apiSlice'
import { RootState } from '../hooks/store';

interface ChatState {
    list: Chat[],
    activeChat: Chat | null
}

const initialState: ChatState = {
    list: [],
    activeChat: null
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveChat(state, action: PayloadAction<Chat | null>) {
            state.activeChat = action.payload;
        },
        setChatList(state, action: PayloadAction<Chat[]>) {
            state.list = [...action.payload];
        },
        setChatMessages(state, action: PayloadAction<{chatId: string, messages: IMessage[]}>) {
            if (state.activeChat?._id === action.payload.chatId) {
                state.activeChat.messages = [...action.payload.messages]
            }

            const index = state.list.findIndex(item => item._id === action.payload.chatId);
            if (index !== -1) {
                state.list[index].messages = [...action.payload.messages]
            }
        },
        addChatMessage(state, action: PayloadAction<{chatId: string | null, message: IMessage}>) {
            if (state.activeChat?._id === action.payload.chatId) {
                if (!state.activeChat?.messages) {
                    state.activeChat.messages = [];
                }
                state.activeChat.messages.push(action.payload.message)
            }

            const index = state.list.findIndex(item => item._id === action.payload.chatId);
            if (index !== -1) {
                if (!state.list[index]?.messages) {
                    state.list[index].messages = [];
                }
                state.list[index]?.messages?.push(action.payload.message);
            }
        }
    }
});

export const { 
    setActiveChat, 
    setChatList,
    setChatMessages,
    addChatMessage,
} = chatSlice.actions;

export default chatSlice.reducer;

export const selectActiveChat = (state: RootState) => state.chat.activeChat