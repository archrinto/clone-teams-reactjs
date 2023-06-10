import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Chat, IMessage, IUser } from './apiSlice'
import { RootState } from '../hooks/store';

interface ChatState {
    list: Chat[],
    activeChat: Chat | null
    draftChat: Chat | null,
    replyMessage: IMessage | null,
}

const initialState: ChatState = {
    list: [],
    activeChat: null,
    draftChat: null,
    replyMessage: null,
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveChat(state, action: PayloadAction<Chat | null>) {
            state.activeChat = action.payload ? {...action.payload} : action.payload;
        },
        setDraftChat(state, action: PayloadAction<Chat | null>) {
            state.draftChat = action.payload ? {...action.payload} : action.payload;
        },
        setChatMarkAsRead(state, action: PayloadAction<Chat | null | undefined >) {
            const chatId = action.payload ? action.payload._id : state.activeChat?._id;
            if (chatId) {
                const index = state.list.findIndex(item => item._id === chatId);
                if (index > -1) {
                    state.list[index].unreadCount = 0;
                }
                if (state.activeChat?._id === chatId) {
                    state.activeChat.unreadCount = 0;
                }
            }
        },
        setActiveChatByUser(state, action: PayloadAction<IUser>){
            const user = action.payload;
            const chat = state.list.filter((item) => item?.chatType == 'single' && item?.participants?.[0]?._id == user._id);
            if (chat?.[0]) {
                state.activeChat = chat[0];
            } else {
                state.draftChat = {
                    _id: '',
                    chatType: 'single',
                    name: user.name,
                    avatar: user.avatar,
                    participants: [{
                        _id: user._id,
                        name: user.name,
                        avatar: user.avatar,
                    }]
                };
                state.activeChat = {...state.draftChat}
            }
        },
        setChatList(state, action: PayloadAction<Chat[]>) {
            state.list = [...action.payload];
        },
        addNewChat(state, action: PayloadAction<Chat>) {
            const index = state.list.findIndex(item => item._id === action.payload._id);
            if (index === -1) {
                state.list = [action.payload, ...state.list];
            }
        },
        updateChat(state, action: PayloadAction<{chatId: string, chat:Chat}>) {
            const index = state.list.findIndex(item => item._id === action.payload.chatId);
            if (index !== -1) {
                if (state.activeChat?._id === action.payload.chatId) {
                    state.activeChat = {
                        ...state.activeChat,
                        ...action.payload.chat
                    }
                }

                state.list[index] = {
                    ...state.list[index],
                    ...action.payload.chat
                }
            }
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
        addChatMessage(state, action: PayloadAction<{chatId: string | null, message: IMessage, currentUserId?: string}>) {
            if (state.activeChat?._id === action.payload.chatId) {
                if (!state.activeChat?.messages) {
                    state.activeChat.messages = [];
                }
                if (action.payload.message.sender?._id !== action.payload.currentUserId) {
                    state.activeChat.unreadCount = (state.activeChat?.unreadCount || 0) + 1;
                }
                state.activeChat.messages.push(action.payload.message)
            }

            const index = state.list.findIndex(item => item._id === action.payload.chatId);
            if (index !== -1) {
                if (!state.list[index]?.messages) {
                    state.list[index].messages = [];
                }
                if (action.payload.message.sender?._id !== action.payload.currentUserId) {
                    state.list[index].unreadCount = (state.list[index]?.unreadCount || 0) + 1;
                }
                state.list[index]?.messages?.push(action.payload.message);
            }
        },
        setReplyMessage(state, action: PayloadAction<IMessage | null>) {
            state.replyMessage = action.payload
        }
    }
});

export const { 
    setActiveChat, 
    setDraftChat,
    setChatList,
    setChatMessages,
    addChatMessage,
    addNewChat,
    updateChat,
    setActiveChatByUser,
    setChatMarkAsRead,
    setReplyMessage
} = chatSlice.actions;

export default chatSlice.reducer;

export const selectActiveChat = (state: RootState) => state.chat.activeChat