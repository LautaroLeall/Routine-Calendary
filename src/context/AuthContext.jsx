// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// AuthContext
// - Guarda usuarios y sesión en localStorage (solo para prototipo).
// - API: register, login, logout, updateUser, getCurrentUser
// Nota de seguridad: en producción NUNCA guardar contraseñas en texto plano.

const AuthContext = createContext();

const STORAGE_KEY = "routine_calendary_users";
const SESSION_KEY = "routine_calendary_current_user_id";

export function AuthProvider({ children }) {
    // users: array de objetos { id, email, password, tipoCalendario, rutinas: [] }
    const [users, setUsers] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            console.error("AuthContext: error leyendo users desde localStorage", err);
            return [];
        }
    });

    // currentUserId: id del usuario logueado o null
    const [currentUserId, setCurrentUserId] = useState(() => {
        try {
            return localStorage.getItem(SESSION_KEY) || null;
        } catch {
            return null;
        }
    });

    // sincronizar users con localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        } catch (err) {
            console.error("AuthContext: error escribiendo users a localStorage", err);
        }
    }, [users]);

    // sincronizar sesión
    useEffect(() => {
        try {
            if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
            else localStorage.removeItem(SESSION_KEY);
        } catch (err) {
            console.error("AuthContext: error guardando session", err);
        }
    }, [currentUserId]);

    // Helper: buscar usuario por email
    const findUserByEmail = (email) => users.find(u => u.email === email);

    // Registrar nuevo usuario (simple)
    const register = ({ email, password, tipoCalendario = "semanal" }) => {
        if (!email || !password) throw new Error("Email y contraseña son requeridos.");
        if (findUserByEmail(email)) throw new Error("El email ya está registrado.");

        const id = Date.now().toString();
        const nuevo = {
            id,
            email,
            password, // << SOLO PARA PROTOTIPO: NO guardar en texto plano en prod
            tipoCalendario,
            rutinas: []
        };
        setUsers(prev => [...prev, nuevo]);
        setCurrentUserId(id);
        return id;
    };

    // Login (simple comparación de texto)
    const login = ({ email, password }) => {
        if (!email || !password) throw new Error("Email y contraseña son requeridos.");
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error("Credenciales inválidas.");
        setCurrentUserId(user.id);
        return user.id;
    };

    const logout = () => {
        setCurrentUserId(null);
    };

    // Actualizar usuario parcialmente: patch = { key: value }
    const updateUser = (id, patch) => {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
    };

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

// Hook de consumo
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}
