import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthState } from './authSlice';
import { RootState } from '../hooks/store';

export interface IMessage {
    _id?: string | null,
    chat?: string | null,
    sender?: User | null,
    type?: string,
    content?: string,
    is_pinned?: boolean,
    is_edited?: boolean,
}

export interface Chat {
    _id: string,
    name?: string,
    user?: any,
    avatar?: string,
    last_message?: any,
    unread_message?: number,
    messages?: IMessage[]
}

export interface LoginRequest {
    username: string
    password: string
}

export interface IMessageRequestParams {
    chat_id: string,
    limit?: number,
    before?: string,
}

export interface UserResponse {
    user: User
    token: string
}

export interface User {
    _id: string,
    first_name?: string,
    last_name?: string,
    avatar?: string,
    profile_status?: string,
    token?: string
}

export interface IMessageRequest {
    type?: string,
    content?: string,
    chat?: string,
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/v1',
        prepareHeaders: (headers, { getState }) => {
            // By default, if we have a token in the store, let's use that for authenticated requests
            const token = (getState() as RootState).auth.token
            if (token) {
              headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    endpoints(builder) {
        return {
            fetchChats: builder.query<Chat[], number|void>({ 
                query(limit = 10) {
                    return `/chats?limit=${limit}`;
                },
                transformResponse: (response: { data: Chat[] }, meta, arg) => response.data
            }),
            
            fetchChatMessages: builder.query<IMessage[], IMessageRequestParams>({
                query({ chat_id, limit = 10, before }) {
                    return `/chats/${chat_id}/messages?limit=${limit}`
                },
                transformResponse: (response: { data: IMessage[] }, meta, arg) => response.data
            }),

            login: builder.mutation<UserResponse, LoginRequest>({
                query: (body) => ({
                    url: '/users/signin',
                    method: 'POST',
                    body
                }),
                transformResponse: (response: { data: UserResponse }, meta, arg) => response.data
            }),

            sendChatMessage: builder.mutation<IMessage, IMessageRequest>({
                query: (body) => ({
                    url: `/chats/${body.chat}/messages`,
                    method: 'POST',
                    body
                }),
                transformResponse: (response: { data: IMessage }, meta, arg) => response.data
            })
        }
    }
})

export const { 
    useFetchChatsQuery,
    useLazyFetchChatsQuery,
    useFetchChatMessagesQuery,
    useLazyFetchChatMessagesQuery,
    useLoginMutation,
    useSendChatMessageMutation
} = apiSlice;