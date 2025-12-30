import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Discovery from './pages/Discovery';
import Profile from './pages/Profile';
import Workspaces from './pages/Workspaces';
import VideoFeed from './pages/VideoFeed';
import Analytics from './pages/Analytics';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const ProfileGate = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  if (user && !user.isProfileComplete) {
    return <Navigate to="/profile" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={<PrivateRoute><ProfileGate><Dashboard /></ProfileGate></PrivateRoute>} />
            <Route path="/discovery" element={<PrivateRoute><ProfileGate><Discovery /></ProfileGate></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/workspaces" element={<PrivateRoute><ProfileGate><Workspaces /></ProfileGate></PrivateRoute>} />
            <Route path="/videos" element={<PrivateRoute><ProfileGate><VideoFeed /></ProfileGate></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><ProfileGate><Analytics /></ProfileGate></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
