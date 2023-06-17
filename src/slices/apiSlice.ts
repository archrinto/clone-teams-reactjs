import { FetchBaseQueryError, createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { AuthState } from './authSlice';
import { RootState } from '../hooks/store';
import config from '../config';
import { error } from 'console';
import { BaseQueryApi, BaseQueryArg, BaseQueryExtraOptions, BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { type } from 'os';
import { RetryOptions } from '@reduxjs/toolkit/dist/query/retry';

export interface IMessage {
    _id?: string | null,
    chat?: {
        _id: string | null
    },
    sender?: IUser | null,
    messageType?: string,
    content?: string,
    replyTo?: IMessage,
    is_pinned?: boolean,
    is_edited?: boolean,
    createdAt?: string,
    updatedAt?: string
}

export interface Chat {
    _id: string,
    name?: string,
    user?: any,
    chatType: string,
    avatar?: string,
    unreadCount?: number,
    messages?: IMessage[],
    participants?: any[],
    createdAt?: string,
    updatedAt?: string,
    participantCount?: number,
    replyMessage?: IMessage | null,
}

export interface IChatRequest {
    chatType: string,
    name: string | null,
    participants: string[]
}

export interface LoginRequest {
    username: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    name: string
}

export interface IMessageRequestParams {
    chatId: string,
    limit?: number,
    skip?: number,
    before?: string,
}

export interface ILoginResponse {
    user: IUser
    token: string
}

export interface IUser {
    _id: string,
    name?: string,
    avatar?: string,
    token?: string,
    email?: string,
    profileStatus?: string,
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

export interface IChangeStatusRequest {
    profileStatus: string,
}

export interface IUpdateProfileRequest {
    name?: string,
    avatar?: string,
    email?: string,
}

export interface IAddParticipantRequest {
    chatId: string,
    data: {
        participants: String[]
    }
}

export interface IUpdateChatRequest {
    chatId: string,
    data: {
        name?: String,
        avatar?: String
    }
}

console.log(config.MAIN_API);

export const apiSlice = createApi({
    reducerPath: 'api',
    refetchOnFocus: false, // skip for now, find how to implement it 
    refetchOnReconnect: false, // skip for now, find how to implement it
    baseQuery: retry(fetchBaseQuery({
        baseUrl: config.MAIN_API,
        prepareHeaders: (headers, { getState }) => {
            // By default, if we have a token in the store, let's use that for authenticated requests
            const token = (getState() as RootState).auth.token
            if (token) {
              headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }), { 
        retryCondition: (
            error: FetchBaseQueryError,
            args: BaseQueryArg<BaseQueryFn>, 
            extraArgs: {
                attempt: number;
                baseQueryApi: BaseQueryApi;
                extraOptions: BaseQueryExtraOptions<BaseQueryFn> & RetryOptions;
            }
        ): boolean => {
            const maxRetries = 3;
            if (extraArgs.attempt > (extraArgs?.extraOptions?.maxRetries || maxRetries)) {
                return false;
            }
            if (extraArgs?.extraOptions?.retryCondition && !extraArgs.extraOptions.retryCondition(error, args, extraArgs)) {
                return false;
            }
            if (typeof(error.status) === "string" && !["FETCH_ERROR", "TIMEOUT_ERROR"].includes(error.status)) {
                return false;
            }
            if (typeof(error.status) === 'number' && error.status <= 500) {
                return false;
            }
            return true;
        }
    }),
    endpoints(builder) {
        return {
            fetchChats: builder.query<Chat[], number|void>({ 
                query(limit = 10) {
                    return `/chats?limit=${limit}`;
                },
                transformResponse: (response: { data: Chat[] }, meta, arg) => response.data,
            }),
            
            fetchChatMessages: builder.query<IMessage[], IMessageRequestParams>({
                query({ chatId, skip = 0, limit = 10, before }) {
                    return `/chats/${chatId}/messages?limit=${limit}&skip=${skip}`
                },
                transformResponse: (response: { data: IMessage[] }, meta, arg) => response.data,
            }),

            fetchUsers: builder.query<IUser[], IUserRequestParams>({
                query({ search, limit = 10 }) {
                    return `/users?search=${search}&limit=${limit}`
                },
                transformResponse: (response: { data: IUser[] }, meta, arg) => response.data
            }),

            register: builder.mutation<IUser, RegisterRequest>({
                query: (body) => ({
                    url: '/users/signup',
                    method: 'POST',
                    body
                }),
                transformResponse: (response: { data: IUser }, meta, arg) => response.data
            }),

            login: builder.mutation<ILoginResponse, LoginRequest>({
                query: (body) => ({
                    url: '/users/signin',
                    method: 'POST',
                    body
                }),
                transformResponse: (response: { data: ILoginResponse }, meta, arg) => response.data
            }),

            sendChatMessage: builder.mutation<IMessage, IMessageRequest>({
                query: (body) => ({
                    url: `/chats/${body.chat}/messages`,
                    method: 'POST',
                    body
                }),
                extraOptions: {
                    maxRetries: 3,
                },
                transformResponse: (response: { data: IMessage }, meta, arg) => response.data,
            }),

            createChat: builder.mutation<Chat, IChatRequest>({
                query: (body) => ({
                    url: `/chats`,
                    method: 'POST',
                    body
                }),
                transformResponse: (response: { data: Chat }, meta, arg) => response.data
            }),

            updateUserProfile: builder.mutation<IUser, IUpdateProfileRequest>({
                query: (body) => ({
                    url: `/users/me`,
                    method: 'PUT',
                    body
                }),
                transformResponse: (response: { data: IUser }, meta, arg) => response.data
            }),

            changeUserStatus: builder.mutation<IUser, IChangeStatusRequest>({
                query: (body) => ({
                    url: `/users/me/status`,
                    method: 'PUT',
                    body
                }),
                transformResponse: (response: { data: IUser }, meta, arg) => response.data
            }),

            addChatParticipant: builder.mutation<Chat, IAddParticipantRequest>({
                query: ({ chatId, data }) => ({
                    url: `/chats/${chatId}/participants`,
                    method: 'POST',
                    body: data
                }),
                transformResponse: (response: { data: Chat }, meta, arg) => response.data
            }),

            updateChat: builder.mutation<Chat, IUpdateChatRequest>({
                query: ({ chatId, data}) => ({
                    url: `/chats/${chatId}`,
                    method: 'PUT',
                    body: data
                }),
                transformResponse: (response: { data: Chat }, meta, arg) => response.data
            }),

            getChat: builder.query<Chat, string>({
                query: (chatId) => {
                    return `/chats/${chatId}`
                },
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
    useCreateChatMutation,
    useRegisterMutation,
    useChangeUserStatusMutation,
    useUpdateUserProfileMutation,
    useAddChatParticipantMutation,
    useUpdateChatMutation,
    useGetChatQuery,
    useLazyGetChatQuery
} = apiSlice;