import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    ChevronRight,
    ChevronLeft,
    GraduationCap,
    Briefcase,
    User,
    Award,
    CheckCircle,
    ArrowRight,
    Plus,
    X,
    Upload,
    Camera
} from 'lucide-react';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const { user, updateProfileStatus } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        domain: '',
        title: '',
        location: '',
        bio: '',
        languages: [],
        education: [{ school: '', degree: '', fieldOfStudy: '', graduationYear: 2025 }],
        experience: [{ title: '', company: '', from: '', to: '', description: '', current: false }],
        profilePicture: '',
        skills: []
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setIsUploading(true);
        try {
            const { data } = await api.post('/upload/profile', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, profilePicture: data.url });
        } catch (err) {
            console.error('Upload failed', err);
            alert('Image upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const [skillInput, setSkillInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');

    const addLanguage = () => {
        if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
            setFormData({
                ...formData,
                languages: [...formData.languages, languageInput.trim()]
            });
            setLanguageInput('');
        }
    };

    const removeLanguage = (lang) => {
        setFormData({
            ...formData,
            languages: formData.languages.filter(l => l !== lang)
        });
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.find(s => s.name === skillInput.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, { name: skillInput.trim(), endorsements: 0 }]
            });
            setSkillInput('');
        }
    };

    const removeSkill = (name) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s.name !== name)
        });
    };

    const handleEducationChange = (index, field, value) => {
        const newEdu = [...formData.education];
        newEdu[index][field] = value;
        setFormData({ ...formData, education: newEdu });
    };

    const handleExperienceChange = (index, field, value) => {
        const newExp = [...formData.experience];
        newExp[index][field] = value;
        setFormData({ ...formData, experience: newExp });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Transform data to match backend schema
            const payload = {
                ...formData,
                graduationYear: formData.education[0]?.graduationYear || 2025
            };
            await api.post('/profiles', payload);
            updateProfileStatus(true);
            navigate('/');
        } catch (err) {
            console.error('Failed to create profile', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-12 relative group">
                            <div className="w-32 h-32 bg-[#4ade80]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#4ade80]/20 overflow-hidden relative">
                                {formData.profilePicture ? (
                                    <img src={`http://localhost:5001${formData.profilePicture}`} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-[#4ade80]/20" size={64} />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-[#021f1a]/80 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-2 bg-[#4ade80] text-[#021f1a] p-2 rounded-full cursor-pointer shadow-xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                                <Camera size={18} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                            <h3 className="text-2xl font-serif font-bold text-white">Let's start with the basics</h3>
                            <p className="text-gray-400 mt-2">Tell us about your professional domain and a bit about yourself.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Professional Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600"
                                    placeholder="e.g. Senior Backend Engineer"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600"
                                    placeholder="e.g. New York, NY"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Primary Domain</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600"
                                    placeholder="e.g. Software Engineering, Product Management"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Short Bio</label>
                                <textarea
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600 h-32"
                                    placeholder="Tell the community who you are and what you're passionate about..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#4ade80]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="text-[#4ade80]" size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white">Education Background</h3>
                            <p className="text-gray-400 mt-2">Where did you study? This helps us find your alumni network.</p>
                        </div>

                        {formData.education.map((edu, idx) => (
                            <div key={idx} className="space-y-4 p-6 bg-black/20 rounded-2xl border border-white/5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">School / University</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none"
                                        placeholder="e.g. Ahmedabad University"
                                        value={edu.school}
                                        onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Degree</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none"
                                            placeholder="e.g. B.Tech"
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Grad Year</label>
                                        <input
                                            type="number"
                                            className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none"
                                            value={edu.graduationYear}
                                            onChange={(e) => handleEducationChange(idx, 'graduationYear', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#4ade80]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="text-[#4ade80]" size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white">Work Experience</h3>
                            <p className="text-gray-400 mt-2">Tell us about your professional journey so far.</p>
                        </div>

                        {formData.experience.map((exp, idx) => (
                            <div key={idx} className="space-y-4 p-6 bg-black/20 rounded-2xl border border-white/5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none"
                                        placeholder="e.g. Frontend Engineer"
                                        value={exp.title}
                                        onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none"
                                        placeholder="e.g. Google"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none text-sm"
                                        placeholder="From (e.g. Jan 2020)"
                                        value={exp.from}
                                        onChange={(e) => handleExperienceChange(idx, 'from', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none text-sm"
                                        placeholder="To (or 'Present')"
                                        value={exp.to}
                                        onChange={(e) => handleExperienceChange(idx, 'to', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#4ade80]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="text-[#4ade80]" size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white">Skills & Expertise</h3>
                            <p className="text-gray-400 mt-2">What are you great at? Add at least 3 skills to stand out.</p>
                        </div>

                        <div className="space-y-4 border-b border-white/5 pb-8 mb-8">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Languages Spoken</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white pl-4 pr-32 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none"
                                    placeholder="Add a language (e.g. English, Hindi)"
                                    value={languageInput}
                                    onChange={(e) => setLanguageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                                />
                                <button
                                    onClick={addLanguage}
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-[#4ade80]/20 text-[#4ade80] rounded-xl font-bold flex items-center gap-2 hover:bg-[#4ade80]/30 transition-all border border-[#4ade80]/20"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.languages.map(lang => (
                                    <div key={lang} className="flex items-center gap-2 px-3 py-1 bg-[#1a3a35] border border-white/5 text-gray-300 rounded-lg text-sm">
                                        {lang}
                                        <button onClick={() => removeLanguage(lang)} className="hover:text-red-400 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {formData.languages.length === 0 && <span className="text-xs text-gray-600 italic">No languages added yet.</span>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Skills & Expertise</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white pl-4 pr-32 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none"
                                    placeholder="Add a skill (e.g. React, UX Design)"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                />
                                <button
                                    onClick={addSkill}
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-[#4ade80] text-[#021f1a] rounded-xl font-bold flex items-center gap-2 hover:bg-[#34d399] transition-all"
                                >
                                    <Plus size={18} /> Add
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map(skill => (
                                    <div key={skill.name} className="flex items-center gap-2 px-4 py-2 bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] rounded-full text-sm">
                                        {skill.name}
                                        <button onClick={() => removeSkill(skill.name)} className="hover:text-white transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {formData.skills.length < 3 && (
                                <p className="text-xs text-gray-500 text-center italic">Please add {3 - formData.skills.length} more skill(s) to continue.</p>
                            )}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-[#4ade80]/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(74,222,128,0.2)]">
                            <CheckCircle className="text-[#4ade80]" size={48} />
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-white">All set!</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">Your professional profile is ready. Welcome to the Alum_Connect family!</p>

                        <div className="bg-black/20 rounded-3xl p-8 border border-white/5 space-y-4 text-left mt-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#1a3a35] border border-white/5 overflow-hidden">
                                    {formData.profilePicture ? (
                                        <img src={`http://localhost:5001${formData.profilePicture}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-gray-600 m-2" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{user?.name}</h4>
                                    <p className="text-xs text-[#4ade80]">{formData.domain}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 border-t border-white/5 pt-4 text-xs text-gray-400">
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">{formData.education[0]?.school || 'University'}</span>
                                    <span>Education</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">{formData.skills.length}</span>
                                    <span>Skills Added</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#021f1a] pt-12 pb-24 px-6 relative overflow-hidden flex flex-col items-center">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4ade80]/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#008ba3]/5 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-2xl z-10">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
                        Alum<span className="text-[#4ade80]">_</span>Connect
                    </h1>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#4ade80]' : i < step ? 'w-3 bg-[#4ade80]/40' : 'w-3 bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#052e28]/50 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative min-h-[500px] flex flex-col">
                    <div className="flex-grow">
                        {renderStep()}
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                        {step > 1 && step < 5 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all font-bold px-4 py-2"
                            >
                                <ChevronLeft size={20} /> Back
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {step < 5 ? (
                            <button
                                disabled={
                                    (step === 1 && (!formData.domain.trim() || !formData.title.trim())) ||
                                    (step === 4 && formData.skills.length < 3)
                                }
                                onClick={() => setStep(step + 1)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-3 rounded-2xl flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                            >
                                Continue <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-[#4ade80] text-[#021f1a] font-bold py-4 rounded-2xl transition-all shadow-xl shadow-[#4ade80]/20 flex items-center justify-center gap-3 hover:bg-[#34d399] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-[#021f1a]/30 border-t-[#021f1a] rounded-full animate-spin"></div>
                                ) : (
                                    <><CheckCircle size={20} /> Get Started</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
