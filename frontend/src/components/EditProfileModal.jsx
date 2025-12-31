import React, { useState } from 'react';
import { X, Save, Plus, User, Camera } from 'lucide-react';
import api from '../services/api';
import { getMediaUrl } from '../utils/url';
import { storage } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const EditProfileModal = ({ isOpen, onClose, profile, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: profile?.title || '',
        location: profile?.location || '',
        domain: profile?.domain || '',
        bio: profile?.bio || '',
        languages: profile?.languages || [],
        profilePicture: profile?.profilePicture || ''
    });
    const [langInput, setLangInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `profiles/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload is " + progress + "% done");
                },
                (error) => {
                    console.error("Upload failed", error);
                    alert("Image upload failed");
                    setIsUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setFormData({ ...formData, profilePicture: downloadURL });
                    setIsUploading(false);
                }
            );
        } catch (err) {
            console.error('Setup failed', err);
            alert('Image upload setup failed');
            setIsUploading(false);
        }
    };

    const addLang = () => {
        if (langInput.trim() && !formData.languages.includes(langInput.trim())) {
            setFormData({ ...formData, languages: [...formData.languages, langInput.trim()] });
            setLangInput('');
        }
    };

    const removeLang = (l) => {
        setFormData({ ...formData, languages: formData.languages.filter(lang => lang !== l) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-[#052e28] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-serif font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-[#021f1a] rounded-2xl border-2 border-white/5 overflow-hidden relative group">
                            {formData.profilePicture ? (
                                <img src={getMediaUrl(formData.profilePicture)} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1a3a35]">
                                    <User className="text-gray-500" size={48} />
                                </div>
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="text-white" size={24} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">Click to change profile picture</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Professional Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a] border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a] border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 outline-none"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Primary Domain</label>
                            <input
                                type="text"
                                className="w-full bg-[#021f1a] border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 outline-none"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Short Bio</label>
                            <textarea
                                className="w-full bg-[#021f1a] border border-white/10 text-white px-4 py-4 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 outline-none h-32"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Languages</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-grow bg-[#021f1a] border border-white/10 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 outline-none"
                                    placeholder="Add language"
                                    value={langInput}
                                    onChange={(e) => setLangInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLang())}
                                />
                                <button
                                    type="button"
                                    onClick={addLang}
                                    className="px-4 py-2 bg-[#1a3a35] text-[#4ade80] border border-[#4ade80]/20 rounded-xl"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.languages.map(l => (
                                    <span key={l} className="flex items-center gap-2 px-3 py-1 bg-[#1a3a35] text-gray-300 rounded-lg text-xs">
                                        {l}
                                        <button type="button" onClick={() => removeLang(l)} className="hover:text-red-400">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </form>

                    <div className="p-0 flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-400 hover:text-white transition-all font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-2.5 bg-[#4ade80] text-[#021f1a] rounded-xl font-bold flex items-center gap-2 hover:bg-[#34d399] transition-all"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
