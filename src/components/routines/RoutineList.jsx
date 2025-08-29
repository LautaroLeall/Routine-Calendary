// src/components/routines/RoutineList.jsx
import RoutineItem from "./RoutineItem";

/**
 * RoutineList.jsx
 * Renderiza todas las rutinas disponibles
 */
const RoutineList = ({ routines, onEdit, onDelete, onClone }) => {
    if (routines.length === 0) {
        return <p className="text-muted">No hay rutinas creadas todavía.</p>;
    }

    return (
        <div className="row">
            {routines.map((routine) => (
                <div key={routine.id} className="col-md-6 col-lg-4 mb-3">
                    <RoutineItem
                        routine={routine}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onClone={onClone}
                    />
                </div>
            ))}
        </div>
    );
};

export default RoutineList;
