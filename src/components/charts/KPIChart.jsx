// src/components/charts/KPIChart.jsx
// - Donut chart mejorado usando Recharts.
// - Muestra porcentajes en la leyenda y en el tooltip.
// - Props:
//    data: array de { name, value, color, pct? }  (si no hay data muestra fallback)
//    innerRadius, outerRadius: tamaño (opcional)
//    animate: boolean para activar animaciones (opcional)
// - Fix: se removió parámetro 'props' no usado en formatTooltip.

import { useRef, useEffect, useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import "../../styles/KPIChart.css";

export default function KPIChart({ data = [], innerRadius = 60, outerRadius = 90, animate = true }) {
    const containerRef = useRef(null);

    // Evitar que el SVG reciba foco por tab (accesibilidad / UX)
    useEffect(() => {
        const svg = containerRef.current?.querySelector("svg");
        if (svg) {
            svg.setAttribute("tabindex", "-1");
            svg.setAttribute("focusable", "false");
        }
    }, []);

    // Normalizar data y calcular totales y porcentajes
    const { normalized, total, legendPayload } = useMemo(() => {
        const source = Array.isArray(data) && data.length > 0 ? data : [{ name: "Sin datos", value: 1, color: "#2b2b2b" }];
        const totalVal = source.reduce((s, d) => s + (Number(d.value) || 0), 0);

        const formatPct = (num) => {
            if (!totalVal) return "0%";
            const pct = (num / totalVal) * 100;
            if (pct === 0) return "0%";
            if (pct < 1) return `${pct.toFixed(1)}%`;
            return `${Math.round(pct)}%`;
        };

        const norm = source.map((d) => {
            const val = Number(d.value) || 0;
            // preferir pct ya provisto por `data` (por ejemplo de computeKpisFromLogs), si no, calcularlo
            const pctText = d.pct ? d.pct : (totalVal ? formatPct(val) : "0%");
            return { ...d, value: val, pct: pctText };
        });

        const payload = norm.map((d, i) => ({
            id: `legend-${i}`,
            value: `${d.name} — ${d.pct}`,
            type: "square",
            color: d.color || "#999"
        }));

        return { normalized: norm, total: totalVal, legendPayload: payload };
    }, [data]);

    // Tooltip formatter: muestra "valor (xx%)"
    // Nota: eliminamos el tercer parámetro 'props' porque no lo usamos (evita warning ESLint).
    const formatTooltip = (value, name) => {
        const val = Number(value) || 0;
        const pct = total ? (val / total) * 100 : 0;
        let pctText = "0%";
        if (total) {
            if (pct === 0) pctText = "0%";
            else if (pct < 1) pctText = `${pct.toFixed(1)}%`;
            else pctText = `${Math.round(pct)}%`;
        }
        return [`${val} (${pctText})`, name];
    };

    return (
        <div className="kpi-chart-card" ref={containerRef} aria-label="KPI chart">
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={normalized}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={4}
                        startAngle={90}
                        endAngle={-270}
                        labelLine={false}
                        isAnimationActive={!!animate}
                    >
                        {normalized.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || "#888"} />
                        ))}
                    </Pie>

                    <Tooltip formatter={formatTooltip} />
                    <Legend payload={legendPayload} verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
