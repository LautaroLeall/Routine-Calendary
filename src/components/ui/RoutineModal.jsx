// src/components/ui/RoutineModal.jsx
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const RoutineModal = ({ routine, onClose, onSave }) => {
    const [name, setName] = useState(routine?.name || "");
    const [type, setType] = useState(routine?.type || "semanal"); // semanal | mensual
    const [startDate, setStartDate] = useState(
        routine?.startDate || dayjs().format("YYYY-MM-DD")
    );
    const [endDate, setEndDate] = useState(routine?.endDate || "");

    // --- VALIDACIONES ---
    const validateRoutine = () => {
        const today = dayjs().startOf("day");
        const start = dayjs(startDate);
        const end = dayjs(endDate);

        // Validar que el nombre no esté vacío
        if (!name.trim()) {
            Swal.fire("Error", "El nombre de la rutina es obligatorio.", "error");
            return false;
        }

        // Validar que la fecha de inicio no sea anterior a hoy
        if (start.isBefore(today)) {
            Swal.fire("Error", "La fecha de inicio no puede ser anterior a hoy.", "error");
            return false;
        }

        // Validación para semanal
        if (type === "semanal") {
            const expectedEnd = start.add(6, "day"); // 7 días contando desde el inicio
            if (!end.isSame(expectedEnd, "day")) {
                Swal.fire(
                    "Error",
                    `Para una rutina semanal, la fecha de fin debe ser exactamente 7 días después (${expectedEnd.format(
                        "YYYY-MM-DD"
                    )}).`,
                    "error"
                );
                return false;
            }
        }

        // Validación para mensual
        if (type === "mensual") {
            const diff = end.diff(start, "day") + 1; // incluye el día de inicio
            if (diff < 28 || diff > 31) {
                Swal.fire(
                    "Error",
                    "Para una rutina mensual, la duración debe ser entre 28 y 31 días.",
                    "error"
                );
                return false;
            }
        }

        return true;
    };

    const handleSave = () => {
        if (!validateRoutine()) return;

        const newRoutine = {
            id: routine?.id || Date.now(),
            name,
            type,
            startDate,
            endDate,
        };

        onSave(newRoutine);
        onClose();
    };

    return (
        <Modal show onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{routine ? "Editar Rutina" : "Nueva Rutina"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Rutina FullBody"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="semanal">Semanal</option>
                            <option value="mensual">Mensual</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fecha de Inicio</Form.Label>
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={dayjs().format("YYYY-MM-DD")}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fecha de Fin</Form.Label>
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RoutineModal;
