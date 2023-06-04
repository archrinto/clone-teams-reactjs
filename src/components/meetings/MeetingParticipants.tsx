import { createRef, useEffect } from "react"
import { IUser } from "../../slices/apiSlice"

interface IMeetingParticipantsProps {
    participants?: any[]
}

interface IVideoProps {
    user: IUser
    stream: any
}

const Video = ({ stream }: IVideoProps) => {
    const localVideo = createRef<HTMLVideoElement>();

    useEffect(() => {
        if (localVideo.current) localVideo.current.srcObject = stream;
    }, [stream, localVideo]);

    return (
        <div className="w-52 aspect-square bg-indigo-400">
            <video 
                className="w-full aspect-square object-cover"
                ref={localVideo}
                autoPlay
            />
        </div>
    )
}

const MeetingParticipants = ({ participants }: IMeetingParticipantsProps) => {
    return (
        <div className="flex-grow w-full pt-32">
            <div className="flex gap-1 justify-center flex-wrap max-w-6xl mr-auto ml-auto">
                {participants?.map((item, i) => 
                    <Video 
                        key={i}
                        user={item.user}
                        stream={item.stream} 
                    />
                )}
            </div>
        </div>
    )
}

export default MeetingParticipants;