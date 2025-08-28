// src/components/calendar/CalendarCard.jsx
import React from "react";
import { FaCalendarAlt, FaCalendarWeek } from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// Card simple para mostrar un calendario.
// Props:
// - calendar: objeto calendar
// - onOpen, onClone, onDelete: callbacks
export default function CalendarCard({ calendar, onOpen, onClone, onDelete }) {
    const isWeekly = calendar.type === "weekly";

    return (
        <motion.div className="calendar-card" whileHover={{ scale: 1.02 }}>
            <div className="card-top" style={{ borderLeft: `5px solid ${calendar.color || "#00c176"}` }}>
                <div className="card-title ms-1">{calendar.name}</div>
                <div className="card-type">{isWeekly ? <FaCalendarWeek /> : <FaCalendarAlt />} {isWeekly ? "Semanal" : "Mensual"}</div>
            </div>

            <div className="card-actions my-3 mx-5 gap-5">
                <button className="btn btn-open" onClick={onOpen}>Abrir</button>
                <button className="btn btn-clone" onClick={onClone}>Clonar</button>
                <button className="btn btn-delete" onClick={onDelete}>Eliminar</button>
            </div>

            <div className="card-meta">
                <small>Creado: {new Date(calendar.createdAt).toLocaleDateString()}</small>
            </div>
        </motion.div>
    );
}
