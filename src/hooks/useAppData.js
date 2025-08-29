// src/hooks/useAppData.js
// Hook para manejar datos específicos de la app por usuario.
// - Usa useLocalStorage para persistencia.
// - Indexa los datos por user.id (más seguro que email, evita problemas si el usuario cambia su email).
// - Expone funciones memoizadas para guardar datos, logs y migración de email a id.

import { useLocalStorage } from "./useLocalStorage";
import { useAuth } from "./useAuth";
import { useMemo, useCallback } from "react";

export function useAppData() {
    // --- Estado global de appData en localStorage ---
    const [appData, setAppData] = useLocalStorage("appData", {});

    // --- Obtener usuario actual desde AuthContext ---
    const { user } = useAuth();
    const userId = user?.id || null; // Usar id único en vez de email

    // --- Función opcional de migración de datos de email a ID ---
    // Esto es útil si queremos mantener datos previos cuando un usuario cambia su email
    const migrateFromEmailToId = useCallback((oldEmail, newUserId) => {
        setAppData(prev => {
            if (!prev[oldEmail]) return prev; // No hay datos antiguos, nada que migrar
            const newData = { ...prev, [newUserId]: prev[oldEmail] };
            delete newData[oldEmail]; // Eliminamos la key antigua
            return newData;
        });
    }, [setAppData]);

    // --- userData derivado ---
    // Devuelve los datos específicos del usuario logueado o un objeto por defecto si no hay datos
    const userData = useMemo(() => {
        if (!userId) return null;
        return appData[userId] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
    }, [appData, userId]);

    // --- Guardar/reemplazar completamente los datos del usuario ---
    const saveUserData = useCallback((newUserData) => {
        if (!userId) {
            console.warn("useAppData: no hay usuario logueado para guardar appData");
            return;
        }
        if (typeof newUserData !== "object" || newUserData === null) {
            console.warn("useAppData.saveUserData: se esperaba un objeto");
            return;
        }
        setAppData(prev => ({ ...prev, [userId]: newUserData }));
    }, [setAppData, userId]);

    // --- Añadir un log al historial del usuario ---
    const addLog = useCallback((log) => {
        if (!userId) {
            console.warn("useAppData.addLog: no hay usuario logueado");
            return;
        }
        setAppData(prev => {
            const prevUser = prev[userId] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
            const newLogs = Array.isArray(prevUser.logs) ? [...prevUser.logs, log] : [log];
            return { ...prev, [userId]: { ...prevUser, logs: newLogs } };
        });
    }, [setAppData, userId]);

    // --- Borrar todos los logs del usuario ---
    const clearLogs = useCallback(() => {
        if (!userId) return;
        setAppData(prev => {
            const prevUser = prev[userId] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
            return { ...prev, [userId]: { ...prevUser, logs: [] } };
        });
    }, [setAppData, userId]);

    // --- Retorno del hook ---
    // Retornamos un objeto con funciones claras y consistentes
    return {
        userData,           // Datos actuales del usuario logueado
        saveUserData,       // Reemplaza datos completos
        appData,            // AppData completo (todos los usuarios)
        addLog,             // Añadir un log
        clearLogs,          // Limpiar logs
        migrateFromEmailToId // Migrar datos antiguos de email a ID
    };
}
