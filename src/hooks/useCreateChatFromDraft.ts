import { toast } from "react-toastify";
import { useCreateChatMutation } from "../slices/apiSlice"
import { addNewChat, setActiveChat, setDraftChat } from "../slices/chatSlice";
import { useAppDispatch } from "./hooks";
import { IChat } from "../models/chat";

export const useCreateChatFromDraft = () => {
    const dispatch = useAppDispatch();
    const [createChat, data] = useCreateChatMutation();

    return async (chat: IChat) => {
        if (!chat._id) {
            const newChatData = {
                name: null,
                chatType: chat?.chatType || 'single',
                participants: chat?.participants?.map(item => item._id) || [],
            }

            try {
                const newChat = await createChat(newChatData).unwrap();
                
                dispatch(addNewChat(newChat));
                dispatch(setActiveChat(newChat));
                dispatch(setDraftChat(null));

                return newChat;
            } catch (error) {
                console.log(error);
                toast.error('Create new chat failed.')
            }
        }

        return null;
    }
}