// src/components/auth/Login.jsx
// - Formulario de login que acepta email o username (campo 'identifier') y password.
// - Tiene botón para mostrar/ocultar la contraseña.
// - Al validar correctamente redirige al Dashboard.
// - Añadir ruta /login que renderice este componente.
// - Consume login() desde AuthContext.

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    // login desde el contexto (compara identifier + password con localStorage)
    const { login } = useAuth();
    const navigate = useNavigate();

    // estado del formulario
    const [form, setForm] = useState({ identifier: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // toggle mostrar contraseña

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
        <div className="container mt-5" style={{ maxWidth: 640 }}>
            <h2>Iniciar sesión</h2>
            <p className="text-muted">Usa tu email o tu nombre de usuario.</p>

            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                    <label className="form-label">Email o usuario</label>
                    <input
                        name="identifier"
                        value={form.identifier}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="email@o_usuario"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <div className="input-group">
                        <input
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            required
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(s => !s)}
                        >
                            {showPassword ? "Ocultar" : "Ver"}
                        </button>
                    </div>
                </div>

                <button className="btn btn-primary">Entrar</button>
            </form>
        </div>
    );
}
