// src/hooks/useInitDemo.js
// Crea calendarios demo (semanal + mensual) SOLO si no hay ninguno.
// El semanal queda activo. Todo con template inicial para que se vean eventos.

import { useEffect } from "react";
import useCalendars from "./useCalendars";

export default function useInitDemo() {
    const { calendars, createCalendar, setActiveCalendar } = useCalendars();

    useEffect(() => {
        if (calendars && Object.keys(calendars).length > 0) return;

        // Semanal demo (eventos en Lun, Mié, Vie)
        const weeklyDemo = createCalendar({
            name: "Semana Demo",
            type: "weekly",
            template: {
                "0": [],
                "1": [{ routineId: "Rutina 1" }, { routineId: "Rutina 2" }],
                "2": [],
                "3": [{ routineId: "Rutina 3" }],
                "4": [],
                "5": [{ routineId: "Rutina 4" }, { routineId: "Rutina 5" }],
                "6": [],
            },
        });
        setActiveCalendar(weeklyDemo.id);

        // Mensual demo (eventos en hoy, +2 y +5)
        const d = new Date();
        const day = d.getDate();
        createCalendar({
            name: "Mes Demo",
            type: "monthly",
            template: {
                [String(day)]: [{ routineId: "Rutina A" }, { routineId: "Rutina B" }],
                [String(day + 2)]: [{ routineId: "Rutina C" }],
                [String(day + 5)]: [{ routineId: "Rutina D" }, { routineId: "Rutina E" }],
            },
        });
    }, [calendars, createCalendar, setActiveCalendar]);
}
