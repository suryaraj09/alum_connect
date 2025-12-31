import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, UserPlus, MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '../utils/url';

const Discovery = () => {
    const [profiles, setProfiles] = useState([]);
    const [search, setSearch] = useState('');
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles();
    }, [domain]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/profiles?domain=${domain}`);
            setProfiles(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (userId) => {
        try {
            await api.post(`/connections/request/${userId}`);
            // Update local state for immediate feedback
            setProfiles(prev => prev.map(p =>
                p.user?._id === userId
                    ? { ...p, connectionStatus: 'pending', isRequester: true }
                    : p
            ));
            alert('Connection request sent!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending request');
        }
    };

    const filteredProfiles = profiles.filter(p =>
        p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.skills?.some(s => s.name?.toLowerCase().includes(search.toLowerCase())) ||
        p.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#021f1a] pt-12 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-serif font-bold text-white tracking-tight">Explore the <span className="text-[#4ade80] italic">Network</span></h1>
                        <p className="text-gray-400 text-lg max-w-xl leading-relaxed">Connect with mentors, alum, and peers across the Alum_Connect ecosystem.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, title, or skills..."
                                className="w-full sm:w-80 bg-[#052e28] border border-white/5 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80]/40 transition-all placeholder:text-gray-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" size={20} />
                            <select
                                className="w-full sm:w-48 bg-[#052e28] border border-white/5 text-white pl-12 pr-10 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80]/40 transition-all appearance-none cursor-pointer"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            >
                                <option value="">All Domains</option>
                                <option value="Technology">Technology</option>
                                <option value="Management">Management</option>
                                <option value="Finance">Finance</option>
                                <option value="Design">Design</option>
                            </select>
                            <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 rotate-90 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-[#052e28]/40 h-[420px] rounded-[2.5rem] border border-white/5 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProfiles.map(p => (
                            <div key={p._id} className="group bg-[#052e28]/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#4ade80]/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 flex flex-col">
                                <Link to={`/profile/${p.user?._id}`} className="block relative h-48 overflow-hidden">
                                    <img
                                        src={getMediaUrl(p.profilePicture || p.user?.profilePicture) || `https://ui-avatars.com/api/?name=${p.user?.name}&background=1a3a35&color=4ade80&size=512`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={p.user?.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#021f1a] to-transparent opacity-60"></div>
                                    <div className="absolute bottom-4 left-6">
                                        <span className="bg-[#4ade80] text-[#021f1a] px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                                            {p.domain}
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-8 space-y-4 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <Link to={`/profile/${p.user?._id}`} className="block group/name">
                                            <h3 className="text-2xl font-bold text-white group-hover/name:text-[#4ade80] transition-colors">{p.user?.name}</h3>
                                            <p className="text-[#4ade80]/80 text-sm font-medium mt-1">{p.title || 'Professional Member'}</p>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <MapPin size={14} />
                                        <span>{p.location || 'Global'}</span>
                                    </div>

                                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed flex-grow italic">
                                        "{p.bio || 'Passionate about connecting and sharing knowledge within the Alum_Connect community.'}"
                                    </p>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {p.skills?.slice(0, 3).map(s => (
                                            <span key={s.name} className="bg-white/5 text-gray-400 px-3 py-1 rounded-lg text-[10px] border border-white/5">
                                                {s.name}
                                            </span>
                                        ))}
                                        {p.skills?.length > 3 && (
                                            <span className="text-gray-600 text-[10px] flex items-center">+{p.skills.length - 3} more</span>
                                        )}
                                    </div>

                                    <div className="pt-6 flex gap-3">
                                        {p.connectionStatus === 'none' ? (
                                            <button
                                                onClick={() => handleConnect(p.user?._id)}
                                                className="flex-grow bg-[#4ade80] text-[#021f1a] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#34d399] transition-all shadow-lg shadow-[#4ade80]/10 active:scale-95"
                                            >
                                                <UserPlus size={18} /> Connect
                                            </button>
                                        ) : p.connectionStatus === 'pending' ? (
                                            <button
                                                disabled
                                                className="flex-grow bg-[#052e28] text-gray-400 border border-white/10 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
                                            >
                                                <UserPlus size={18} /> {p.isRequester ? 'Pending' : 'Accept Request'}
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="flex-grow bg-[#1a3a35] text-[#4ade80] border border-[#4ade80]/20 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
                                            >
                                                <UserCheck size={18} /> Connected
                                            </button>
                                        )}
                                        <Link
                                            to={`/profile/${p.user?._id}`}
                                            className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                        >
                                            <ExternalLink size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredProfiles.length === 0 && (
                    <div className="text-center py-24 bg-[#052e28]/20 rounded-[3rem] border border-dashed border-white/10">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-gray-700" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-400">No matches found</h3>
                        <p className="text-gray-600 mt-2">Try adjusting your filters or search terms.</p>
                        <button
                            onClick={() => { setSearch(''); setDomain(''); }}
                            className="mt-8 text-[#4ade80] font-bold hover:underline"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Discovery;
