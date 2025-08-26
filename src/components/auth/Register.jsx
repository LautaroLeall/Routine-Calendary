// src/components/auth/Register.jsx
// - Captura email, username, password y confirmPassword.
// - Permite mostrar/ocultar contraseñas con íconos.
// - Incluye modal (UsageModal) para elegir propósito(s) del calendario.
// - Llama a register() del AuthContext y redirige al dashboard.

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5"; 
import { FaEyeSlash } from "react-icons/fa"; 
import { RiExpandLeftLine } from "react-icons/ri";
import UsageModal from "./UsageModal";  
import "../../styles/Register.css";    

export default function Register() {
    const { register } = useAuth();       // función para registrar usuario
    const navigate = useNavigate();

    // Estado del formulario
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        purpose: [] // el usuario puede elegir uno o varios propósitos desde el modal
    });

    // Estados independientes para mostrar/ocultar contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estado de errores de validación
    const [error, setError] = useState("");

    // Estado del modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Maneja cambios en inputs de texto
    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    // Maneja selección de propósito desde el modal
    const handlePurposeSelect = (selected) => {
        setForm((prev) => ({ ...prev, purpose: selected }));
    };

    // Validaciones personalizadas del formulario
    const validateForm = () => {
        if (!form.email.includes("@")) {
            throw new Error("Debes ingresar un email válido.");
        }
        if (form.password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }
        if (form.password !== form.confirmPassword) {
            throw new Error("Las contraseñas no coinciden.");
        }
        if (form.purpose.length === 0) {
            throw new Error("Debes elegir al menos un propósito.");
        }
    };

    // Maneja envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Validamos antes de enviar
            validateForm();

            // Creamos el usuario con AuthContext
            await register({
                email: form.email.trim(),
                username: form.username.trim(),
                password: form.password,
                purpose: form.purpose,
            });

            // Redirigimos al dashboard
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Error en el registro");
        }
    };

    return (
        <div className="container">
            <Link to="/" className="back-link-register">
                <RiExpandLeftLine />
            </Link>
            <div className="register-container">
                <h2 className="register-title">Registro</h2>
                <p className="register-subtitle">
                    Crea tu cuenta para empezar a organizar tus rutinas.
                </p>

                <form onSubmit={handleSubmit} className="register-form">
                    {/* Mensaje de error en validaciones */}
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
                        <small className="text-muted">
                            Lo usarás también para iniciar sesión.
                        </small>
                    </div>

                    {/* Campo Contraseña */}
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
                            />
                            <span
                                className="password-toggle ms-2"
                                onClick={() => setShowPassword((s) => !s)}
                            >
                                {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                            </span>
                        </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="form-group password-group mb-3">
                        <div className="password-input d-flex align-items-center">
                            <input
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="confirmar contraseña"
                                required
                            />
                            <span
                                className="password-toggle ms-2"
                                onClick={() => setShowConfirmPassword((s) => !s)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                            </span>
                        </div>
                    </div>

                    {/* Botón para abrir modal de propósito */}
                    <div className="form-group mb-4">
                        <button
                            type="button"
                            className="btn-modal mb-1"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Seleccionar propósito
                        </button>
                        {form.purpose.length > 0 && (
                            <p className="selected-purpose ms-1" style={{ fontSize: "0.8em" }}>
                                Seleccionado: {form.purpose.join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Botón de registro */}
                    <div className="d-flex justify-content-center mb-3">
                        <button className="btn-register">Registrarme</button>
                    </div>

                    <div className="d-flex justify-content-end">
                        <Link to="/login" className="btn-link">
                            ¿Ya tienes cuenta?
                        </Link>
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
        </div>
    );
}
