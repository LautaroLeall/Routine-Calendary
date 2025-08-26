// src/components/ui/SummaryCard.jsx
// - Tarjeta de resumen KPI reutilizable.
// - Props:
//    title (string): título de la tarjeta.
//    value (string|number): valor principal grande.
//    delta (string|number): cambio relativo (p.e. "+8%") opcional.
//    subtitle (string): texto pequeño debajo del valor.
//    icon (React node): ícono opcional a la izquierda.
//    accent (string): color de acento CSS (opcional).
// - Diseño pensado para encajar en grids responsivos del Dashboard.

import React from "react";
import "../../styles/SummaryCard.css";

export default function SummaryCard({ title, value, delta, subtitle, icon, accent = "#0d6efd" }) {
    return (
        <div className="sc-card" style={{ borderColor: accent }}>
            <div className="sc-left">
                {icon ? <div className="sc-icon" style={{ background: accent }}>{icon}</div> : null}
            </div>

            <div className="sc-main">
                <div className="sc-top">
                    <span className="sc-title">{title}</span>
                    {delta !== undefined && (
                        <span className={`sc-delta ${String(delta).startsWith("-") ? "neg" : "pos"}`}>
                            {delta}
                        </span>
                    )}
                </div>

                <div className="sc-value">{value}</div>
                {subtitle && <div className="sc-sub">{subtitle}</div>}
            </div>
        </div>
    );
}
