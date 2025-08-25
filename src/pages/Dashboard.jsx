import React from "react";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
    const { getCurrentUser, logout } = useAuth();
    const user = getCurrentUser();

    return (
        <div className="container mt-5">
            <h2>Dashboard</h2>
            <p>Bienvenido, <strong>{user?.email}</strong></p>
            <p>Tipo de calendario: <strong>{user?.tipoCalendario}</strong></p>
            <button className="btn btn-secondary" onClick={() => logout()}>Cerrar sesión</button>
        </div>
    );
}
