// src/components/ui/RegisterModal.jsx
// Modal interactivo para que el usuario seleccione el propósito de uso.
// - Compatible con Register.jsx y otros padres.
// - Props: isOpen (boolean), onClose (func), onConfirm (func), onSelect (func alias), initialSelected (array).
// - Permite selección múltiple y requiere al menos una opción antes de confirmar.
// - Mejoras: accesibilidad con aria-label dinámico, toggleOption memoizado, comentarios detallados.

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "../../styles/RegisterModal.css";

export default function UsageModal({ isOpen, onClose, onConfirm, onSelect, initialSelected = [] }) {
    // --- Opciones disponibles ---
    const options = [
        { id: "gym", label: "Gym / Entrenamiento", description: "Planifica tus rutinas de ejercicios y progreso físico." },
        { id: "work", label: "Trabajo / Productividad", description: "Organiza tus tareas laborales y proyectos." },
        { id: "home", label: "Hogar / Tareas", description: "Gestiona tus responsabilidades domésticas." },
        { id: "study", label: "Estudio / Cursos", description: "Planifica tus estudios, materias y cursos online." },
        { id: "other", label: "Otro", description: "Usos personales o personalizados." },
    ];

    // --- Estado local ---
    const [selected, setSelected] = useState(Array.isArray(initialSelected) ? initialSelected : []);

    // --- Sincronizar selected con initialSelected al abrir/cerrar modal ---
    useEffect(() => {
        setSelected(Array.isArray(initialSelected) ? initialSelected : []);
    }, [initialSelected, isOpen]);

    // --- Toggle selección de una opción ---
    const toggleOption = useCallback((id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(opt => opt !== id) : [...prev, id]
        );
    }, []);

    // --- Llamadas seguras a callbacks del padre ---
    const callParentWithSelected = (arr) => {
        try {
            if (typeof onConfirm === "function") onConfirm(arr);
        } catch (err) {
            console.error("Error en onConfirm callback:", err);
        }
        try {
            if (typeof onSelect === "function") onSelect(arr);
        } catch (err) {
            console.error("Error en onSelect callback:", err);
        }
    };

    // --- Confirmar selección ---
    const handleConfirm = () => {
        if (!Array.isArray(selected) || selected.length === 0) {
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

        callParentWithSelected(selected);

        if (typeof onClose === "function") onClose();
    };

    // --- No renderizamos si el modal está cerrado ---
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
                <h2 className="modal-title">¿Para qué vas a usar Routine Calendary?</h2>
                <p className="modal-subtitle">Elige una o varias opciones para personalizar tu experiencia.</p>

                <div className="options-grid">
                    {options.length > 0 && options.map(opt => {
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
                                aria-label={`${opt.label}${isSelected ? ", seleccionado" : ""}`}
                            >
                                {/* Mostrar título y descripción si está seleccionado */}
                                {isSelected ? (
                                    <>
                                        <h3>{opt.label}</h3>
                                        <p>{opt.description}</p>
                                    </>
                                ) : (
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
