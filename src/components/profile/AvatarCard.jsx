// src/components/profile/AvatarCard.jsx
// - Avatar circular con preview (dataURL).
// - Botones para cargar / quitar imagen.
// - Recibe fileRef y onFileChange desde padre.

import React from "react";
import { useAuth } from "../../hooks/useAuth";

export default function AvatarCard({ avatarPreview, onPickFile, onFileChange, onRemoveAvatar, fileRef }) {

    const { user } = useAuth();
    const initials = user
        ? (user.username || user.email || "U").substring(0, 2).toUpperCase()
        : "U";

    return (
        <aside className="card-profile avatar-card">
            <div className="avatar-circle">
                {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="avatar-img" />
                ) : (
                    <div className="avatar-placeholder" title={user.username || user.email}>
                        <span className="avatar-profile">{initials}</span>
                    </div>
                )}
            </div>

            <div className="avatar-actions">
                <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
                <div className="d-flex gap-3 align-items-center">
                    <button type="button" className="btn-avatar btn-change-profile" onClick={onPickFile}>Cargar foto</button>
                    <button type="button" className="btn-avatar btn-revert-profile" onClick={onRemoveAvatar}>Quitar foto</button>
                </div>
            </div>

            <div className="avatar-note">
                <small className="text-muted">Recomendado: imagen cuadrada, hasta 5MB.</small>
            </div>
        </aside>
    );
}
