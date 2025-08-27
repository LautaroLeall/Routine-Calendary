// src/utils/metrics.js
// - Helpers para transformar userData (logs) a KPIs para Dashboard.
// - computeKpisFromLogs(logs, options) -> { summary, kpiData, meta }

//  - Normaliza fechas a YYYY-MM-DD (acepta Date o string).
//  - Calcula conteos del periodo actual (N días) y del periodo anterior (N días previos).
//  - Devuelve deltas reales (p. ej. "+25%", "-12%", "0%", "Nuevo").
//  - Devuelve kpiData con valores numéricos y pct (texto) para leyenda/tooltip.
//  - Linter fixes: se eliminó variable no usada y se usa hasOwnProperty de forma segura.

const STATUS_ORDER = [
    { key: "completed", title: "Completadas", color: "#00c176" },
    { key: "skipped", title: "Saltadas", color: "#ff8a65" },
    { key: "postponed", title: "Pospuestas", color: "#ffd54f" },
    { key: "missed", title: "No cumplidas", color: "#ff6b6b" },
];

// Formatea Date o string a YYYY-MM-DD (local)
function toISODate(d) {
    const dt = d instanceof Date ? d : new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// Fecha N días atrás, sin mutar original
function dateNDaysAgo(baseDate, n) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - n);
    return d;
}

// Formatea cambio relativo entre curr y prev
function formatDeltaPct(curr, prev) {
    // prev === 0 edge cases
    if (prev === 0) {
        if (curr === 0) return "0%";
        // Antes 0 y ahora >0 => "Nuevo"
        return "Nuevo";
    }
    const raw = ((curr - prev) / prev) * 100;
    if (Math.abs(raw) < 1) return `${raw.toFixed(1)}%`;
    return `${Math.round(raw)}%`;
}

export function computeKpisFromLogs(logs = [], options = {}) {
    const { days = 7, toDate = new Date() } = options;

    // Normalizar: asegurar que logs sea array
    const allLogs = Array.isArray(logs) ? logs : [];

    // Periodos:
    const endCur = new Date(toDate);
    const startCur = dateNDaysAgo(endCur, days - 1);
    const endPrev = dateNDaysAgo(startCur, 1);
    const startPrev = dateNDaysAgo(endPrev, days - 1);

    const startCurISO = toISODate(startCur);
    const endCurISO = toISODate(endCur);
    const startPrevISO = toISODate(startPrev);
    const endPrevISO = toISODate(endPrev);

    // Normalizar logs: convertir date a ISO y status a lowercase string
    const normalized = allLogs.map((l) => ({
        ...l,
        date: toISODate(l.date),
        status: String(l.status || "").toLowerCase(),
    }));

    // Inicializar contadores
    const countsCur = {};
    const countsPrev = {};
    STATUS_ORDER.forEach(s => { countsCur[s.key] = 0; countsPrev[s.key] = 0; });

    // Helper rango
    const inRange = (iso, startISO, endISO) => iso >= startISO && iso <= endISO;

    // Contar (usa Object.prototype.hasOwnProperty.call para evitar override)
    for (const l of normalized) {
        const d = l.date;
        const st = l.status;
        if (!Object.prototype.hasOwnProperty.call(countsCur, st)) continue; // ignorar statuses no definidos

        if (inRange(d, startCurISO, endCurISO)) {
            countsCur[st] += 1;
        } else if (inRange(d, startPrevISO, endPrevISO)) {
            countsPrev[st] += 1;
        }
    }

    // Totales
    const totalCur = Object.values(countsCur).reduce((a, b) => a + b, 0);
    const totalPrev = Object.values(countsPrev).reduce((a, b) => a + b, 0);

    // Construir summary y kpiData en orden definido
    const summary = STATUS_ORDER.map(({ key, title }) => {
        const curr = countsCur[key] || 0;
        const prev = countsPrev[key] || 0;
        const delta = formatDeltaPct(curr, prev);
        return { key, title, value: curr, delta };
    });

    // kpiData: valor numérico y pct (texto) para usar en leyenda/tooltip
    const kpiData = STATUS_ORDER.map(({ key, title, color }) => {
        const val = countsCur[key] || 0;
        const pct = totalCur ? (val / totalCur) * 100 : 0;
        const pctText = totalCur === 0 ? "0%" : (pct < 1 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`);
        return { name: title, value: val, color, pct: pctText };
    });

    const meta = {
        startCurISO, endCurISO, startPrevISO, endPrevISO,
        totalCur, totalPrev,
    };

    return { summary, kpiData, meta };
}

export default computeKpisFromLogs;
