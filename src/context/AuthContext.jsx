// src/context/AuthContext.jsx
// - Provee un contexto de autenticación para la app (registro, login, logout).
// - Guarda usuarios y la sesión en localStorage (solo para prototipo).
// - Expone funciones: register, login, logout, updateUser, getCurrentUser.
// - Esta implementación **NO** es segura para producción (contraseñas en texto plano).
// - Ideal para prototipado local; más adelante migrarás a Firebase/Supabase.

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const STORAGE_KEY = "routine_calendary_users";
const SESSION_KEY = "routine_calendary_current_user_id";

export function AuthProvider({ children }) {
    // Estado: lista de usuarios (leída desde localStorage al iniciar)
    const [users, setUsers] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            console.error("AuthContext: error leyendo users desde localStorage", err);
            return [];
        }
    });

    // Estado: id del usuario actualmente logueado (o null)
    const [currentUserId, setCurrentUserId] = useState(() => {
        try {
            return localStorage.getItem(SESSION_KEY) || null;
        } catch {
            return null;
        }
    });

    // Sincroniza 'users' en localStorage cada vez que cambia
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        } catch (err) {
            console.error("AuthContext: error escribiendo users a localStorage", err);
        }
    }, [users]);

    // Sincroniza la sesión actual en localStorage
    useEffect(() => {
        try {
            if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
            else localStorage.removeItem(SESSION_KEY);
        } catch (err) {
            console.error("AuthContext: error guardando session", err);
        }
    }, [currentUserId]);

    // ---------- Helpers ----------
    const findUserByEmail = (email) => users.find(u => u.email === email);
    const findUserByUsername = (username) => users.find(u => u.username === username);

    // ---------- API pública ----------
    // register({ email, username, password, purpose })
    // - Crea un usuario nuevo y lo loguea.
    // - Lanza un Error si faltan campos o email/username ya existen.
    const register = ({ email, username, password, purpose = "general" }) => {
        if (!email || !username || !password) throw new Error("Email, usuario y contraseña son requeridos.");
        if (findUserByEmail(email)) throw new Error("El email ya está registrado.");
        if (findUserByUsername(username)) throw new Error("El nombre de usuario ya está en uso.");

        const id = Date.now().toString();
        const nuevo = {
            id,
            email,
            username,
            password, // << SOLO PARA PROTOTIPO: en prod usar hashing
            purpose,
            tipoCalendario: null, // se definirá cuando el usuario cree su primera rutina
            rutinas: []
        };
        setUsers(prev => [...prev, nuevo]);
        setCurrentUserId(id);
        return id;
    };

    // login({ identifier, password })
    // - identifier puede ser email o username.
    // - Lanza Error si credenciales inválidas.
    const login = ({ identifier, password }) => {
        if (!identifier || !password) throw new Error("Usuario (email o username) y contraseña son requeridos.");

        const user = users.find(u =>
            (u.email === identifier || u.username === identifier) && u.password === password
        );

        if (!user) throw new Error("Credenciales inválidas.");
        setCurrentUserId(user.id);
        return user.id;
    };

    const logout = () => setCurrentUserId(null);

    // updateUser(id, patch)
    // - Actualiza parcialmente un usuario (por ejemplo: tipoCalendario, purpose, rutinas).
    const updateUser = (id, patch) => {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
    };

    // Devuelve el usuario actualmente logueado (objeto) o null
    const getCurrentUser = () => users.find(u => u.id === currentUserId) || null;

    return (
        <AuthContext.Provider value={{
            users,
            currentUserId,
            register,
            login,
            logout,
            updateUser,
            getCurrentUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook de conveniencia para usar el contexto
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}
