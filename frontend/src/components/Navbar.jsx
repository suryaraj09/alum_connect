import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, MessageSquare, Video, PieChart, LayoutDashboard } from 'lucide-react';

const NavLink = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center space-x-2 text-gray-400 hover:text-white font-medium transition-all group py-2">
        <span className="group-hover:text-[#4ade80] transition-colors">{icon}</span>
        <span>{label}</span>
    </Link>
);

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-[#011613] border-b border-[#1a3a35] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="text-2xl font-serif font-bold text-white tracking-tight">
                    Alum<span className="text-[#4ade80]">_</span>Connect
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Home" />
                    <NavLink to="/workspaces" icon={<MessageSquare size={18} />} label="Workspaces" />
                    <NavLink to="/videos" icon={<Video size={18} />} label="Videos" />
                    <NavLink to="/analytics" icon={<PieChart size={18} />} label="Analytics" />
                </div>

                <div className="flex items-center space-x-6">
                    <Link to="/profile" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 rounded-full border-2 border-[#1a3a35] group-hover:border-[#4ade80] flex items-center justify-center bg-[#052e28] text-[#4ade80] font-bold transition-all shadow-inner overflow-hidden">
                            {user.name && user.name[0].toUpperCase()}
                        </div>
                        <span className="hidden sm:inline text-gray-300 group-hover:text-white font-medium transition-colors">{user.name}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors bg-[#052e28] rounded-full"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
