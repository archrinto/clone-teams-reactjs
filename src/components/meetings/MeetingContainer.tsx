import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import MeetingHeader from "./MeetingHeader";
import MeetingParticipants, { PeerVideo } from "./MeetingParticipants";
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

export interface IUserPeer {
    peerId: string,
    peer?: SimplePeer.Instance,
    mediaState?: IMediaState,
    stream?: MediaStream,
    user?: {
        name: string,
        avatar: string | null
    }
}

export interface IMediaState {
    video: boolean,
    audio: boolean,
}

const MeetingContainer = () => {
    let initiatorTimeout: any = null;
    let mediaStreamTimeout: any = null;
    let mediaStateTimeout: any = null;
    let shareScreenStateTimeout: any = null;

    const { roomId } = useParams();

    const [getChat, chatResult] = useLazyGetChatQuery();

    const currentChat = useAppSelector(state => state.chat.activeChat);

    const [mediaState, setMediaState] = useState<IMediaState>({ 
        video: false, 
        audio: false 
    });
    const [drawCount, setDrawCount] = useState(0);
    const [shareScreenState, setShareScreenState] = useState(false);
    const [peers, setPeers] = useState<IUserPeer[]>([]);
    const [shareScreenPeer, setShareScreenPeer] = useState<IUserPeer | null>(null);

    const peersRef = useRef<IUserPeer[]>([]);
    const pinnedPeerRef = useRef<IUserPeer | null>(null);
    const myPeerRef = useRef<IUserPeer | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const shareScreenStreamRef = useRef<MediaStream | null>(null);
    const shareScreenPeerRef = useRef<IUserPeer | null>(null);
    const shareScreenPeersRef = useRef<IUserPeer[]>([]);

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
        mediaStateTimeout = setTimeout(() => {
            console.log('-- update mediaState');

            socket.emit('media-state-change', {
                roomId: roomId,
                mediaState: mediaState
            });
            
            navigator.mediaDevices.getUserMedia({
                ...mediaState,
                audio: true
            }).then((stream) => {
                if (!mediaState.audio) {
                    stream.getAudioTracks().forEach(track => track.enabled = false);
                }

                // add track to existing media stream
                if (myPeerRef?.current?.stream) {
                    myPeerRef.current.stream.getTracks().forEach(track => {
                        myPeerRef?.current?.stream?.removeTrack(track);
                        track.stop();
                    });
                    stream.getTracks().forEach(track => {
                        myPeerRef?.current?.stream?.addTrack(track);
                    })
                } else {
                    if (myPeerRef.current) {
                        myPeerRef.current.stream = stream;
                    }
                }
                
                // update track for peers
                peersRef.current.forEach(item => {
                    console.log('---- update peer stream', item?.peer?.streams);
                    // console.log('---- current stream')
                    if (!item?.peer?.streams?.[0]) return;

                    item.peer.streams.forEach(s => console.log(s));

                    stream.getTracks().forEach(track => {
                        item?.peer?.addTrack(track, item.peer.streams[0]);
                    })
                })
                
                if (myPeerRef.current) {
                    myPeerRef.current.mediaState = mediaState;
                    setDrawCount(curr => curr + 1);
                }
            }).catch((error) => {
                console.error(error) 
            })
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

        myPeerRef.current = {
            peerId: 'myPeer',
            mediaState: mediaState
        }

        socket.on('user-join-meeting', handleUserJoinMeet);
        socket.on('user-send-peer-signal', handleUserSendPeerSignal);
        socket.on('user-return-peer-signal', handleUserReturnPeerSignal);
        socket.on('user-leave-meeting', handleUserLeaveMeeting);
        socket.on('user-media-state-change', handleUserMediaStateChange);
        socket.on('user-send-share-screen-peer-signal', handleUserSendShareScreenPeerSignal);
        socket.on('user-return-share-screen-peer-signal', handleUserReturnShareScreenPeerSignal);
        socket.on('user-stop-share-screen', handleUserStopShareScreen);
    };

    const handleUserJoinMeet = ({ userId, user }: any) => {
        console.log('--- joined:', userId);
        console.log('--- create new main peer', userId);

        const participantPeer = createParticipantPeer(userId);
        const shareScreenPeer = shareScreenState ? createShareScreenPeer(userId) : null;

        addParticipantPeer({ peerId: userId, peer: participantPeer, user });

        if (shareScreenPeer) {
            console.log('--- create share screen peer');
            addShareScreenPeer({
                peerId: userId,
                peer: shareScreenPeer
            })
        }
    };

    const handleUserSendPeerSignal = ({ userId, user, signal }: any) => {
        console.log('--- receive peer signal', userId);

        let userPeer = peersRef.current.find(item => item.peerId === userId);

        if (userPeer) {
            if (!userPeer.peer?.destroyed) {
                userPeer?.peer?.signal(signal);
            } else {
                removePeer(userPeer.peerId);
            }
            return;
        }

        const peer = createSecondPaticipantPeer(userId);

        addParticipantPeer({ 
            peerId: userId, 
            peer: peer,
            user 
        });

        // trigger incoming signal
        // use timeout to prevent signal triggered before participant rendered
        // that cause stream event not trigered
        setTimeout(() => {
            peer.signal(signal);
        }, 500)
    }

    const handleUserReturnPeerSignal = ({ userId, signal }: any) => {
        console.log('--- receive return peer signal', userId);

        const peer = peersRef.current.find(item => item.peerId === userId);
        if (peer) {
            console.log('--- apply signal to existing peer', userId);
            peer?.peer?.signal(signal);
        }
    }

    const handleUserLeaveMeeting = ({ userId }: any) => {
        console.log('--- user leave meeting', userId);

        removePeer(userId);
    }

    const handleUserMediaStateChange = ({ userId, mediaState }: any) => {
        console.log('--- user media state change', userId, mediaState);
        onPeerMediaState(userId, mediaState);
        // setPeers(peers => {
        //     const index = peers.findIndex(item => item.peerId === userId);
        //     if (index === -1) return peers;
        //     peers[index].mediaState = userMediaState;
        //     return [...peers];
        // });
    }

    const cleanup = () => {
        console.log('--- clean up');

        if (initiatorTimeout) clearTimeout(initiatorTimeout);

        socket.emit('leave-meeting', { roomId: roomId });
        if (shareScreenPeersRef.current.length) {
            handleStopShareScreen();
        }

        if (peersRef.current.length > 0) {
            peersRef.current.forEach((item) => {
                item?.peer?.destroy();
            });
        }

        handleStopMediaStream();

        peersRef.current = [];
        setPeers([]);

        socket.off('user-return-peer-signal');
        socket.off('user-send-peer-signal');
        socket.off('user-leave-meeting');
        socket.off('user-join-meeting');
        socket.off('user-send-share-screen-peer-signal');
        socket.off('user-return-share-screen-peer-signal');
        socket.off('user-stop-share-screen');
    }

    const handleStopMediaStream = () => {
        if (!mediaStreamRef.current) return;
        
        console.log('-- stop current mediaStream');
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    const addParticipantPeer = (peer: IUserPeer) => {
        peersRef.current.push(peer);
        setDrawCount(curr => curr + 1);
        // setPeers(peers => [...peers, peer]);

        console.log('--- add new peer ref', peer.peerId, peersRef.current)
    }

    const removePeer = (userId: string) => {
        const indexParticipantRef = peersRef.current.findIndex(item => item.peerId === userId);
        const indexShareScreenRef = shareScreenPeersRef.current.findIndex(item => item.peerId == userId);

        if (indexParticipantRef !== -1) {
            peersRef.current.splice(indexParticipantRef, 1);
        }

        if (indexShareScreenRef !== -1) {
            shareScreenPeersRef.current.splice(indexShareScreenRef, 1);
        }

        setDrawCount(curr => curr + 1);

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

    const createParticipantPeer = (userId: string) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: myPeerRef.current?.stream,
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
            handleUserLeaveMeeting({ userId });
        })

        peer.on('error', (error) => {
            console.error('Peer Error:', error)
        });

        peer.on('stream', stream => {
            onPeerStream(userId, stream);
        });

        peer.on('track', (track, stream) => {
            onPeerTrack(userId, track, stream);
        });

        return peer;
    }

    const createSecondPaticipantPeer = (userId: string) => {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: myPeerRef.current?.stream,
            config: {
                ...SIMPLE_PEER_CONFIG
            }
        });

        peer.on('signal', (signal) => {
            console.log('--- send return signal to roomid')
            socket.emit('return-peer-signal', {
                targetId: userId,
                signal: signal
            });
        });

        peer.on('error', (error) => {
            console.error('Peer Error:', error)
        });

        peer.on('close', () => {
            console.log('--- peer closed');
            handleUserLeaveMeeting({ userId });
        });

        peer.on('stream', stream => {
            onPeerStream(userId, stream);
        });

        peer.on('track', (track, stream) => {
            onPeerTrack(userId, track, stream);
        });

        return peer;
    }

    const onPeerMediaState = (userId: string, mediaState: IMediaState) => {
        const index = peersRef.current.findIndex(item => item.peerId === userId);
        console.log('-- peer update media state', userId, mediaState, index);
        if (index !== -1) {
            peersRef.current[index].mediaState = mediaState;
            setDrawCount(curr => curr + 1);
        }
    }

    const onPeerStream = (userId: string, stream: MediaStream) => {
        const index = peersRef.current.findIndex(item => item.peerId === userId);
        console.log('--- receive peer stream', index);
        if (index !== -1) {
            peersRef.current[index].stream = stream;
            setDrawCount(curr => curr + 1);
        }
    }

    const onPeerTrack = (userId: string, track: MediaStreamTrack, stream: MediaStream) => {
        const index = peersRef.current.findIndex(item => item.peerId === userId);
        console.log('--- receive track', userId, track, index);

        if (index === -1) return;
        if (!peersRef.current[index].stream) {
            peersRef.current[index].stream = stream;
        };

        if (track.kind === 'audio') {
            peersRef.current?.[index]?.stream?.getAudioTracks().forEach(t => {
                peersRef.current?.[index]?.stream?.removeTrack(t);
            });
        }

        if (track.kind === 'video') {
            peersRef.current?.[index]?.stream?.getVideoTracks().forEach(t => {
                peersRef.current?.[index]?.stream?.removeTrack(t);
            });
        }

        peersRef.current?.[index]?.stream?.addTrack(track);
    }

    /// Share Screen ///

    const handleOnToggleShareScreen = () => {
        if (!shareScreenState) {
            navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            }).then(stream => {
                stream.getVideoTracks()[0].addEventListener('ended', () => {
                    handleStopShareScreen();
                })
                shareScreenStreamRef.current = stream;
                handleStartScreenSharing();
                setShareScreenState(true);
            }).catch(err => {
                console.log(err);
                setShareScreenState(false);
            })
        } else {
            handleStopShareScreen();
        }
    }

    const handleStopShareScreen = () => {
        socket.emit('stop-share-screen', {
            roomId: roomId
        })
        shareScreenPeersRef.current.forEach(item => {
            item?.peer?.destroy();
        });
        shareScreenPeersRef.current = [];
        shareScreenStreamRef.current?.getTracks().forEach(track => track.stop());
        setShareScreenState(false);
    }

    const handleStartScreenSharing = () => {
        peersRef.current.forEach(item => {
            const newPeer = createShareScreenPeer(item.peerId);
            addShareScreenPeer({
                peerId: item.peerId,
                peer: newPeer
            })
        })
    }

    const addShareScreenPeer = (userPeer: IUserPeer) => {
        const index = shareScreenPeersRef.current.findIndex(item => item.peerId === userPeer.peerId);
        if (index !== -1) shareScreenPeersRef.current.splice(index, 1);
        shareScreenPeersRef.current.push(userPeer);
    }

    const handleUserSendShareScreenPeerSignal = ({ userId, user, signal }: any) => {
        if (shareScreenPeerRef.current?.peerId == userId) {
            if (shareScreenPeerRef.current?.peer?.destroyed) {
                shareScreenPeerRef.current = null;
                setDrawCount(curr => curr + 1);
            } else {
                shareScreenPeerRef.current?.peer?.signal(signal);
                return;
            }
        } else {
            shareScreenPeerRef.current = null;
            setDrawCount(curr => curr + 1);
        }

        const peer = createSecondShareScreenPeer(userId);
        const userPeer = {
            peerId: userId,
            peer: peer,
            user
        }

        shareScreenPeerRef.current = userPeer;
        setDrawCount(curr => curr + 1);

        // trigger incoming signal
        // use timeout to prevent signal triggered before participant rendered
        // that cause steam event not trigered
        setTimeout(() => {
            peer.signal(signal);
        }, 500)
    }

    const createShareScreenPeer = (userId: string) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: shareScreenStreamRef.current || undefined,
            config: {
                ...SIMPLE_PEER_CONFIG
            }
        });

        peer.on('signal', (signal) => {
            console.log('--- emit send share screen peer signal');
            socket.emit('send-share-screen-peer-signal', { 
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

        return peer;
    }

    const createSecondShareScreenPeer = (userId: string) => {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            config: {
                ...SIMPLE_PEER_CONFIG
            }
        });

        peer.on('signal', (signal) => {
            socket.emit('return-share-screen-peer-signal', {
                targetId: userId,
                signal: signal
            });
        });

        peer.on('error', (error) => {
            console.error('Peer Error:', error)
        });

        peer.on('close', () => {
            console.log('--- peer closed');
        });

        peer.on('stream', (stream) => {
            console.log('---receive share screen stream', stream);

            if (shareScreenPeerRef.current) {
                shareScreenPeerRef.current.stream = stream
                setDrawCount(curr => curr + 1);
            }
        });

        peer.on('track', (track: MediaStreamTrack, stream: MediaStream) => {
            if (!shareScreenPeerRef.current) return;
            
            if (!shareScreenPeerRef.current?.stream) {
                shareScreenPeerRef.current.stream = stream
                setDrawCount(curr => curr + 1);
            }

            if (track.kind === 'audio') {
                shareScreenPeerRef.current.stream.getAudioTracks().forEach(t => {
                    shareScreenPeerRef.current?.stream?.removeTrack(t);
                });
            }
    
            if (track.kind === 'video') {
                shareScreenPeerRef.current.stream.getVideoTracks().forEach(t => {
                    shareScreenPeerRef.current?.stream?.removeTrack(t);
                });
            }

            shareScreenPeerRef.current.stream.addTrack(track);
        })

        return peer;
    }

    const handleUserReturnShareScreenPeerSignal = ({ userId, signal }: any) => {
        console.log('--- receive return peer signal', userId);

        const index = shareScreenPeersRef.current.findIndex(item => item.peerId === userId);
        if (shareScreenPeersRef.current?.[index]) {
            if (shareScreenPeersRef.current[index]?.peer?.destroyed) {
                shareScreenPeersRef.current.splice(index, 1);
                return;
            }
            shareScreenPeersRef.current[index]?.peer?.signal(signal);
        }
    }

    const handleUserStopShareScreen = () => {
        console.log('--- user stop share screen', shareScreenPeer);

        shareScreenPeerRef.current?.peer?.destroy();
        shareScreenPeerRef.current = null;

        setDrawCount(curr => curr + 1);
    }

    return (
        <div className="h-screen bg-zinc-900 w-full flex flex-col">
            <MeetingHeader 
                micStatus={mediaState.audio}
                cameraStatus={mediaState.video}
                shareScreenStatus={shareScreenState}
                onLeave={handleOnLeave}
                onToggleCamera={handleOnToggleCamera}
                onToggleMic={handleOnToggleMic}
                onToggleShareScreen={handleOnToggleShareScreen}
                meetingName={currentChat ? getChatName(currentChat) : 'Unknown'}
            />
            <MeetingParticipants 
                participantPeers={peersRef.current}
                shareScreenPeer={shareScreenPeerRef.current}
                myPeer={myPeerRef.current}
            />
        </div>
    )
}

export default MeetingContainer;