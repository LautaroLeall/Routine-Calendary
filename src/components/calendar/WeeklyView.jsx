// src/components/calendar/WeeklyView.jsx
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import ActivitiesModal from "../ui/ActivitiesModal";

// WeeklyView
// - Muestra la semana (Lun..Dom) basada en `calendar` que llega por prop.
// - Abre ActivitiesModal cuando el usuario pide "Ver actividades".
// - No navega desde aquí a /routine: el modal tiene el botón "Agregar actividad" que redirige.
export default function WeeklyView({ calendar: activeCalendar }) {
    const [refDate, setRefDate] = useState(dayjs());
    const [modalData, setModalData] = useState(null); // { routines, date } o null

    // Inicio de semana en Lunes
    const startOfWeekMonday = (d) => {
        const dayIndex = d.day(); // 0..6 (Dom..Sab)
        const diff = (dayIndex + 6) % 7;
        return d.subtract(diff, "day").startOf("day");
    };

    // Array con los 7 días (Lun..Dom) a partir de refDate
    const weekDays = useMemo(() => {
        const start = startOfWeekMonday(refDate);
        return Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
    }, [refDate]);

    const goPrev = () => setRefDate((d) => d.subtract(7, "day"));
    const goNext = () => setRefDate((d) => d.add(7, "day"));
    const goToday = () => setRefDate(dayjs());

    // Obtiene las rutinas del día desde calendar.template
    // Key para weekly = day.day() → "0".."6"
    const getRoutinesForDay = (day) => {
        if (!activeCalendar) return [];
        const key = String(day.day());
        const template = activeCalendar.template || {};
        const arr = template?.[key] || [];
        return arr.map((it) => (typeof it === "string" ? { routineId: it } : it));
    };

    // Fallbacks UI si no hay calendario o si no es semanal
    if (!activeCalendar) {
        return (
            <div className="view-placeholder">
                <h3>No hay calendario activo</h3>
                <p>
                    Ve a <strong>Mis Calendarios</strong> y crea o selecciona un calendario para verlo aquí.
                </p>
            </div>
        );
    }

    if (activeCalendar.type !== "weekly") {
        return (
            <div className="view-placeholder">
                <h3>El calendario activo no es semanal</h3>
                <p>
                    Selecciona un calendario <strong>semanal</strong> o clona uno para usar la vista semanal.
                </p>
            </div>
        );
    }

    return (
        <div className="weekly-view">
            {/* Header / controles */}
            <div className="weekly-controls">
                <div className="title-block">
                    <h2>{activeCalendar.name}</h2>
                    <p className="muted small">
                        Semana del {weekDays[0].format("DD MMM YYYY")} — {weekDays[6].format("DD MMM YYYY")}
                    </p>
                </div>

                <div className="controls">
                    <button className="btn small" onClick={goPrev} aria-label="Semana anterior">◀</button>
                    <button className="btn small" onClick={goToday}>Hoy</button>
                    <button className="btn small" onClick={goNext} aria-label="Semana siguiente">▶</button>
                </div>
            </div>

            {/* Grid semanal */}
            <div className="week-grid">
                {weekDays.map((day) => {
                    const routines = getRoutinesForDay(day);
                    const isToday = day.isSame(dayjs(), "day");
                    const hasEvents = routines.length > 0;
                    const bgClass = hasEvents ? "day-has-event" : "day-no-event";

                    return (
                        <div
                            key={day.format("YYYY-MM-DD")}
                            className={`day-cell ${bgClass} ${isToday ? "today" : ""}`}
                        >
                            <div className="day-header">
                                <div className="day-name">{day.format("ddd")}</div>
                                <div className="day-date">{day.format("DD")}</div>
                            </div>

                            <div className="day-body">
                                {hasEvents ? (
                                    // Abre modal de actividades para ese día
                                    <button
                                        className="btn small primary"
                                        onClick={() => setModalData({ routines, date: day })}
                                    >
                                        Ver actividades
                                    </button>
                                ) : (
                                    // Si querés, podés reemplazar esto por un botón que redirija a /routine
                                    <div className="no-events">Sin eventos</div>
                                )}
                            </div>

                            <div className="day-footer">
                                <small>{day.format("ddd DD MMM")}</small>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ActivitiesModal reutilizable (cerrar resetea modalData) */}
            <ActivitiesModal
                isOpen={!!modalData}
                routines={modalData?.routines || []}
                date={modalData?.date}
                onClose={() => setModalData(null)}
            />
        </div>
    );
}
