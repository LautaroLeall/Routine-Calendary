// src/components/ui/SummaryCard.jsx
// - Tarjeta de resumen KPI reutilizable.
// - Props:
//    title: string
//    value: string|number
//    delta: string|number (opcional, p.e. "+8%" or "-2")

import React from "react";
import "../../styles/SummaryCard.css";

export default function SummaryCard({ title, value, delta, subtitle, icon, accent = "#0d6efd" }) {
    // Normalizar delta para clase (positivo/negativo/neutral)
    const deltaStr = delta !== undefined && delta !== null ? String(delta) : null;
    const deltaClass = deltaStr ? (deltaStr.startsWith("-") ? "neg" : "pos") : "neutral";

    return (
        <article className="sc-card" style={{ borderColor: accent }} role="region" aria-label={`${title} — ${value}`}>
            <div className="sc-left" aria-hidden={!icon}>
                {icon ? (
                    <div className="sc-icon" style={{ background: accent }}>{icon}</div>
                ) : (
                    <div className="sc-icon sc-icon--placeholder" style={{ background: accent }}>{title?.slice(0, 1) || "·"}</div>
                )}
            </div>

            <div className="sc-main">
                <div className="sc-top">
                    <span className="sc-title">{title}</span>
                    {deltaStr !== null && (
                        <span className={`sc-delta ${deltaClass}`} aria-hidden="false">
                            {deltaStr}
                        </span>
                    )}
                </div>

                <div className="sc-value" aria-live="polite">{value ?? "0"}</div>
                {subtitle && <div className="sc-sub">{subtitle}</div>}
            </div>
        </article>
    );
}
