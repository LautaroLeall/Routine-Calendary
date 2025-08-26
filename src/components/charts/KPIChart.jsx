// src/components/charts/KPIChart.jsx
// - Donut chart simple usando Recharts.
// - Props:
//    data: array de { name, value, color }
//    innerRadius, outerRadius: tamaño (opcional)
// - Exporta un gráfico responsive listo para Dashboard.
import React, { useRef, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import "../../styles/KPIChart.css";

export default function KPIChart({ data = [], innerRadius = 60, outerRadius = 90 }) {
    const containerRef = useRef(null);

    useEffect(() => {
        // Al montar: buscar el <svg> interno de Recharts y evitar que sea focusable por defecto
        const svg = containerRef.current?.querySelector("svg");
        if (svg) {
            svg.setAttribute("tabindex", "-1");    // evita que reciba tab por teclado
            svg.setAttribute("focusable", "false"); // para compatibilidad SVG/IE
        }
    }, []);

    const total = data.reduce((s, d) => s + (d.value || 0), 0);
    const hasData = total > 0;
    const fallback = [{ name: "Sin datos", value: 1, color: "#2b2b2b" }];

    return (
        <div className="kpi-chart-card" ref={containerRef}>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={hasData ? data : fallback}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={-270}
                        labelLine={false}
                    >
                        {(hasData ? data : fallback).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>

                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
