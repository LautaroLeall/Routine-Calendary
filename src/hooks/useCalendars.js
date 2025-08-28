// src/hooks/useCalendars.js
import { useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppData } from "../hooks/useAppData";

// Hook helper para gestionar calendarios en userData.
// → Ahora createCalendar admite "template" opcional.
// → Agrego updateCalendar por si quieres editar luego.
export default function useCalendars() {
    const [userData, saveUserData] = useAppData();

    // Memo para evitar cambiar ref en cada render
    const calendars = useMemo(() => userData?.calendars || {}, [userData]);
    const activeCalendarId = userData?.activeCalendarId || null;

    // Crear calendario (acepta template opcional)
    const createCalendar = useCallback(
        ({ name = "Nuevo calendario", type = "weekly", color = "#00c176", template } = {}) => {
            const id = `cal_${uuidv4()}`;
            const now = new Date().toISOString();

            // plantilla base por tipo, si no te dan una
            const baseTemplate = type === "weekly"
                ? { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] }
                : {}; // monthly: map por día "1".."31" cuando toque

            const newCal = {
                id,
                name,
                type,
                color,
                template: template ?? baseTemplate,
                events: {},
                createdAt: now,
                updatedAt: now,
            };

            const next = {
                ...(userData || {}),
                calendars: { ...(userData?.calendars || {}), [id]: newCal },
                activeCalendarId: id,
            };
            saveUserData(next);
            return newCal;
        },
        [userData, saveUserData]
    );

    const cloneCalendar = useCallback(
        (id) => {
            const original = calendars?.[id];
            if (!original) return null;
            const now = new Date().toISOString();
            const newId = `cal_${uuidv4()}`;
            const cloned = {
                ...original,
                id: newId,
                name: `${original.name} (copia)`,
                createdAt: now,
                updatedAt: now,
            };
            const next = {
                ...(userData || {}),
                calendars: { ...(userData?.calendars || {}), [newId]: cloned },
                activeCalendarId: newId,
            };
            saveUserData(next);
            return cloned;
        },
        [calendars, userData, saveUserData]
    );

    const deleteCalendar = useCallback(
        (id) => {
            if (!calendars?.[id]) return;
            const { [id]: _removed, ...rest } = calendars;

            let nextActive = activeCalendarId;
            if (activeCalendarId === id) {
                const remainingIds = Object.keys(rest);
                nextActive = remainingIds.length > 0 ? remainingIds[0] : null;
            }
            const next = { ...(userData || {}), calendars: rest, activeCalendarId: nextActive };
            saveUserData(next);
        },
        [calendars, activeCalendarId, userData, saveUserData]
    );

    const setActiveCalendar = useCallback(
        (id) => {
            if (!calendars?.[id]) return null;
            saveUserData({ ...(userData || {}), activeCalendarId: id });
            return calendars[id];
        },
        [calendars, userData, saveUserData]
    );

    // actualizar un calendario existente (merge superficial)
    const updateCalendar = useCallback(
        (id, patch) => {
            const original = calendars?.[id];
            if (!original) return null;
            const now = new Date().toISOString();
            const updated = { ...original, ...patch, updatedAt: now };
            const next = {
                ...(userData || {}),
                calendars: { ...(userData?.calendars || {}), [id]: updated },
                activeCalendarId: userData?.activeCalendarId ?? id,
            };
            saveUserData(next);
            return updated;
        },
        [calendars, userData, saveUserData]
    );

    return useMemo(
        () => ({ calendars, activeCalendarId, createCalendar, cloneCalendar, deleteCalendar, setActiveCalendar, updateCalendar }),
        [calendars, activeCalendarId, createCalendar, cloneCalendar, deleteCalendar, setActiveCalendar, updateCalendar]
    );
}
