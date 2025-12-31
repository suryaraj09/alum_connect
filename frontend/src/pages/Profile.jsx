import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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
    Edit2,
    Plus,
    X
} from 'lucide-react';
import CreatePostModal from '../components/CreatePostModal';
import EditProfileModal from '../components/EditProfileModal';
import { getMediaUrl } from '../utils/url';

const Profile = () => {
    const { user, updateProfileStatus } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');

    const handleUpdateProfile = async (updatedData) => {
        try {
            const { data } = await api.post('/profiles', updatedData);
            setProfile(data);
            setIsEditModalOpen(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        }
    };

    useEffect(() => {
        const fetchMyData = async () => {
            try {
                const [profileRes, postsRes] = await Promise.all([
                    api.get('/profiles/me'),
                    api.get(`/posts/user/${user._id}`)
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data);
                if (profileRes.data && !user.isProfileComplete) {
                    updateProfileStatus(true);
                }
            } catch (error) {
                console.error('Error fetching own profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyData();
    }, [user.isProfileComplete, updateProfileStatus]);

    if (loading) return (
        <div className="min-h-screen bg-[#021f1a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#4ade80]/20 border-t-[#4ade80] rounded-full animate-spin"></div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-[#021f1a] flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-serif mb-4">Complete your profile to get started</h2>
            <Link to="/onboarding" className="bg-[#4ade80] text-[#021f1a] px-8 py-3 rounded-xl font-bold">Go to Onboarding</Link>
        </div>
    );

    const videoPost = posts.find(p => p.media?.type === 'video');

    return (
        <div className="min-h-screen bg-[#021f1a] text-white">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex items-center gap-3 text-sm text-gray-400">
                <Link to="/" className="hover:text-white transition-colors"><Home size={16} /></Link>
                <ChevronRight size={14} />
                <span className="text-white">My Profile</span>
            </div>

            {/* Header Section */}
            <section className="bg-[#052e28] border-y border-[#1a3a35] py-16">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="w-64 h-64 rounded-2xl overflow-hidden border-4 border-[#4ade80]/20 shadow-2xl relative group">
                        <img
                            src={getMediaUrl(profile.profilePicture || user?.profilePicture) || `https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff&size=512`}
                            className="w-full h-full object-cover"
                            alt={user?.name}
                        />
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                            <Plus className="text-white" size={32} />
                        </button>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <div className="inline-flex items-center gap-4 mb-6">
                            <div className="px-4 py-1.5 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full text-[#4ade80] text-sm font-bold">
                                <Award size={16} className="inline mr-2" /> Top Mentor
                            </div>
                            <button onClick={() => setIsEditModalOpen(true)} className="p-2 bg-[#1a3a35] border border-[#25524b] rounded-full text-gray-400 hover:text-[#4ade80] transition-all">
                                <Edit2 size={18} />
                            </button>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">{user?.name}</h1>
                        <p className="text-xl md:text-2xl text-gray-400 mb-8 font-light">{profile.title || profile.domain}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <button onClick={() => setIsPostModalOpen(true)} className="px-8 py-3 bg-[#4ade80] text-[#021f1a] rounded-full font-bold hover:bg-[#34d399] transition-all flex items-center gap-2">
                                <Plus size={18} /> Create a post
                            </button>
                            <button onClick={() => setIsEditModalOpen(true)} className="px-8 py-3 bg-[#1a3a35] hover:bg-[#25524b] border border-[#4ade80]/30 rounded-full font-bold transition-all flex items-center gap-2 text-[#4ade80]">
                                <Edit2 size={18} /> Edit Profile
                            </button>
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
                            <span className="text-gray-400 cursor-default text-sm">(38 reviews)</span>
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
                            <li className="flex items-center gap-4 border-l-2 border-[#4ade80] pl-4">
                                <Clock size={20} className="text-[#4ade80]" />
                                <span>Active today (Visible to others)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-12 border-t border-[#1a3a35]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-serif font-bold italic">Skills</h3>
                            <button className="text-gray-500 hover:text-[#4ade80]"><Plus size={20} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.map((skill, idx) => (
                                <span key={idx} className="px-4 py-2 bg-[#1a3a35] border border-white/5 rounded-full text-sm font-medium hover:border-[#4ade80]/50 transition-all cursor-default">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - About & Videos */}
                <div className="lg:col-span-8 space-y-20">
                    <section>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-serif font-bold italic text-[#4ade80]">About</h2>
                            <button className="text-gray-500 hover:text-[#4ade80]"><Edit2 size={20} /></button>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg text-gray-300 leading-relaxed">
                                {profile.bio || "No bio yet. Tell the community about yourself!"}
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-serif font-bold italic">Your Introduction</h2>
                            <button className="text-gray-500 hover:text-[#4ade80]"><Plus size={20} /></button>
                        </div>
                        {videoPost ? (
                            <div className="bg-[#052e28] border border-[#1a3a35] rounded-3xl overflow-hidden shadow-2xl group max-w-md">
                                <div className="aspect-video relative overflow-hidden bg-black">
                                    <video
                                        src={getMediaUrl(videoPost.media.url)}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                        controls
                                    />
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold tracking-widest text-[#4ade80]">VIDEO</div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <h3 className="text-xl font-bold">{videoPost.text.split('\n')[0]}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2">
                                        {videoPost.text}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 border-2 border-dashed border-[#1a3a35] rounded-3xl text-center bg-[#052e28]/50">
                                <Video size={48} className="mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-400 mb-6">Introduce yourself with a short video to stand out!</p>
                                <button onClick={() => setIsPostModalOpen(true)} className="px-6 py-2 border border-[#4ade80] text-[#4ade80] rounded-full font-bold hover:bg-[#4ade80]/10 transition-all">
                                    Upload Video
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                user={{
                    ...user,
                    profilePicture: getMediaUrl(profile.profilePicture || user.profilePicture)
                }}
                onPost={async (postData) => {
                    try {
                        const { data } = await api.post('/posts', postData);
                        setPosts([data, ...posts]);
                        alert('Post created!');
                    } catch (err) {
                        alert('Failed to create post');
                    }
                }}
            />
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={profile}
                onUpdate={handleUpdateProfile}
            />
        </div>
    );
};

export default Profile;
