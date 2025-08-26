// src/pages/Dashboard.jsx
// - Página Dashboard (skeleton).
// - Importa NavBar, SummaryCard, KPIChart y muestra datos dummy
// - Más adelante reemplazaremos los datos dummy por datos reales desde AuthContext/useLocalStorage.

import React from "react";
import NavBar from "../components/ui/NavBar";
import SummaryCard from "../components/ui/SummaryCard";
import KPIChart from "../components/charts/KPIChart";
import { FaCheck, FaTimes, FaClock, FaExclamation } from "react-icons/fa";
import "../styles/Dashboard.css"; // crea este archivo si querés reglas específicas

export default function Dashboard() {
    // Datos dummy (en un siguiente paso traeremos datos reales)
    const kpiData = [
        { name: "Completadas", value: 24, color: "#00c176" },
        { name: "Saltadas", value: 6, color: "#ff8a65" },
        { name: "Pospuestas", value: 4, color: "#ffd54f" },
        { name: "No cumplidas", value: 3, color: "#ff6b6b" },
    ];

    const summary = [
        { title: "Completadas", value: 24, delta: "+8%", subtitle: "Últimos 7 días", icon: <FaCheck />, accent: "#00c176" },
        { title: "Saltadas", value: 6, delta: "-2%", subtitle: "Últimos 7 días", icon: <FaTimes />, accent: "#ff8a65" },
        { title: "Pospuestas", value: 4, delta: "+1%", subtitle: "Últimos 7 días", icon: <FaClock />, accent: "#ffd54f" },
        { title: "No cumplidas", value: 3, delta: "-1%", subtitle: "Últimos 7 días", icon: <FaExclamation />, accent: "#ff6b6b" },
    ];

    return (
        <div className="dashboard-page">
            <NavBar />

            <main className="dashboard-main container">
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p className="muted">Resumen rápido de tu actividad y estado actual de tus rutinas.</p>
                </header>

                <section className="kpi-grid">
                    {summary.map((s, idx) => (
                        <SummaryCard
                            key={idx}
                            title={s.title}
                            value={s.value}
                            delta={s.delta}
                            subtitle={s.subtitle}
                            icon={s.icon}
                            accent={s.accent}
                        />
                    ))}
                </section>

                <section className="chart-area">
                    <div className="chart-left">
                        <KPIChart data={kpiData} />
                    </div>

                    <aside className="chart-right">
                        <div className="card-mini">
                            <h3>Actividad reciente</h3>
                            <ul>
                                <li>Hoy: Completaste "Cardio"</li>
                                <li>Ayer: Pospusiste "Piernas"</li>
                                <li>Hace 2 días: Saltaste "Espalda"</li>
                            </ul>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
