import emptyUserAvatar from '../assets/images/empty-user-avatar.png';
import statusAvailable from '../assets/images/icons/presence_available.png';
import statusUnknown from '../assets/images/icons/presence_unknown.png';
import statusOof from '../assets/images/icons/presence_oof.png';
import statusOffline from '../assets/images/icons/presence_offline.png';
import statusAway from '../assets/images/icons/presence_away.png';
import statusBusy from '../assets/images/icons/presence_busy.png';
import statusDnd from '../assets/images/icons/presence_dnd.png';

interface IAvatarProps {
    status?: string
    src?: string,
    alt?: string,
    hideStatus?: boolean
}

const Avatar = ({ status, src, alt, hideStatus=false }: IAvatarProps) => {
    let statusBadge = statusUnknown;

    switch(status) {
        case 'available':
            statusBadge = statusAvailable;
            break;
        case 'away':
            statusBadge = statusAway;
            break;
        case 'busy':
            statusBadge = statusBusy;
            break;
        case 'offline':
            statusBadge = statusOffline;
            break;
        case 'oof':
            statusBadge = statusOof;
            break;
        case 'dnd':
            statusBadge = statusDnd;
            break;
        default:
            statusBadge = statusUnknown;
    }

    return (
        <div className="relative flex-none">
            <img
                src={src || emptyUserAvatar}
                alt={alt || 'Avatar'}
                className="w-8 h-8 rounded-full mr-2 bg-gray-300"
                onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = emptyUserAvatar;
                }}
            />
            { !hideStatus ? 
                <span className="absolute right-2 bottom-0 z-40 border-2 border-white rounded-full bg-white">
                    <img 
                        src={statusBadge}
                        className="w-2.5 h-2.5 rounded-full"
                    />
                </span> : null
            }
        </div>
    )
}

export default Avatar;