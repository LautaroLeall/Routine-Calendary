// src/context/AuthProvider.jsx
// - Contiene únicamente el componente AuthProvider (export default).
// - Usa AuthContext importado desde authContext.js.
// - Encapsula la lógica de users/session en localStorage (prototipo).
// - Mejora: expone `user` y `isAuthenticated` directamente, y memoiza funciones para evitar re-renders innecesarios.

import { useEffect, useState, useMemo, useCallback } from "react";
import { AuthContext } from "./authContext";

const STORAGE_KEY = "routine_calendary_users";
const SESSION_KEY = "routine_calendary_current_user_id";

export default function AuthProvider({ children }) {
    // users: array de usuarios registrados (prototipo, guardado en localStorage)
    const [users, setUsers] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            console.error("AuthProvider: error leyendo users desde localStorage", err);
            return [];
        }
    });

    // currentUserId: id del usuario en sesión (string) o null
    const [currentUserId, setCurrentUserId] = useState(() => {
        try {
            return localStorage.getItem(SESSION_KEY) || null;
        } catch (err) {
            console.error("AuthProvider: error leyendo session desde localStorage", err);
            return null;
        }
    });

    // Persistir users en localStorage cuando cambian
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        } catch (err) {
            console.error("AuthProvider: error escribiendo users a localStorage", err);
        }
    }, [users]);

    // Persistir currentUserId en localStorage cuando cambia (o remover si es null)
    useEffect(() => {
        try {
            if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
            else localStorage.removeItem(SESSION_KEY);
        } catch (err) {
            console.error("AuthProvider: error guardando session", err);
        }
    }, [currentUserId]);

    // --- Helpers internos (no expuestos directamente, salvo getCurrentUser) ---
    const findUserByEmail = useCallback(
        (email) => users.find((u) => u.email === email),
        [users]
    );

    const findUserByUsername = useCallback(
        (username) => users.find((u) => u.username === username),
        [users]
    );

    // Registrar nuevo usuario (prototipo).
    // - Valida campos, revisa duplicados, guarda en users y setea sesión.
    // - RETURN: id del nuevo usuario.
    const register = useCallback(
        ({ email, username, password, purpose = [] }) => {
            if (!email || !username || !password) throw new Error("Email, usuario y contraseña son requeridos.");
            if (findUserByEmail(email)) throw new Error("El email ya está registrado.");
            if (findUserByUsername(username)) throw new Error("El nombre de usuario ya está en uso.");

            const id = Date.now().toString();
            const nuevo = {
                id,
                email,
                username,
                password, // << SOLO PROTOTIPO: en producción usar hashing + no guardar plaintext.
                purpose: Array.isArray(purpose) ? purpose : [purpose],
                tipoCalendario: null,
                rutinas: []
            };

            // Agregamos el usuario y lo dejamos logueado
            setUsers((prev) => [...prev, nuevo]);
            setCurrentUserId(id);

            return id;
        },
        [findUserByEmail, findUserByUsername]
    );

    // Login prototipo: acepta email o username en 'identifier' y contraseña en 'password'.
    // Si coincide, setea currentUserId.
    const login = useCallback(
        ({ identifier, password }) => {
            if (!identifier || !password) throw new Error("Usuario (email o username) y contraseña son requeridos.");

            const user = users.find((u) =>
                (u.email === identifier || u.username === identifier) && u.password === password
            );

            if (!user) throw new Error("Credenciales inválidas.");
            setCurrentUserId(user.id);
            return user.id;
        },
        [users]
    );

    // Logout: limpia la sesión
    const logout = useCallback(() => {
        setCurrentUserId(null);
    }, []);

    // Actualizar datos de un usuario (patch parcial)
    const updateUser = useCallback((id, patch) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    }, []);

    // Devuelve el usuario conectado o null
    const getCurrentUser = useCallback(() => {
        return users.find((u) => u.id === currentUserId) || null;
    }, [users, currentUserId]);

    // Exponemos `user` y `isAuthenticated` derivados (memoizados)
    const user = useMemo(() => getCurrentUser(), [getCurrentUser]);
    const isAuthenticated = useMemo(() => Boolean(user), [user]);

    // Value del contexto
    const contextValue = useMemo(() => ({
        users,
        currentUserId,
        user,               // usuario ya resuelto (o null)
        isAuthenticated,    // booleano útil
        register,
        login,
        logout,
        updateUser,
        getCurrentUser
    }), [users, currentUserId, user, isAuthenticated, register, login, logout, updateUser, getCurrentUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
