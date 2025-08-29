// src/hooks/useCalendars.js
// Hook helper para manejar calendarios de userData
// Funcionalidades: crear, clonar, eliminar, actualizar, cambiar activo

import { useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppData } from "../hooks/useAppData";

export default function useCalendars() {
    const { userData, saveUserData } = useAppData();

    // --- Memo para no recrear cada render ---
    const calendars = useMemo(() => userData?.calendars || {}, [userData]);
    const activeCalendarId = userData?.activeCalendarId || null;

    // --- Crear calendario ---
    const createCalendar = useCallback(
        ({ name = "Nuevo calendario", type = "weekly", color = "#00c176", template } = {}) => {
            const id = `cal_${uuidv4()}`;
            const now = new Date().toISOString();
            const baseTemplate = type === "weekly" ? { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] } : {};
            const newCal = { id, name, type, color, template: template ?? baseTemplate, events: {}, createdAt: now, updatedAt: now };
            const next = { ...(userData || {}), calendars: { ...(userData?.calendars || {}), [id]: newCal }, activeCalendarId: id };
            saveUserData(next);
            return newCal;
        },
        [userData, saveUserData]
    );

    // --- Clonar calendario ---
    const cloneCalendar = useCallback(
        (id) => {
            const original = calendars?.[id];
            if (!original) return null;
            const now = new Date().toISOString();
            const newId = `cal_${uuidv4()}`;
            const cloned = { ...original, id: newId, name: `${original.name} (copia)`, createdAt: now, updatedAt: now };
            const next = { ...(userData || {}), calendars: { ...(userData?.calendars || {}), [newId]: cloned }, activeCalendarId: newId };
            saveUserData(next);
            return cloned;
        },
        [calendars, userData, saveUserData]
    );

    // --- Eliminar calendario ---
    const deleteCalendar = useCallback(
        (id) => {
            if (!calendars?.[id]) return;
            const { [id]: _, ...rest } = calendars;
            const nextActive = activeCalendarId === id ? Object.keys(rest)[0] ?? null : activeCalendarId;
            const next = { ...(userData || {}), calendars: rest, activeCalendarId: nextActive };
            saveUserData(next);
        },
        [calendars, activeCalendarId, userData, saveUserData]
    );

    // --- Cambiar calendario activo ---
    const setActiveCalendar = useCallback(
        (id) => {
            if (!calendars?.[id]) return null;
            saveUserData({ ...(userData || {}), activeCalendarId: id });
            return calendars[id];
        },
        [calendars, userData, saveUserData]
    );

    // --- Actualizar calendario existente ---
    const updateCalendar = useCallback(
        (id, patch) => {
            const original = calendars?.[id];
            if (!original) return null;
            const now = new Date().toISOString();
            const updated = { ...original, ...patch, updatedAt: now };
            const next = { ...(userData || {}), calendars: { ...(userData?.calendars || {}), [id]: updated }, activeCalendarId: userData?.activeCalendarId ?? id };
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
