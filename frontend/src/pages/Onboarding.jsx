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
import { getMediaUrl } from '../utils/url';

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
        experience: [{ title: '', company: '', from: 2020, to: new Date().getFullYear(), description: '', current: false }],
        profilePicture: '',
        skills: [],
        mentorshipRole: 'mentee', // mentor, mentee, both
        userType: 'student', // student, faculty, alumni, other
        skillsToLearn: [],
        skillsToTeach: []
    });

    const [roles, setRoles] = useState({
        isMentor: false,
        isMentee: true // default
    });

    const wellKnownSkills = [
        'Artificial Intelligence', 'Machine Learning', 'Data Science',
        'Web Development', 'Mobile App Development', 'UI/UX Design',
        'Product Management', 'Cloud Computing', 'Cybersecurity',
        'Blockchain', 'Digital Marketing', 'Business Strategy',
        'Finance', 'Public Speaking', 'Photography'
    ];

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

    const toggleRole = (role) => {
        const newRoles = { ...roles, [role]: !roles[role] };
        // Ensure at least one is selected
        if (!newRoles.isMentor && !newRoles.isMentee) return;

        setRoles(newRoles);

        let roleVal = 'both';
        if (newRoles.isMentor && !newRoles.isMentee) roleVal = 'mentor';
        if (!newRoles.isMentor && newRoles.isMentee) roleVal = 'mentee';

        setFormData({ ...formData, mentorshipRole: roleVal });
    };

    const toggleSkillToLearn = (skill) => {
        const current = formData.skillsToLearn;
        if (current.includes(skill)) {
            setFormData({ ...formData, skillsToLearn: current.filter(s => s !== skill) });
        } else {
            setFormData({ ...formData, skillsToLearn: [...current, skill] });
        }
    };

    const toggleSkillToTeach = (skill) => {
        const current = formData.skillsToTeach;
        if (current.includes(skill)) {
            setFormData({ ...formData, skillsToTeach: current.filter(s => s !== skill) });
        } else {
            setFormData({ ...formData, skillsToTeach: [...current, skill] });
        }
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
                                    <img src={getMediaUrl(formData.profilePicture)} alt="Preview" className="w-full h-full object-cover" />
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Professional Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600"
                                    placeholder="e.g. Senior Backend Engineer"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Primary Domain <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600"
                                    placeholder="e.g. Software Engineering, Product Management"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Short Bio <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600 h-24"
                                    placeholder="Tell the community who you are..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Languages <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none"
                                        placeholder="Add a language (e.g. English, Gujarati)..."
                                        value={languageInput}
                                        onChange={(e) => setLanguageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                                    />
                                    <button
                                        onClick={addLanguage}
                                        className="px-4 py-2 bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] rounded-xl hover:bg-[#4ade80]/20 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.languages.map(lang => (
                                        <span key={lang} className="bg-[#4ade80]/10 text-[#4ade80] px-3 py-1 rounded-lg text-xs flex items-center gap-2 border border-[#4ade80]/20">
                                            {lang}
                                            <X size={14} className="cursor-pointer hover:text-white" onClick={() => removeLanguage(lang)} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center">
                            <h3 className="text-2xl font-serif font-bold text-white">Tell us about your role at AU</h3>
                            <p className="text-gray-400 mt-2">Are you a student, faculty member, or alumni of Ahmedabad University?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'student', title: 'Student', desc: 'Currently studying at Ahmedabad University' },
                                { id: 'faculty', title: 'Faculty', desc: 'Teaching or researching at Ahmedabad University' },
                                { id: 'alumni', title: 'Alumni', desc: 'Have graduated from Ahmedabad University' },
                                { id: 'other', title: 'Other Associate', desc: 'Affiliated with Ahmedabad University in another capacity' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setFormData({ ...formData, userType: item.id })}
                                    className={`p-5 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${formData.userType === item.id ? 'bg-[#4ade80]/10 border-[#4ade80]' : 'bg-[#021f1a]/50 border-white/10 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center ${formData.userType === item.id ? 'bg-[#4ade80] border-[#4ade80]' : 'border-gray-500'}`}>
                                        {formData.userType === item.id && <CheckCircle className="text-[#021f1a]" size={14} />}
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-bold ${formData.userType === item.id ? 'text-white' : 'text-gray-400'}`}>{item.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center">
                            <h3 className="text-2xl font-serif font-bold text-white">How do you want to participate?</h3>
                            <p className="text-gray-400 mt-2">Choose your primary roles in the community. You can change this later.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => toggleRole('isMentee')}
                                className={`p-6 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${roles.isMentee ? 'bg-[#4ade80]/10 border-[#4ade80]' : 'bg-[#021f1a]/50 border-white/10 opacity-60 hover:opacity-100'}`}
                            >
                                <div className={`mt-1 w-6 h-6 rounded border flex items-center justify-center ${roles.isMentee ? 'bg-[#4ade80] border-[#4ade80]' : 'border-gray-500'}`}>
                                    {roles.isMentee && <CheckCircle className="text-[#021f1a]" size={14} />}
                                </div>
                                <div>
                                    <h4 className={`text-lg font-bold ${roles.isMentee ? 'text-white' : 'text-gray-400'}`}>Interested in being a Mentee</h4>
                                    <p className="text-sm text-gray-500 mt-1">I'm here to learn from others and grow my skill set.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => toggleRole('isMentor')}
                                className={`p-6 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${roles.isMentor ? 'bg-[#4ade80]/10 border-[#4ade80]' : 'bg-[#021f1a]/50 border-white/10 opacity-60 hover:opacity-100'}`}
                            >
                                <div className={`mt-1 w-6 h-6 rounded border flex items-center justify-center ${roles.isMentor ? 'bg-[#4ade80] border-[#4ade80]' : 'border-gray-500'}`}>
                                    {roles.isMentor && <CheckCircle className="text-[#021f1a]" size={14} />}
                                </div>
                                <div>
                                    <h4 className={`text-lg font-bold ${roles.isMentor ? 'text-white' : 'text-gray-400'}`}>Interested in becoming a Mentor</h4>
                                    <p className="text-sm text-gray-500 mt-1">I want to share my knowledge and guide fellow members.</p>
                                </div>
                            </button>
                        </div>

                        <div className="p-4 bg-[#4ade80]/5 rounded-2xl border border-[#4ade80]/10">
                            <p className="text-xs text-gray-400 italic">
                                <strong>Note:</strong> If you select only Mentee, you're here to learn. If only Mentor, you're here to teach. Selecting both allows you to both learn and contribute knowledge.
                            </p>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#4ade80]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="text-[#4ade80]" size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white">Education Background</h3>
                            <p className="text-gray-400 mt-2">Where did you study?</p>
                        </div>

                        {formData.education.map((edu, idx) => (
                            <div key={idx} className="space-y-4 p-6 bg-black/20 rounded-2xl border border-white/5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        School / University <span className="text-red-500">*</span>
                                    </label>
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
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Degree <span className="text-red-500">*</span>
                                        </label>
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
                                        <select
                                            className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none cursor-pointer"
                                            value={edu.graduationYear}
                                            onChange={(e) => handleEducationChange(idx, 'graduationYear', parseInt(e.target.value))}
                                        >
                                            {Array.from({ length: new Date().getFullYear() + 5 - 2000 + 1 }, (_, i) => 2000 + i).reverse().map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#4ade80]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="text-[#4ade80]" size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white">Work Experience</h3>
                            <p className="text-gray-400 mt-2">Tell us about your professional journey.</p>
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">From Year</label>
                                        <select
                                            className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none cursor-pointer"
                                            value={exp.from}
                                            onChange={(e) => handleExperienceChange(idx, 'from', parseInt(e.target.value))}
                                        >
                                            {Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => 2000 + i).reverse().map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">To Year</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none cursor-pointer disabled:opacity-50"
                                                value={exp.to}
                                                onChange={(e) => handleExperienceChange(idx, 'to', parseInt(e.target.value))}
                                                disabled={exp.current}
                                            >
                                                {Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => 2000 + i).reverse().map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            <label className="flex items-center gap-2 px-3 bg-[#021f1a]/50 border border-white/10 rounded-xl cursor-pointer hover:border-[#4ade80]/30 transition-all">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-500 bg-transparent text-[#4ade80] focus:ring-[#4ade80] focus:ring-offset-0 cursor-pointer"
                                                    checked={exp.current}
                                                    onChange={(e) => handleExperienceChange(idx, 'current', e.target.checked)}
                                                />
                                                <span className="text-sm text-gray-300 whitespace-nowrap">Current</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full bg-[#021f1a]/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] outline-none h-24"
                                        placeholder="Describe your role and achievements..."
                                        value={exp.description}
                                        onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto max-h-[60vh] pr-2">
                        <div className="text-center">
                            <h3 className="text-2xl font-serif font-bold text-white">Skills & Expertise</h3>
                            <p className="text-gray-400 mt-2">What do you want to learn or teach?</p>
                        </div>

                        {roles.isMentee && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-[#4ade80]">I want to learn:</label>
                                <div className="flex flex-wrap gap-2">
                                    {wellKnownSkills.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkillToLearn(skill)}
                                            className={`px-3 py-1.5 rounded-full border text-xs transition-all ${formData.skillsToLearn.includes(skill) ? 'bg-[#4ade80] text-[#021f1a] border-[#4ade80]' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-[#021f1a]/50 border border-white/10 text-white pl-4 pr-32 py-3 rounded-xl outline-none"
                                        placeholder="Add more skills to learn..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                toggleSkillToLearn(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {roles.isMentor && (
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <label className="block text-sm font-medium text-[#008ba3]">I can teach:</label>
                                <div className="flex flex-wrap gap-2">
                                    {wellKnownSkills.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkillToTeach(skill)}
                                            className={`px-3 py-1.5 rounded-full border text-xs transition-all ${formData.skillsToTeach.includes(skill) ? 'bg-[#008ba3] text-white border-[#008ba3]' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-[#021f1a]/50 border border-white/10 text-white pl-4 pr-32 py-3 rounded-xl outline-none"
                                        placeholder="Add more skills to teach..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                toggleSkillToTeach(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 7:
                return (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-[#4ade80]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="text-[#4ade80]" size={48} />
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-white">All set!</h3>
                        <p className="text-gray-400">Welcome to the Alum_Connect family!</p>

                        <div className="bg-black/20 rounded-3xl p-6 border border-white/5 text-left">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Role:</span>
                                <span className="text-[#4ade80] font-bold capitalize">{formData.mentorshipRole}</span>
                            </div>
                            <div className="mt-4 text-xs text-gray-500">
                                {roles.isMentee && <p>Learning: {formData.skillsToLearn.slice(0, 3).join(', ')}...</p>}
                                {roles.isMentor && <p>Teaching: {formData.skillsToTeach.slice(0, 3).join(', ')}...</p>}
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
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#4ade80]' : i < step ? 'w-3 bg-[#4ade80]/40' : 'w-3 bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#052e28]/50 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative min-h-[500px] flex flex-col">
                    <div className="flex-grow">
                        {renderStep()}
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                        {step > 1 && step < 7 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all font-bold px-4 py-2"
                            >
                                <ChevronLeft size={20} /> Back
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {step < 7 ? (
                            <button
                                disabled={
                                    (step === 1 && (!formData.domain.trim() || !formData.title.trim() || !formData.location.trim() || !formData.bio.trim() || formData.languages.length === 0)) ||
                                    (step === 4 && (!formData.education[0]?.school.trim() || !formData.education[0]?.degree.trim())) ||
                                    (step === 5 && (!formData.experience[0]?.title.trim() || !formData.experience[0]?.company.trim() || !formData.experience[0]?.description.trim())) ||
                                    (step === 6 && ((roles.isMentee && formData.skillsToLearn.length === 0) || (roles.isMentor && formData.skillsToTeach.length === 0)))
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
