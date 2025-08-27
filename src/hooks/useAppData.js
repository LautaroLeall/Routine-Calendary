// src/hooks/useAppData.js
// - Hook para leer/guardar appData por usuario.
// - Usa useLocalStorage para persistencia y expone utilidades: saveUserData, addLog, clearLogs.
// - Mejora: funciones memoizadas con useCallback para estabilidad de referencias.

import { useLocalStorage } from "./useLocalStorage";
import { useAuth } from "./useAuth";
import { useMemo, useCallback } from "react";

export function useAppData() {
    const [appData, setAppData] = useLocalStorage("appData", {});
    const { user } = useAuth();
    const userEmail = user?.email || null;

    // userData derivado (o null si no hay usuario)
    const userData = useMemo(() => {
        if (!userEmail) return null;
        return appData[userEmail] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
    }, [appData, userEmail]);

    // Guardar (reemplaza por completo userData)
    const saveUserData = useCallback((newUserData) => {
        if (!userEmail) {
            console.warn("useAppData: no hay usuario logueado para guardar appData");
            return;
        }
        setAppData(prev => ({ ...prev, [userEmail]: newUserData }));
    }, [setAppData, userEmail]);

    // Añadir un log (push) - crea array logs si no existe
    const addLog = useCallback((log) => {
        if (!userEmail) {
            console.warn("useAppData.addLog: no hay usuario logueado");
            return;
        }
        setAppData(prev => {
            const prevUser = prev[userEmail] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
            const newLogs = Array.isArray(prevUser.logs) ? [...prevUser.logs, log] : [log];
            return { ...prev, [userEmail]: { ...prevUser, logs: newLogs } };
        });
    }, [setAppData, userEmail]);

    // Borrar todos los logs (útil para testing)
    const clearLogs = useCallback(() => {
        if (!userEmail) return;
        setAppData(prev => {
            const prevUser = prev[userEmail] || { calendars: {}, activeCalendarId: null, routines: {}, logs: [] };
            return { ...prev, [userEmail]: { ...prevUser, logs: [] } };
        });
    }, [setAppData, userEmail]);

    return [userData, saveUserData, appData, { addLog, clearLogs }];
}
