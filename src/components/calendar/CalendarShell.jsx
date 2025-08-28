// src/components/calendar/CalendarShell.jsx
import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// Componente visual que muestra el header del calendario:
// - Título "Calendario"
// - Frase descriptiva
// - Botones: Semanal Mensual Mis Calendarios + Nuevo Calendario
// - No ejecuta la lógica de crear/editar: delega mediante callbacks

export default function CalendarShell({ activeTab = "list", onChangeTab }) {
    return (
        <header className="calendar-shell">
            <div className="calendar-shell-left">
                <h1>Calendario</h1>
                <p className="muted">Organiza y visualiza tus rutinas por semana o por mes.</p>
            </div>

            <div className="calendar-shell-right">
                <nav className="calendar-tabs" role="tablist" aria-label="Vista del calendario">
                    <motion.button
                        className={`tab-btn ${activeTab === "weekly" ? "active" : ""}`}
                        onClick={() => onChangeTab("weekly")}
                        aria-pressed={activeTab === "weekly"}
                    >
                        Semanal
                    </motion.button>

                    <motion.button
                        className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
                        onClick={() => onChangeTab("monthly")}
                        aria-pressed={activeTab === "monthly"}
                    >
                        Mensual
                    </motion.button>

                    <motion.button
                        className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
                        onClick={() => onChangeTab("list")}
                        aria-pressed={activeTab === "list"}
                    >
                        Mis Calendarios
                    </motion.button>
                </nav>
            </div>
        </header>
    );
}