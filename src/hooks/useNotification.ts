import { useEffect, useRef } from "react"
import messageNotificationSound from '../assets/sounds/teams-notification.mp3';
import meetingNotificationSound from '../assets/sounds/teams-default.mp3';
import logoIcon from '../assets/images/icons/logo.png';
import callIcon from '../assets/images/call-icon-1.jpg';
import emptyAvatarUser from '../assets/images/empty-avatar-1.png';
import { getChatName } from "../utils/ChatHelper";
import { IChat, IMessage } from "../models/chat";

const useNotification = () => {
    const notificationRef = useRef<Notification[]>([]);

    useEffect(() => {
        window.addEventListener('focus', onFocus);

        return () => {
            window.removeEventListener('focus', onFocus);
        }
    })

    const onFocus = () => {
        closeAllNotification();
    };

    const createMessageNotificaion = (message: IMessage) => {
        if (!('Notification' in window)) return;
        if (!message?.sender) return;

        Notification.requestPermission().then(permission => {
            const notificationAudio = new Audio(messageNotificationSound);

            if (permission !== 'granted') return;
            if (document.visibilityState === 'visible' && document.hasFocus()) {
                notificationAudio.play();
                return;
            }

            const notificationBody = message.messageType == 'text' ? message.content : message.messageType
            const notification = new Notification(message?.sender?.name || 'New Message', 
                {
                    body: notificationBody,
                    silent: true,
                    icon: message.sender?.avatar || emptyAvatarUser,
                    badge: logoIcon,
                    data: {
                        kind: 'message',
                        data: message 
                    }
                }
            );
            
            notification.onshow = () => {
                notificationRef.current.push(notification);
                try {
                    notificationAudio.play();
                } catch(e) {
                    console.log('cannot play notification sound')
                }
            };
            notification.onclick = () => {
                notificationAudio.pause();
                notificationAudio.currentTime = 0;

                window.focus();
            };
        })
    }

    const createMeetingStartNotification = (chat: IChat) => {
        if (!('Notification' in window)) return;
        
        const chatName = getChatName(chat);

        if (!chatName) return;

        Notification.requestPermission().then(permission => {
            const notificationAudio = new Audio(meetingNotificationSound);

            if (permission !== 'granted') return;

            const notification = new Notification(chatName, 
                {
                    body: 'wants you to join a meeting',
                    silent: true,
                    icon: chat.avatar || callIcon,
                    badge: logoIcon,
                    data: {
                        kind: 'message',
                        data: chat 
                    }
                }
            );
            
            notification.onshow = () => {
                notificationRef.current.push(notification);
                try {
                    notificationAudio.play();
                } catch(e) {
                    console.log('cannot play notification sound')
                }
            };
            notification.onclick = (event: any) => {
                notificationAudio.pause();
                notificationAudio.currentTime = 0;
                
                const width = Math.floor(window.innerWidth * 0.7);
                const height = Math.floor(window.innerHeight * 0.8);
                const left = Math.floor((window.innerWidth - width) / 2);
                const top = Math.floor((window.innerHeight - height) / 2);

                window.open(`/meeting/${chat._id}`, '_blank', `width=${width}, height=${height}, left=${left}, top=${top}`);
            };
        })
    }

    const closeAllNotification = () => {
        notificationRef.current.map(item => item.close());
        notificationRef.current = [];
    }

    return {
        createMessageNotificaion,
        closeAllNotification,
        createMeetingStartNotification
    }
}

export default useNotification;