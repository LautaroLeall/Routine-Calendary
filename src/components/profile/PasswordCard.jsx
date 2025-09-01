// src/components/ui/PasswordCard.jsx
// - Card para cambiar contraseña: actual / nueva / confirmar nueva.
// - Incluye toggles para mostrar/ocultar contraseñas.

import React, { useState } from "react";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5"; // 👈 el ojo abierto

export default function PasswordCard({ pw, onPwChange, onConfirm, changing }) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <aside className="card-profile password-card">
            <h3 className="card-profile-title mb-3">Cambiar contraseña</h3>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onConfirm(e);
                }}
            >
                {/* contraseña actual */}
                <div className="form-group password-group mb-3">
                    <div className="password-input d-flex align-items-center">
                        <input
                            name="currentPassword"
                            type={showCurrent ? "text" : "password"}
                            className="form-control"
                            placeholder="tu contraseña actual"
                            value={pw.currentPassword}
                            onChange={onPwChange}
                            required
                        />
                        <span
                            className="password-toggle ms-2"
                            onClick={() => setShowCurrent((s) => !s)}
                            role="button"
                            title={showCurrent ? "Ocultar" : "Mostrar"}
                        >
                            {showCurrent ? <FaEyeSlash /> : <IoEyeSharp />}
                        </span>
                    </div>
                </div>

                {/* nueva contraseña */}
                <div className="form-group password-group  mb-3">
                    <div className="password-input d-flex align-items-center">
                        <input
                            name="newPassword"
                            type={showNew ? "text" : "password"}
                            className="form-control"
                            placeholder="tu nueva contraseña"
                            value={pw.newPassword}
                            onChange={onPwChange}
                            required
                        />
                        <span
                            className="password-toggle ms-2"
                            onClick={() => setShowNew((s) => !s)}
                            role="button"
                            title={showNew ? "Ocultar" : "Mostrar"}
                        >
                            {showNew ? <FaEyeSlash /> : <IoEyeSharp />}
                        </span>
                    </div>
                </div>

                {/* confirmar nueva */}
                <div className="form-group password-group mb-3">
                    <div className="password-input d-flex align-items-center">
                        <input
                            name="confirmNewPassword"
                            type={showConfirm ? "text" : "password"}
                            className="form-control"
                            placeholder="confirma tu nueva contraseña"
                            value={pw.confirmNewPassword}
                            onChange={onPwChange}
                            required
                        />
                        <span
                            className="password-toggle ms-2"
                            onClick={() => setShowConfirm((s) => !s)}
                            role="button"
                            title={showConfirm ? "Ocultar" : "Mostrar"}
                        >
                            {showConfirm ? <FaEyeSlash /> : <IoEyeSharp />}
                        </span>
                    </div>
                </div>

                <div className="actions-row">
                    <button
                        type="submit"
                        className="btn-change-profile"
                        disabled={changing}
                    >
                        {changing ? "Cambiando..." : "Confirmar nueva contraseña"}
                    </button>
                </div>
            </form>
        </aside >
    );
}
