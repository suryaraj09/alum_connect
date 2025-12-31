import React, { useState } from 'react';
import { X, ImageIcon, Video, Calendar, MoreHorizontal, ThumbsUp, Send, User, Users } from 'lucide-react';
import { storage } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const CreatePostModal = ({ isOpen, onClose, onPost, user }) => {
    const [text, setText] = useState('');
    const [preview, setPreview] = useState(null);
    const [rawFile, setRawFile] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setRawFile(file);
            setPreview(URL.createObjectURL(file));
            setMediaType(type);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let mediaUrl = null;

            if (rawFile) {
                const storageRef = ref(storage, `posts/${Date.now()}_${rawFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, rawFile);

                // We'll wrap common upload logic in a promise for easier await
                mediaUrl = await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log("Post media upload is " + progress + "% done");
                        },
                        (error) => reject(error),
                        async () => {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(url);
                        }
                    );
                });
            }

            onPost({ text, media: mediaUrl, mediaType: mediaType });
            setText('');
            setPreview(null);
            setRawFile(null);
            setMediaType(null);
            onClose();
        } catch (err) {
            console.error('Post failed', err);
            alert('Failed to upload media');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#052e28] border border-[#1a3a35] w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a3a35]">
                    <h2 className="text-xl font-serif font-bold text-white">Share an update</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#1a3a35] rounded-full text-gray-400 transition-all hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full border border-[#25524b] bg-[#1a3a35] flex items-center justify-center text-[#4ade80] font-bold overflow-hidden">
                                {user?.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : <User size={24} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-white leading-none">{user?.name}</h4>
                                <button type="button" className="mt-1 px-3 py-1 border border-gray-600 rounded-full text-[10px] text-gray-400 flex items-center gap-1 hover:border-white hover:text-white transition-all">
                                    <Users size={12} /> Anyone
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What do you want to talk about?"
                            className="w-full h-40 bg-transparent text-white border-none focus:ring-0 text-lg placeholder-gray-500 resize-none"
                            autoFocus
                        />

                        {preview && (
                            <div className="relative mt-4 border border-[#1a3a35] rounded-xl overflow-hidden bg-[#021f1a]">
                                {mediaType === 'image' ? (
                                    <img src={preview} className="w-full h-auto max-h-[300px] object-contain" />
                                ) : (
                                    <video src={preview} className="w-full h-auto max-h-[300px]" controls />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-[#021f1a]/60 backdrop-blur-sm flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <button
                                    onClick={() => { setPreview(null); setRawFile(null); setMediaType(null); }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <label className="p-3 hover:bg-[#1a3a35] rounded-full text-gray-400 transition-all cursor-pointer hover:text-[#4ade80]" title="Add Photo">
                                    <ImageIcon size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                                </label>
                                <label className="p-3 hover:bg-[#1a3a35] rounded-full text-gray-400 transition-all cursor-pointer hover:text-[#4ade80]" title="Add Video">
                                    <Video size={20} />
                                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                                </label>
                                <button type="button" className="p-3 hover:bg-[#1a3a35] rounded-full text-gray-400 transition-all hover:text-[#4ade80]" title="Add Event">
                                    <Calendar size={20} />
                                </button>
                                <button type="button" className="p-3 hover:bg-[#1a3a35] rounded-full text-gray-400 transition-all hover:text-[#4ade80]" title="More">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={(!text.trim() && !preview) || isUploading}
                                className={`px-8 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${((!text.trim() && !preview) || isUploading)
                                    ? 'bg-[#1a3a35] text-gray-500 cursor-not-allowed border border-[#25524b]'
                                    : 'bg-[#4ade80] text-[#021f1a] hover:bg-[#34d399] active:scale-95 shadow-lg shadow-[#4ade80]/10'
                                    }`}
                            >
                                {isUploading ? <div className="w-5 h-5 border-2 border-[#021f1a]/30 border-t-[#021f1a] rounded-full animate-spin"></div> : <><Send size={18} /> Post</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
