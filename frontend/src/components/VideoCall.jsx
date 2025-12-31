import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';

const VideoCall = ({ socket, workspaceId, onClose, incomingCall }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callStatus, setCallStatus] = useState(incomingCall ? 'answering' : 'connecting');

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);

    // ICE servers configuration (using free STUN servers)
    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    };

    useEffect(() => {
        if (incomingCall) {
            handleIncomingCall();
        } else {
            initializeCall();
        }

        return () => {
            cleanup();
        };
    }, []);

    const handleIncomingCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const peerConnection = new RTCPeerConnection(iceServers);
            peerConnectionRef.current = peerConnection;

            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
                setCallStatus('connected');
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.emit('ice-candidate', {
                        to: incomingCall.from,
                        candidate: event.candidate
                    });
                }
            };

            await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socket.emit('call-accepted', {
                to: incomingCall.from,
                answer
            });

            socket.on('ice-candidate', async ({ candidate }) => {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error('Error adding ICE candidate:', error);
                }
            });

            socket.on('call-ended', () => {
                endCall();
            });

        } catch (error) {
            console.error('Error handling incoming call:', error);
            onClose();
        }
    };

    const initializeCall = async () => {
        try {
            // Get local media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Create peer connection
            const peerConnection = new RTCPeerConnection(iceServers);
            peerConnectionRef.current = peerConnection;

            // Add local stream tracks to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            // Handle incoming tracks
            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
                setCallStatus('connected');
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.emit('ice-candidate', {
                        to: workspaceId,
                        candidate: event.candidate
                    });
                }
            };

            // Create and send offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            if (socket) {
                socket.emit('call-user', {
                    workspaceId,
                    offer
                });
            }

            // Listen for answer
            socket.on('call-accepted', async ({ answer }) => {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            });

            // Listen for ICE candidates
            socket.on('ice-candidate', async ({ candidate }) => {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error('Error adding ICE candidate:', error);
                }
            });

            // Listen for incoming calls
            socket.on('incoming-call', async ({ from, offer }) => {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                socket.emit('call-accepted', {
                    to: from,
                    answer
                });
            });

            // Listen for call end
            socket.on('call-ended', () => {
                endCall();
            });

        } catch (error) {
            console.error('Error initializing call:', error);
            alert('Failed to access camera/microphone. Please check permissions.');
            onClose();
        }
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                // Start screen sharing
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });

                const screenTrack = screenStream.getVideoTracks()[0];
                const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');

                if (sender) {
                    sender.replaceTrack(screenTrack);
                }

                screenTrack.onended = () => {
                    // When user stops sharing, switch back to camera
                    toggleScreenShare();
                };

                setIsScreenSharing(true);
            } else {
                // Stop screen sharing, switch back to camera
                const videoTrack = localStream.getVideoTracks()[0];
                const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');

                if (sender) {
                    sender.replaceTrack(videoTrack);
                }

                setIsScreenSharing(false);
            }
        } catch (error) {
            console.error('Error toggling screen share:', error);
        }
    };

    const endCall = () => {
        setCallStatus('ended');
        if (socket) {
            socket.emit('end-call', { workspaceId });
        }
        cleanup();
        onClose();
    };

    const cleanup = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
            <div className="w-full h-full relative">
                {/* Remote Video (Full Screen) */}
                <div className="w-full h-full bg-[#021f1a] flex items-center justify-center">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center">
                            <div className="w-32 h-32 bg-[#1a3a35] rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Video size={64} className="text-[#4ade80]" />
                            </div>
                            <p className="text-white text-lg">Waiting for other participant...</p>
                            <p className="text-gray-400 text-sm mt-2">{callStatus}</p>
                        </div>
                    )}
                </div>

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-64 h-48 bg-black rounded-2xl overflow-hidden border-2 border-[#4ade80] shadow-2xl">
                    {!isVideoOff ? (
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#1a3a35] flex items-center justify-center">
                            <VideoOff size={48} className="text-gray-500" />
                        </div>
                    )}
                </div>

                {/* Call Controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-[#052e28]/90 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1a3a35] hover:bg-[#25524b]'}`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1a3a35] hover:bg-[#25524b]'}`}
                        title={isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
                    >
                        {isVideoOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
                    </button>

                    <button
                        onClick={toggleScreenShare}
                        className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-[#4ade80] hover:bg-[#34d399]' : 'bg-[#1a3a35] hover:bg-[#25524b]'}`}
                        title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                    >
                        {isScreenSharing ? <MonitorOff size={24} className="text-[#021f1a]" /> : <Monitor size={24} className="text-white" />}
                    </button>

                    <button
                        onClick={endCall}
                        className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all"
                        title="End Call"
                    >
                        <PhoneOff size={24} className="text-white" />
                    </button>
                </div>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
};

export default VideoCall;
