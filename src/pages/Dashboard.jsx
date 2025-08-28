// src/pages/Dashboard.jsx
// Dashboard conectado a datos reales (useAppData).
// Muestra:
//   * Summary KPIs (últimos 7 días)
//   * Gráfico KPI
//   * CalendarMini (modo semanal por defecto)
//   * Actividad reciente
// Si no hay datos → fallback a mensaje.

import { useMemo } from "react";
import NavBar from "../components/ui/NavBar";
import SummaryCard from "../components/ui/SummaryCard";
import KPIChart from "../components/charts/KPIChart";
import CalendarMini from "../components/ui/CalendarMini";
import { useAppData } from "../hooks/useAppData";
import { computeKpisFromLogs } from "../utils/metrics";
import { FaCheck, FaTimes, FaClock, FaExclamation } from "react-icons/fa";
import "../styles/Dashboard.css";

export default function Dashboard() {
    // --- 0) Hook custom → devuelve [userData, saveUserData] ---
    const [userData, saveUserData] = useAppData();

    // --- 1) Normalización de logs ---
    // Siempre devolvemos un array, aunque userData.logs sea undefined.
    // useMemo evita recrear un array en cada render.
    const logs = useMemo(
        () => (Array.isArray(userData?.logs) ? userData.logs : []),
        [userData?.logs]
    );

    // --- 2) Calendario activo ---
    const activeCalendar = userData?.calendars?.[userData?.activeCalendarId] || null;

    // --- 3) Calcular KPIs ---
    // Ahora también recuperamos meta (con info del rango de fechas).
    const { summary, kpiData, meta } = useMemo(() => {
        if (logs.length === 0) {
            return { summary: [], kpiData: [], meta: { days: 0, start: null, end: null } };
        }
        return computeKpisFromLogs(logs, { days: 7 });
    }, [logs]);

    // --- 4) Demo opcional ---
    // Seed de datos de prueba si logs están vacíos
    const ensureDemo = false;
    if (ensureDemo && logs.length === 0 && userData) {
        const todayISO = new Date().toISOString().split("T")[0];
        const demoLogs = [
            { date: todayISO, routineId: "rut_demo_1", status: "completed" },
            { date: todayISO, routineId: "rut_demo_2", status: "skipped" }
        ];
        saveUserData({ ...userData, logs: demoLogs });
    }

    // --- 5) Configuración de summary cards ---
    const summaryCards = [
        { title: "Completadas", icon: <FaCheck />, accent: "#00c176" },
        { title: "Saltadas", icon: <FaTimes />, accent: "#ff8a65" },
        { title: "Pospuestas", icon: <FaClock />, accent: "#ffd54f" },
        { title: "No cumplidas", icon: <FaExclamation />, accent: "#ff6b6b" },
    ];

    // --- 6) Early return si no hay datos de usuario ---
    if (!userData) {
        return (
            <>
                <NavBar />
                <main className="dashboard-main container">
                    <h1>Dashboard</h1>
                    <p className="muted">Inicia sesión para ver tus rutinas.</p>
                </main>
            </>
        );
    }

    // --- 7) Render principal ---
    return (
        <div className="dashboard-page">
            <NavBar />
            <main className="dashboard-main container">
                {/* Header */}
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p className="muted">
                        Resumen rápido de tu actividad y estado actual de tus rutinas.
                    </p>
                    {/*  mostrar rango de fechas analizado */}
                    {meta?.days > 0 && (
                        <p className="muted small">
                            Analizando últimos {meta.days} días ({meta.start} → {meta.end})
                        </p>
                    )}
                </header>

                {/* KPI cards */}
                <section className="kpi-grid">
                    {summary.map((s, idx) => (
                        <SummaryCard
                            key={s.key || idx}
                            title={s.title}
                            value={s.value}
                            delta={s.delta}
                            subtitle="Últimos 7 días"
                            icon={summaryCards[idx]?.icon}
                            accent={summaryCards[idx]?.accent}
                        />
                    ))}
                </section>

                {/* Chart + CalendarMini + Recent Activity */}
                <section className="chart-area">
                    <div className="chart-left">
                        <KPIChart data={kpiData} />
                        <div style={{ marginTop: 12 }}>
                            <CalendarMini calendar={activeCalendar} />
                        </div>
                    </div>

                    <aside className="chart-right">
                        <div className="card-mini">
                            <h3>Actividad reciente</h3>
                            <ul>
                                {logs.slice(-6).reverse().map((l, i) => (
                                    <li key={`${l.date}-${i}`}>
                                        {l.date}: {l.status} — {l.routineId}
                                    </li>
                                ))}
                                {logs.length === 0 && (
                                    <li>No hay actividad reciente.</li>
                                )}
                            </ul>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
