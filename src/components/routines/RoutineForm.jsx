// src/components/routines/RoutineForm.jsx
import { useState } from "react";

/**
 * RoutineForm.jsx
 * Formulario para crear una nueva rutina
 */
const RoutineForm = ({ onAdd }) => {
    const [name, setName] = useState("");
    const [type, setType] = useState("semanal");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !startDate || !endDate) return;

        onAdd({ name, type, startDate, endDate, activities: [] });

        setName("");
        setType("semanal");
        setStartDate("");
        setEndDate("");
    };

    return (
        <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
            <h2 className="h5 mb-3">Crear Nueva Rutina</h2>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre de la rutina"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="row mb-3">
                <div className="col-md-4">
                    <label className="form-label">Tipo</label>
                    <select
                        className="form-select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="semanal">Semanal</option>
                        <option value="mensual">Mensual</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Inicio</label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Fin</label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <button type="submit" className="btn btn-primary">
                Agregar Rutina
            </button>
        </form>
    );
};

export default RoutineForm;
