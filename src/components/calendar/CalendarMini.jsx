// src/components/calendar/CalendarMini.jsx
// - Vista compacta semanal (preview) mostrando cantidad de rutinas por día.
// - Props:
//    - calendar: objeto calendario activo (puede ser null)
//    - mode: "week" | "month" (opcional, por defecto "week") -> la vista "month" está preparada para extender en el futuro
//
// calendar.routines puede ser:
//   - semanal: { "Lunes": ["rut_1","rut_2"], ... }
//   - mensual: { "2025-08-26": ["rut_3"], ... }

import React from "react";
import "../../styles/CalendarMini.css";

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// formatea fecha YYYY-MM-DD
function formatISO(d) {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function CalendarMini({ calendar, mode = "week" }) {
    // fallback si no hay calendario
    if (!calendar) return <div className="cm-mini empty">Sin calendario activo</div>;

    // datos básicos
    const today = new Date();
    const todayISO = formatISO(today);

    // cálculo del lunes de la semana actual (0 = Lunes)
    const dayOfWeek = (today.getDay() + 6) % 7; // transformamos: Sun(0)->6, Mon(1)->0, etc.
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    // Por ahora solo modo "week" (compacto). Si pasa "month" podemos extender.
    if (mode === "week") {
        const days = WEEK_DAYS.map((label, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const iso = formatISO(date);

            let count = 0;
            if ((calendar.type || "semanal") === "semanal") {
                const arr = calendar.routines?.[label] || [];
                count = Array.isArray(arr) ? arr.length : 0;
            } else {
                // calendario mensual u otro: buscar por ISO
                const arr = calendar.routines?.[iso] || [];
                count = Array.isArray(arr) ? arr.length : 0;
            }

            const isToday = iso === todayISO;
            return { label, iso, count, isToday };
        });

        return (
            <div className="cm-mini" role="region" aria-label="Vista compacta semanal">
                <div className="cm-title">Semana</div>
                <div className="cm-grid">
                    {days.map((d) => (
                        <div
                            key={d.iso}
                            className={`cm-day ${d.isToday ? "today" : ""}`}
                            title={`${d.label} — ${d.count} rutina${d.count !== 1 ? "s" : ""}`}
                            aria-label={`${d.label}, ${d.count} rutina${d.count !== 1 ? "s" : ""}`}
                        >
                            <div className="cm-day-label">{d.label.slice(0, 3)}</div>
                            <div className={`cm-dot ${d.count > 0 ? "active" : ""}`}>
                                {d.count > 0 ? d.count : ""}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Placeholder si en un futuro solicitas month (por ahora devolvemos un aviso elegante)
    return <div className="cm-mini empty">Modo mensual (próximamente)</div>;
}
