import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthState } from './authSlice';
import { RootState } from '../hooks/store';

export interface IMessage {
    _id?: string | null,
    chat?: string | null,
    sender?: IUser | null,
    type?: string,
    content?: string,
    is_pinned?: boolean,
    is_edited?: boolean,
    createdAt?: string,
    updatedAt?: string
}

export interface Chat {
    _id: string,
    name?: string,
    user?: any,
    type: string,
    avatar?: string,
    unreadCount?: number,
    messages?: IMessage[],
    participants?: any[],
    createdAt?: string,
    updatedAt?: string
}

export interface IChatRequest {
    type: string,
    name: string | null,
    participants: string[]
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

export interface IUserResponse {
    user: IUser
    token: string
}

export interface IUser {
    _id: string,
    name?: string,
    avatar?: string,
    token?: string
}

export interface IMessageRequest {
    type?: string,
    content?: string,
    chat?: string,
}

export interface IUserRequestParams {
    search: string,
    limit: number,
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

            fetchUsers: builder.query<IUser[], IUserRequestParams>({
                query({ search, limit = 10 }) {
                    return `/users?search=${search}&limit=${limit}`
                },
                transformResponse: (response: { data: IUser[] }, meta, arg) => response.data
            }),

            login: builder.mutation<IUserResponse, LoginRequest>({
                query: (body) => ({
                    url: '/users/signin',
                    method: 'POST',
                    body
                }),
                transformResponse: (response: { data: IUserResponse }, meta, arg) => response.data
            }),

            sendChatMessage: builder.mutation<IMessage, IMessageRequest>({
                query: (body) => ({
                    url: `/chats/${body.chat}/messages`,
                    method: 'POST',
                    body
                }),
                transformResponse: (response: { data: IMessage }, meta, arg) => response.data
            }),

            createChat: builder.mutation<Chat, IChatRequest>({
                query: (body) => ({
                    url: `/chats`,
                    method: 'POST',
                    body
                }),
                transformResponse: (response: { data: Chat }, meta, arg) => response.data
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
    useSendChatMessageMutation,
    useLazyFetchUsersQuery,
    useCreateChatMutation
} = apiSlice;