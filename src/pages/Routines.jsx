// src/pages/Routines.jsx
import React from 'react'
import { useAuth } from "../hooks/useAuth";
import NavBar from "../components/ui/NavBar";

const Routines = () => {
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();

    return (
        <>
            <NavBar />
            <div className="container mt-5">
                <h2>Mi Rutinas</h2>
                <p>Bienvenido, <strong>{user?.email}</strong></p>
            </div>
        </>
    )
}

export default Routines