// src/components/UsageModal.jsx
// - Modal interactivo para que el usuario seleccione el propósito de uso.
// - Usa "cards" con hover y estados seleccionados.
// - Si no selecciona nada, lanza un SweetAlert2 en vez de un alert feo.
// - Props: isOpen, onClose, onConfirm.

import { useState } from "react";
import Swal from "sweetalert2";
import "../../styles/UsageModal.css";

export default function UsageModal({ isOpen, onClose, onConfirm }) {
    // Opciones disponibles
    const options = [
        { id: "gym", label: "Gym / Entrenamiento", description: "Planifica tus rutinas de ejercicios y progreso físico." },
        { id: "work", label: "Trabajo / Productividad", description: "Organiza tus tareas laborales y proyectos." },
        { id: "home", label: "Hogar / Tareas", description: "Gestiona tus responsabilidades domésticas." },
        { id: "study", label: "Estudio / Cursos", description: "Planifica tus estudios, materias y cursos online." },
        { id: "other", label: "Otro", description: "Usos personales o personalizados." },
    ];

    // Estado de selección múltiple
    const [selected, setSelected] = useState([]);

    // Alternar selección al hacer click en una card
    const toggleOption = (id) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(opt => opt !== id) // deseleccionar
                : [...prev, id] // seleccionar
        );
    };

    // Confirmar selección
    const handleConfirm = () => {
        if (selected.length === 0) {
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
        onConfirm(selected); // pasamos selección al padre
        onClose(); // cerramos modal
    };

    if (!isOpen) return null; // no mostrar si el modal no está abierto

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">¿Para qué vas a usar Routine Calendary?</h2>
                <p className="modal-subtitle">Elige una o varias opciones para personalizar tu experiencia.</p>

                <div className="options-grid">
                    {options.map(opt => {
                        const isSelected = selected.includes(opt.id);
                        return (
                            <div
                                key={opt.id}
                                className={`option-card ${isSelected ? "selected" : ""}`}
                                onClick={() => toggleOption(opt.id)}
                            >
                                {/* Si está seleccionada: mostrar todo */}
                                {isSelected ? (
                                    <>
                                        <h3>{opt.label}</h3>
                                        <p>{opt.description}</p>
                                    </>
                                ) : (
                                    // Si NO está seleccionada: título + descripción centrados
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
