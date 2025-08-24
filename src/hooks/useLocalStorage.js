// hook simple para sincronizar con localStorage
import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
    const [state, setState] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("useLocalStorage read error:", error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error("useLocalStorage write error:", error);
        }
    }, [key, state]);

    return [state, setState];
}
