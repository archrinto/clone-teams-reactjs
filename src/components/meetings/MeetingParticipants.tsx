import { createRef, useEffect, useRef, useState } from "react"
import { IUser } from "../../slices/apiSlice"
import SimplePeer from "simple-peer"

interface IMeetingParticipantsProps {
    participants?: any[]
}

interface IVideoProps {
    peerId: IUser
    peer: SimplePeer.Instance
}

const Video = ({ peer }: IVideoProps) => {
    let peerTimeout: any = null;
    const [isVideoSteam, setIsVideoSteam] = useState(false);
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        peerTimeout = setTimeout(() => {
            peer.on('track', handlePeerTrack)
            peer.on("stream", handlePeerStream);
        }, 100);

        return () => {
            if (peerTimeout) clearTimeout(peerTimeout);
            peer.removeListener('track', handlePeerTrack);
            peer.removeListener('stream', handlePeerStream);
        }
    }, []);

    const handlePeerTrack =  (track: any, stream: any) => {
        track.addEventListener('mute', () => {
            setIsVideoSteam(false);
            console.log('--- user stop the stream');
        })
    };

    const handlePeerStream = (stream: any) => {
        console.log('-- receive stream', ref);
        setIsVideoSteam(true);

        if (!ref.current) return;
        ref.current.srcObject = stream;
    }

    return (
        <div className="w-52 aspect-square bg-indigo-400">
            <video 
                className={'w-full aspect-square object-cover ' + (isVideoSteam ? 'block' : 'hidden') }
                ref={ref}
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
                        peerId={item.peerId}
                        peer={item.peer} 
                    />
                )}
            </div>
        </div>
    )
}

export default MeetingParticipants;