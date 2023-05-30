import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import chatReducer from '../slices/chatSlice';
import { apiSlice } from '../slices/apiSlice';
import userReducer from '../slices/userSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        users: userReducer,
        [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(apiSlice.middleware);
    }
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;