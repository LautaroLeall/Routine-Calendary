// src/components/profile/ProfileForm.jsx
// - Form de edición de email / username / purpose (solo UI).
// - Botones Guardar / Revertir.
// - No maneja lógica de persistencia: recibe callbacks desde la página padre.

import React from "react";

export default function ProfileForm({
    form,
    onInputChange,
    onOpenPurposeModal,
    onSave,
    onRevert,
    saving,
}) {
    return (
        <aside className="card-profile">
            <h3 className="card-profile-title">Datos de cuenta</h3>

            {/* Display current values (read-only area) */}
            <div className="info-row">
                <label>Email actual</label>
                <div className="info-value">{form.email || "—"}</div>
            </div>

            <div className="info-row">
                <label>Nombre de usuario</label>
                <div className="info-value">{form.username || "—"}</div>
            </div>

            <div className="info-row">
                <label>Propósitos</label>
                <div className="info-value small">{(form.purpose && form.purpose.join(", ")) || "—"}</div>
            </div>

            <hr />

            {/* Editable inputs */}
            <form className="edit-form" onSubmit={(e) => { e.preventDefault(); onSave(e); }}>
                <div className="form-group mb-3">
                    <input
                        name="email"
                        type="email"
                        className="form-control"
                        placeholder="tu@correo.com"
                        value={form.email}
                        onChange={onInputChange}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <input
                        name="username"
                        type="text"
                        className="form-control"
                        placeholder="tu_usuario"
                        value={form.username}
                        onChange={onInputChange}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <div>
                        <button type="button" className="btn-modal" onClick={onOpenPurposeModal}>Editar propósitos</button>
                    </div>
                    <small className="text-muted ms-1">Propósitos: {form.purpose && form.purpose.join(", ")}</small>
                </div>

                <div className="actions-row d-flex align-items-center justify-content-start gap-3">
                    <button type="submit" className="btn-change-profile" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button type="button" className="btn-revert-profile" onClick={onRevert}>Revertir cambios</button>
                </div>
            </form>
        </aside>
    );
}
