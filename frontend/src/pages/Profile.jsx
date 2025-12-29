import { useState, useEffect } from 'react';
import api from '../services/api';

const Profile = () => {
    const [profile, setProfile] = useState({
        education: '',
        graduationYear: 2024,
        skills: '',
        domain: '',
        bio: '',
        schedulingLink: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profiles/me');
            setProfile({
                ...data,
                skills: data.skills.join(', ')
            });
        } catch (err) {
            console.log('No profile found, create one.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const skillsArray = profile.skills.split(',').map(s => s.trim());
            await api.post('/profiles', { ...profile, skills: skillsArray });
            alert('Profile updated!');
        } catch (err) {
            alert('Update failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Education</label>
                        <input
                            className="w-full px-4 py-2 rounded-xl border"
                            value={profile.education}
                            onChange={e => setProfile({ ...profile, education: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Graduation Year</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 rounded-xl border"
                            value={profile.graduationYear}
                            onChange={e => setProfile({ ...profile, graduationYear: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Domain</label>
                    <input
                        className="w-full px-4 py-2 rounded-xl border"
                        placeholder="e.g. Software Engineering"
                        value={profile.domain}
                        onChange={e => setProfile({ ...profile, domain: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                    <input
                        className="w-full px-4 py-2 rounded-xl border"
                        placeholder="React, Node, Python"
                        value={profile.skills}
                        onChange={e => setProfile({ ...profile, skills: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                        className="w-full px-4 py-2 rounded-xl border h-32"
                        value={profile.bio}
                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Scheduling Link (Calendly)</label>
                    <input
                        className="w-full px-4 py-2 rounded-xl border"
                        value={profile.schedulingLink}
                        onChange={e => setProfile({ ...profile, schedulingLink: e.target.value })}
                    />
                </div>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 transition">
                    Save Profile
                </button>
            </form>
        </div>
    );
};

export default Profile;
