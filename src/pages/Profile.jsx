// src/pages/Profile.jsx
// Página mínima: compone subcomponentes y usa useProfile hook.

import React from "react";
import NavBar from "../components/ui/NavBar";
import ProfileForm from "../components/profile/ProfileForm";
import AvatarCard from "../components/profile/AvatarCard";
import PasswordCard from "../components/profile/PasswordCard";
import UsageModal from "../components/ui/RegisterModal";
import { useProfile } from "../hooks/useProfile";
import "../styles/Profile.css";
import "../styles/ProfileForm.css";
import "../styles/AvatarCard.css";
import "../styles/PasswordCard.css";

export default function Profile() {
    const props = useProfile();

    return (
        <>
            <NavBar />
            <main className="container profile-wrapper">
                <header className="profile-header">
                    <div>
                        <h1 className="profile-main-title">Mi perfil</h1>
                        <p className="profile-subtitle">Actualiza tu email, nombre de usuario y preferencias.</p>
                    </div>
                </header>

                <section className="profile-grid">
                    <div className="left-column">
                        <ProfileForm
                            form={props.form}
                            onInputChange={props.handleInputChange}
                            onOpenPurposeModal={() => props.setIsModalOpen(true)}
                            onSave={props.handleSaveProfile}
                            onRevert={props.handleRevert}
                            saving={props.savingProfile}
                            error={props.error}
                            success={props.success}
                        />
                    </div>

                    <div className="right-column">
                        <AvatarCard
                            avatarPreview={props.avatarPreview}
                            onPickFile={props.handlePickFile}
                            onFileChange={props.handleFileChange}
                            onRemoveAvatar={props.handleRemoveAvatar}
                            fileRef={props.fileRef}
                        />

                        <div className="account-action-buttons d-flex flex-column justyfy-content-center align-items-center gap-3 mt-5">
                            <button className="btn-delete w-75" onClick={props.handleLogout}>Cerrar sesión</button>
                            <button className="btn-delete w-75" onClick={props.handleDeleteAccount}>Eliminar cuenta</button>
                        </div>
                    </div>
                </section>

                <section className="password-section">
                    <PasswordCard
                        pw={props.pw}
                        onPwChange={props.handlePwChange}
                        onConfirm={props.handleConfirmChangePassword}
                        changing={props.changingPassword}
                    />
                </section>

                <UsageModal isOpen={props.isModalOpen} onClose={() => props.setIsModalOpen(false)} onSelect={props.handlePurposeSelect} initialSelected={props.form.purpose} />
            </main>
        </>
    );
}
