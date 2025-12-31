import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Hero from '../components/discovery/Hero';
import ProfileCarousel from '../components/discovery/ProfileCarousel';
import api from '../services/api';
import { Star, Filter, ArrowRight, UserPlus, CheckCircle, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '../utils/url';

const dummyUsers = [
    {
        _id: 'd1',
        user: { name: 'Elizabeth Halper' },
        domain: 'Software Engineering',
        education: 'Stanford University',
        profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        skills: ['Software Engineering', 'Azure', 'Data Structures'],
        engagementScore: 5.0,
        graduationYear: 2018
    },
    {
        _id: 'd2',
        user: { name: 'Marcos Rezende' },
        domain: 'Product Design',
        education: 'MIT',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        skills: ['Product Design', 'UI/UX', 'Strategy'],
        engagementScore: 4.9,
        graduationYear: 2015
    },
    {
        _id: 'd3',
        user: { name: 'Andrii Latyshev' },
        domain: 'Cloud Systems',
        education: 'UC Berkeley',
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        skills: ['Go', 'Kubernetes', 'AWS'],
        engagementScore: 5.0,
        graduationYear: 2019
    },
    {
        _id: 'd4',
        user: { name: 'Lily Zhao' },
        domain: 'Data Science',
        education: 'Harvard',
        profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
        skills: ['Python', 'TensorFlow', 'SQL'],
        engagementScore: 4.8,
        graduationYear: 2020
    }
];

const SmallProfileCard = ({ profile, onConnect }) => {
    const navigate = useNavigate();
    const [requestSent, setRequestSent] = useState(false);

    const handleConnect = async () => {
        if (profile._id.startsWith('d')) {
            setRequestSent(true);
            return;
        }
        try {
            await onConnect(profile.user._id);
            setRequestSent(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-[#1a3a35] rounded-xl overflow-hidden border border-[#25524b] group hover:border-[#008ba3] transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="aspect-square overflow-hidden relative">
                <img
                    src={getMediaUrl(profile.profilePicture || profile.user?.profilePicture) || `https://ui-avatars.com/api/?name=${profile.user?.name || 'User'}&background=0D8ABC&color=fff`}
                    alt={profile.user?.name || 'User'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-[#052e28]/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {profile.engagementScore || 0}
                </div>
            </div>
            <div className="p-4">
                <h4 className="font-bold text-white text-sm mb-0.5">{profile.user?.name || 'User'}</h4>
                <p className="text-[11px] text-gray-400 mb-3">{profile.title || profile.domain} • Class of {profile.graduationYear || '2025'}</p>

                <div className="flex flex-wrap gap-1 mb-4 h-5 overflow-hidden">
                    {profile.skills?.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-[#25524b] text-gray-400 rounded-sm">
                            {typeof skill === 'string' ? skill : skill.name}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleConnect}
                        disabled={requestSent}
                        className={`flex-grow py-1.5 rounded-md text-[10px] font-semibold transition-all flex items-center justify-center gap-2 ${requestSent
                            ? 'bg-[#1a3a35] text-gray-500 border border-[#25524b]'
                            : 'bg-[#008ba3] text-white hover:bg-[#00a8c2]'
                            }`}
                    >
                        {requestSent ? <><CheckCircle size={12} /> Pending</> : <><UserPlus size={12} /> Connect</>}
                    </button>
                    <Link
                        to={`/profile/${profile.user?._id || profile._id}`}
                        className="p-1.5 border border-[#25524b] text-gray-400 hover:text-white hover:border-gray-500 rounded-md transition-all flex items-center justify-center cursor-pointer"
                    >
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [profiles, setProfiles] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profilesRes, myProfileRes] = await Promise.all([
                    api.get('/profiles'),
                    api.get('/profiles/me')
                ]);
                setProfiles(profilesRes.data);
                setMyProfile(myProfileRes.data);
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConnect = async (userId) => {
        try {
            await api.post(`/connections/request/${userId}`);
        } catch (err) {
            throw err;
        }
    };

    const displayProfiles = profiles.length > 0 ? profiles : dummyUsers;

    // Filter profiles based on role for 'both' users
    const mentors = displayProfiles.filter(p => p.mentorshipRole === 'mentor' || p.mentorshipRole === 'both');
    const mentees = displayProfiles.filter(p => p.mentorshipRole === 'mentee' || p.mentorshipRole === 'both');

    return (
        <div className="min-h-screen bg-[#021f1a]">
            <Hero />

            <div className="px-6 -mt-10 mb-10 overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Role-based conditional rendering */}
                    {myProfile?.mentorshipRole === 'both' ? (
                        <>
                            <div>
                                <h2 className="text-xl font-serif text-white/80 mb-6 flex items-center gap-3">
                                    <span className="w-10 h-[1px] bg-[#4ade80]"></span>
                                    Recommended Mentors
                                </h2>
                                <ProfileCarousel profiles={mentors} />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif text-white/80 mb-6 flex items-center gap-3">
                                    <span className="w-10 h-[1px] bg-[#008ba3]"></span>
                                    Potential Mentees
                                </h2>
                                <ProfileCarousel profiles={mentees} />
                            </div>
                        </>
                    ) : (
                        <div>
                            <h2 className="text-xl font-serif text-white/80 mb-6 flex items-center gap-3">
                                <span className="w-10 h-[1px] bg-[#4ade80]"></span>
                                {myProfile?.mentorshipRole === 'mentor' ? 'Potential Mentees' : 'Recommended Mentors'}
                            </h2>
                            <ProfileCarousel profiles={displayProfiles} />
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-20 border-t border-[#1a3a35]">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-4xl font-serif text-white mb-3">
                            {myProfile?.mentorshipRole === 'mentor' ? 'Discovery for Mentors' :
                                myProfile?.mentorshipRole === 'mentee' ? 'Discovery for Mentees' :
                                    'Community Discovery'}
                        </h2>
                        <p className="text-gray-400 max-w-xl">
                            {myProfile?.mentorshipRole === 'mentor' ? 'Guide the next generation of talent. Find mentees who align with your expertise.' :
                                myProfile?.mentorshipRole === 'mentee' ? 'Connect with mentors who can accelerate your career and help you master new skills.' :
                                    'Organic, interest-driven connections. Find the perfect match for your professional journey.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/discovery" className="flex items-center gap-2 px-5 py-2.5 bg-[#4ade80] text-[#021f1a] rounded-xl font-bold transition-all text-sm hover:bg-[#34d399]">
                            Explore More <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {displayProfiles.map((p) => (
                        <SmallProfileCard key={p._id} profile={p} onConnect={handleConnect} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
