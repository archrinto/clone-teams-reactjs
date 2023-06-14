import { createRef, useEffect, useRef, useState } from "react"
import { IUser } from "../../slices/apiSlice"
import SimplePeer from "simple-peer"
import { MicrophoneIcon } from "@heroicons/react/24/solid"
import MicrophoneSlashIcon from "./MicrophoneSlashIcon"

interface IMeetingParticipantsProps {
    participants?: any[]
}

const Video = ({ userPeer }: any) => {
    let peerTimeout: any = null;
    const streamRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        console.log('--- rerender')
        peerTimeout = setTimeout(() => {
            userPeer.peer.on('track', handlePeerTrack)
            userPeer.peer.on("stream", handlePeerStream);
        }, 100);

        return () => {
            if (peerTimeout) clearTimeout(peerTimeout);
            userPeer.peer.removeListener('track', handlePeerTrack);
            userPeer.peer.removeListener('stream', handlePeerStream);
        }
    }, []);

    const handlePeerTrack =  (track: any, stream: any) => {
        console.log('--- receive', track.kind, 'track')
    };

    const handlePeerStream = (stream: any) => {
        console.log('-- receive stream', stream);
        if (!streamRef.current) return;
        streamRef.current.srcObject = stream;
    }

    return (
        <div className="w-72 aspect-video bg-zinc-500 relative rounded-md overflow-hidden">
            <video 
                className={'w-full aspect-video object-cover ' + (!userPeer?.mediaState?.video ? 'hidden': 'block') }
                ref={streamRef}
                autoPlay
            />
            <div className="absolute bottom-2 left-2 text-sm bg-gray-800 bg-opacity-50 text-white px-3 py-0.5 rounded-md flex items-center gap-2">
                <span>{ userPeer?.user?.name || userPeer.peerId }</span>
                { !userPeer?.mediaState?.audio ?
                     <MicrophoneSlashIcon className="h-4 w-4" /> : <MicrophoneIcon className="h-4 w-4" />
                }
            </div>
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
                        userPeer={item}
                    />
                )}
            </div>
        </div>
    )
}

export default MeetingParticipants;