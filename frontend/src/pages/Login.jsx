import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Github, AtSign } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#021f1a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4ade80]/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#008ba3]/5 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl font-serif font-bold text-white tracking-tight mb-2">
                        Alum<span className="text-[#4ade80]">_</span>Connect
                    </h1>
                    <p className="text-gray-400">Welcome back! Please enter your details.</p>
                </div>

                <div className="bg-[#052e28]/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-500">
                    <h2 className="text-2xl font-serif font-bold text-white mb-8 text-center">Sign In</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-sm flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4ade80] transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                                <button type="button" className="text-xs text-[#4ade80] hover:underline">Forgot password?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4ade80] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#4ade80] text-[#021f1a] font-bold py-4 rounded-2xl transition-all shadow-xl shadow-[#4ade80]/10 flex items-center justify-center gap-3 hover:bg-[#34d399] active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-[#021f1a]/30 border-t-[#021f1a] rounded-full animate-spin"></div>
                            ) : (
                                <><LogIn size={20} /> Sign In</>
                            )}
                        </button>
                    </form>

                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#052e28]/5 px-4 text-gray-500">Or continue with</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-2xl hover:bg-white/10 transition-all active:scale-[0.98]">
                            <Github size={18} /> GitHub
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-2xl hover:bg-white/10 transition-all active:scale-[0.98]">
                            <AtSign size={18} /> Google
                        </button>
                    </div>

                    <p className="text-center mt-10 text-gray-400 text-sm">
                        Don't have an account yet? <Link to="/signup" className="text-[#4ade80] font-bold hover:underline">Create account</Link>
                    </p>
                </div>

                <p className="text-center text-gray-600 text-xs mt-8">
                    © 2025 Alum_Connect. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
