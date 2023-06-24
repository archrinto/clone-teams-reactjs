import { IUser } from "./user"

export interface IChat {
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

export interface IChatRequest {
    chatType: string,
    name: string | null,
    participants: string[]
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

export interface IMessageRequest {
    type?: string,
    content?: string,
    chat?: string,
}

export interface IMessageRequestParams {
    chatId: string,
    limit?: number,
    skip?: number,
    before?: string,
}

export interface IChatState {
    list: IChat[],
    activeChat: IChat | null
    draftChat: IChat | null,
    replyMessage: IMessage | null,
}

