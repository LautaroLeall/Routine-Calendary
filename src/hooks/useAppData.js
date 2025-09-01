// src/hooks/useAppData.js
// Hook para manejar datos específicos de la app por usuario.
// - Usa useLocalStorage para persistencia.
// - Indexa los datos por user.id (más seguro que email).
// - Expone funciones memoizadas para guardar datos, logs y migración.
// - Expone propiedades en ese mismo array para permitir destructuring por objeto:
//     const { userData, saveUserData } = useAppData();
// Esto facilita migración gradual en el código.

import { useLocalStorage } from "./useLocalStorage";
import { useAuth } from "./useAuth";
import { useMemo, useCallback } from "react";

export function useAppData() {
    // --- Estado global de appData en localStorage ---
    const [appData, setAppData] = useLocalStorage("appData", {});

    // --- Obtener usuario actual desde AuthContext ---
    const { user } = useAuth();
    const userId = user?.id || null; // Usar id único en vez de email

    // --- Migración opcional de email -> userId (útil si antes indexabas por email) ---
    const migrateFromEmailToId = useCallback(
        (oldEmail, newUserId) => {
            setAppData((prev) => {
                if (!prev || !prev[oldEmail]) return prev;
                const next = { ...prev, [newUserId]: prev[oldEmail] };
                delete next[oldEmail];
                return next;
            });
        },
        [setAppData]
    );

    // --- userData derivado (para el usuario logueado) ---
    // Devolvemos `null` si no hay usuario (así las páginas pueden hacer early return).
    const userData = useMemo(() => {
        if (!userId) return null;
        return appData[userId] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
    }, [appData, userId]);

    // --- saveUserData: reemplaza por completo los datos del usuario ---
    const saveUserData = useCallback(
        (newUserDataOrUpdater) => {
            if (!userId) {
                console.warn("useAppData: no hay usuario logueado para guardar appData");
                return;
            }
            setAppData((prev) => {
                const prevUser = prev?.[userId] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
                // aceptamos función o valor (como setState)
                const newUserData =
                    typeof newUserDataOrUpdater === "function"
                        ? newUserDataOrUpdater(prevUser)
                        : newUserDataOrUpdater;
                if (typeof newUserData !== "object" || newUserData === null) {
                    console.warn("useAppData.saveUserData: se esperaba un objeto");
                    return prev;
                }
                return { ...(prev || {}), [userId]: newUserData };
            });
        },
        [setAppData, userId]
    );

    // --- addLog: añadir un log al historial del usuario ---
    const addLog = useCallback(
        (log) => {
            if (!userId) {
                console.warn("useAppData.addLog: no hay usuario logueado");
                return;
            }
            setAppData((prev) => {
                const prevUser = prev?.[userId] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
                const newLogs = Array.isArray(prevUser.logs) ? [...prevUser.logs, log] : [log];
                return { ...(prev || {}), [userId]: { ...prevUser, logs: newLogs } };
            });
        },
        [setAppData, userId]
    );

    // --- clearLogs: borrar todos los logs ---
    const clearLogs = useCallback(() => {
        if (!userId) return;
        setAppData((prev) => {
            const prevUser = prev?.[userId] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
            return { ...(prev || {}), [userId]: { ...prevUser, logs: [] } };
        });
    }, [setAppData, userId]);

    // --- Helpers / utilidades a exponer ---
    const helpers = useMemo(
        () => ({ addLog, clearLogs, migrateFromEmailToId }),
        [addLog, clearLogs, migrateFromEmailToId]
    );

    // --- Dual return: array (legacy) + propiedades (object-like) ---
    const arr = [userData, saveUserData, appData, helpers];

    // Adjuntamos propiedades al array para permitir acceso por objeto también
    // Ej: const { userData, saveUserData } = useAppData();
    Object.assign(arr, {
        userData,
        saveUserData,
        appData,
        addLog,
        clearLogs,
        migrateFromEmailToId,
    });

    return arr;
}
