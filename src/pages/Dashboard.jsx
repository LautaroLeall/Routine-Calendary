// src/pages/Dashboard.jsx
import React from 'react'
import { useAuth } from "../hooks/useAuth";
import NavBar from "../components/ui/Navbar";

export default function Dashboard() {
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();

    return (
        <>
            <NavBar />
            <div className="container mt-5">
                <h2>Mi Calendario</h2>
                <p>Bienvenido, <strong>{user?.email}</strong></p>
            </div>
        </>
    );
}
