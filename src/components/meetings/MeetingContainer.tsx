import { useEffect, useState } from "react";
import { socket } from "../../socket";
import MeetingHeader from "./MeetingHeader";
import MeetingParticipants from "./MeetingParticipants";
import { useAppSelector } from "../../hooks/hooks";
import { selectCurrentUser } from "../../slices/authSlice";
import { useParams } from "react-router-dom";
import Peer from "peerjs";
import config from "../../config";

const MeetingContainer = () => {
    const currentUser = useAppSelector(selectCurrentUser);
    const [myStream, setMySteam] = useState<any>(null);
    const [videoStreams, setVideoStreams] = useState<any[]>([]);
    const [micStatus, setMicStatus] = useState(true);
    const [cameraStatus, setCameraStatus] = useState(true);

    const { roomId } = useParams();

    const addUserParticipant = (participant: any) => {
        setVideoStreams((current) => {
            const index = current.findIndex(item => item.user._id == participant.user._id)
            if (index !== -1) {
                current.splice(index, 1);
            } 
            return [
                ...current,
                participant
            ]
        });
    }

    const handleOnLeave = () => {

    }
    const handleOnToggleCamera = () => {
        setCameraStatus(current => !current)
        if (myStream) {
            myStream.getVideoTracks().forEach((track: any) => track.enabled = !track.enabled);
        }
        
    }
    const handleOnToggleMic = () => {
        setMicStatus(current => !current)
        if (myStream) {
            myStream.getAudioTracks().forEach((track: any) => track.enabled = !track.enabled);
        }
    }
    const handleWindowDestroy = () => {
        
    }

    useEffect(() => {
        let peer: Peer | null = null;

        if (roomId && currentUser) {
            peer = new Peer(currentUser._id, {
                host: '/',
                port: config.PEER_SERVER_PORT,
            });

            peer?.on('open', (id: string) => {
                console.log('---peer open', id)
                socket.emit('join-meeting', roomId, id);
            });

            peer?.on('disconnected', userId => {
                console.log('peer disconnected', userId);
            })

            peer?.on('error', (error: any) => {
                console.log('perr error', error);
            })

            // socket.on('user-joined-meeting', userJoinedMeeting);
            socket.on('user-leave-meeting', () => {

            });

            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            }).then((myStream) => {
                setMySteam(myStream);
                
                peer?.on('call', (call: any) => {
                    call.answer(myStream);
                    call.on('stream', (peerStream: any) => {
                        addUserParticipant({
                            user: { _id: call.peer },
                            stream: peerStream
                        })
                    })
                })
    
                socket.on('user-joined-meeting', async (userId) => {
                    console.log('---user joined', userId);
    
                    const call = peer?.call(userId, myStream);
    
                    console.log('call', 'calling user', userId);
    
                    call?.on('stream', (stream) => {
                        addUserParticipant({
                            user: { _id: userId },
                            stream: stream
                        })
                    })
                })

            })
        }

        window.addEventListener('beforeunload', handleWindowDestroy);

        return () => {
            if (peer) {
                peer?.disconnect();
            }
            socket.off('user-joined-meeting');
            socket.off('user-leave-meeting');
            socket.emit('leave-meeting', roomId);
            setVideoStreams([]);
            window.removeEventListener('beforeunload', handleWindowDestroy);
        }
    }, []);

    return (
        <div className="h-screen bg-zinc-700 w-full flex flex-col">
            <MeetingHeader 
                micStatus={micStatus}
                cameraStatus={cameraStatus}
                onLeave={handleOnLeave}
                onToggleCamera={handleOnToggleCamera}
                onToggleMic={handleOnToggleMic}
            />
            <MeetingParticipants 
                participants={videoStreams}
            />
        </div>
    )
}

export default MeetingContainer;