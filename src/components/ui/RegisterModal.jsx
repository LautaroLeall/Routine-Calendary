// src/components/UsageModal.jsx
// - Modal interactivo para que el usuario seleccione el propósito de uso.
// - Usa "cards" con hover y estados seleccionados.
// - Debe elegirse al menos una opción antes de confirmar.
// - Envía la selección al componente padre (ej. Register).
// - Props aceptadas (compatibles): isOpen, onClose, onConfirm, onSelect, initialSelected.
//   Nota: onConfirm / onSelect son alias: el modal llamará a cualquiera que le pases.

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../../styles/RegisterModal.css";

export default function UsageModal({ isOpen, onClose, onConfirm, onSelect, initialSelected = [] }) {
    // Diseño:
    // - Se acepta tanto `onConfirm` como `onSelect` (por compatibilidad con distintos padres).
    // - `initialSelected` se usa para inicializar/sincronizar el estado cuando se reabre el modal.
    // - Al confirmar, llamamos a ambos callbacks si existen y luego cerramos el modal.

    // Opciones disponibles (id, label, description)
    const options = [
        { id: "gym", label: "Gym / Entrenamiento", description: "Planifica tus rutinas de ejercicios y progreso físico." },
        { id: "work", label: "Trabajo / Productividad", description: "Organiza tus tareas laborales y proyectos." },
        { id: "home", label: "Hogar / Tareas", description: "Gestiona tus responsabilidades domésticas." },
        { id: "study", label: "Estudio / Cursos", description: "Planifica tus estudios, materias y cursos online." },
        { id: "other", label: "Otro", description: "Usos personales o personalizados." },
    ];

    // Estado local de selección múltiple
    const [selected, setSelected] = useState(Array.isArray(initialSelected) ? initialSelected : []);

    // Sincronizar selected cuando cambia initialSelected (por ejemplo al reabrir el modal)
    useEffect(() => {
        setSelected(Array.isArray(initialSelected) ? initialSelected : []);
    }, [initialSelected, isOpen]);

    // Alterna selección de una opción (agregar / quitar)
    const toggleOption = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(opt => opt !== id) : [...prev, id]
        );
    };

    // Función interna que llama a las props del padre de forma segura
    const callParentWithSelected = (arr) => {
        try {
            // Llamamos a onConfirm si lo pasaron
            if (typeof onConfirm === "function") onConfirm(arr);
        } catch (err) {
            console.error("Error en onConfirm callback:", err);
        }
        try {
            // Llamamos a onSelect si lo pasaron (alias)
            if (typeof onSelect === "function") onSelect(arr);
        } catch (err) {
            console.error("Error en onSelect callback:", err);
        }
    };

    // Confirmar selección: valida, llama al padre, y cierra modal
    const handleConfirm = () => {
        if (!Array.isArray(selected) || selected.length === 0) {
            // SweetAlert2 para feedback bonito
            Swal.fire({
                icon: "warning",
                title: "Selecciona al menos una opción",
                text: "No puedes continuar sin elegir cómo usarás Routine Calendary.",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#007bff",
                background: "#1e1e1e",
                color: "#fff",
            });
            return;
        }

        // Llamamos al padre (onConfirm / onSelect). Lo envolvemos en try/catch por seguridad.
        callParentWithSelected(selected);

        // Cerramos modal
        if (typeof onClose === "function") onClose();
    };

    // Si no está abierto, no renderizamos nada
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
                <h2 className="modal-title">¿Para qué vas a usar Routine Calendary?</h2>
                <p className="modal-subtitle">Elige una o varias opciones para personalizar tu experiencia.</p>

                <div className="options-grid">
                    {options.map(opt => {
                        const isSelected = selected.includes(opt.id);
                        return (
                            <div
                                key={opt.id}
                                className={`option-card ${isSelected ? "selected" : ""} ${opt.id === "other" ? "option-other" : ""}`}
                                onClick={() => toggleOption(opt.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleOption(opt.id); }}
                                aria-pressed={isSelected}
                            >
                                {/* Si está seleccionada: mostramos título + descripción */}
                                {isSelected ? (
                                    <>
                                        <h3>{opt.label}</h3>
                                        <p>{opt.description}</p>
                                    </>
                                ) : (
                                    // Si NO está seleccionada: show preview (título centrado; descripción aparece en hover vía CSS)
                                    <div className="card-preview">
                                        <h3>{opt.label}</h3>
                                        <p>{opt.description}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="modal-actions">
                    <button className="btn-confirm" onClick={handleConfirm}>
                        Confirmar selección
                    </button>
                </div>
            </div>
        </div>
    );
}
