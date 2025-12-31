import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Layout,
    MessageSquare,
    ArrowRight,
    Search,
    Clock,
    User as UserIcon,
    Terminal,
    Target,
    Shield
} from 'lucide-react';

const Workspaces = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const { data } = await api.get('/workspaces');
                setWorkspaces(data);
            } catch (err) {
                console.error('Failed to fetch workspaces', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspaces();
    }, []);

    const filteredWorkspaces = workspaces.filter(ws => {
        const otherMember = ws.members.find(m => m._id !== userInfo?._id);
        return otherMember?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#021f1a] pt-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#4ade80] font-bold animate-pulse">Initializing Workspaces...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#021f1a] text-white pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
                            <span className="text-[#4ade80]"><Layout size={32} /></span>
                            Your Workspaces
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your active mentor and mentee collaborations.</p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4ade80] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search collaborations..."
                            className="bg-[#052e28] border border-[#1a3a35] rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-[#4ade80] focus:ring-4 focus:ring-[#4ade80]/10 transition-all w-full md:w-80 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-center mb-12">
                    <div className="bg-[#052e28]/50 border border-[#1a3a35] p-6 rounded-3xl flex items-center gap-4 min-w-[300px]">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Focus</p>
                            <p className="text-xl font-bold">{workspaces.length} Environments</p>
                        </div>
                    </div>
                </div>

                {/* Grid of Workspaces */}
                {filteredWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredWorkspaces.map(ws => {
                            const otherMember = ws.members.find(m => m._id !== userInfo?._id);
                            return (
                                <div
                                    key={ws._id}
                                    onClick={() => navigate(`/workspace/${ws._id}`)}
                                    className="group relative bg-[#052e28] border border-[#1a3a35] rounded-[2rem] p-8 hover:border-[#4ade80] transition-all cursor-pointer shadow-2xl hover:shadow-[#4ade80]/5 overflow-hidden"
                                >
                                    {/* Background Accent */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80]/5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>

                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-[#1a3a35] border border-[#25524b] overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                                {otherMember?.profilePicture ? (
                                                    <img src={otherMember.profilePicture} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <UserIcon size={28} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-[#4ade80] transition-colors">
                                                    Mentoring: {otherMember?.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <Clock size={12} />
                                                    <span>Active recently</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-[#1a3a35] text-[#4ade80] text-[10px] font-bold rounded-full uppercase tracking-widest border border-[#4ade80]/20">
                                            Premium Flow
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="bg-[#1a3a35]/50 p-3 rounded-2xl text-center">
                                            <div className="text-[#4ade80] mb-1 flex justify-center"><Terminal size={14} /></div>
                                            <div className="text-[10px] text-gray-500 font-bold">Code</div>
                                        </div>
                                        <div className="bg-[#1a3a35]/50 p-3 rounded-2xl text-center">
                                            <div className="text-blue-400 mb-1 flex justify-center"><MessageSquare size={14} /></div>
                                            <div className="text-[10px] text-gray-500 font-bold">Chat</div>
                                        </div>
                                        <div className="bg-[#1a3a35]/50 p-3 rounded-2xl text-center">
                                            <div className="text-purple-400 mb-1 flex justify-center"><Shield size={14} /></div>
                                            <div className="text-[10px] text-gray-500 font-bold">Files</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-[#1a3a35]">
                                        <div className="flex -space-x-2">
                                            {ws.members.map(m => (
                                                <div key={m._id} className="w-8 h-8 rounded-full border-2 border-[#052e28] bg-[#1a3a35] flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                                    {m.profilePicture ? (
                                                        <img src={m.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{m.name[0]}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button className="flex items-center gap-2 text-sm font-bold text-[#4ade80] group-hover:translate-x-1 transition-transform">
                                            Launch Environment <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-[#052e28] border border-dashed border-[#1a3a35] rounded-[3rem] p-20 text-center">
                        <div className="w-20 h-20 bg-[#1a3a35] rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-600">
                            <Layout size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-4">No Active Workspaces</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-8">
                            Workspaces are created automatically once you accept a connection request.
                            Head over to Discovery to find prospective mentors.
                        </p>
                        <button
                            onClick={() => navigate('/discovery')}
                            className="bg-[#4ade80] text-[#021f1a] px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-[#4ade80]/20"
                        >
                            Explore Discovery
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workspaces;
