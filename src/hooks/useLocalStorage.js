// src/hooks/useLocalStorage.js
// Hook para sincronizar estado con localStorage.
// - Soporta lazy initialValue (función o valor).
// - Sincroniza entre pestañas (storage event).
// - Soporta debounce opcional para reducir escrituras frecuentes.
// - Permite custom serializer/deserializer.
// - Maneja errores de lectura/escritura de manera segura.

import { useState, useEffect, useRef, useCallback } from "react";

export function useLocalStorage(
    key,
    initialValue,
    {
        serializer = JSON.stringify,    // cómo serializar antes de guardar
        deserializer = JSON.parse,      // cómo parsear al leer
        syncAcrossTabs = true,          // sincroniza cambios entre pestañas
        debounce = 0,                   // milisegundos; 0 = sin debounce
    } = {}
) {
    // --- Leer valor inicial (lazy init) ---
    const readInitial = () => {
        if (typeof window === "undefined") {
            // SSR: devolvemos initialValue si no hay localStorage
            return typeof initialValue === "function" ? initialValue() : initialValue;
        }
        try {
            const raw = localStorage.getItem(key);
            if (raw !== null) return deserializer(raw);
            return typeof initialValue === "function" ? initialValue() : initialValue;
        } catch (err) {
            console.error("useLocalStorage read error:", err);
            return typeof initialValue === "function" ? initialValue() : initialValue;
        }
    };

    const [state, setState] = useState(readInitial);

    const writeTimeout = useRef(null);  // para debounce
    const mounted = useRef(false);      // marca si el componente ya montó

    // --- Persistir en localStorage ---
    useEffect(() => {
        if (typeof window === "undefined") return;

        const write = () => {
            try {
                localStorage.setItem(key, serializer(state));
            } catch (err) {
                console.error("useLocalStorage write error:", err);
            }
        };

        if (debounce > 0) {
            clearTimeout(writeTimeout.current);
            writeTimeout.current = setTimeout(write, debounce);
            return () => clearTimeout(writeTimeout.current);
        } else {
            write();
        }
    }, [key, state, serializer, debounce]);

    // --- Sincronizar entre pestañas ---
    useEffect(() => {
        if (!syncAcrossTabs || typeof window === "undefined") return;

        const handler = (e) => {
            if (e.key !== key) return;
            try {
                const newVal = e.newValue ? deserializer(e.newValue) : null;
                setState((prev) => {
                    const same = JSON.stringify(prev) === JSON.stringify(newVal);
                    return same ? prev : newVal;
                });
            } catch (err) {
                console.error("useLocalStorage storage event parse error:", err);
            }
        };

        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, [key, deserializer, syncAcrossTabs]);

    // --- Setter estable ---
    const setStoredState = useCallback((valOrFn) => {
        setState((prev) => (typeof valOrFn === "function" ? valOrFn(prev) : valOrFn));
    }, []);

    // --- marcar montaje (opcional, útil para efectos condicionales) ---
    useEffect(() => {
        mounted.current = true;
    }, []);

    // --- Retorno del hook ---
    // [state actual, setter estable]
    return [state, setStoredState];
}
