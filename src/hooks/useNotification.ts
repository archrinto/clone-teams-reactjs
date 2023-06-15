import { useEffect, useRef } from "react"
import { IMessage } from "../slices/apiSlice";
import messageNotificationSound from '../assets/sounds/teams-notification.mp3';
import logoIcon from '../assets/images/icons/logo.png';
import emptyUserAvatar from '../assets/images/empty-avatar-1.png';

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
            if (document.visibilityState !== 'visible' || document.hasFocus()) {
                notificationAudio.play();
                return;
            }

            const notificationBody = message.messageType == 'text' ? message.content : message.messageType
            const notification = new Notification(message?.sender?.name || 'New Message', 
                {
                    body: notificationBody,
                    silent: true,
                    icon: message.sender?.avatar || emptyUserAvatar,
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
            };
        })
    }

    const closeAllNotification = () => {
        notificationRef.current.map(item => item.close());
        notificationRef.current = [];
    }

    return {
        createMessageNotificaion,
        closeAllNotification
    }
}

export default useNotification;