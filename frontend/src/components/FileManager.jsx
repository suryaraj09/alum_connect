import React, { useState, useEffect } from 'react';
import { Upload, File, FileText, Image, Film, Download, Trash2, Loader } from 'lucide-react';
import api from '../services/api';

const FileManager = ({ workspaceId, socket }) => {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        loadFiles();

        if (socket) {
            socket.on('new-resource', ({ workspaceId: wsId, resource }) => {
                if (wsId === workspaceId) {
                    loadFiles();
                }
            });
        }

        return () => {
            if (socket) socket.off('new-resource');
        };
    }, [workspaceId, socket]);

    const loadFiles = async () => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/resources`);
            // Only show resources of type 'file'
            const onlyFiles = data.filter(r => r.type === 'file');
            setFiles(onlyFiles);
        } catch (error) {
            console.error('Error loading files:', error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload file
            const uploadRes = await api.post('/upload/workspace', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Add resource to workspace
            const resourceData = {
                title: file.name,
                url: uploadRes.data.url,
                type: 'file'
            };

            const { data } = await api.post(`/workspaces/${workspaceId}/resources`, resourceData);

            // Emit to others
            if (socket) {
                socket.emit('resource-shared', { workspaceId, resource: data });
            }

            // Refresh list locally
            loadFiles();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (url) => {
        const ext = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <Image size={24} className="text-purple-400" />;
        if (['mp4', 'mov', 'avi'].includes(ext)) return <Film size={24} className="text-red-400" />;
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return <FileText size={24} className="text-blue-400" />;
        return <File size={24} className="text-gray-400" />;
    };

    return (
        <div className="flex-grow bg-[#052e28] rounded-3xl border border-[#1a3a35] flex flex-col overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold font-serif text-white">Workspace Storage</h3>
                    <p className="text-gray-400 text-sm">Shared resources and files</p>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4ade80] text-[#021f1a] font-bold rounded-xl hover:bg-[#34d399] transition-all disabled:opacity-50"
                    >
                        {isUploading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
                        Upload File
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <Upload size={64} className="mb-4" />
                        <p>No files yet. Upload something to share!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file) => (
                            <div key={file._id} className="bg-[#1a3a35]/50 border border-[#1a3a35] p-4 rounded-xl flex items-center gap-4 hover:border-[#4ade80] transition-colors group">
                                <div className="p-3 bg-[#021f1a] rounded-lg">
                                    {getFileIcon(file.url)}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-medium text-white truncate" title={file.title}>{file.title}</h4>
                                    <p className="text-xs text-gray-400">
                                        by {file.uploadedBy?.name || 'Unknown'} • {new Date(file.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <a
                                    href={`${import.meta.env.VITE_API_URL}${file.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="p-2 text-gray-400 hover:text-[#4ade80] transition-colors"
                                    title="Download"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileManager;
