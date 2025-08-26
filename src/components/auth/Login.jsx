// src/components/auth/Login.jsx
// - Formulario de login que acepta email o username (campo 'identifier') y password.
// - Tiene botón para mostrar/ocultar la contraseña.
// - Al validar correctamente redirige al Dashboard.
// - Añadir ruta /login que renderice este componente.
// - Consume login() desde AuthContext.

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa"; 
import { RiExpandLeftLine } from "react-icons/ri";
import "../../styles/Login.css";

export default function Login() {
    // login desde el contexto (compara identifier + password con localStorage)
    const { login } = useAuth();
    const navigate = useNavigate();

    // estado del formulario
    const [form, setForm] = useState({ identifier: "", password: "" });
    const [error, setError] = useState("");

    // estado para mostrar/ocultar contraseñas
    const [showPasswords, setShowPasswords] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        try {
            login({ identifier: form.identifier.trim(), password: form.password });
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
        }
    };

    return (
        <div className="container">
            <Link to="/" className="back-link-login">
                <RiExpandLeftLine />
            </Link>
            <div className="login-container">
                <h2 className="login-title">Iniciar sesión</h2>
                <p className="login-subtitle">Usa tu email o tu nombre de usuario.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="form-group mb-3">
                        <input
                            name="identifier"
                            value={form.identifier}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="tu@correo.com o tu_usuario"
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <div className="input-group d-flex align-items-center">
                            <input
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                type={showPasswords ? "text" : "password"}
                                placeholder="contraseña"
                                className="form-control"
                                required
                            />
                            <span
                                className="password-toggle ms-2"
                                onClick={() => setShowPasswords(s => !s)}
                            >
                                {showPasswords ? <FaEyeSlash /> : <IoEyeSharp />}
                            </span>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center mb-3">
                        <button className="btn-login">Entrar</button>
                    </div>

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
