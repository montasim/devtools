'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';

interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, name: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateName: (name: string) => Promise<boolean>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const res = await apiClient.get<User>('/api/auth/me');
            if (res.ok && res.data) {
                setUser(res.data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await apiClient.post<User>('/api/auth/login', { email, password });
            if (res.ok && res.data) {
                setUser(res.data);
                return true;
            }
            handleApiError(res.error?.message ?? 'Login failed');
            return false;
        } catch (error) {
            handleApiError('Login failed', error);
            return false;
        }
    }, []);

    const signup = useCallback(
        async (email: string, password: string, name: string): Promise<boolean> => {
            try {
                const res = await apiClient.post<User>('/api/auth/register/verify-otp', {
                    email,
                    password,
                    name,
                });
                if (res.ok && res.data) {
                    setUser(res.data);
                    return true;
                }
                handleApiError(res.error?.message ?? 'Signup failed');
                return false;
            } catch (error) {
                handleApiError('Signup failed', error);
                return false;
            }
        },
        [],
    );

    const logout = useCallback(async () => {
        try {
            await apiClient.post('/api/auth/logout');
            setUser(null);
        } catch (error) {
            handleApiError('Logout failed', error);
        }
    }, []);

    const updateName = useCallback(async (name: string): Promise<boolean> => {
        try {
            const res = await apiClient.post<User>('/api/auth/update-name', { name });
            if (res.ok && res.data) {
                setUser(res.data);
                return true;
            }
            handleApiError(res.error?.message ?? 'Failed to update name');
            return false;
        } catch (error) {
            handleApiError('Failed to update name', error);
            return false;
        }
    }, []);

    const updatePassword = useCallback(
        async (currentPassword: string, newPassword: string): Promise<boolean> => {
            try {
                const res = await apiClient.post('/api/auth/update-password', {
                    currentPassword,
                    newPassword,
                });
                if (res.ok) return true;
                handleApiError(res.error?.message ?? 'Failed to update password');
                return false;
            } catch (error) {
                handleApiError('Failed to update password', error);
                return false;
            }
        },
        [],
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                updateName,
                updatePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
