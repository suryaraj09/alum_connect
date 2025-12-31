import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const AuthContext = createContext();
const ALLOWED_DOMAIN = 'ahduni.edu.in';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const register = async (name, email, password) => {
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            throw new Error(`Only university accounts (@${ALLOWED_DOMAIN}) are allowed`);
        }
        const { data } = await api.post('/auth/register', { name, email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        // Force the domain restriction in the Google picker if possible
        provider.setCustomParameters({
            hd: ALLOWED_DOMAIN
        });

        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        if (!firebaseUser.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            await auth.signOut();
            throw new Error(`Only university accounts (@${ALLOWED_DOMAIN}) are allowed`);
        }

        const { data } = await api.post('/auth/google', {
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            googleId: firebaseUser.uid,
            profilePicture: firebaseUser.photoURL
        });

        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        auth.signOut();
    };

    const updateProfileStatus = (status) => {
        const updatedUser = { ...user, isProfileComplete: status };
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateProfileStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
