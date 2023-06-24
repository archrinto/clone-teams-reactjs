import { IChat } from "../models/chat";

export const getChatName = (chat: IChat): string => {
    if (chat.chatType === 'single') {
        return chat?.participants?.[0]?.name || '';
    }

    if (chat.chatType === 'group' && !chat.name) {
        return chat?.participants?.map(item => item.name?.split(' ')?.[0] || '').join(', ') || '';
    }
    
    return chat.name || '';
}