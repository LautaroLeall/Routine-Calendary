// src/components/auth/Login.jsx
// - Formulario de login que acepta email o username (campo 'identifier') y password.
// - Botón para mostrar/ocultar la contraseña.
// - Al validar correctamente redirige al Dashboard.
// - Añadir ruta /login que renderice este componente.
// - Consume login() desde AuthContext.
// - Mejoras: async/await en login, loader, comentarios detallados, accesibilidad.

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { RiExpandLeftLine } from "react-icons/ri";
import "../../styles/Login.css";

export default function Login() {
    const { login } = useAuth();       // función login desde AuthContext
    const navigate = useNavigate();

    // --- Estado del formulario ---
    const [form, setForm] = useState({ identifier: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);   // Loader para mostrar durante login
    const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar contraseña

    // --- Manejo de cambios en inputs ---
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // --- Manejo de submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Llamamos a login del AuthContext
            await login({ identifier: form.identifier.trim(), password: form.password });
            navigate("/dashboard"); // Redirige al Dashboard
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            {/* Link de retroceso */}
            <Link to="/" className="back-link-login">
                <RiExpandLeftLine />
            </Link>

            <div className="login-container">
                <h2 className="login-title">Iniciar sesión</h2>
                <p className="login-subtitle">Usa tu email o tu nombre de usuario.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    {/* Mensaje de error */}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Campo identifier (email o username) */}
                    <div className="form-group mb-3">
                        <input
                            name="identifier"
                            value={form.identifier}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="tu@correo.com o tu_usuario"
                            required
                            aria-label="Email o nombre de usuario"
                        />
                    </div>

                    {/* Campo contraseña con toggle */}
                    <div className="form-group password-group mb-3">
                        <div className="password-input d-flex align-items-center">
                            <input
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="contraseña"
                                required
                                aria-label="Contraseña"
                            />
                            <span
                                className="password-toggle ms-2"
                                onClick={() => setShowPassword(s => !s)}
                                role="button"
                                tabIndex={0}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowPassword(s => !s); }}
                            >
                                {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                            </span>
                        </div>
                    </div>

                    {/* Botón de login */}
                    <div className="d-flex justify-content-center mb-3">
                        <button className="btn-login" disabled={loading}>
                            {loading ? "Ingresando..." : "Entrar"}
                        </button>
                    </div>

                    {/* Link a registro */}
                    <div className="d-flex justify-content-end">
                        <Link to="/register" className="btn-link">
                            ¿No tienes cuenta?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
