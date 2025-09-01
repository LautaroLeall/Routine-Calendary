// src/hooks/useProfileAvatar.js
// Lógica relacionada sólo al avatar:
// - pick file, validate tipo/tamaño/dimensiones
// - compress + resize (canvas)
// - persistir en saveUserData y propagar a updateUser
// Recibe initialAvatar y funciones desde wrapper.

import { useRef, useState } from "react";
import Swal from "sweetalert2";

/* configuración */
const DEFAULT_MAX_DIM = 1024;
const DEFAULT_QUALITY = 0.8;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10MB final aprox
const MIN_DIMENSION = 200; // px mínimo

// helper: compress + resize -> dataURL (jpeg)
function compressAndResizeImage(file, { maxDim = DEFAULT_MAX_DIM, quality = DEFAULT_QUALITY } = {}) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Error leyendo archivo"));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxDim || height > maxDim) {
                    const ratio = width / height;
                    if (ratio >= 1) {
                        width = maxDim;
                        height = Math.round(maxDim / ratio);
                    } else {
                        height = maxDim;
                        width = Math.round(maxDim * ratio);
                    }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error("Error al comprimir"));
                        const r2 = new FileReader();
                        r2.onerror = () => reject(new Error("Error leyendo blob"));
                        r2.onload = () => resolve(String(r2.result));
                        r2.readAsDataURL(blob);
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
    });
}

export function useProfileAvatar({
    initialAvatar = null,
    user,
    updateUser,
    saveUserData,
}) {
    const fileRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(initialAvatar);

    // safeUpdateUser local
    async function safeUpdateUser(patch) {
        if (typeof updateUser !== "function") return null;
        if (updateUser.length >= 2 && user?.id) return await updateUser(user.id, patch);
        return await updateUser(patch);
    }

    function handlePickFile() {
        if (fileRef.current) fileRef.current.click();
    }

    async function handleFileChange(e) {
        const file = e?.target?.files?.[0];
        if (!file) return;

        // validar tipo
        if (!file.type || !file.type.startsWith("image/")) {
            const msg = "El archivo debe ser una imagen.";
            await Swal.fire({ icon: "warning", title: "Tipo inválido", text: msg });
            if (e.target) e.target.value = "";
            return;
        }

        // tamaño bruto límite (evitar uploads gigantes)
        const rawMax = 15 * 1024 * 1024;
        if (file.size > rawMax) {
            const msg = `El archivo es demasiado grande (máx ${Math.round(rawMax / 1024 / 1024)}MB).`;
            await Swal.fire({ icon: "warning", title: "Archivo demasiado grande", text: msg });
            if (e.target) e.target.value = "";
            return;
        }

        try {
            const dataUrl = await compressAndResizeImage(file, { maxDim: DEFAULT_MAX_DIM, quality: DEFAULT_QUALITY });

            // validar dimensiones mínimas
            await new Promise((res, rej) => {
                const img = new Image();
                img.onload = () => {
                    if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
                        return rej(new Error(`La imagen debe tener al menos ${MIN_DIMENSION}x${MIN_DIMENSION}px.`));
                    }
                    res();
                };
                img.onerror = () => rej(new Error("No se pudo procesar la imagen"));
                img.src = dataUrl;
            });

            // calcular tamaño aproximado final
            const base64 = dataUrl.split(",")[1] || "";
            const finalSize = Math.round((base64.length * 3) / 4);
            if (finalSize > DEFAULT_MAX_BYTES) {
                const msg = `La imagen comprimida excede ${Math.round(DEFAULT_MAX_BYTES / 1024 / 1024)}MB.`;
                await Swal.fire({ icon: "warning", title: "Archivo demasiado grande", text: msg });
                if (e.target) e.target.value = "";
                return;
            }

            // persistir preview y appData
            setAvatarPreview(dataUrl);
            if (typeof saveUserData === "function") {
                saveUserData((prev) => ({ ...(prev || {}), profile: { ...((prev && prev.profile) || {}), avatar: dataUrl, updatedAt: new Date().toISOString() } }));
            }

            // intentar propagar a auth
            try {
                await safeUpdateUser({ avatar: dataUrl });
            } catch (err) {
                console.warn("Avatar -> safeUpdateUser falló (no fatal):", err);
            }

            await Swal.fire({ icon: "success", title: "Imagen cargada", timer: 1000, showConfirmButton: false });
        } catch (err) {
            await Swal.fire({ icon: "error", title: "Error", text: err?.message || "No se pudo procesar la imagen" });
        } finally {
            if (e?.target) e.target.value = "";
        }
    }

    async function handleRemoveAvatar() {
        setAvatarPreview(null);
        if (typeof saveUserData === "function") {
            saveUserData((prev) => ({ ...(prev || {}), profile: { ...((prev && prev.profile) || {}), avatar: null, updatedAt: new Date().toISOString() } }));
        }
        try {
            await safeUpdateUser({ avatar: null });
        } catch (err) {
            console.warn("remove avatar -> safeUpdateUser falló (no fatal):", err);
        }
        await Swal.fire({ icon: "info", title: "Avatar eliminado", timer: 900, showConfirmButton: false });
    }

    return {
        avatarPreview,
        setAvatarPreview,
        fileRef,
        handlePickFile,
        handleFileChange,
        handleRemoveAvatar,
    };
}
