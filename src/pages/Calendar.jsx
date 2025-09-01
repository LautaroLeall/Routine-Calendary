// src/pages/Calendar.jsx
import { useState } from "react";
import NavBar from "../components/ui/NavBar";
import CalendarShell from "../components/calendar/CalendarShell";
import WeeklyView from "../components/calendar/WeeklyView";
import MonthlyView from "../components/calendar/MonthlyView";
import CalendarList from "../components/calendar/CalendarList";
import useCalendars from "../hooks/useCalendars";
import useInitDemo from "../hooks/useInitDemo";

import "../styles/Calendar.css";
import "../styles/CalendarAlert.css";
import "../styles/CalendarCard.css";
import "../styles/CalendarList.css";
import "../styles/CalendarMonthly.css";
import "../styles/CalendarShell.css";
import "../styles/CalendarWeek.css";

// Página principal /calendar
// - Contiene la estructura principal y cambia entre pestañas: semanal, mensual, mis calendarios.
// - WeeklyView y MonthlyView se renderizan según el calendario activo.
// - CalendarList permite abrir, clonar y eliminar calendarios.
export default function CalendarPage() {
    // tab: 'weekly' | 'monthly' | 'list'
    const [tab, setTab] = useState("list");

    // Hook para acceder a calendarios y calendario activo
    const { calendars, activeCalendarId } = useCalendars();
    const activeCalendar = calendars[activeCalendarId];

    // Hook para asegurar que siempre haya un calendario activo
    useInitDemo();

    // Función para cambiar de pestaña
    const goToTab = (t) => setTab(t);

    return (
        <div className="calendar-page">
            <NavBar />
            <main className="calendar-main container">
                {/* Shell contiene título, frase y botones (lógica visual) */}
                <CalendarShell activeTab={tab} onChangeTab={goToTab} />

                {/* Contenido principal según pestaña */}
                <section className="calendar-content">
                    {tab === "weekly" && <WeeklyView calendar={activeCalendar} />}
                    {tab === "monthly" && <MonthlyView calendar={activeCalendar} />}
                    {tab === "list" && (
                        <CalendarList
                            onOpen={(calType) => setTab(calType)}
                        />
                    )}
                </section>
            </main>
        </div>
    );
}
