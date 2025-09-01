// src/context/AuthProvider.jsx
// - register/login async (hash/compare).
// - updateUser soporta firmas (id, patch) o (patch) y hace validaciones de duplicados.
// - updateUser maneja hashing si recibe `password` en el patch.
// - changePassword robusto (varias firmas posibles de llamada en otros componentes).
// - deleteUser para remover usuarios (y cerrar sesión si era el usuario actual).
// - getCurrentUser / getPublicUserById no exponen passwordHash (usamos _PASSWORD_HASH para evitar warnings).
// - Helpers internos renombrados con _ prefijo para evitar ESLint "unused vars" while retaining them for future use.
// - Uso de useCallback/useMemo y setState funcional.

import { useEffect, useState, useMemo, useCallback } from "react";
import bcrypt from "bcryptjs";
import { AuthContext } from "./authContext";

const STORAGE_KEY = "routine_calendary_users";
const SESSION_KEY = "routine_calendary_current_user_id";

export default function AuthProvider({ children }) {
    // --- Estado: users (array) y currentUserId ---
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

    // --- Persistencia en localStorage ---
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

    // --- Helpers para buscar (prefijados con _ para evitar ESLint unused-var warnings) ---
    // NOTA: Los mantengo aquí por si quieres usarlos en futuras funciones. Están prefijados con `_`
    // para indicar que actualmente no se usan pero son intencionales.
    const _findUserByEmail = useCallback(
        (email) => users.find((u) => u.email === String(email).trim().toLowerCase()),
        [users]
    );

    const _findUserByUsername = useCallback(
        (username) => users.find((u) => u.username === String(username).trim()),
        [users]
    );

    // --- register: crea un usuario nuevo (async por hashing) ---
    const register = useCallback(
        async ({ email, username, password, purpose = [] }) => {
            if (!email || !username || !password)
                throw new Error("Email, usuario y contraseña son requeridos.");

            const normalizedEmail = String(email).trim().toLowerCase();
            const normalizedUsername = String(username).trim();

            // Validaciones rápidas antes de hash (mejor UX)
            if (users.some((u) => u.email === normalizedEmail)) throw new Error("El email ya está registrado.");
            if (users.some((u) => u.username === normalizedUsername)) throw new Error("El nombre de usuario ya está en uso.");

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
        [users]
    );

    // --- login: acepta email o username en identifier ---
    const login = useCallback(
        async ({ identifier, password }) => {
            if (!identifier || !password) throw new Error("Usuario (email o username) y contraseña son requeridos.");

            const normalized = String(identifier).trim();
            const maybeEmail = normalized.toLowerCase();

            const user = users.find(
                (u) => u.email === maybeEmail || u.username === normalized
            );

            if (!user) throw new Error("Credenciales inválidas.");

            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) throw new Error("Credenciales inválidas.");

            setCurrentUserId(user.id);
            return user.id;
        },
        [users]
    );

    // --- logout ---
    const logout = useCallback(() => {
        setCurrentUserId(null);
    }, []);

    // --- updateUser ---
    // Soporta:
    // - Si patch.password está presente, se hashéa y se guarda como passwordHash.
    // - Valida duplicados de email/username usando el `prev` de setUsers para evitar races.
    // - Retorna el usuario actualizado (sin passwordHash).
    const updateUser = useCallback(
        async (...args) => {
            // Resolver firma
            let id;
            let patch;
            if (args.length === 2 && typeof args[0] === "string" && typeof args[1] === "object") {
                id = args[0];
                patch = args[1];
            } else if (args.length === 1 && typeof args[0] === "object") {
                id = currentUserId;
                patch = args[0];
            } else {
                throw new Error("updateUser: firma inválida. Usa updateUser(id, patch) o updateUser(patch).");
            }

            if (!id) throw new Error("updateUser: id de usuario requerido.");

            // Si viene plain `password` en el patch, hashéalo primero
            let processedPatch = { ...patch };
            if (processedPatch.password) {
                const newHash = await bcrypt.hash(String(processedPatch.password), 10);
                processedPatch.passwordHash = newHash;
                delete processedPatch.password;
            }

            // Normalizar email/username si vienen
            if (processedPatch.email) processedPatch.email = String(processedPatch.email).trim().toLowerCase();
            if (processedPatch.username) processedPatch.username = String(processedPatch.username).trim();

            // Actualizamos usando el prev para evitar race conditions y poder validar duplicados contra prev
            let updatedUser = null;
            setUsers((prev) => {
                // Validaciones de duplicados contra `prev`
                if (processedPatch.email && prev.some((other) => other.id !== id && other.email === processedPatch.email)) {
                    throw new Error("El email ya está en uso.");
                }
                if (processedPatch.username && prev.some((other) => other.id !== id && other.username === processedPatch.username)) {
                    throw new Error("El nombre de usuario ya está en uso.");
                }

                return prev.map((u) => {
                    if (u.id !== id) return u;
                    const merged = { ...u, ...processedPatch };
                    updatedUser = merged;
                    return merged;
                });
            });

            if (!updatedUser) throw new Error("Usuario no encontrado.");

            const { passwordHash: _PASSWORD_HASH, ...publicData } = updatedUser;
            return publicData;
        },
        [currentUserId]
    );

    // --- changePassword ---
    // Firma esperada típica: changePassword(id, currentPassword, newPassword)
    // También se puede llamar changePassword(currentPassword, newPassword) si no se pasa id.
    const changePassword = useCallback(
        async (...args) => {
            let idArg;
            let currentPassword;
            let newPassword;

            if (args.length === 3 && typeof args[0] === "string") {
                [idArg, currentPassword, newPassword] = args;
            } else if (args.length === 2) {
                [currentPassword, newPassword] = args;
                idArg = currentUserId;
            } else if (args.length === 1 && typeof args[0] === "object") {
                const obj = args[0];
                idArg = obj.id || currentUserId;
                currentPassword = obj.currentPassword;
                newPassword = obj.newPassword;
            } else {
                throw new Error("changePassword: firma inválida.");
            }

            if (!idArg) throw new Error("changePassword: id de usuario requerido.");
            if (!currentPassword || !newPassword) throw new Error("changePassword: faltan contraseñas.");

            const target = users.find((u) => u.id === idArg);
            if (!target) throw new Error("Usuario no encontrado.");

            const valid = await bcrypt.compare(String(currentPassword), target.passwordHash);
            if (!valid) throw new Error("Contraseña actual incorrecta.");

            const newHash = await bcrypt.hash(String(newPassword), 10);
            setUsers((prev) => prev.map((u) => (u.id === idArg ? { ...u, passwordHash: newHash } : u)));

            return true;
        },
        [users, currentUserId]
    );

    // --- deleteUser: elimina un usuario local (simulado) ---
    const deleteUser = useCallback(
        async (id) => {
            if (!id) throw new Error("deleteUser: id requerido.");
            setUsers((prev) => prev.filter((u) => u.id !== id));
            if (currentUserId === id) {
                setCurrentUserId(null);
            }
            return true;
        },
        [currentUserId]
    );

    // --- Obtener usuario público (sin passwordHash) ---
    const getCurrentUser = useCallback(() => {
        const u = users.find((u) => u.id === currentUserId);
        if (!u) return null;
        const { passwordHash: _PASSWORD_HASH, ...publicData } = u;
        return publicData;
    }, [users, currentUserId]);

    const getPublicUserById = useCallback(
        (id) => {
            const u = users.find((u) => u.id === id);
            if (!u) return null;
            const { passwordHash: _PASSWORD_HASH, ...publicData } = u;
            return publicData;
        },
        [users]
    );

    // --- Derived values memoizados ---
    const user = useMemo(() => getCurrentUser(), [getCurrentUser]);
    const isAuthenticated = useMemo(() => Boolean(user), [user]);

    // --- Context value ---
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
            deleteUser,
            getCurrentUser,
            getPublicUserById,
        }),
        [users, currentUserId, user, isAuthenticated, register, login, logout, updateUser, changePassword, deleteUser, getCurrentUser, getPublicUserById]
    );

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
