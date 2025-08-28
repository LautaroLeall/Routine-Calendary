import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ActivitiesModal from "../ui/ActivitiesModal";

export default function MonthlyView({ calendar: activeCalendar }) {
    const [refDate, setRefDate] = useState(dayjs());
    const [modalData, setModalData] = useState(null); // { routines, date }

    // Construye arreglo de días para el grid (incluye "huecos" de otras semanas)
    const monthDays = useMemo(() => {
        if (!activeCalendar) return [];
        const startOfMonth = refDate.startOf("month");
        const endOfMonth = refDate.endOf("month");
        const startWeekday = startOfMonth.day(); // 0=Dom..6=Sab

        const prevDays = Array.from({ length: startWeekday }, (_, i) =>
            startOfMonth.subtract(startWeekday - i, "day")
        );
        const currentDays = Array.from({ length: endOfMonth.date() }, (_, i) =>
            startOfMonth.add(i, "day")
        );
        const totalDays = prevDays.concat(currentDays);

        const remainder = 7 - (totalDays.length % 7 || 7);
        const nextDays = remainder < 7
            ? Array.from({ length: remainder }, (_, i) => endOfMonth.add(i + 1, "day"))
            : [];

        return totalDays.concat(nextDays);
    }, [refDate, activeCalendar]);

    const goPrev = () => setRefDate((d) => d.subtract(1, "month"));
    const goNext = () => setRefDate((d) => d.add(1, "month"));
    const goToday = () => setRefDate(dayjs());

    // Rutinas por día (monthly: key = número de día "1".."31")
    const getRoutinesForDay = (day) => {
        if (!activeCalendar) return [];
        const key = String(day.date());
        const template = activeCalendar.template || {};
        const arr = template?.[key] || [];
        return arr.map((it) => (typeof it === "string" ? { routineId: it } : it));
    };

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
    if (activeCalendar.type !== "monthly") {
        return (
            <div className="view-placeholder">
                <h3>El calendario activo no es mensual</h3>
                <p>
                    Selecciona un calendario <strong>mensual</strong> o clona uno para usar la vista mensual.
                </p>
            </div>
        );
    }

    const weekNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    return (
        <div className="monthly-view">
            <div className="monthly-controls mb-4">
                <div className="title-block">
                    <h2>{activeCalendar.name}</h2>
                    <p className="muted small">{refDate.format("MMMM YYYY")}</p>
                </div>
                <div className="controls">
                    <button className="btn small" onClick={goPrev}>
                        <FaArrowLeft style={{ fontSize: "1.5rem" }} />
                    </button>
                    <button className="btn small" onClick={goToday}>Hoy</button>
                    <button className="btn small" onClick={goNext}>
                        <FaArrowRight style={{ fontSize: "1.5rem" }} />
                    </button>
                </div>
            </div>

            {/* Encabezado de días */}
            <div className="month-grid-header">
                {weekNames.map((d) => (
                    <div key={d} className="day-name-header">{d}</div>
                ))}
            </div>

            {/* Grid mensual */}
            <div className="month-grid">
                {monthDays.map((day) => {
                    const routines = getRoutinesForDay(day);
                    const isToday = day.isSame(dayjs(), "day");
                    const isCurrentMonth = day.month() === refDate.month();
                    const hasEvents = routines.length > 0;

                    let bgClass = "day-no-event";
                    if (hasEvents) bgClass = "day-has-event";
                    if (!isCurrentMonth) bgClass = "day-outside";

                    return (
                        <div
                            key={day.format("YYYY-MM-DD")}
                            className={`day-cell ${bgClass} ${isToday ? "today" : ""}`}
                        >
                            <div className="day-header">
                                <div className="day-date">{day.date()}</div>
                            </div>

                            <div className="day-body">
                                {hasEvents ? (
                                    <button
                                        className="btn-event"
                                        onClick={() => setModalData({ routines, date: day })}
                                    >
                                        Ver actividades
                                    </button>
                                ) : (
                                    <div className="no-events">Sin eventos</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal con tus actividades */}
            {modalData && (
                <ActivitiesModal
                    isOpen={!!modalData}
                    routines={modalData.routines}
                    date={modalData.date}
                    onClose={() => setModalData(null)}
                />
            )}
        </div>
    );
}
