import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Globe, MessageSquare, Video, PieChart, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                    Alum_Connect
                </Link>

                <div className="hidden md:flex items-center space-x-6">
                    <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavLink to="/discovery" icon={<Globe size={20} />} label="Discovery" />
                    <NavLink to="/workspaces" icon={<MessageSquare size={20} />} label="Workspaces" />
                    <NavLink to="/videos" icon={<Video size={20} />} label="Videos" />
                    <NavLink to="/analytics" icon={<PieChart size={20} />} label="Stats" />
                </div>

                <div className="flex items-center space-x-4">
                    <Link to="/profile" className="flex items-center space-x-2 text-slate-700 hover:text-primary-600 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                            {user.name[0].toUpperCase()}
                        </div>
                        <span className="hidden sm:inline font-medium">{user.name}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center space-x-2 text-slate-600 hover:text-primary-600 font-medium transition-colors">
        {icon}
        <span>{label}</span>
    </Link>
);

export default Navbar;
