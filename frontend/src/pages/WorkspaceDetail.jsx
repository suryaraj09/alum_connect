import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Video, MessageSquare, FileText, Send, Building2, User, Phone, PhoneOff, Home, Folder, Plus, Grid } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import VideoCall from '../components/VideoCall';
import DocumentEditor from '../components/DocumentEditor';
import FileManager from '../components/FileManager';

const WorkspaceDetail = () => {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeView, setActiveView] = useState('default'); // 'default', 'document', 'files'
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const [isConnected, setIsConnected] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Initialize Socket.io connection
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
            auth: {
                token: userInfo?.token
            }
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket Connected!');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket Disconnected!');
            setIsConnected(false);
        });

        console.log('Socket connecting to:', import.meta.env.VITE_API_URL || 'http://localhost:5001');
        console.log('User Info:', userInfo);

        // Join workspace room
        newSocket.emit('join-workspace', {
            workspaceId: id,
            userId: userInfo?._id
        });

        console.log('Emitted join-workspace for:', id);

        // Listen for new messages
        newSocket.on('new-message', (message) => {
            console.log('Received new message:', message);
            setMessages(prev => [...prev, message]);

            // Send notification if not from self
            if (message.sender._id !== userInfo._id && Notification.permission === 'granted') {
                new Notification(`New message from ${message.sender.name}`, {
                    body: message.content
                });
            }
        });

        newSocket.on('incoming-call', ({ from, offer }) => {
            console.log('Incoming call from:', from);
            setIncomingCall({ from, offer });
        });

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }


        // Listen for typing indicator
        newSocket.on('user-typing', ({ userId, isTyping }) => {
            setIsTyping(isTyping);
        });

        // Listen for active users
        newSocket.on('active-users', ({ users }) => {
            setActiveUsers(users);
        });

        newSocket.on('user-joined', ({ userId, activeCount }) => {
            console.log(`User ${userId} joined. Active: ${activeCount}`);
        });

        newSocket.on('user-left', ({ userId, activeCount }) => {
            console.log(`User ${userId} left. Active: ${activeCount}`);
        });

        // Cleanup on unmount
        return () => {
            newSocket.emit('leave-workspace', {
                workspaceId: id,
                userId: userInfo?._id
            });
            newSocket.close();
        };
    }, [id, userInfo?._id]);

    // Load message history
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const { data } = await api.get(`/messages/${id}`);
                setMessages(data);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };
        loadMessages();
    }, [id]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send-message', {
            workspaceId: id,
            userId: userInfo._id,
            content: newMessage,
            type: 'text'
        });

        setNewMessage('');

        // Stop typing indicator
        socket.emit('typing', {
            workspaceId: id,
            userId: userInfo._id,
            isTyping: false
        });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket) return;

        // Send typing indicator
        socket.emit('typing', {
            workspaceId: id,
            userId: userInfo._id,
            isTyping: true
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', {
                workspaceId: id,
                userId: userInfo._id,
                isTyping: false
            });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#021f1a] text-white pt-20 flex">
            {/* Sidebar Tools */}
            <aside className="w-20 bg-[#052e28] border-r border-[#1a3a35] flex flex-col items-center py-8 gap-8">
                <button
                    onClick={() => setActiveView('default')}
                    className={`p-3 transition-all ${activeView === 'default' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Home"
                >
                    <Home size={24} />
                </button>
                <button
                    onClick={() => setIsInCall(true)}
                    className={`p-3 rounded-2xl transition-all shadow-lg ${isInCall ? 'bg-[#4ade80] text-[#021f1a]' : 'bg-[#1a3a35] text-[#4ade80] hover:bg-[#4ade80] hover:text-[#021f1a]'}`}
                    title="Live Video"
                >
                    <Video size={24} />
                </button>
                <button
                    onClick={() => setActiveView('document')}
                    className={`p-3 transition-all ${activeView === 'document' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Documents"
                >
                    <FileText size={24} />
                </button>
                <button
                    onClick={() => setActiveView('files')}
                    className={`p-3 transition-all ${activeView === 'files' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Files & Storage"
                >
                    <Folder size={24} />
                </button>
            </aside>

            {/* Main Workspace Area */}
            <div className="flex-grow flex flex-col">
                <header className="h-16 border-b border-[#1a3a35] px-8 flex items-center justify-between bg-[#052e28]/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#4ade80] rounded-full flex items-center justify-center text-[#021f1a] font-bold text-xs">
                            <Building2 size={16} />
                        </div>
                        <h2 className="font-serif font-bold">Office Workspace: <span className="text-[#4ade80]">Expert Mentoring Session</span></h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-[#1a3a35] text-[#4ade80]' : 'bg-red-900/50 text-red-500'}`}>
                            {isConnected ? 'Live' : 'Offline'}
                        </div>
                        <div className="flex -space-x-2">
                            {activeUsers.slice(0, 3).map((userId, idx) => (
                                <div key={userId} className="w-8 h-8 rounded-full bg-[#1a3a35] border-2 border-[#021f1a] flex items-center justify-center">
                                    <User size={14} />
                                </div>
                            ))}
                            {activeUsers.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-[#008ba3] border-2 border-[#021f1a] flex items-center justify-center text-xs">
                                    +{activeUsers.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Live View Area (Center) */}
                    <div className="lg:col-span-2 p-8 flex flex-col gap-6 relative">
                        {incomingCall && !isInCall && (
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#052e28] border-2 border-[#4ade80] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-bounce">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#4ade80] rounded-full flex items-center justify-center text-[#021f1a]">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Incoming Call...</h4>
                                        <p className="text-xs text-gray-400">Someone is inviting you to connect</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIncomingCall(null)}
                                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <PhoneOff size={20} />
                                    </button>
                                    <button
                                        onClick={() => setIsInCall(true)}
                                        className="p-2 bg-[#4ade80] text-[#021f1a] rounded-lg hover:bg-[#34d399] transition-all"
                                    >
                                        <Phone size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeView === 'document' ? (
                            <DocumentEditor socket={socket} workspaceId={id} />
                        ) : activeView === 'files' ? (
                            <FileManager workspaceId={id} socket={socket} />
                        ) : (
                            <div className="flex-grow bg-[#052e28] rounded-3xl border border-[#1a3a35] relative overflow-hidden shadow-2xl p-8">
                                <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                                    <Grid className="text-[#4ade80]" />
                                    Workspace Home
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        onClick={() => setActiveView('document')}
                                        className="group bg-[#1a3a35]/50 border border-[#1a3a35] p-6 rounded-2xl hover:border-[#4ade80] transition-all text-left space-y-4"
                                    >
                                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">New Document</h4>
                                            <p className="text-sm text-gray-400">Create a shared text document</p>
                                        </div>
                                    </button>

                                    <button className="group bg-[#1a3a35]/50 border border-[#1a3a35] p-6 rounded-2xl hover:border-[#4ade80] transition-all text-left space-y-4">
                                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Grid size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">New Spreadsheet</h4>
                                            <p className="text-sm text-gray-400">Collaborate on data & tables</p>
                                        </div>
                                    </button>

                                    <button onClick={() => setIsInCall(true)} className="group bg-[#1a3a35]/50 border border-[#1a3a35] p-6 rounded-2xl hover:border-[#4ade80] transition-all text-left space-y-4">
                                        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Video size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Start Meeting</h4>
                                            <p className="text-sm text-gray-400">Launch video/audio call</p>
                                        </div>
                                    </button>

                                    <button onClick={() => setActiveView('files')} className="group bg-[#1a3a35]/50 border border-[#1a3a35] p-6 rounded-2xl hover:border-[#4ade80] transition-all text-left space-y-4">
                                        <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Folder size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Storage</h4>
                                            <p className="text-sm text-gray-400">Manage shared files</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Area (Right) */}
                    <div className="border-l border-[#1a3a35] bg-[#052e28]/30 flex flex-col">
                        <div className="p-4 border-b border-[#1a3a35] flex items-center gap-2">
                            <MessageSquare size={18} className="text-[#4ade80]" />
                            <h3 className="text-sm font-bold">Workspace Chat</h3>
                        </div>

                        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                            {messages.map(msg => (
                                <div key={msg._id} className={`flex flex-col ${msg.sender._id === userInfo._id ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender._id === userInfo._id ? 'bg-[#008ba3] text-white rounded-tr-none' : 'bg-[#1a3a35] text-gray-200 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1">
                                        {msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-start">
                                    <div className="bg-[#1a3a35] text-gray-400 p-3 rounded-2xl text-sm italic">
                                        typing...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-4 bg-[#052e28] border-t border-[#1a3a35] flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={handleTyping}
                                placeholder="Type a message..."
                                className="flex-grow bg-[#1a3a35] border border-[#25524b] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#4ade80] transition-all"
                            />
                            <button type="submit" className="p-2 bg-[#4ade80] text-[#021f1a] rounded-xl hover:scale-105 transition-all">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {isInCall && (
                <VideoCall
                    socket={socket}
                    workspaceId={id}
                    incomingCall={incomingCall}
                    onClose={() => {
                        setIsInCall(false);
                        setIncomingCall(null);
                    }}
                />
            )}
        </div>
    );
};

export default WorkspaceDetail;
