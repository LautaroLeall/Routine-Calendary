import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const STORAGE_KEY = "routine_calendary_users";
const SESSION_KEY = "routine_calendary_current_user_id";

export function AuthProvider({ children }) {
    const [users, setUsers] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [currentUserId, setCurrentUserId] = useState(() => {
        return localStorage.getItem(SESSION_KEY) || null;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
        else localStorage.removeItem(SESSION_KEY);
    }, [currentUserId]);

    const register = ({ email, password, tipoCalendario }) => {
        // simple validation
        if (users.find(u => u.email === email)) {
            throw new Error("El email ya está registrado");
        }
        const id = Date.now().toString();
        const nuevo = {
            id,
            email,
            password, // << solo para pruebas. NO almacenar contraseñas en texto plano en producción
            tipoCalendario: tipoCalendario || "semanal",
            rutinas: [] // aquí guardaremos las rutinas del usuario
        };
        setUsers(prev => [...prev, nuevo]);
        setCurrentUserId(id);
        return id;
    };

    const login = ({ email, password }) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error("Credenciales inválidas");
        setCurrentUserId(user.id);
        return user.id;
    };

    const logout = () => {
        setCurrentUserId(null);
    };

    const updateUser = (id, patch) => {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
    };

    const getCurrentUser = () => users.find(u => u.id === currentUserId) || null;

    return (
        <AuthContext.Provider value={{ users, currentUserId, register, login, logout, updateUser, getCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
