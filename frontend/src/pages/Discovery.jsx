import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Filter, UserPlus } from 'lucide-react';

const Discovery = () => {
    const [profiles, setProfiles] = useState([]);
    const [search, setSearch] = useState('');
    const [domain, setDomain] = useState('');

    useEffect(() => {
        fetchProfiles();
    }, [domain]);

    const fetchProfiles = async () => {
        try {
            const { data } = await api.get(`/profiles?domain=${domain}`);
            setProfiles(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleConnect = async (userId) => {
        try {
            await api.post(`/connections/request/${userId}`);
            alert('Request sent!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending request');
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold">Discover Alumni & Students</h1>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search skills..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    >
                        <option value="">All Domains</option>
                        <option value="Tech">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Design">Design</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profiles.map(p => (
                    <div key={p._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                                {p.user.name[0]}
                            </div>
                            <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                                Engagement: {p.engagementScore}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold">{p.user.name}</h3>
                        <p className="text-slate-600 text-sm mb-4">{p.domain} • Class of {p.graduationYear}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {p.skills.slice(0, 3).map(s => (
                                <span key={s} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs">{s}</span>
                            ))}
                        </div>
                        <button
                            onClick={() => handleConnect(p.user._id)}
                            className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-xl transition-colors"
                        >
                            <UserPlus size={18} />
                            <span>Connect</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Discovery;
