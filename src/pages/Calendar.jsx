// src/pages/Calendar.jsx
import React from 'react'
import { useAuth } from "../hooks/useAuth";
import NavBar from "../components/ui/Navbar";

const Calendar = () => {
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
    )
}

export default Calendar
