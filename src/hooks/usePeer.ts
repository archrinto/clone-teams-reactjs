import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const usePeer = (options: any) => {
    let peerStateTimeout: any = null;
    const [peer, setPeer] = useState<Peer | null>(null);

    useEffect(() => {
        const initializePeer = () => {
            const newPeer = new Peer(options);

            peerStateTimeout = setTimeout(() => {
                setPeer(newPeer);
            }, 2000);

            newPeer.on('error', (error) => {
                console.error('PeerJS error:', error);
            });
        };

        if (!peer) {
            initializePeer();
        }

        return () => {
            if (peer) {
                peer.destroy();
            }

            if (peerStateTimeout) {
                clearTimeout(peerStateTimeout);
            }
        };
    }, [peer, options]);

    return peer;
};


export default usePeer;