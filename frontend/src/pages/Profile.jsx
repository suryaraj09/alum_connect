import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateProfileStatus } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        education: '',
        graduationYear: 2024,
        skills: '',
        domain: '',
        bio: '',
        schedulingLink: ''
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profiles/me');
            if (data) {
                setProfile({
                    ...data,
                    skills: data.skills.join(', ')
                });
                setHasProfile(true);
                setIsEditing(false);
            } else {
                setIsEditing(true);
            }
        } catch (err) {
            console.log('No profile found, create one.');
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const skillsArray = profile.skills.split(',').map(s => s.trim());
            await api.post('/profiles', { ...profile, skills: skillsArray });

            // Check if profile is now complete (same logic as backend)
            const isComplete = profile.education && profile.graduationYear && profile.domain && skillsArray.length > 0;
            if (isComplete) {
                updateProfileStatus(true);
                if (!hasProfile) {
                    alert('Profile complete! Access granted.');
                    navigate('/');
                } else {
                    alert('Profile updated!');
                    setIsEditing(false);
                    setHasProfile(true);
                }
            } else {
                alert('Profile updated, but some fields are still missing for full access.');
                setIsEditing(false);
                setHasProfile(true);
            }
        } catch (err) {
            alert('Update failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your Profile</h1>
                {hasProfile && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl font-semibold hover:bg-primary-100 transition"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
            {user && !user.isProfileComplete && (
                <div className="mb-8 p-4 bg-primary-50 text-primary-700 rounded-2xl border border-primary-100">
                    <p className="font-semibold text-lg">Almost there! 🚀</p>
                    <p>Please complete these required fields to get full access to the platform:
                        <strong> Education, Graduation Year, Domain, and Skills</strong>.</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Education</label>
                        <input
                            className={`w-full px-4 py-2 rounded-xl border ${!isEditing ? 'bg-slate-50 text-slate-500' : ''}`}
                            value={profile.education}
                            onChange={e => setProfile({ ...profile, education: e.target.value })}
                            disabled={!isEditing}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Graduation Year</label>
                        <input
                            type="number"
                            className={`w-full px-4 py-2 rounded-xl border ${!isEditing ? 'bg-slate-50 text-slate-500' : ''}`}
                            value={profile.graduationYear}
                            onChange={e => setProfile({ ...profile, graduationYear: e.target.value })}
                            disabled={!isEditing}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Domain</label>
                    <input
                        className={`w-full px-4 py-2 rounded-xl border ${!isEditing ? 'bg-slate-50 text-slate-500' : ''}`}
                        placeholder="e.g. Software Engineering"
                        value={profile.domain}
                        onChange={e => setProfile({ ...profile, domain: e.target.value })}
                        disabled={!isEditing}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                    <input
                        className={`w-full px-4 py-2 rounded-xl border ${!isEditing ? 'bg-slate-50 text-slate-500' : ''}`}
                        placeholder="React, Node, Python"
                        value={profile.skills}
                        onChange={e => setProfile({ ...profile, skills: e.target.value })}
                        disabled={!isEditing}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                        className={`w-full px-4 py-2 rounded-xl border h-32 ${!isEditing ? 'bg-slate-50 text-slate-500' : ''}`}
                        value={profile.bio}
                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Scheduling Link (Calendly)</label>
                    <input
                        className={`w-full px-4 py-2 rounded-xl border ${!isEditing ? 'bg-slate-50 text-slate-500' : ''}`}
                        value={profile.schedulingLink}
                        onChange={e => setProfile({ ...profile, schedulingLink: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                {isEditing && (
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 transition"
                        >
                            Save Changes
                        </button>
                        {hasProfile && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Profile;
