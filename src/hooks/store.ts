import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import chatReducer from '../slices/chatSlice';
import { apiSlice } from '../slices/apiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(apiSlice.middleware);
    }
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;