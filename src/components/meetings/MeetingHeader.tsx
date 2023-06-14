
import { VideoCameraIcon, MicrophoneIcon, PhoneIcon, VideoCameraSlashIcon } from "@heroicons/react/24/solid";
import MicrophoneSlashIcon from "./MicrophoneSlashIcon";

interface IMeetingHeaderProps {
    onLeave?: () => void
    onToggleMic?: () => void
    onToggleCamera?: () => void
    micStatus: boolean
    cameraStatus: boolean,
    meetingName?: string
}

const MeetingHeader = ({ 
    onLeave, onToggleCamera, onToggleMic, micStatus, cameraStatus, meetingName
}: IMeetingHeaderProps) => {
    return (
        <div className="flex flex-col">
            <div className="text-center bg-zinc-900 text-white py-1 text-sm">
                <span>{ meetingName || 'Meeting Name' }</span>
            </div>
            <div className="flex bg-zinc-800 py-2 justify-between items-stretch">
                <div className="flex-1 text-white flex items-center px-3">
                    <div className="flex items-center">
                        <span>00:22</span>
                    </div>
                </div>
                <div className="flex items-center py-2 px-3 gap-4 text-white">
                    <span className="h-full border-l border-gray-600"></span>
                    <button 
                        onClick={() => onToggleCamera ? onToggleCamera() : null}
                        className="p-1"
                    >
                        { cameraStatus ? 
                            <VideoCameraIcon className="h-5 w-5" /> :
                            <VideoCameraSlashIcon className="h-5 w-5" />
                        }
                    </button>
                    <button 
                        onClick={() => onToggleMic ? onToggleMic() : null}
                        className="p-1"
                    >
                        { micStatus ? 
                            <MicrophoneIcon className="h-5 w-5" /> :
                            <MicrophoneSlashIcon className="h-5 w-5" />
                        }
                    </button>
                    <button
                        onClick={() => onLeave ? onLeave() : null}
                        className=" bg-red-700 rounded-sm text-white py-1 px-3 flex items-center gap-2"
                    >
                        <PhoneIcon className="h-4 w-4" />
                        Leave
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MeetingHeader;