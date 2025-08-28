// src/components/calendar/CalendarList.jsx
import { useMemo } from "react";
import useCalendars from "../../hooks/useCalendars";
import CalendarCard from "./CalendarCard";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Lista / Cards de "Mis Calendarios".
// - Muestra los calendarios existentes (si los hay)
// - Botones para Abrir (setActive + navegar a tab correspondiente), Clonar y Eliminar.
// - También maneja + Nuevo Calendario (pregunta tipo/clonar).

export default function CalendarList({ onOpen = () => { } }) {
    const { calendars, createCalendar, cloneCalendar, deleteCalendar, setActiveCalendar } = useCalendars();

    const list = useMemo(() => Object.values(calendars || {}), [calendars]);

    // Handler para crear nuevo calendario (usa SweetAlert2 para elegir tipo o clonar)
    const handleNew = async () => {
        const { value: action } = await MySwal.fire({
            title: "Crear nuevo calendario",
            input: "radio",
            inputOptions: {
                create_weekly: "Crear calendario semanal",
                create_monthly: "Crear calendario mensual",
                clone_existing: "Clonar un calendario existente"
            },
            inputValidator: (value) => !value && "Debes elegir una opción",
            showCancelButton: true
        });

        if (!action) return;

        if (action === "create_weekly" || action === "create_monthly") {
            // Pedimos nombre y creamos
            const { value: name } = await MySwal.fire({
                title: "Nombre del calendario",
                input: "text",
                inputPlaceholder: action === "create_weekly" ? "Semana: Entrenos" : "Mes: Rutinas Agosto",
                showCancelButton: true,
                inputValidator: (v) => !v && "Escribe un nombre"
            });
            if (!name) return;

            const newCal = createCalendar({ name, type: action === "create_weekly" ? "weekly" : "monthly" });
            MySwal.fire("Creado", `Calendario '${newCal.name}' creado`, "success");
            // Abrirlo
            setActiveCalendar(newCal.id);
            onOpen(newCal.type === "weekly" ? "weekly" : "monthly");

        } else if (action === "clone_existing") {
            // Si no hay calendario para clonar, avisamos
            if (list.length === 0) {
                MySwal.fire("Nada para clonar", "No hay calendarios existentes.", "info");
                return;
            }
            // Selección simple
            const inputOptions = list.reduce((acc, c) => {
                acc[c.id] = `${c.name} — ${c.type}`;
                return acc;
            }, {});

            const { value: idToClone } = await MySwal.fire({
                title: "Elige calendario a clonar",
                input: "select",
                inputOptions,
                inputPlaceholder: "Selecciona...",
                showCancelButton: true
            });
            if (!idToClone) return;

            const cloned = cloneCalendar(idToClone);
            MySwal.fire("Clonado", `Calendario '${cloned.name}' clonado`, "success");
            setActiveCalendar(cloned.id);
            onOpen(cloned.type === "weekly" ? "weekly" : "monthly");
        }
    };

    // Handler eliminar
    const handleDelete = async (id, name) => {
        const res = await MySwal.fire({
            title: `Eliminar '${name}'?`,
            text: "Esta acción eliminará el calendario. ¡No se podrá deshacer!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar"
        });

        if (res.isConfirmed) {
            deleteCalendar(id);
            MySwal.fire("Eliminado", "El calendario fue eliminado", "success");
        }
    };

    return (
        <div className="calendar-list">
            <div className="list-toolbar">
                <h2>Mis Calendarios</h2>
                <div>
                    <button className="btn-new-calendar" onClick={handleNew}>
                        + Nuevo Calendario
                    </button>
                </div>
            </div>

            {list.length === 0 ? (
                <div className="empty-state">
                    <p>No tienes calendarios aún. Crea uno nuevo para empezar.</p>
                    <button className="btn btn-primary" onClick={handleNew}>
                        Crear calendario
                    </button>
                </div>
            ) : (
                <div className="cards-grid">
                    {list.map((c) => (
                        <CalendarCard
                            key={c.id}
                            calendar={c}
                            onOpen={() => {
                                setActiveCalendar(c.id);
                                onOpen(c.type === "weekly" ? "weekly" : "monthly");
                            }}
                            onClone={() => {
                                const cloned = cloneCalendar(c.id);
                                MySwal.fire("Clonado", `Calendario '${cloned.name}' creado`, "success");
                                setActiveCalendar(cloned.id);
                                onOpen(cloned.type === "weekly" ? "weekly" : "monthly");
                            }}
                            onDelete={() => handleDelete(c.id, c.name)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
