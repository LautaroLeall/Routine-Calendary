// src/components/routines/RoutineItem.jsx
import { FaRegClone, FaEdit, FaTrash } from "react-icons/fa";

/**
 * RoutineItem.jsx
 * Muestra la información de una rutina con sus acciones
 */
const RoutineItem = ({ routine, onEdit, onDelete, onClone }) => {
    return (
        <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{routine.name}</h5>
                <p className="card-text mb-1">
                    <strong>Tipo:</strong> {routine.type}
                </p>
                <p className="card-text mb-1">
                    <strong>Desde:</strong> {routine.startDate}
                </p>
                <p className="card-text">
                    <strong>Hasta:</strong> {routine.endDate}
                </p>

                {/* Acciones */}
                <div className="mt-auto d-flex justify-content-between">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit({ ...routine, name: routine.name + " (Editado)" })}
                    >
                        <FaEdit /> Editar
                    </button>

                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(routine.id)}
                    >
                        <FaTrash /> Eliminar
                    </button>

                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onClone(routine.id)}
                    >
                        <FaRegClone /> Clonar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoutineItem;
