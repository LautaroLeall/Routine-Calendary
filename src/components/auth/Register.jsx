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
import UsageModal from "../ui/RegisterModal";
import "../../styles/Register.css";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        purpose: [],
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // Loader/disable
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Maneja cambios en inputs ---
    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    // --- Maneja selección de propósito ---
    const handlePurposeSelect = (selected) => {
        setForm((prev) => ({ ...prev, purpose: selected }));
    };

    // --- Validaciones del formulario ---
    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.trim())) {
            throw new Error("Debes ingresar un email válido.");
        }
        if (form.username.trim().length < 3) {
            throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
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

    // --- Maneja envío del formulario ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            validateForm();

            await register({
                email: form.email.trim().toLowerCase(),
                username: form.username.trim(),
                password: form.password,
                purpose: form.purpose,
            });

            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Error en el registro");
        } finally {
            setIsSubmitting(false);
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
                    {/* Mensaje de error */}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Email */}
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

                    {/* Username */}
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

                    {/* Password */}
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

                    {/* Confirm Password */}
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

                    {/* Propósito */}
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
                        <button className="btn-register" disabled={isSubmitting}>
                            {isSubmitting ? "Registrando..." : "Registrarme"}
                        </button>
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
