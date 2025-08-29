// src/components/routines/RoutineBuilder.jsx
import { useState } from "react";
import RoutineForm from "./RoutineForm";
import RoutineList from "./RoutineList";

/**
 * RoutineBuilder.jsx
 * Contenedor principal de la página Routines
 * Maneja el estado global de todas las rutinas
 */
const RoutineBuilder = () => {
    const [routines, setRoutines] = useState([]);

    const addRoutine = (newRoutine) => {
        setRoutines([...routines, { ...newRoutine, id: Date.now() }]);
    };

    const editRoutine = (updatedRoutine) => {
        setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
    };

    const deleteRoutine = (id) => {
        setRoutines(routines.filter(r => r.id !== id));
    };

    const cloneRoutine = (id) => {
        const routine = routines.find(r => r.id === id);
        if (routine) {
            const cloned = { ...routine, id: Date.now(), name: routine.name + " (Copia)" };
            setRoutines([...routines, cloned]);
        }
    };

    return (
        <div className="container py-4">
            <h1 className="mb-4">Gestor de Rutinas</h1>

            {/* Formulario */}
            <RoutineForm onAdd={addRoutine} />

            {/* Lista de rutinas */}
            <RoutineList
                routines={routines}
                onEdit={editRoutine}
                onDelete={deleteRoutine}
                onClone={cloneRoutine}
            />
        </div>
    );
};

export default RoutineBuilder;
