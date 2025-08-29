// src/hooks/useAuth.js 
// Hook de conveniencia para consumir AuthContext.
// Retorna todos los métodos y datos del AuthProvider:
//   - user, isAuthenticated
//   - register, login, logout, updateUser, changePassword
//   - getCurrentUser, getPublicUserById
// Debe usarse siempre dentro de un <AuthProvider>.

import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}
