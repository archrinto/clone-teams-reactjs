import { IChat } from "../models/chat";
import { IUser } from "../models/user";
import { formatDateTimeShort } from "./DateHelper";

export const getChatName = (chat: IChat): string => {
    if (chat.chatType === 'single') {
        return chat?.participants?.[0]?.name || '';
    }

    if (chat.chatType === 'group' && !chat.name) {
        return chat?.participants?.map(item => item.name?.split(' ')?.[0] || '').join(', ') || '';
    }
    
    return chat.name || '';
}

export const getChatDateTime = (chat: IChat): string => {
    let strDate = chat?.createdAt || '';
    if (chat?.messages && chat.messages.length > 0) {
        strDate = chat.messages?.[0].createdAt || '';
    }

    return strDate ? formatDateTimeShort(strDate) : 'n/a';
}

export const getChatSingleUser = (chat: IChat): IUser | undefined => {
    return chat?.participants?.[0];
}