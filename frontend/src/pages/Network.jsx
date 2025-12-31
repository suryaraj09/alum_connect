import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, UserCheck, MessageSquare, ArrowRight, X, Check, Building2 } from 'lucide-react';

const Network = () => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [sentInvitations, setSentInvitations] = useState([]);
    const [connections, setConnections] = useState([]);
    const [suggestedProfiles, setSuggestedProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMainTab, setActiveMainTab] = useState('grow'); // 'grow' or 'catchup'

    useEffect(() => {
        const fetchNetworkData = async () => {
            try {
                const [invitesRes, connRes, sentRes, profilesRes] = await Promise.all([
                    api.get('/connections/received'),
                    api.get('/connections/friends'),
                    api.get('/connections/sent'),
                    api.get('/profiles')
                ]);
                setInvitations(invitesRes.data);
                setConnections(connRes.data);
                setSentInvitations(sentRes.data);
                // Only show a few suggested profiles
                setSuggestedProfiles(profilesRes.data.slice(0, 4));
            } catch (err) {
                console.error('Failed to fetch network data', err);
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
                setInvitations(invitations.filter(inv => inv._id !== inviteId));
                // Optionally refetch connections to show the new one
                const connRes = await api.get('/connections/friends');
                setConnections(connRes.data);

                if (data.workspaceId) {
                    navigate(`/workspace/${data.workspaceId}`);
                }
            } else {
                await api.post(`/connections/reject/${inviteId}`);
                setInvitations(invitations.filter(inv => inv._id !== inviteId));
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen bg-[#021f1a] text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-[#052e28] border border-[#1a3a35] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-serif mb-6 flex items-center gap-2 text-[#4ade80]">
                            Manage network
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setActiveMainTab('grow')}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeMainTab === 'grow' ? 'bg-[#1a3a35] text-white' : 'text-gray-400 hover:bg-[#1a3a35]/50'}`}
                                >
                                    <div className="flex items-center gap-3"><Users size={18} /> Manage Invitations</div>
                                    <span className="text-xs font-bold">{invitations.length}</span>
                                </button>
                            </li>
                            <li>
                                <div className="w-full flex items-center justify-between p-3 rounded-xl text-gray-400">
                                    <div className="flex items-center gap-3"><UserCheck size={18} /> Total Connections</div>
                                    <span className="text-xs font-bold">{connections.length}</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="p-4 bg-[#1a3a35]/20 border border-[#1a3a35]/50 rounded-2xl">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Network Tip</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            A strong network is built on mutual support. Reach out to mentors in your field of interest.
                        </p>
                    </div>
                </aside>

                {/* Main */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#052e28] border border-[#1a3a35] rounded-2xl overflow-hidden shadow-xl">
                        <div className="flex border-b border-[#1a3a35]">
                            <button
                                onClick={() => setActiveMainTab('grow')}
                                className={`flex-grow py-4 px-6 text-sm font-bold transition-all border-b-2 ${activeMainTab === 'grow' ? 'border-[#4ade80] text-[#4ade80]' : 'border-transparent text-gray-500 hover:text-white'}`}
                            >
                                Grow
                            </button>
                            <button
                                onClick={() => setActiveMainTab('catchup')}
                                className={`flex-grow py-4 px-6 text-sm font-bold transition-all border-b-2 ${activeMainTab === 'catchup' ? 'border-[#4ade80] text-[#4ade80]' : 'border-transparent text-gray-500 hover:text-white'}`}
                            >
                                Catch up
                            </button>
                        </div>

                        <div className="p-6">
                            {activeMainTab === 'grow' ? (
                                <>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-lg font-serif">Invitations ({invitations.length})</h2>
                                        {invitations.length > 0 && (
                                            <button className="text-sm font-bold text-[#4ade80] hover:underline">Show all</button>
                                        )}
                                    </div>

                                    <div className="divide-y divide-[#1a3a35]">
                                        {invitations.map(invite => (
                                            <div key={invite._id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-[#1a3a35] rounded-full border border-[#25524b] flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                        {invite.from.profilePicture ? (
                                                            <img src={invite.from.profilePicture} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users size={24} className="text-gray-600" />
                                                        )}
                                                    </div>
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
                                                        onClick={() => handleAction(invite._id, 'ignore')}
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
                                            <div className="py-12 text-center">
                                                <p className="text-gray-500 italic mb-4">No pending invitations.</p>
                                                <button
                                                    onClick={() => navigate('/discovery')}
                                                    className="text-sm font-bold text-[#4ade80] hover:underline flex items-center gap-2 mx-auto justify-center"
                                                >
                                                    Discover people <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-lg font-serif">Sent Requests ({sentInvitations.length})</h2>
                                        <p className="text-xs text-gray-500 italic">"Catch up" helps you stay on top of your outreach.</p>
                                    </div>

                                    <div className="divide-y divide-[#1a3a35]">
                                        {sentInvitations.map(invite => (
                                            <div key={invite._id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-[#1a3a35] rounded-full border border-[#25524b] flex-shrink-0 flex items-center justify-center">
                                                        <Users size={24} className="text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white transition-all">{invite.to.name}</h4>
                                                        <p className="text-xs text-gray-400">{invite.to.role}</p>
                                                        <div className="mt-1 flex items-center gap-2 text-[10px] text-[#008ba3] bg-[#008ba3]/10 w-fit px-2 py-0.5 rounded border border-[#008ba3]/20">
                                                            Pending Response
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 text-xs font-bold text-gray-500 bg-[#1a3a35]/50 rounded-lg cursor-not-allowed">
                                                    Request Sent
                                                </button>
                                            </div>
                                        ))}
                                        {sentInvitations.length === 0 && (
                                            <div className="py-12 text-center text-gray-500 italic">
                                                You haven't sent any connection requests recently.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {activeMainTab === 'grow' && suggestedProfiles.length > 0 && (
                        <div className="bg-[#052e28] border border-[#1a3a35] rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-serif">People you may know</h3>
                                <button onClick={() => navigate('/discovery')} className="text-sm font-bold text-[#4ade80] hover:underline">See more</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {suggestedProfiles.map(profile => (
                                    <div key={profile._id} className="p-4 bg-[#1a3a35]/50 border border-[#1a3a35] rounded-xl text-center group hover:border-[#4ade80] transition-all">
                                        <div className="w-16 h-16 bg-[#052e28] rounded-full mx-auto mb-3 border border-[#25524b] overflow-hidden">
                                            {profile.user.profilePicture ? (
                                                <img src={profile.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={20} className="text-gray-700 mt-4 mx-auto" />
                                            )}
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1 truncate">{profile.user.name}</h4>
                                        <p className="text-[10px] text-gray-400 mb-4 h-8 overflow-hidden">{profile.domain}</p>
                                        <button
                                            onClick={() => navigate(`/profile/${profile.user._id}`)}
                                            className="w-full py-2 bg-transparent border border-[#4ade80] text-[#4ade80] text-xs font-bold rounded-lg hover:bg-[#4ade80] hover:text-[#021f1a] transition-all"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-[#052e28] border border-[#1a3a35] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-serif mb-6">Recent Connections</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {connections.map(conn => (
                                <div key={conn._id} className="p-4 bg-[#1a3a35] border border-[#25524b] rounded-xl flex items-center justify-between group hover:border-[#008ba3] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#052e28] rounded-full border border-[#25524b] overflow-hidden flex items-center justify-center">
                                            {conn.user.profilePicture ? (
                                                <img src={conn.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={16} className="text-gray-700" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white leading-none mb-1">{conn.user.name}</h4>
                                            <p className="text-[10px] text-gray-400">{conn.profile?.domain || 'Connection'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/workspace/${conn.workspaceId}`)}
                                        className="p-2 bg-[#1a3a35] text-gray-400 rounded-lg hover:text-[#4ade80] transition-all"
                                        title="Message"
                                    >
                                        <MessageSquare size={18} />
                                    </button>
                                </div>
                            ))}
                            {connections.length === 0 && (
                                <p className="col-span-2 text-center text-gray-500 text-sm py-4 italic">No active connections yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Network;
