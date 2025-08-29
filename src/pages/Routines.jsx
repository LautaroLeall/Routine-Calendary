// src/pages/Routines.jsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import NavBar from "../components/ui/NavBar";
import RoutineForm from "../components/routines/RoutineForm";
import RoutineList from "../components/routines/RoutineList";
import RoutineModal from "../components/ui/RoutineModal";

import { v4 as uuidv4 } from "uuid";

/**
 * Página principal de gestión de rutinas
 */
const Routines = () => {
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();

    // Estado de rutinas
    const [routines, setRoutines] = useState([]);

    // Estado para modal de edición
    const [selectedRoutine, setSelectedRoutine] = useState(null);
    const [showModal, setShowModal] = useState(false);

    /** Agregar una nueva rutina */
    const handleAddRoutine = (routine) => {
        setRoutines([...routines, { ...routine, id: uuidv4() }]);
    };

    /** Editar rutina (abre modal con datos) */
    const handleEditRoutine = (routine) => {
        setSelectedRoutine(routine);
        setShowModal(true);
    };

    /** Guardar cambios de edición */
    const handleUpdateRoutine = (updatedRoutine) => {
        setRoutines(
            routines.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r))
        );
        setShowModal(false);
        setSelectedRoutine(null);
    };

    /** Eliminar rutina */
    const handleDeleteRoutine = (id) => {
        setRoutines(routines.filter((r) => r.id !== id));
    };

    /** Clonar rutina */
    const handleCloneRoutine = (id) => {
        const routine = routines.find((r) => r.id === id);
        if (routine) {
            const clonedRoutine = {
                ...routine,
                id: uuidv4(),
                name: routine.name + " (Clonada)",
            };
            setRoutines([...routines, clonedRoutine]);
        }
    };

    return (
        <>
            <NavBar />
            <div className="container mt-5">
                <h2>Mis Rutinas</h2>
                <p>
                    Bienvenido, <strong>{user?.email}</strong>
                </p>

                {/* Formulario para crear nuevas rutinas */}
                <RoutineForm onSave={handleAddRoutine} />

                <hr />

                {/* Lista de rutinas */}
                <RoutineList
                    routines={routines}
                    onEdit={handleEditRoutine}
                    onDelete={handleDeleteRoutine}
                    onClone={handleCloneRoutine}
                />

                {/* Modal de edición */}
                {showModal && selectedRoutine && (
                    <RoutineModal
                        routine={selectedRoutine}
                        onClose={() => setShowModal(false)}
                        onSave={handleUpdateRoutine}
                    />
                )}
            </div>
        </>
    );
};

export default Routines;
