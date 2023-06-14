import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import MeetingHeader from "./MeetingHeader";
import MeetingParticipants from "./MeetingParticipants";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import config from "../../config";
import SimplePeer from "simple-peer";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useGetChatQuery, useLazyGetChatQuery } from "../../slices/apiSlice";
import { setActiveChat } from "../../slices/chatSlice";
import { getChatName } from "../../utils/ChatHelper";

const CAPTURE_OPTIONS = {
    audio: false,
    video: true,
}

const PEER_OPTIONS = {
    host: '/',
    port: config.PEER_SERVER_PORT
}

const SIMPLE_PEER_CONFIG = {
    iceServers: [
        {
            urls: config.TURN_SERVER || '',
            username: config.TURN_SERVER_USER || '',
            credential: config.TURN_SERVER_PASSWORD || ''
        }
    ]
}

interface IUserPeer {
    peerId: string,
    peer: SimplePeer.Instance,
    mediaState?: IMediaState,
    user?: {
        name: string,
        avatar: string | null
    }
}

interface IMediaState {
    video: boolean,
    audio: boolean,
}

const MeetingContainer = () => {
    let initiatorTimeout: any = null;
    let mediaStreamTimeout: any = null;
    let mediaStateTimeout: any = null;

    const { roomId } = useParams();
    const [mediaState, setMediaState] = useState<IMediaState>({ 
        video: false, 
        audio: false 
    });
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const currentChat = useAppSelector(state => state.chat.activeChat);
    const [getChat, chatResult] = useLazyGetChatQuery();
    const [peers, setPeers] = useState<IUserPeer[]>([]);
    const peersRef = useRef<IUserPeer[]>([]);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        // set timeout to pervent multiple initialize
        initiatorTimeout = setTimeout(() => initialize(), 100);

        window.addEventListener('beforeunload', cleanup);

        return () => {
            cleanup();
            window.removeEventListener('beforeunload', cleanup);
        }
    }, []);

    useEffect(() => {
        if (chatResult && chatResult.data) {
            dispatch(setActiveChat(chatResult.data));
        }
    }, [chatResult])

    useEffect(() => {
        mediaStreamTimeout = setTimeout(() => {
            console.log('-- update mediaStream');

            peersRef.current.forEach(item => {
                console.log('--- current peer streams', item.peer.streams);

                if (item.peer.streams.length > 0) {
                    console.log('--- remove current stream');
                    item.peer.removeStream(item.peer.streams[0]);
                }

                if (mediaStream) {
                    console.log('--- add new stream');
                    item.peer.addStream(mediaStream);
                }
            });
        }, 100);

        return () => {
            if (mediaStreamTimeout) clearTimeout(mediaStreamTimeout);
            handleStopMediaStream();
        }
    }, [mediaStream]);

    useEffect(() => {
        mediaStateTimeout = setTimeout(() => {
            console.log('-- update mediaState');

            socket.emit('media-state-change', {
                roomId: roomId,
                mediaState: mediaState
            });

            if (mediaStream) {
                console.log('-- stop current mediaStream');
                mediaStream.getTracks().forEach(track => track.stop());
            }

            if (mediaState.audio || mediaState.video) {
                navigator.mediaDevices.getUserMedia(mediaState)
                    .then((stream) => setMediaStream(stream))
                    .catch((error) => console.error(error))
            } else {
                setMediaStream(null);
            }
        }, 100);

        return () => {
            if (mediaStateTimeout) clearTimeout(mediaStateTimeout);
        }
    }, [mediaState]);

    const initialize = () => {
        if (!roomId) return;

        getChat(roomId);

        console.log('--- joining a meeting');

        socket.emit('join-meeting', {
            roomId: roomId
        });

        socket.on('user-join-meeting', handleUserJoinMeet);
        socket.on('user-send-peer-signal', handleUserSendPeerSignal);
        socket.on('user-return-peer-signal', handleUserReturnPeerSignal);
        socket.on('user-leave-meeting', handleUserLeaveMeeting);
        socket.on('user-media-state-change', handleUserMediaStateChange);
    };

    const handleUserJoinMeet = ({ userId, user }: any) => {
        console.log('--- joined:', userId);

        console.log('--- create new main peer', userId)

        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            config: {
                ...SIMPLE_PEER_CONFIG
            }
        });

        peer.on('signal', (signal) => {
            console.log('--- emit send peer signal');
            socket.emit('send-peer-signal', { 
                targetId: userId,
                signal: signal,
            });
        });

        peer.on('close', () => {
            console.log('--- peer closed');
        })

        peer.on('error', (error) => {
            console.error('Peer Error:', error)
        });

        addPeer({ peerId: userId, peer: peer, user });
    };

    const handleUserSendPeerSignal = ({ userId, user, signal }: any) => {
        console.log('--- receive peer signal', userId);

        const peer = peersRef.current.find(item => item.peerId === userId);
        if (peer) {
            console.log('--- apply signal to existing peer', userId);
            peer.peer.signal(signal);
            return;
        }

        console.log('--- create new slave peer', userId)

        const newPeer = new SimplePeer({
            initiator: false,
            trickle: false,
            config: {
                ...SIMPLE_PEER_CONFIG
            }
        });

        newPeer.on('signal', (signal) => {
            console.log('--- send return signal to roomid')
            socket.emit('return-peer-signal', {
                targetId: userId,
                signal: signal
            });
        });

        newPeer.on('error', (error) => {
            console.error('Peer Error:', error)
        });

        newPeer.on('close', () => {
            console.log('--- peer closed');
        })

        // trigger incoming signal
        newPeer.signal(signal);

        addPeer({ peerId: userId, peer: newPeer, user });
    }

    const handleUserReturnPeerSignal = ({ userId, signal }: any) => {
        console.log('--- receive return peer signal', userId);

        const peer = peersRef.current.find(item => item.peerId === userId);
        if (peer) {
            console.log('--- apply signal to existing peer', userId);
            peer.peer.signal(signal);
        }
    }

    const handleUserLeaveMeeting = ({ userId }: any) => {
        console.log('--- user leave meeting', userId);

        removePeer(userId);
    }

    const handleUserMediaStateChange = ({ userId, mediaState: userMediaState }: any) => {
        console.log('--- user media state change', userId, mediaState);
        setPeers(peers => {
            const index = peers.findIndex(item => item.peerId === userId);
            if (index === -1) return peers;
            peers[index].mediaState = userMediaState;
            return [...peers];
        });
    }

    const cleanup = () => {
        console.log('--- clean up');

        if (initiatorTimeout) clearTimeout(initiatorTimeout);

        socket.emit('leave-meeting', { roomId: roomId });

        if (peersRef.current.length > 0) {
            peersRef.current.forEach((item) => {
                item.peer.destroy();
            });
        }

        handleStopMediaStream();

        peersRef.current = [];
        setPeers([]);

        socket.off('user-return-peer-signal');
        socket.off('user-send-peer-signal');
        socket.off('user-leave-meeting');
        socket.off('user-join-meeting');
    }

    const handleStopMediaStream = () => {
        if (!mediaStream) return;
        
        console.log('-- stop current mediaStream');
        mediaStream.getTracks().forEach(track => track.stop());
    }

    const addPeer = async (peer: IUserPeer) => {
        peersRef.current.push(peer);
        setPeers(peers => [...peers, peer]);

        console.log('--- add new peer ref', peer.peerId, peersRef.current)
    }

    const removePeer = (userId: string) => {
        const indexRef = peersRef.current.findIndex(item => item.peerId === userId);
        if (indexRef !== -1) {
            peersRef.current.splice(indexRef, 1);
        }

        setPeers(peers => {
            const newPeers = [...peers];
            
            for (let i=0; i < newPeers.length; i++) {
                if (newPeers[i].peerId == userId) {
                    newPeers.splice(i, 1);
                }
            }

            return newPeers;
        });


        console.log('--- peers ref', peersRef.current, peersRef.current.length);
    }

    const handleOnLeave = () => {
        // emitLeaveRoom();
        // stopMediaStream();
        window.close();
    }
    

     const handleOnToggleCamera = () => {
        setMediaState((state) => { 
            return {
                ...state,
                video: !state.video
            }
        })
    }
    const handleOnToggleMic = () => {
        setMediaState((state) => { 
            return {
                ...state,
                audio: !state.audio
            }
        })
    }

    return (
        <div className="h-screen bg-zinc-700 w-full flex flex-col">
            <MeetingHeader 
                micStatus={mediaState.audio}
                cameraStatus={mediaState.video}
                onLeave={handleOnLeave}
                onToggleCamera={handleOnToggleCamera}
                onToggleMic={handleOnToggleMic}
                meetingName={currentChat ? getChatName(currentChat) : 'Unknown'}
            />
            <MeetingParticipants 
                participants={peers}
            />
        </div>
    )
}

export default MeetingContainer;