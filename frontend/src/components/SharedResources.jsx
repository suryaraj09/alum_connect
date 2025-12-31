import React, { useState, useEffect } from 'react';
import { FileText, Grid, Video, ExternalLink, Plus, Trash2, Clock, User } from 'lucide-react';
import api from '../services/api';

const SharedResources = ({ workspaceId, type, socket }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResources();

        if (socket) {
            socket.on('new-resource', ({ workspaceId: wsId, resource }) => {
                if (wsId === workspaceId && resource.type === type) {
                    setResources(prev => [resource, ...prev]);
                }
            });
        }

        return () => {
            if (socket) socket.off('new-resource');
        };
    }, [workspaceId, type, socket]);

    const loadResources = async () => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/resources`);
            // Filter by type
            const filtered = data.filter(r => r.type === type);
            setResources(filtered);
        } catch (error) {
            console.error('Error loading resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'document': return <FileText className="text-blue-400" size={24} />;
            case 'spreadsheet': return <Grid className="text-green-400" size={24} />;
            case 'meeting': return <Video className="text-purple-400" size={24} />;
            default: return <FileText size={24} />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'document': return 'Shared Documents';
            case 'spreadsheet': return 'Shared Spreadsheets';
            case 'meeting': return 'Meeting History';
            default: return 'Shared Resources';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading resources...</div>;

    return (
        <div className="flex flex-col h-full bg-[#052e28] rounded-3xl border border-[#1a3a35] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#1a3a35] flex justify-between items-center bg-[#1a3a35]/30">
                <div className="flex items-center gap-3">
                    {getIcon()}
                    <h3 className="text-xl font-serif font-bold text-white">{getTitle()}</h3>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {resources.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 italic opacity-50">
                        <Plus size={48} className="mb-4" />
                        <p>No {type}s shared yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {resources.map((res) => (
                            <div key={res._id} className="bg-[#1a3a35]/50 border border-[#1a3a35] p-5 rounded-2xl group hover:border-[#4ade80] transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#021f1a] rounded-xl flex items-center justify-center text-[#4ade80] group-hover:scale-110 transition-transform">
                                        {getIcon()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-[#4ade80] transition-colors">{res.title}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><User size={12} /> {res.uploadedBy?.name || 'User'}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(res.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-[#021f1a] text-[#4ade80] rounded-xl hover:bg-[#4ade80] hover:text-[#021f1a] transition-all"
                                    title="Open Link"
                                >
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedResources;
