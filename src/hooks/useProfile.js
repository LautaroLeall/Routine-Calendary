// src/hooks/useProfile.js
// Hook que centraliza la lógica de la página Profile:
// - Inicializa desde useAppData/user
// - Maneja avatar upload/preview (dataURL)
// - Guarda profile en appData y propaga a AuthContext (safeUpdateUser)
// - Maneja cambio de contraseña (varias firmas)
// - Exposición clara de callbacks y estados para los subcomponentes

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "./useAuth";
import { useAppData } from "./useAppData";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useProfile() {
    const { user, updateUser, changePassword, logout, deleteUser } = useAuth();
    const { userData, saveUserData } = useAppData();

    const [form, setForm] = useState({ email: "", username: "", purpose: [] });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });

    const initialized = useRef(false);

    // cargar datos iniciales desde appData o Auth user
    useEffect(() => {
        // solo inicializar si no tenemos avatarPreview
        if (!user || initialized.current) return;  // esperar a que user exista

        const prof = userData?.profile;
        setForm({
            email: prof?.email || user.email || "",
            username: prof?.username || user.username || "",
            purpose: prof?.purpose || user.purpose || [],
        });
        setAvatarPreview(prof?.avatar || user.avatar || null);

        initialized.current = true; // marca que ya inicializamos
    }, [userData, user]);


    // actualizar usuario con varias firmas posibles
    const safeUpdateUser = async (patch) => {
        if (typeof updateUser !== "function") return null;
        try {
            if (updateUser.length >= 2 && user?.id) return await updateUser(user.id, patch);
            return await updateUser(patch);
        } catch (err) {
            console.error("❌ Error en safeUpdateUser:", err);
        }
    };

    // guardar cambios en appData dentro de profile
    const persistProfileToAppData = (profilePatch) => {
        saveUserData((prev) => ({
            ...prev,
            profile: { ...(prev.profile || {}), ...profilePatch }
        }));
    };

    // cambios de inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handlePurposeSelect = (selected) => {
        setForm((p) => ({ ...p, purpose: selected }));
        setIsModalOpen(false);
    };

    // validación de perfil
    const validateProfile = () => {
        if (!emailRegex.test(String(form.email).trim())) throw new Error("Email inválido");
        if (!form.username || String(form.username).trim().length < 3) throw new Error("Nombre de usuario demasiado corto");
        if (!Array.isArray(form.purpose) || form.purpose.length === 0) throw new Error("Debes seleccionar al menos un propósito");
    };

    // guardar perfil
    const handleSaveProfile = async (e) => {
        e?.preventDefault();
        setError(""); setSuccess(""); setSavingProfile(true);

        try {
            validateProfile();

            const prevProfile = userData?.profile || {};
            const patchForAuth = {
                email: form.email.trim().toLowerCase(),
                username: form.username.trim(),
                ...(avatarPreview ? { avatar: avatarPreview } : { avatar: null }),
            };

            const hasChanges =
                prevProfile.email !== patchForAuth.email ||
                prevProfile.username !== patchForAuth.username ||
                JSON.stringify(prevProfile.purpose) !== JSON.stringify(form.purpose) ||
                prevProfile.avatar !== avatarPreview;

            if (!hasChanges) {
                return Swal.fire({ icon: "info", title: "No hay cambios para guardar", timer: 1400, showConfirmButton: false });
            }

            await safeUpdateUser(patchForAuth);

            persistProfileToAppData({
                email: patchForAuth.email,
                username: patchForAuth.username,
                purpose: form.purpose,
                avatar: avatarPreview || null,
                updatedAt: new Date().toISOString(),
            });

            await Swal.fire({ icon: "success", title: "Perfil actualizado", timer: 1400, showConfirmButton: false });

        } catch (err) {
            setError(err?.message || "Error al guardar perfil");
            Swal.fire({ icon: "error", title: "Error", text: err?.message || "No se pudo guardar el perfil" });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleRevert = () => {
        const prof = userData?.profile;
        if (prof) {
            setForm({
                email: prof.email || user?.email || "",
                username: prof.username || user?.username || "",
                purpose: prof.purpose || user?.purpose || [],
            });
            setAvatarPreview(prof.avatar || user?.avatar || null);
            setError(""); setSuccess("");
            return;
        }
        if (user) {
            setForm({ email: user.email || "", username: user.username || "", purpose: user.purpose || [] });
            setAvatarPreview(user.avatar || null);
            setSuccess("Cambios revertidos al usuario actual."); setError("");
            return;
        }
        setError("No hay datos previos para revertir.");
    };

    // avatar
    const handlePickFile = () => fileRef.current && fileRef.current.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            const msg = "El archivo debe ser una imagen.";
            setError(msg);
            Swal.fire({ icon: "warning", title: "Tipo inválido", text: msg });
            return;
        }

        const minSize = 3 * 1024 * 1024;
        const maxSize = 10 * 1024 * 1024;
        if (file.size < minSize || file.size > maxSize) {
            const msg = `El tamaño de la imagen debe ser entre 3MB y 10MB.`;
            setError(msg);
            Swal.fire({ icon: "warning", title: "Tamaño inválido", text: msg });
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;

            const img = new Image();
            img.onload = () => {
                const minWidth = 300, minHeight = 300;
                if (img.width < minWidth || img.height < minHeight) {
                    const msg = `La imagen debe tener al menos ${minWidth}x${minHeight}px.`;
                    setError(msg);
                    Swal.fire({ icon: "warning", title: "Dimensiones inválidas", text: msg });
                    return;
                }

                setAvatarPreview(dataUrl);
                persistProfileToAppData({ avatar: dataUrl, updatedAt: new Date().toISOString() });
                safeUpdateUser({ avatar: dataUrl }).catch(() => { });
                Swal.fire({ icon: "success", title: "Imagen cargada", timer: 1000, showConfirmButton: false });
            };
            img.onerror = () => {
                const msg = "No se pudo cargar la imagen.";
                setError(msg);
                Swal.fire({ icon: "error", title: "Error", text: msg });
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        persistProfileToAppData({ avatar: null, updatedAt: new Date().toISOString() });
        safeUpdateUser({ avatar: null }).catch(() => { });
        Swal.fire({ icon: "info", title: "Avatar eliminado", timer: 900, showConfirmButton: false });
    };

    // password
    const handlePwChange = (e) => {
        const { name, value } = e.target;
        setPw((p) => ({ ...p, [name]: value }));
    };

    const validatePw = () => {
        if (!pw.currentPassword) throw new Error("Debes ingresar tu contraseña actual");
        if (!pw.newPassword || pw.newPassword.length < 6) throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
        if (pw.newPassword !== pw.confirmNewPassword) throw new Error("La nueva contraseña y su confirmación no coinciden");
    };

    const handleConfirmChangePassword = async (e) => {
        e?.preventDefault();
        setError(""); setSuccess(""); setChangingPassword(true);
        try {
            validatePw();

            if (typeof changePassword !== "function") throw new Error("Función changePassword no disponible");

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
            Swal.fire({ icon: "success", title: "Contraseña actualizada", timer: 1400, showConfirmButton: false });
        } catch (err) {
            setError(err?.message || "Error cambiando contraseña");
            Swal.fire({ icon: "error", title: "Error", text: err?.message || "No se pudo cambiar la contraseña" });
        } finally {
            setChangingPassword(false);
        }
    };

    // logout/delete
    const handleLogout = async () => {
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
            Swal.fire({ icon: "success", title: "Sesión cerrada", timer: 1200, showConfirmButton: false });
        }
    };

    const handleDeleteAccount = async () => {
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
                await deleteUser(user?.id);
                saveUserData({});
                Swal.fire({ icon: "success", title: "Cuenta eliminada", timer: 1400, showConfirmButton: false });
            } else {
                saveUserData({ ...(userData || {}), profile: undefined });
                if (typeof logout === "function") logout();
                Swal.fire({ icon: "success", title: "Cuenta eliminada", timer: 1400, showConfirmButton: false });
            }
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err?.message || "No se pudo eliminar la cuenta" });
        }
    };

    return {
        form, setForm,
        avatarPreview, fileRef,
        isModalOpen, setIsModalOpen,
        savingProfile, changingPassword, error, success,
        pw,
        handleInputChange, handlePurposeSelect, handleSaveProfile, handleRevert,
        handlePickFile, handleFileChange, handleRemoveAvatar,
        handlePwChange, handleConfirmChangePassword,
        handleLogout, handleDeleteAccount,
    };
}
