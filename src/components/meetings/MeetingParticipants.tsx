import { createRef, useEffect, useRef, useState } from "react"
import { IUser } from "../../slices/apiSlice"
import SimplePeer from "simple-peer"
import { MicrophoneIcon } from "@heroicons/react/24/solid"
import MicrophoneSlashIcon from "./MicrophoneSlashIcon"
import { IMediaState } from "./MeetingContainer"

interface IMeetingParticipantsProps {
    participantPeers?: any[],
    shareScreenPeer?: any,
    myPeer?: any,
    children?: any
}

export const PeerVideo = ({ userPeer, className, src, objectFit, muted }: any) => {
    let peerTimeout: any = null;
    const refVideo = useRef<HTMLVideoElement>(null);
    const refStream = useRef<MediaStream>();
    
    if (refVideo.current &&  userPeer?.stream) {
        refVideo.current.srcObject = userPeer.stream;
    }

    return (
        <div className={className}>
            <video 
                className={`w-full h-full ${objectFit || 'object-cover'} ${!userPeer?.mediaState?.video ? 'block': 'block'}`}
                ref={refVideo}
                src={src}
                autoPlay
                muted={muted}
                playsInline={true}
            />
            <div className="absolute bottom-0 left-0 max-w-full text-sm overflow-hidden">
                <div className="bg-gray-800 bg-opacity-50 text-white px-3 py-0.5 rounded-md flex items-center gap-2 m-2">
                    <span className="truncate w-full">{ userPeer?.user?.name || userPeer?.peerId || 'Unknown' }</span>
                    { !userPeer?.mediaState?.audio ?
                        <MicrophoneSlashIcon className="h-4 w-4" /> : <MicrophoneIcon className="h-4 w-4" />
                    }
                </div>
            </div>
        </div>
    )
}

const MeetingParticipants = ({ participantPeers, shareScreenPeer, myPeer }: IMeetingParticipantsProps) => {
    if (shareScreenPeer) {
        return (
            <div className="flex-grow w-full flex flex-row sm:flex-col">
                <div className="flex-grow relative">
                    <PeerVideo 
                        className="bg-zinc-900 top-0 bottom-0 left-0 right-0 h-full w-full object-contain pt-1"
                        userPeer={shareScreenPeer}
                        objectFit={'object-contain'}
                    />
                </div>
                <div className="w-96 sm:w-full border-zinc-800 flex-none flex flex-col p-1">
                    <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-1 content-start justify-center">
                        <PeerVideo 
                            className="w-full aspect-4/3 bg-zinc-500 relative rounded overflow-hidden"
                            userPeer={myPeer}
                            muted={true}
                        />
                        { participantPeers?.map((item, i) =>
                            <PeerVideo 
                                key={i}
                                className="w-full aspect-4/3 bg-zinc-500 relative rounded overflow-hidden"
                                userPeer={item}
                            />
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-grow w-full flex flex-row border-t-2 border-zinc-900 relative">
            <div className="flex flex-wrap gap-1 justify-center content-start w-full p-2">
                { participantPeers?.map((item, i) =>
                    <PeerVideo
                        key={i}
                        userPeer={item}
                        className="w-80 sm:w-56 aspect-4/3 bg-zinc-500 relative"
                    />
                )}
            </div>
            <div className="absolute bottom-0 right-0">
                <div className="w-64 sm:w-40 aspect-4/3 bg-zinc-500 relative">
                    <PeerVideo
                        userPeer={myPeer}
                        muted={true}
                    />
                </div>
            </div>
        </div>
    )
}

export default MeetingParticipants;