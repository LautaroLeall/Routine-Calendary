// src/components/auth/Register.jsx
// - Formulario de registro con campos: email, username, password, confirmPassword.
// - Permite alternar la visibilidad de las contraseñas con íconos de react-icons.
// - Incluye botón que abre un modal (UsageModal) para elegir propósito del calendario.
// - Llama a register() del AuthContext y redirige al Dashboard.
// - Importar y añadir ruta /register.
// - Reemplaza el componente previo si existe.

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";  // Icono ver contraseña
import { FaEyeSlash } from "react-icons/fa";   // Icono ocultar contraseña
import UsageModal from "./UsageModal";         // Modal para elegir propósito
import "../../styles/Register.css";            // Estilos del register

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
        purpose: [] // el usuario puede elegir varias opciones desde el modal
    });

    // estado para mostrar/ocultar contraseñas
    const [showPasswords, setShowPasswords] = useState(false);

    // estado de error en validación
    const [error, setError] = useState("");

    // estado para controlar si se abre el modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Maneja cambios en inputs (reutilizable)
    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // Maneja selección de propósito (desde el modal)
    const handlePurposeSelect = (selected) => {
        setForm(prev => ({ ...prev, purpose: selected }));
    };

    // Submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (form.password !== form.confirmPassword) {
                throw new Error("Las contraseñas no coinciden.");
            }
            if (form.purpose.length === 0) {
                throw new Error("Debes elegir al menos un propósito.");
            }
            // Llamamos al contexto para crear usuario
            await register({
                email: form.email.trim(),
                username: form.username.trim(),
                password: form.password,
                purpose: form.purpose
            });
            // Redirigir al dashboard
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Error en el registro");
        }
    };

    return (
        <div className="register-container">
            <h2 className="register-title">Registro</h2>
            <p className="register-subtitle">Crea tu cuenta para empezar a organizar tus rutinas.</p>

            <form onSubmit={handleSubmit} className="register-form">
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Campo Email */}
                <div className="form-group mb-3">
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

                {/* Campo Username */}
                <div className="form-group mb-3">
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="tu_usuario"
                        required
                    />
                    <small className="text-muted">Lo usarás también para iniciar sesión.</small>
                </div>

                {/* Contraseña y Confirmar contraseña */}
                <div className="form-row mb-3">
                    <div className="form-group password-group mb-3">
                        <div className="password-input d-flex align-items-center">
                            <input
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                type={showPasswords ? "text" : "password"}
                                className="form-control"
                                placeholder="contraseña"
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

                    <div className="form-group password-group">
                        <div className="password-input d-flex align-items-center">
                            <input
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                type={showPasswords ? "text" : "password"}
                                className="form-control"
                                placeholder="confirmar contraseña"
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
                </div>

                {/* Botón que abre el modal */}
                <div className="form-group mb-4">
                    <button
                        type="button"
                        className="btn-modal"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Seleccionar propósito
                    </button>
                    {form.purpose.length > 0 && (
                        <p className="selected-purpose">
                            Seleccionado: {form.purpose.join(", ")}
                        </p>
                    )}
                </div>

                <div className="d-flex justify-content-center">
                    {/* Botón de registro */}
                    <button className="btn-register">Registrarme</button>
                </div>
            </form>

            {/* Modal de propósitos */}
            <UsageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handlePurposeSelect}
                initialSelected={form.purpose}
            />
        </div>
    );
}
