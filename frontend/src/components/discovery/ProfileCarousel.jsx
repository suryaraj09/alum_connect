import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '../../utils/url';
import { Link } from 'react-router-dom';

const users = [
    {
        id: 1,
        name: 'Elizabeth Halper',
        role: 'Senior Software Engineer',
        company: 'Microsoft',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        skills: ['Software Engineering', 'Azure', 'Data Structures'],
        score: '5.0'
    },
    {
        id: 2,
        name: 'Marcos Rezende',
        role: 'Senior Product Designer',
        company: 'Microsoft',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        skills: ['Product Design', 'UI/UX', 'Strategy'],
        score: '4.9'
    },
    {
        id: 3,
        name: 'Andrii Latyshev',
        role: 'Senior Software Engineer',
        company: 'Google',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        skills: ['Backend', 'Go', 'Distributed Systems'],
        score: '5.0'
    },
    {
        id: 4,
        name: 'Lily Zhao',
        role: 'Senior Data Scientist',
        company: 'Spotify',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
        skills: ['ML', 'Python', 'Big Data'],
        score: '4.8'
    },
    {
        id: 5,
        name: 'Sarah Chen',
        role: 'Full Stack Developer',
        company: 'Netflix',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
        skills: ['React', 'Node.js', 'AWS'],
        score: '5.0'
    }
];

const ProfileCard = ({ user, isFeatured }) => {
    const name = user.user?.name || user.name;
    const image = getMediaUrl(user.profilePicture || user.image) || `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`;
    const role = user.title || user.role || user.domain;
    const companyLabel = user.company || user.education?.school || (Array.isArray(user.education) ? user.education[0]?.school : user.education);
    const skills = user.skills || [];
    const score = user.engagementScore || user.score || '0.0';
    const profileId = user.user?._id || user._id;

    return (
        <motion.div
            className={`bg-[#173d36] rounded-2xl overflow-hidden border border-[#25524b] transition-all duration-500 ${isFeatured ? 'scale-110 z-20 shadow-2xl ring-2 ring-[#008ba3]' : 'scale-90 opacity-40 blur-[1px]'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="relative aspect-[4/5]">
                <img src={image} alt={name} className="w-full h-full object-cover" />
                <div className="absolute bottom-4 right-4 bg-[#052e28]/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-white">{score}</span>
                </div>
            </div>
            <div className="p-5 text-left">
                <h3 className="text-xl font-bold text-white mb-1 truncate">{name}</h3>
                <p className="text-sm text-gray-400 mb-4 truncate">{role} {companyLabel ? `at ${companyLabel}` : ''}</p>

                <div className="flex flex-wrap gap-2 mb-6 h-8 overflow-hidden">
                    {skills.map((skill, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-1 bg-[#25524b] text-gray-300 rounded-full">
                            {typeof skill === 'string' ? skill : skill.name}
                        </span>
                    ))}
                </div>

                <Link
                    to={`/profile/${profileId}`}
                    className="block w-full py-2 bg-gradient-to-r from-[#008ba3] to-[#01b4d3] hover:from-[#01b4d3] hover:to-[#02c8eb] text-white rounded-lg text-sm font-semibold transition-all text-center"
                >
                    View profile
                </Link>
            </div>
        </motion.div>
    );
};

const ProfileCarousel = ({ profiles }) => {
    const [centerIndex, setCenterIndex] = useState(2);

    const displayUsers = profiles && profiles.length >= 3 ? profiles : users;

    const next = () => setCenterIndex((prev) => (prev + 1) % displayUsers.length);
    const prev = () => setCenterIndex((prev) => (prev - 1 + displayUsers.length) % displayUsers.length);

    // Helper to get relative indices
    const getIndex = (offset) => (centerIndex + offset + displayUsers.length) % displayUsers.length;

    return (
        <div className="bg-[#021f1a] py-20 overflow-hidden px-4 md:px-0">
            <div className="max-w-6xl mx-auto relative flex items-center justify-center">
                {/* Navigation buttons */}
                <button onClick={prev} className="absolute left-4 md:-left-12 z-30 p-3 bg-[#1a3a35] hover:bg-[#25524b] rounded-full text-white transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={next} className="absolute right-4 md:-right-12 z-30 p-3 bg-[#1a3a35] hover:bg-[#25524b] rounded-full text-white transition-all">
                    <ChevronRight className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4 md:gap-8 min-h-[500px]">
                    {/* Visible cards */}
                    <div className="hidden md:block w-71">
                        <ProfileCard user={displayUsers[getIndex(-2)]} isFeatured={false} />
                    </div>
                    <div className="w-71">
                        <ProfileCard user={displayUsers[getIndex(-1)]} isFeatured={false} />
                    </div>
                    <div className="w-80 scale-105 md:scale-100">
                        <ProfileCard user={displayUsers[centerIndex]} isFeatured={true} />
                    </div>
                    <div className="w-71">
                        <ProfileCard user={displayUsers[getIndex(1)]} isFeatured={false} />
                    </div>
                    <div className="hidden md:block w-71">
                        <ProfileCard user={displayUsers[getIndex(2)]} isFeatured={false} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCarousel;
