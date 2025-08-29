// src/context/AuthProvider.jsx
// 1. Se reemplaza el almacenamiento de contraseñas en texto plano por bcryptjs (passwordHash).
// 2. Normalización de email/username (trim + toLowerCase para emails).
// 3. Función changePassword añadida para actualizar la contraseña de manera segura.
// 4. updateUser valida duplicados de email/username antes de actualizar.
// 5. getCurrentUser y getPublicUserById no exponen passwordHash.
// 6. register y login ahora son async para manejar hashing de contraseñas.
// 7. Uso consistente de useCallback + useMemo para evitar re-renders innecesarios.

import { useEffect, useState, useMemo, useCallback } from "react";
import bcrypt from "bcryptjs";
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
        } catch (err) {
            console.error("AuthProvider: error leyendo session desde localStorage", err);
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

    // --- Helpers internos ---
    const findUserByEmail = useCallback(
        (email) => users.find((u) => u.email === email.trim().toLowerCase()),
        [users]
    );

    const findUserByUsername = useCallback(
        (username) => users.find((u) => u.username === username.trim()),
        [users]
    );

    // --- Registro ---
    const register = useCallback(
        async ({ email, username, password, purpose = [] }) => {
            if (!email || !username || !password)
                throw new Error("Email, usuario y contraseña son requeridos.");

            const normalizedEmail = email.trim().toLowerCase();
            const normalizedUsername = username.trim();

            if (findUserByEmail(normalizedEmail)) throw new Error("El email ya está registrado.");
            if (findUserByUsername(normalizedUsername)) throw new Error("El nombre de usuario ya está en uso.");

            const id = Date.now().toString();
            const passwordHash = await bcrypt.hash(password, 10);

            const nuevo = {
                id,
                email: normalizedEmail,
                username: normalizedUsername,
                passwordHash,
                purpose: Array.isArray(purpose) ? purpose : [purpose],
                tipoCalendario: null,
                rutinas: [],
            };

            setUsers((prev) => [...prev, nuevo]);
            setCurrentUserId(id);

            return id;
        },
        [findUserByEmail, findUserByUsername]
    );

    // --- Login ---
    const login = useCallback(
        async ({ identifier, password }) => {
            if (!identifier || !password) throw new Error("Usuario (email o username) y contraseña son requeridos.");

            const user = users.find(
                (u) =>
                    (u.email === identifier.trim().toLowerCase() || u.username === identifier.trim())
            );

            if (!user) throw new Error("Credenciales inválidas.");

            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) throw new Error("Credenciales inválidas.");

            setCurrentUserId(user.id);
            return user.id;
        },
        [users]
    );

    // --- Logout ---
    const logout = useCallback(() => {
        setCurrentUserId(null);
    }, []);

    // --- Update user ---
    const updateUser = useCallback(
        (id, patch) => {
            setUsers((prev) =>
                prev.map((u) => {
                    if (u.id !== id) return u;

                    const updated = { ...u, ...patch };

                    if (patch.email) {
                        const normalizedEmail = patch.email.trim().toLowerCase();
                        if (users.some((other) => other.id !== id && other.email === normalizedEmail))
                            throw new Error("El email ya está en uso.");
                        updated.email = normalizedEmail;
                    }

                    if (patch.username) {
                        const normalizedUsername = patch.username.trim();
                        if (users.some((other) => other.id !== id && other.username === normalizedUsername))
                            throw new Error("El nombre de usuario ya está en uso.");
                        updated.username = normalizedUsername;
                    }

                    return updated;
                })
            );
        },
        [users]
    );

    // --- Change password ---
    const changePassword = useCallback(
        async (id, currentPassword, newPassword) => {
            const user = users.find((u) => u.id === id);
            if (!user) throw new Error("Usuario no encontrado.");
            const valid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!valid) throw new Error("Contraseña actual incorrecta.");
            const newHash = await bcrypt.hash(newPassword, 10);
            updateUser(id, { passwordHash: newHash });
            return true;
        },
        [users, updateUser]
    );

    // --- Obtener usuario ---
    const getCurrentUser = useCallback(() => {
        const u = users.find((u) => u.id === currentUserId);
        if (!u) return null;
        const { passwordHash: _passwordHash, ...publicData } = u;
        return publicData;
    }, [users, currentUserId]);

    const getPublicUserById = useCallback(
        (id) => {
            const u = users.find((u) => u.id === id);
            if (!u) return null;
            const { passwordHash: _passwordHash, ...publicData } = u;
            return publicData;
        },
        [users]
    );

    // --- Memoized ---
    const user = useMemo(() => getCurrentUser(), [getCurrentUser]);
    const isAuthenticated = useMemo(() => Boolean(user), [user]);

    const contextValue = useMemo(
        () => ({
            users,
            currentUserId,
            user,
            isAuthenticated,
            register,
            login,
            logout,
            updateUser,
            changePassword,
            getCurrentUser,
            getPublicUserById,
        }),
        [users, currentUserId, user, isAuthenticated, register, login, logout, updateUser, changePassword, getCurrentUser, getPublicUserById]
    );

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
