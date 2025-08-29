import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import "../../styles/ActivitiesModal.css";

export default function ActivitiesModal({ isOpen, routines = [], date, onClose }) {
    const navigate = useNavigate();
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content activities-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                    Actividades del {dayjs(date).format("DD MMM YYYY")}
                </h2>

                {routines.length > 0 ? (
                    <ul className="activities-list">
                        {routines.map((r, i) => (
                            <li key={i} className="activity-item">
                                <span className="activity-title">{r.title || r.routineId}</span>
                                {r.description && <p className="activity-desc">{r.description}</p>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-activities">Sin actividades para este día</p>
                )}

                <div className="modal-actions d-flex justify-content-center gap-5">
                    <button className="btn-cancel w-75" onClick={onClose}>
                        Cerrar
                    </button>
                    <button
                        className="btn-confirm w-75"
                        onClick={() => {
                            onClose();
                            navigate("/routines");
                        }}
                    >
                        Agregar actividad
                    </button>
                </div>
            </div>
        </div>
    );
}
