// src/context/AuthProvider.jsx
// - Contiene únicamente el componente AuthProvider (export default).
// - Usa AuthContext importado desde authContext.js.
// - Encapsula la lógica de users/session en localStorage (prototipo).

import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";

const STORAGE_KEY = "routine_calendary_users";
const SESSION_KEY = "routine_calendary_current_user_id";

export default function AuthProvider({ children }) {
    const [users, setUsers] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            console.error("AuthProvider: error leyendo users desde localStorage", err);
            return [];
        }
    });

    const [currentUserId, setCurrentUserId] = useState(() => {
        try {
            return localStorage.getItem(SESSION_KEY) || null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        } catch (err) {
            console.error("AuthProvider: error escribiendo users a localStorage", err);
        }
    }, [users]);

    useEffect(() => {
        try {
            if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
            else localStorage.removeItem(SESSION_KEY);
        } catch (err) {
            console.error("AuthProvider: error guardando session", err);
        }
    }, [currentUserId]);

    // Helpers
    const findUserByEmail = (email) => users.find((u) => u.email === email);
    const findUserByUsername = (username) => users.find((u) => u.username === username);

    const register = ({ email, username, password, purpose = [] }) => {
        if (!email || !username || !password) throw new Error("Email, usuario y contraseña son requeridos.");
        if (findUserByEmail(email)) throw new Error("El email ya está registrado.");
        if (findUserByUsername(username)) throw new Error("El nombre de usuario ya está en uso.");

        const id = Date.now().toString();
        const nuevo = {
            id,
            email,
            username,
            password, // << SOLO PROTOTIPO: en producción usar hashing
            purpose: Array.isArray(purpose) ? purpose : [purpose],
            tipoCalendario: null,
            rutinas: []
        };
        setUsers((prev) => [...prev, nuevo]);
        setCurrentUserId(id);
        return id;
    };

    const login = ({ identifier, password }) => {
        if (!identifier || !password) throw new Error("Usuario (email o username) y contraseña son requeridos.");

        const user = users.find((u) =>
            (u.email === identifier || u.username === identifier) && u.password === password
        );

        if (!user) throw new Error("Credenciales inválidas.");
        setCurrentUserId(user.id);
        return user.id;
    };

    const logout = () => setCurrentUserId(null);

    const updateUser = (id, patch) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    };

    const getCurrentUser = () => users.find((u) => u.id === currentUserId) || null;

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
