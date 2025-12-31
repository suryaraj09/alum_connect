import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, MessageSquare, FileText, Send, Building2, User, Phone, PhoneOff, Home, Folder, Plus, Grid, Clock, X } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import VideoCall from '../components/VideoCall';
import SharedResources from '../components/SharedResources';
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
    const [activeView, setActiveView] = useState('default'); // 'default', 'document', 'spreadsheet', 'meeting', 'files'
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkModalType, setLinkModalType] = useState('document');
    const [linkData, setLinkData] = useState({ title: '', url: '' });
    const [isSharing, setIsSharing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const [isConnected, setIsConnected] = useState(false);
    const { user: currentUser } = useAuth();
    const [workspace, setWorkspace] = useState(null);

    // Initialize Socket.io connection
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
            auth: {
                token: currentUser?.token
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
        console.log('User Info:', currentUser);

        // Join workspace room
        newSocket.emit('join-workspace', {
            workspaceId: id,
            userId: currentUser?._id
        });

        console.log('Emitted join-workspace for:', id);

        newSocket.on('new-message', (message) => {
            console.log('Received new message:', message);
            setMessages(prev => {
                // Avoid duplicates if from self (already added optimistically)
                if (message.sender._id === currentUser?._id) return prev;

                // Increment unread count if not in message view
                if (activeView !== 'messages') {
                    setUnreadCount(c => c + 1);
                }

                return [...prev, message];
            });

            // Send notification if not from self
            if (message.sender._id !== currentUser?._id && Notification.permission === 'granted') {
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
                userId: currentUser?._id
            });
            newSocket.close();
        };
    }, [id, currentUser?._id]);

    // Load workspace details
    useEffect(() => {
        const fetchWorkspace = async () => {
            try {
                const { data } = await api.get('/workspaces');
                const currentWs = data.find(ws => ws._id === id);
                setWorkspace(currentWs);
            } catch (err) {
                console.error('Failed to fetch workspace:', err);
            }
        };
        fetchWorkspace();
    }, [id]);

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

    const handleShareLink = async (e) => {
        e.preventDefault();
        if (!linkData.title || !linkData.url) return;

        setIsSharing(true);
        try {
            const { data } = await api.post(`/workspaces/${id}/resources`, {
                ...linkData,
                type: linkModalType
            });

            if (socket) {
                socket.emit('resource-shared', { workspaceId: id, resource: data });
            }

            setLinkData({ title: '', url: '' });
            setShowLinkModal(false);
            setActiveView(linkModalType);
        } catch (error) {
            console.error('Error sharing link:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            _id: Date.now().toString(), // Temporary ID
            workspace: id,
            sender: {
                _id: currentUser?._id,
                name: currentUser?.name,
                profilePicture: currentUser?.profilePicture
            },
            content: newMessage,
            type: 'text',
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, messageData]);

        socket.emit('send-message', {
            workspaceId: id,
            userId: currentUser?._id,
            content: newMessage,
            type: 'text'
        });

        setNewMessage('');

        // Stop typing indicator
        socket.emit('typing', {
            workspaceId: id,
            userId: currentUser?._id,
            isTyping: false
        });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket) return;

        // Send typing indicator
        socket.emit('typing', {
            workspaceId: id,
            userId: currentUser?._id,
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
                userId: currentUser?._id,
                isTyping: false
            });
        }, 2000);
    };

    return (
        <div className="h-[calc(100vh-80px)] mt-20 bg-[#021f1a] text-white flex overflow-hidden">
            {/* Sidebar Tools */}
            <aside className="w-20 bg-[#011613] border-r border-[#1a3a35] flex flex-col py-8 gap-1">
                <button
                    onClick={() => setActiveView('default')}
                    className={`p-3 transition-all ${activeView === 'default' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Workspace Home"
                >
                    <Home size={24} />
                </button>

                <div className="w-8 h-[1px] bg-[#1a3a35] mx-auto my-4" />

                <button
                    onClick={() => setActiveView('document')}
                    className={`p-3 transition-all ${activeView === 'document' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Documents"
                >
                    <FileText size={24} />
                </button>
                <button
                    onClick={() => setActiveView('spreadsheet')}
                    className={`p-3 transition-all ${activeView === 'spreadsheet' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Spreadsheets"
                >
                    <Grid size={24} />
                </button>
                <button
                    onClick={() => setActiveView('meeting')}
                    className={`p-3 transition-all ${activeView === 'meeting' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Meeting History"
                >
                    <Clock size={24} />
                </button>
                <button
                    onClick={() => {
                        setActiveView('messages');
                        setUnreadCount(0);
                    }}
                    className={`p-3 transition-all relative ${activeView === 'messages' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Messages"
                >
                    <MessageSquare size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#011613]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveView('files')}
                    className={`p-3 transition-all ${activeView === 'files' ? 'text-[#4ade80] bg-[#1a3a35]/50 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                    title="Shared Storage"
                >
                    <Folder size={24} />
                </button>

                <div className="flex-grow" />

                <button
                    onClick={() => setIsInCall(true)}
                    className="p-3 text-[#4ade80] hover:bg-[#4ade80] hover:text-[#021f1a] transition-all bg-[#1a3a35] rounded-xl mx-3 mb-2 shadow-lg shadow-[#4ade80]/10 flex items-center justify-center"
                    title="Instant Video Call"
                >
                    <Video size={24} />
                </button>
            </aside>

            {/* Main Workspace Area */}
            <div className="flex-grow flex flex-col">
                <header className="h-16 border-b border-[#1a3a35] px-8 flex items-center justify-between bg-[#052e28]/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#4ade80] rounded-full flex items-center justify-center text-[#021f1a] font-bold text-xs overflow-hidden">
                            {workspace?.members.find(m => m._id !== currentUser?._id)?.profilePicture ? (
                                <img src={workspace.members.find(m => m._id !== currentUser?._id).profilePicture} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 size={16} />
                            )}
                        </div>
                        <h2 className="font-serif font-bold">
                            Office Workspace: <span className="text-[#4ade80]">{workspace?.members.find(m => m._id !== currentUser?._id)?.name || 'Loading...'}</span>
                        </h2>
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

                <div className="flex-grow h-[calc(100vh-144px)] overflow-hidden">
                    {activeView === 'messages' ? (
                        <div className="h-full flex flex-col bg-[#052e28]/30">
                            <div className="p-4 border-b border-[#1a3a35] flex items-center justify-between px-8">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={18} className="text-[#4ade80]" />
                                    <h3 className="text-sm font-bold">Workspace Chat</h3>
                                </div>
                                {isTyping && (
                                    <span className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest animate-pulse">Someone is typing...</span>
                                )}
                            </div>

                            <div className="flex-grow p-8 space-y-4 overflow-y-auto custom-scrollbar relative">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-30 italic text-center">
                                        <MessageSquare size={48} className="mb-4" />
                                        <p>No messages yet.<br />Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <div key={msg._id} className={`flex flex-col ${msg.sender?._id === currentUser?._id ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-md ${msg.sender?._id === currentUser?._id ? 'bg-[#4ade80] text-[#021f1a] rounded-tr-none' : 'bg-[#1a3a35] text-gray-200 rounded-tl-none border border-[#25524b]'}`}>
                                                {msg.content}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 px-1">
                                                {msg.sender?._id !== currentUser?._id && <span className="text-[10px] font-bold text-[#4ade80]">{msg.sender?.name}</span>}
                                                <span className="text-[9px] text-gray-500">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isTyping && (
                                    <div className="flex items-start">
                                        <div className="bg-[#1a3a35] text-gray-400 px-4 py-3 rounded-2xl flex items-center gap-1.5 shadow-sm border border-[#25524b]">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-bounce"></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Typing</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-6 bg-[#052e28] border-t border-[#1a3a35] flex gap-4 px-8">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleTyping}
                                    placeholder="Type a message..."
                                    className="flex-grow bg-[#1a3a35] border border-[#25524b] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#4ade80] transition-all shadow-inner"
                                />
                                <button type="submit" className="p-4 bg-[#4ade80] text-[#021f1a] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#4ade80]/20">
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="h-full p-8 flex flex-col gap-6 relative overflow-y-auto custom-scrollbar">
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

                            {activeView === 'document' || activeView === 'spreadsheet' || activeView === 'meeting' ? (
                                <SharedResources workspaceId={id} type={activeView} socket={socket} />
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
                                            onClick={() => {
                                                setLinkModalType('document');
                                                setShowLinkModal(true);
                                            }}
                                            className="group bg-[#1a3a35]/50 border border-[#1a3a35] p-6 rounded-2xl hover:border-[#4ade80] transition-all text-left space-y-4"
                                        >
                                            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">Share Document</h4>
                                                <p className="text-sm text-gray-400">Add link to Google Docs / Word</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setLinkModalType('spreadsheet');
                                                setShowLinkModal(true);
                                            }}
                                            className="group bg-[#1a3a35]/50 border border-[#1a3a35] p-6 rounded-2xl hover:border-[#4ade80] transition-all text-left space-y-4"
                                        >
                                            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Grid size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">Share Spreadsheet</h4>
                                                <p className="text-sm text-gray-400">Link Google Sheets / Excel</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setLinkModalType('meeting');
                                                setShowLinkModal(true);
                                            }}
                                            className="group bg-[#1a3a35]/50 border border-[#1a3a35] p-6 rounded-2xl hover:border-[#4ade80] transition-all text-left space-y-4"
                                        >
                                            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Video size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">Create Meeting</h4>
                                                <p className="text-sm text-gray-400">Share Google Meet link</p>
                                            </div>
                                        </button>

                                        <button onClick={() => setActiveView('files')} className="group bg-[#1a3a35]/50 border border-[#1a3a35] p-6 rounded-2xl hover:border-[#4ade80] transition-all text-left space-y-4">
                                            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Folder size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">Shared Storage</h4>
                                                <p className="text-sm text-gray-400">Upload & manage shared files</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Link Sharing Modal */}
                            {showLinkModal && (
                                <div className="absolute inset-0 z-[60] bg-[#021f1a]/80 backdrop-blur-sm flex items-center justify-center p-8">
                                    <div className="bg-[#052e28] border border-[#1a3a35] w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-serif font-bold capitalize">Share {linkModalType}</h3>
                                            <button onClick={() => setShowLinkModal(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                                        </div>
                                        <form onSubmit={handleShareLink} className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title / Description</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder={linkModalType === 'meeting' ? 'e.g. Design Review - 3PM' : 'e.g. Marketing Strategy Draft'}
                                                    className="w-full bg-[#1a3a35] border border-[#1a3a35] rounded-xl px-4 py-3 outline-none focus:border-[#4ade80] transition-all"
                                                    value={linkData.title}
                                                    onChange={e => setLinkData({ ...linkData, title: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">URL Link</label>
                                                <input
                                                    type="url"
                                                    required
                                                    placeholder="https://..."
                                                    className="w-full bg-[#1a3a35] border border-[#1a3a35] rounded-xl px-4 py-3 outline-none focus:border-[#4ade80] transition-all"
                                                    value={linkData.url}
                                                    onChange={e => setLinkData({ ...linkData, url: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSharing}
                                                className="w-full py-4 bg-[#4ade80] text-[#021f1a] font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {isSharing ? 'Sharing...' : `Share ${linkModalType}`}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
