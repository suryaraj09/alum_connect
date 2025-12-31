import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';

const DocumentEditor = ({ socket, workspaceId }) => {
    const [content, setContent] = useState('');
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        // Initial setup or load from API
        setContent('Start collaborating on your document here...');
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('doc-update', (newContent) => {
                setContent(newContent);
            });
        }
    }, [socket]);

    const handleChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);

        // Emit changes to other users
        if (socket) {
            socket.emit('doc-change', { workspaceId, content: newContent });
        }
    };

    const handleSave = () => {
        setLastSaved(new Date());
        // Save to backend logic would go here
    };

    return (
        <div className="flex flex-col h-full bg-[#052e28] rounded-3xl border border-[#1a3a35] overflow-hidden shadow-2xl">
            <div className="bg-[#052e28]/50 p-4 border-b border-[#1a3a35] flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileText className="text-[#4ade80]" size={20} />
                    <span className="font-bold text-white">Shared Document</span>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1a3a35] hover:bg-[#25524b] text-[#4ade80] rounded-lg transition-colors text-sm"
                >
                    <Save size={16} />
                    Save
                </button>
            </div>

            <textarea
                value={content}
                onChange={handleChange}
                className="flex-grow w-full bg-[#021f1a]/30 text-gray-200 p-6 resize-none focus:outline-none font-mono leading-relaxed"
                placeholder="Type here to collaborate..."
            />

            <div className="bg-[#052e28] p-2 border-t border-[#1a3a35] text-xs text-gray-500 flex justify-between px-4">
                <span>{content.length} characters</span>
                <span>{lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Unsaved changes'}</span>
            </div>
        </div>
    );
};

export default DocumentEditor;
