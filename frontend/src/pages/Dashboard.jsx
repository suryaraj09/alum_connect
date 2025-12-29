import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Welcome back, {user?.name}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
                    <p className="text-slate-500">Coming soon: Organic activity feed from your connections and mentorship interests.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Profile Score</span>
                            <span className="font-bold text-primary-600">75/100</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Active Workspaces</span>
                            <span className="font-bold text-primary-600">3</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
