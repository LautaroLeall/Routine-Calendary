// src/hooks/useAuth.js
// - Hook de conveniencia para consumir AuthContext.
// - Debe estar en su propio archivo para evitar advertencias del hot-reload.

import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}
