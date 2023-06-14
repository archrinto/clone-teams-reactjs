import { Chat } from "../slices/apiSlice";

export const getChatName = (chat: Chat): string => {
    if (chat.chatType === 'single') {
        return chat?.participants?.[0]?.name || '';
    }
    return chat.name || '';
}