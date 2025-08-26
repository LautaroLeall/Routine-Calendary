// src/hooks/useLocalStorage.js
// Hook para sincronizar estado con localStorage.
// - Soporta lazy initialValue (función).
// - Sincroniza entre pestañas (storage event).
// - Opcional: debounce para reducir escrituras.
// - Opcional: custom serializer/deserializer.

import { useState, useEffect, useRef, useCallback } from "react";

export function useLocalStorage(
    key,
    initialValue,
    {
        serializer = JSON.stringify,
        deserializer = JSON.parse,
        syncAcrossTabs = true,
        debounce = 0, // milisegundos; 0 = sin debounce
    } = {}
) {
    // Lazy initializer (maneja función o valor)
    const readInitial = () => {
        if (typeof window === "undefined") {
            // SSR safety: devolver initialValue (o resultado si es función)
            return typeof initialValue === "function" ? initialValue() : initialValue;
        }
        try {
            const raw = localStorage.getItem(key);
            if (raw !== null) {
                return deserializer(raw);
            }
            return typeof initialValue === "function" ? initialValue() : initialValue;
        } catch (err) {
            console.error("useLocalStorage read error:", err);
            return typeof initialValue === "function" ? initialValue() : initialValue;
        }
    };

    const [state, setState] = useState(readInitial);
    const writeTimeout = useRef(null);
    const mounted = useRef(false);

    // Persistir en localStorage cuando cambie el estado (con debounce opcional)
    useEffect(() => {
        if (typeof window === "undefined") return;

        // no escribir en el primer render si el valor vino de localStorage
        // pero aquí nos quedamos con el comportamiento por defecto: siempre escribimos (es seguro).
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

    // Sincronizar entre pestañas si syncAcrossTabs = true
    useEffect(() => {
        if (!syncAcrossTabs || typeof window === "undefined") return;

        const handler = (e) => {
            if (e.key !== key) return;
            try {
                // e.newValue puede ser null si borraron la key
                const newVal = e.newValue ? deserializer(e.newValue) : null;
                // evitar hacer setState innecesario si es igual (shallow compare)
                setState((prev) => {
                    // simple check
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

    // Setter estable (acepta función como setState)
    const setStoredState = useCallback((valOrFn) => {
        setState((prev) => (typeof valOrFn === "function" ? valOrFn(prev) : valOrFn));
    }, []);

    // marcar que ya montamos (opcional)
    useEffect(() => {
        mounted.current = true;
    }, []);

    return [state, setStoredState];
}
