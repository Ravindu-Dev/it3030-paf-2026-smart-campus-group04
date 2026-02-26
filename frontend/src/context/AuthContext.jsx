import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Authentication Context
 *
 * Provides auth state and actions to the entire app:
 * - user: the current user object (null if not logged in)
 * - token: the JWT token (null if not logged in)
 * - isAuthenticated: boolean shortcut
 * - isLoading: true while checking auth on app load
 * - login(credential): send Google credential to backend, store JWT
 * - logout(): clear token and user state
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // On app load, check if we have a stored token and validate it
    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                // Validate the token by calling GET /api/auth/me
                const response = await api.get('/auth/me');
                setUser(response.data.data);
                setToken(storedToken);
            } catch (error) {
                // Token is invalid or expired — clear it
                console.error('Token validation failed:', error);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, []);

    /**
     * Login with Google OAuth credential.
     * Sends the credential to the backend, stores the JWT, and sets user state.
     */
    const login = async (googleCredential) => {
        const response = await api.post('/auth/google', {
            credential: googleCredential,
        });

        const { token: jwtToken, user: userData } = response.data.data;

        // Store token in localStorage for persistence
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);

        return userData;
    };

    /**
     * Logout — clear token and user state.
     */
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to access auth context.
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
