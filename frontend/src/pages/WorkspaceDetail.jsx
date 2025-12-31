import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Video, MessageSquare, FileText, Send, Building2, User } from 'lucide-react';

const WorkspaceDetail = () => {
    const { id } = useParams();
    const [messages, setMessages] = useState([
        { id: 1, sender: 'System', text: 'Workspace created. Start your mentoring journey here!', time: '10:00 AM' },
        { id: 2, sender: 'Mentor', text: 'Hi! Happy to connect. What would you like to focus on today?', time: '10:05 AM' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setMessages([...messages, { id: Date.now(), sender: 'Me', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setNewMessage('');
    };

    return (
        <div className="min-h-screen bg-[#021f1a] text-white pt-20 flex">
            {/* Sidebar Tools */}
            <aside className="w-20 bg-[#052e28] border-r border-[#1a3a35] flex flex-col items-center py-8 gap-8">
                <button className="p-3 bg-[#1a3a35] text-[#4ade80] rounded-2xl hover:bg-[#4ade80] hover:text-[#021f1a] transition-all shadow-lg" title="Live Video">
                    <Video size={24} />
                </button>
                <button className="p-3 text-gray-400 hover:text-white transition-all" title="Code/Doc Collaboration">
                    <FileText size={24} />
                </button>
                <button className="p-3 text-gray-400 hover:text-white transition-all" title="Shared Tasks">
                    <Building2 size={24} />
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
                        <div className="px-3 py-1 bg-[#1a3a35] rounded-full text-[10px] text-[#4ade80] font-bold uppercase tracking-wider">Live Now</div>
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-[#1a3a35] border-2 border-[#021f1a] flex items-center justify-center"><User size={14} /></div>
                            <div className="w-8 h-8 rounded-full bg-[#008ba3] border-2 border-[#021f1a] flex items-center justify-center"><User size={14} /></div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Live View Area (Center) */}
                    <div className="lg:col-span-2 p-8 flex flex-col gap-6">
                        <div className="flex-grow bg-[#052e28] rounded-3xl border border-[#1a3a35] relative overflow-hidden shadow-2xl flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <Building2 size={64} className="text-[#25524b] mx-auto" />
                                <p className="text-gray-500 font-serif italic text-lg">Shared canvas area for documents, code, or video stream.</p>
                                <button className="px-8 py-3 bg-[#4ade80] text-[#021f1a] font-bold rounded-xl hover:scale-105 transition-all">Start Interactive Session</button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area (Right) */}
                    <div className="border-l border-[#1a3a35] bg-[#052e28]/30 flex flex-col">
                        <div className="p-4 border-b border-[#1a3a35] flex items-center gap-2">
                            <MessageSquare size={18} className="text-[#4ade80]" />
                            <h3 className="text-sm font-bold">Workspace Chat</h3>
                        </div>

                        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'Me' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'Me' ? 'bg-[#008ba3] text-white rounded-tr-none' : 'bg-[#1a3a35] text-gray-200 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1">{msg.sender} • {msg.time}</span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSend} className="p-4 bg-[#052e28] border-t border-[#1a3a35] flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-grow bg-[#1a3a35] border border-[#25524b] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#4ade80] transition-all"
                            />
                            <button className="p-2 bg-[#4ade80] text-[#021f1a] rounded-xl hover:scale-105 transition-all">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceDetail;
