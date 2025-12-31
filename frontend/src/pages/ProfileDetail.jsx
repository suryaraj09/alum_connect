import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    Star,
    Globe,
    MessageCircle,
    Clock,
    CheckCircle,
    Linkedin,
    ChevronRight,
    Home,
    Video,
    Award,
    Bookmark
} from 'lucide-react';
import { getMediaUrl } from '../utils/url';

const ProfileDetail = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, postsRes] = await Promise.all([
                    api.get(`/profiles/${id}`),
                    api.get(`/posts/user/${id}`)
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data);
            } catch (err) {
                console.error('Error fetching profile data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (currentUser && profile && currentUser._id === profile.user?._id) {
        return <Navigate to="/profile" />;
    }

    if (loading) return (
        <div className="min-h-screen bg-[#021f1a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#4ade80]/20 border-t-[#4ade80] rounded-full animate-spin"></div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-[#021f1a] flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-serif mb-4">Profile not found</h2>
            <Link to="/" className="text-[#4ade80] hover:underline">Back to Discovery</Link>
        </div>
    );

    const handleConnect = async () => {
        try {
            await api.post(`/connections/request/${profile.user?._id}`);
            // Update local state to show pending
            setProfile({
                ...profile,
                connectionStatus: 'pending',
                isRequester: true
            });
            alert('Connection request sent!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending request');
        }
    };

    return (
        <div className="min-h-screen bg-[#021f1a] text-white">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex items-center gap-3 text-sm text-gray-400">
                <Link to="/" className="hover:text-white transition-colors"><Home size={16} /></Link>
                <ChevronRight size={14} />
                <Link to="/discovery" className="hover:text-white transition-colors">Find a Mentor</Link>
                <ChevronRight size={14} />
                <span className="text-white">{profile.user?.name}</span>
            </div>

            {/* Header Section */}
            <section className="bg-[#052e28] border-y border-[#1a3a35] py-16">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="w-64 h-64 rounded-2xl overflow-hidden border-4 border-[#4ade80]/20 shadow-2xl relative group">
                        <img
                            src={getMediaUrl(profile.profilePicture || profile.user?.profilePicture) || `https://ui-avatars.com/api/?name=${profile.user?.name}&background=0D8ABC&color=fff&size=512`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt={profile.user?.name}
                        />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full text-[#4ade80] text-sm font-bold mb-6">
                            <Award size={16} /> Alum_Connect Member
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">{profile.user?.name}</h1>
                        <p className="text-xl md:text-2xl text-gray-400 mb-8 font-light">{profile.title || profile.domain}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            {profile.connectionStatus === 'none' ? (
                                <button
                                    onClick={handleConnect}
                                    className="px-8 py-3 bg-[#4ade80] text-[#021f1a] rounded-full font-bold hover:bg-[#34d399] transition-all flex items-center gap-2 shadow-lg shadow-[#4ade80]/10 active:scale-95"
                                >
                                    <UserPlus size={18} /> Connect
                                </button>
                            ) : profile.connectionStatus === 'pending' ? (
                                <button
                                    disabled
                                    className="px-8 py-3 bg-[#1a3a35] text-gray-400 border border-white/10 rounded-full font-bold transition-all flex items-center gap-2 cursor-not-allowed"
                                >
                                    <Plus size={18} /> {profile.isRequester ? 'Pending' : 'Accept Request'}
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="px-8 py-3 bg-[#1a3a35] text-[#4ade80] border border-[#4ade80]/20 rounded-full font-bold transition-all flex items-center gap-2 cursor-not-allowed shadow-inner"
                                >
                                    <UserCheck size={18} /> Connected
                                </button>
                            )}

                            <button className="p-3 bg-[#1a3a35] hover:bg-[#25524b] border border-white/10 rounded-full transition-all text-gray-400 hover:text-white">
                                <Bookmark size={20} />
                            </button>
                            <a href="#" className="p-3 bg-[#1a3a35] hover:bg-[#25524b] border border-white/10 rounded-full transition-all text-gray-400 hover:text-[#4ade80]">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Side - Stats & Skills */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-[#4ade80] text-[#021f1a] rounded text-sm font-black flex items-center gap-1">
                                <Star size={14} fill="currentColor" /> 5.0
                            </div>
                            <span className="text-gray-400 hover:text-white cursor-pointer underline text-sm transition-colors">(38 reviews)</span>
                        </div>

                        <p className="text-lg font-bold text-[#4ade80]">{profile.title} \ Mentor \ Alum</p>

                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-center gap-4">
                                <Globe size={20} className="text-gray-500" />
                                <span>{profile.location || 'Distributed'}</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <MessageCircle size={20} className="text-gray-500" />
                                <span>Speaks {profile.languages?.join(', ') || 'English'}</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Clock size={20} className="text-gray-500" />
                                <span>Active today</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <CheckCircle size={20} className="text-gray-500" />
                                <span>Usually responds in half a day</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-12 border-t border-[#1a3a35]">
                        <h3 className="text-2xl font-serif font-bold mb-8 italic">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.map((skill, idx) => (
                                <span key={idx} className="px-4 py-2 bg-[#1a3a35] border border-white/5 rounded-full text-sm font-medium hover:border-[#4ade80]/50 transition-all cursor-default">
                                    {skill.name}
                                </span>
                            ))}
                            {profile.skills?.length > 10 && (
                                <span className="text-[#4ade80] font-bold text-sm cursor-pointer hover:underline self-center ml-2">
                                    + {profile.skills.length - 10} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - About & Videos */}
                <div className="lg:col-span-8 space-y-20">
                    <section>
                        <h2 className="text-3xl font-serif font-bold mb-8 italic text-[#4ade80]">About</h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg text-gray-300 leading-relaxed">
                                {profile.bio}
                            </p>
                            <button className="mt-4 text-[#4ade80] font-bold hover:underline">Read more</button>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-serif font-bold mb-8 italic">Get to know {profile.user?.name?.split(' ')[0]}</h2>
                        {videoPost ? (
                            <div className="bg-[#052e28] border border-[#1a3a35] rounded-3xl overflow-hidden shadow-2xl group max-w-md">
                                <div className="aspect-video relative overflow-hidden bg-black">
                                    <video
                                        src={getMediaUrl(videoPost.media.url)}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                        poster={getMediaUrl(profile.user?.profilePicture)}
                                        controls
                                    />
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold tracking-widest text-[#4ade80]">VIDEO</div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-[#4ade80] rounded-full flex items-center justify-center text-[#021f1a] transform scale-0 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                                            <Video size={24} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <h3 className="text-xl font-bold group-hover:text-[#4ade80] transition-colors">{videoPost.text.split('\n')[0]}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                        {videoPost.text}
                                    </p>
                                    <Link to={`/post/${videoPost._id}`} className="inline-flex items-center gap-2 text-[#4ade80] text-sm font-bold hover:gap-3 transition-all">
                                        Read more <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 border-2 border-dashed border-[#1a3a35] rounded-3xl text-center">
                                <p className="text-gray-500 italic">No introduction video shared yet.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ProfileDetail;
