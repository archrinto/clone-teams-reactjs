import { useState, useEffect } from "react";

export function useUserMedia(requestedMedia: any) {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        async function enableStream() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(requestedMedia);
                setMediaStream(stream);
            } catch (err) {
                // Removed for brevity
            }
        }

        if (!mediaStream) {
            enableStream();
        } else {
            return function cleanup() {
                mediaStream.getTracks().forEach((track: any) => {
                    track.stop();
                });
            }
        }
    }, [mediaStream, requestedMedia]);

    return mediaStream;
}