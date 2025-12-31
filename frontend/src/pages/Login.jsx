import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Github, AtSign } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const ALLOWED_DOMAIN = 'ahduni.edu.in';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            setError(`Only university accounts (@${ALLOWED_DOMAIN}) are allowed`);
            return;
        }

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

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError(err.message || 'Google login failed');
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
                    <p className="text-gray-400">Welcome back! Please enter your university details.</p>
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
                            <label className="block text-sm font-medium text-gray-300 ml-1">University Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4ade80] transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    className="w-full bg-[#021f1a]/50 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#4ade80]/20 focus:border-[#4ade80] transition-all outline-none placeholder:text-gray-600"
                                    placeholder={`your@${ALLOWED_DOMAIN}`}
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

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        University Google Account
                    </button>

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
