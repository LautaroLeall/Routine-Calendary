// src/components/auth/Register.jsx
// - Formulario de registro con campos: email, username, password, confirmPassword, purpose.
// - Validaciones básicas: campos requeridos y que las contraseñas coincidan.
// - Permite alternar la visibilidad de las contraseñas.
// - Llama a register() del AuthContext y redirige al Dashboard.
// - Importar y añadir ruta /register.
// - Reemplaza el componente previo si existe.

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
    // useAuth nos da la función register que persiste al usuario en localStorage
    const { register } = useAuth();
    const navigate = useNavigate();

    // estado del formulario
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        purpose: "gym"
    });
    const [showPasswords, setShowPasswords] = useState(false); // toggle ver/ocultar
    const [error, setError] = useState("");

    // Maneja cambios en inputs (reutilizable)
    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // Submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (form.password !== form.confirmPassword) {
                throw new Error("Las contraseñas no coinciden.");
            }
            // Llamamos al contexto para crear usuario
            await register({
                email: form.email.trim(),
                username: form.username.trim(),
                password: form.password,
                purpose: form.purpose
            });
            // Redirigir al dashboard (puedes redirigir a un "setup" si prefieres)
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Error en el registro");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 640 }}>
            <h2>Registro</h2>
            <p className="text-muted">Crea tu cuenta para empezar a organizar tus rutinas.</p>

            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        className="form-control"
                        placeholder="tu@correo.com"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Nombre de usuario</label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="tu_usuario"
                        required
                    />
                    <small className="text-muted">Lo usarás para iniciar sesión también.</small>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            type={showPasswords ? "text" : "password"}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Confirmar contraseña</label>
                        <input
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            type={showPasswords ? "text" : "password"}
                            className="form-control"
                            required
                        />
                    </div>
                </div>

                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="showPasswords"
                        checked={showPasswords}
                        onChange={() => setShowPasswords(s => !s)}
                    />
                    <label className="form-check-label" htmlFor="showPasswords">
                        Ver contraseñas
                    </label>
                </div>

                <div className="mb-3">
                    <label className="form-label">¿Para qué vas a usar Routine-Calendary?</label>
                    <select
                        name="purpose"
                        value={form.purpose}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="gym">Gym / Entrenamiento</option>
                        <option value="work">Trabajo / Productividad</option>
                        <option value="home">Hogar / Tareas</option>
                        <option value="study">Estudio / Cursos</option>
                        <option value="other">Otro</option>
                    </select>
                    <small className="text-muted">Podrás cambiar esto luego en tu perfil.</small>
                </div>

                <button className="btn btn-primary">Registrarme</button>
            </form>
        </div>
    );
}
