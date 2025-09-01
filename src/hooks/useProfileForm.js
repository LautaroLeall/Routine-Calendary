// src/hooks/useProfileForm.js
// Lógica del formulario (email/username/purpose) + cambio de contraseña + acciones de cuenta.
// Este hook **no** accede directamente a Auth/AppData; recibe las funciones/valores desde el wrapper.

import { useState } from "react";
import Swal from "sweetalert2";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useProfileForm({
    user,
    userData,
    updateUser,      // función del AuthProvider
    saveUserData,    // función de useAppData
    changePassword,  // función del AuthProvider
    logout,          // función del AuthProvider
    deleteUser,      // función del AuthProvider
    initialForm = { email: "", username: "", purpose: [] },
}) {
    // --- Estados del formulario y UI ---
    const [form, setForm] = useState(initialForm);
    const [savingProfile, setSavingProfile] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // --- Estados de contraseña ---
    const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    const [changingPassword, setChangingPassword] = useState(false);

    // --- safeUpdateUser: intenta (id, patch) o (patch) según la firma del AuthProvider ---
    async function safeUpdateUser(patch) {
        if (typeof updateUser !== "function") return null;
        if (updateUser.length >= 2 && user?.id) return await updateUser(user.id, patch);
        return await updateUser(patch);
    }

    // --- Persistir fragmento profile en appData (fusiona con prev.profile) ---
    function persistProfileToAppData(profilePatch) {
        if (typeof saveUserData !== "function") return;
        saveUserData((prev) => ({
            ...(prev || {}),
            profile: { ...((prev && prev.profile) || {}), ...profilePatch },
        }));
    }

    /* ---------- handlers básicos ---------- */

    function handleInputChange(e) {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    }

    function handlePurposeSelect(selected) {
        setForm((p) => ({ ...p, purpose: selected }));
    }

    function validateProfile() {
        const email = String(form.email || "").trim();
        const username = String(form.username || "").trim();

        if (!emailRegex.test(email)) throw new Error("Email inválido");
        if (!username || username.length < 3) throw new Error("Nombre de usuario demasiado corto");
        if (!Array.isArray(form.purpose) || form.purpose.length === 0) throw new Error("Debes seleccionar al menos un propósito");
    }

    /* ---------- guardar perfil ---------- */
    async function handleSaveProfile(e) {
        e?.preventDefault?.();
        setError("");
        setSuccess("");
        setSavingProfile(true);

        try {
            validateProfile();

            const prevProfile = userData?.profile || {};
            const patchForAuth = {
                email: String(form.email).trim().toLowerCase(),
                username: String(form.username).trim(),
                // avatar no lo editamos aquí (lo maneja el hook/avatar component),
                // pero preservamos lo guardado en prevProfile para la comparación
                avatar: prevProfile.avatar || null,
            };

            // Detectar cambios (comparar con userData.profile o con user si no hay appData)
            const currentEmail = (prevProfile.email || user?.email || "").toString();
            const currentUsername = (prevProfile.username || user?.username || "").toString();
            const currentPurpose = prevProfile.purpose || user?.purpose || [];
            const currentAvatar = prevProfile.avatar || null;

            const hasChanges =
                currentEmail !== patchForAuth.email ||
                currentUsername !== patchForAuth.username ||
                JSON.stringify(currentPurpose) !== JSON.stringify(form.purpose || []) ||
                currentAvatar !== (patchForAuth.avatar || null);

            if (!hasChanges) {
                await Swal.fire({ icon: "info", title: "No hay cambios para guardar", timer: 1400, showConfirmButton: false });
                setSavingProfile(false);
                return;
            }

            // Intentar propagar cambio al AuthProvider (si existe)
            await safeUpdateUser({ email: patchForAuth.email, username: patchForAuth.username });

            // Persistir en appData (fusionando)
            persistProfileToAppData({
                email: patchForAuth.email,
                username: patchForAuth.username,
                purpose: form.purpose,
                updatedAt: new Date().toISOString(),
            });

            // Mensajes detallados según cambios concretos
            const prevEmail = currentEmail;
            const prevUsername = currentUsername;
            if (prevEmail && prevEmail !== patchForAuth.email) {
                await Swal.fire({ icon: "success", title: `mail actualizado de ${prevEmail} a ${patchForAuth.email}`, timer: 2000, showConfirmButton: false });
            }
            if (prevUsername && prevUsername !== patchForAuth.username) {
                await Swal.fire({ icon: "success", title: `nombre de usuario actualizado de ${prevUsername} a ${patchForAuth.username}`, timer: 2000, showConfirmButton: false });
            }
            if (prevEmail === patchForAuth.email && prevUsername === patchForAuth.username) {
                await Swal.fire({ icon: "success", title: "Perfil actualizado", timer: 1400, showConfirmButton: false });
            }

            setSuccess("Perfil guardado correctamente.");
        } catch (err) {
            setError(err?.message || "Error al guardar perfil");
            await Swal.fire({ icon: "error", title: "Error", text: err?.message || "No se pudo guardar el perfil" });
        } finally {
            setSavingProfile(false);
        }
    }

    /* ---------- revertir cambios ---------- */
    function handleRevert() {
        const prof = userData?.profile;
        if (prof) {
            setForm({
                email: prof.email || user?.email || "",
                username: prof.username || user?.username || "",
                purpose: prof.purpose || user?.purpose || [],
            });
            setError("");
            setSuccess("Cambios revertidos a la versión guardada.");
            return;
        }
        if (user) {
            setForm({ email: user.email || "", username: user.username || "", purpose: user.purpose || [] });
            setError("");
            setSuccess("Cambios revertidos al usuario actual.");
            return;
        }
        setError("No hay datos previos para revertir.");
    }

    /* ---------- password handlers ---------- */
    function handlePwChange(e) {
        const { name, value } = e.target;
        setPw((p) => ({ ...p, [name]: value }));
    }

    function validatePw() {
        if (!pw.currentPassword) throw new Error("Debes ingresar tu contraseña actual");
        if (!pw.newPassword || pw.newPassword.length < 6) throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
        if (pw.newPassword !== pw.confirmNewPassword) throw new Error("La nueva contraseña y su confirmación no coinciden");
    }

    async function handleConfirmChangePassword(e) {
        e?.preventDefault?.();
        setError("");
        setSuccess("");
        setChangingPassword(true);
        try {
            validatePw();
            if (typeof changePassword !== "function") throw new Error("Función changePassword no disponible");

            // adapt to multiple signatures supported by AuthProvider
            if (changePassword.length >= 3 && user?.id) {
                await changePassword(user.id, pw.currentPassword, pw.newPassword);
            } else if (changePassword.length === 2 && user?.id) {
                await changePassword(user.id, { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
            } else if (changePassword.length === 2) {
                await changePassword(pw.currentPassword, pw.newPassword);
            } else if (changePassword.length === 1) {
                await changePassword({ id: user?.id, currentPassword: pw.currentPassword, newPassword: pw.newPassword });
            } else {
                await changePassword(pw.currentPassword, pw.newPassword);
            }

            setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
            setSuccess("Contraseña actualizada");
            await Swal.fire({ icon: "success", title: "Contraseña actualizada", timer: 1400, showConfirmButton: false });
        } catch (err) {
            setError(err?.message || "Error cambiando contraseña");
            await Swal.fire({ icon: "error", title: "Error", text: err?.message || "No se pudo cambiar la contraseña" });
        } finally {
            setChangingPassword(false);
        }
    }

    /* ---------- logout / delete ---------- */
    async function handleLogout() {
        const res = await Swal.fire({
            title: "¿Cerrar sesión?",
            text: "Vas a salir de tu cuenta. ¿Querés continuar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
        });
        if (res.isConfirmed) {
            if (typeof logout === "function") logout();
            await Swal.fire({ icon: "success", title: "Sesión cerrada", timer: 1200, showConfirmButton: false });
        }
    }

    async function handleDeleteAccount() {
        const res = await Swal.fire({
            title: "¿Eliminar cuenta?",
            text: "Esta acción eliminará tu cuenta local. ¿Confirmás?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!res.isConfirmed) return;

        try {
            if (typeof deleteUser === "function") {
                // Eliminamos usuario del AuthProvider y limpiamos appData (reemplazando por {})
                await deleteUser(user?.id);
                // No declaramos 'prev' porque no lo necesitamos aquí (evita eslint unused var)
                saveUserData(() => ({}));
                await Swal.fire({ icon: "success", title: "Cuenta eliminada", timer: 1400, showConfirmButton: false });
            } else {
                // Fallback: sólo eliminar profile dentro del appData y cerrar sesión
                saveUserData((prev) => ({ ...(prev || {}), profile: undefined }));
                if (typeof logout === "function") logout();
                await Swal.fire({ icon: "success", title: "Cuenta eliminada (simulada)", timer: 1400, showConfirmButton: false });
            }
        } catch (err) {
            await Swal.fire({ icon: "error", title: "Error", text: err?.message || "No se pudo eliminar la cuenta" });
        }
    }

    // --- Exports (API del hook) ---
    return {
        form,
        setForm,
        savingProfile,
        error,
        success,
        pw,
        changingPassword,

        handleInputChange,
        handlePurposeSelect,
        handleSaveProfile,
        handleRevert,

        handlePwChange,
        handleConfirmChangePassword,

        handleLogout,
        handleDeleteAccount,
    };
}
