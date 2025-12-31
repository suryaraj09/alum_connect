import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, UserCheck, MessageSquare, ArrowRight, X, Check, Building2 } from 'lucide-react';

const Network = () => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('received');

    useEffect(() => {
        const fetchNetworkData = async () => {
            try {
                const [invitesRes, connRes] = await Promise.all([
                    api.get('/connections/received'),
                    api.get('/connections/friends')
                ]);
                setInvitations(invitesRes.data);
                setConnections(connRes.data);
            } catch (err) {
                console.error('Failed to fetch network data', err);
                // Fallback dummy data for demo
                setInvitations([
                    { _id: 'inv1', from: { name: 'Karan Yadav', role: 'Student @ Ahmedabad University' }, type: 'Mentorship' },
                    { _id: 'inv2', from: { name: 'Naman Chouhan', role: 'Aspiring Web Dev' }, type: 'Career Guidance' }
                ]);
                setConnections([
                    { _id: 'c1', user: { name: 'Rishab Sharma' }, profile: { domain: 'Cloud Systems' }, workspaceId: 'ws1' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchNetworkData();
    }, []);

    const handleAction = async (inviteId, action) => {
        try {
            if (action === 'accept') {
                const { data } = await api.post(`/connections/accept/${inviteId}`);
                // Remove from invitations immediately
                setInvitations(invitations.filter(inv => inv._id !== inviteId));
                // Add to connections if we have the data
                // Since Connection model might differ, best to refetch or manually push
                // For now, removing from list is the primary "on the spot" requirement

                // Navigate only if needed, otherwise stay to show "Recent Connections" updated
                if (data.workspaceId) {
                    // Navigate after a short delay so user sees the "Accepted" state? 
                    // Or just navigate. User said "accepted we see direct connection".
                    // If moving to workspace, they see the connection there.
                    navigate(`/workspace/${data.workspaceId}`);
                }
            } else {
                await api.post(`/connections/reject/${inviteId}`);
                setInvitations(invitations.filter(inv => inv._id !== inviteId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#021f1a] text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-[#052e28] border border-[#1a3a35] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                            Manage network
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <button onClick={() => setActiveTab('received')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'received' ? 'bg-[#1a3a35] text-white' : 'text-gray-400 hover:bg-[#1a3a35]/50'}`}>
                                    <div className="flex items-center gap-3"><Users size={18} /> Connections</div>
                                    <span className="text-xs font-bold">{connections.length}</span>
                                </button>
                            </li>
                            <li>
                                <button className="w-full flex items-center justify-between p-3 rounded-xl text-gray-400 hover:bg-[#1a3a35]/50 transition-all">
                                    <div className="flex items-center gap-3"><UserCheck size={18} /> Following</div>
                                    <span className="text-xs font-bold">12</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[#1a3a35]/30 border border-[#1a3a35] rounded-2xl p-6 text-center">
                        <p className="text-xs text-gray-500 mb-4">You earned a special puzzle 🎁</p>
                        <div className="bg-[#008ba3] px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#00a8c2] transition-all">
                            Solve now
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#052e28] border border-[#1a3a35] rounded-2xl overflow-hidden shadow-xl">
                        <div className="flex border-b border-[#1a3a35]">
                            <button className="flex-grow py-4 px-6 text-sm font-bold border-b-2 border-[#4ade80] text-[#4ade80]">Grow</button>
                            <button className="flex-grow py-4 px-6 text-sm font-bold text-gray-500 hover:text-white transition-all">Catch up</button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-serif">Invitations ({invitations.length})</h2>
                                <button className="text-sm font-bold text-[#4ade80] hover:underline">Show all</button>
                            </div>

                            <div className="divide-y divide-[#1a3a35]">
                                {invitations.map(invite => (
                                    <div key={invite._id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-[#1a3a35] rounded-full border border-[#25524b] flex-shrink-0"></div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-[#4ade80] transition-all">{invite.from.name}</h4>
                                                <p className="text-xs text-gray-400">{invite.from.role}</p>
                                                <div className="mt-1 flex items-center gap-2 text-[10px] text-[#4ade80] bg-[#1a3a35] w-fit px-2 py-0.5 rounded">
                                                    <MessageSquare size={10} /> Interested in {invite.type}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleAction(invite._id, 'reject')}
                                                className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-all"
                                            >
                                                Ignore
                                            </button>
                                            <button
                                                onClick={() => handleAction(invite._id, 'accept')}
                                                className="px-6 py-2 bg-transparent border border-[#008ba3] text-[#008ba3] hover:bg-[#008ba3] hover:text-white rounded-full text-sm font-bold transition-all"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {invitations.length === 0 && (
                                    <p className="py-12 text-center text-gray-500 italic">No pending invitations.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#052e28] border border-[#1a3a35] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-serif mb-6">Recent Connections</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {connections.map(conn => (
                                <div key={conn._id} className="p-4 bg-[#1a3a35] border border-[#25524b] rounded-xl flex items-center justify-between group hover:border-[#008ba3] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#052e28] rounded-full border border-[#25524b]"></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white leading-none mb-1">{conn.user.name}</h4>
                                            <p className="text-[10px] text-gray-400">{conn.profile?.domain}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/workspace/${conn.workspaceId}`)}
                                        className="p-2 bg-[#052e28] text-[#4ade80] rounded-lg hover:bg-[#4ade80] hover:text-[#021f1a] transition-all"
                                        title="Enter Office Workspace"
                                    >
                                        <Building2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Network;
