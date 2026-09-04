import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('nexus_token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchMe();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchMe = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            localStorage.removeItem('nexus_token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success) {
            localStorage.setItem('nexus_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.message || 'Login failed');
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        if (res.data.success) {
            localStorage.setItem('nexus_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.message || 'Registration failed');
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/auth/logout');
            }
        } catch (e) {
            // Ignore error on logout
        } finally {
            localStorage.removeItem('nexus_token');
            setToken(null);
            setUser(null);
        }
    };

    const updateProfile = async (profileData) => {
        const res = await api.post('/auth/profile', profileData);
        if (res.data.success) {
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.message || 'Gagal memperbarui profil');
    };

    const updatePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
        const res = await api.post('/auth/password', {
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: newPasswordConfirmation,
        });
        return res.data;
    };

    const createStore = async (storeData) => {
        const res = await api.post('/seller/create-store', storeData);
        if (res.data.success) {
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.message || 'Gagal membuat toko');
    };

    const updateLocalBalance = (newBalance) => {
        setUser((prev) => (prev ? { ...prev, balance: newBalance } : prev));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateProfile,
                updatePassword,
                createStore,
                updateLocalBalance,
                fetchMe,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
