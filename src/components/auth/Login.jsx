import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            login(form);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="form-control" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="form-control" required />
                </div>
                <button className="btn btn-primary">Entrar</button>
            </form>
        </div>
    );
}
