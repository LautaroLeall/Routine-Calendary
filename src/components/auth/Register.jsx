import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", tipoCalendario: "semanal" });
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            register(form);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Registro</h2>
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
                <div className="mb-3">
                    <label className="form-label">Tipo de calendario</label>
                    <select value={form.tipoCalendario} onChange={e => setForm({ ...form, tipoCalendario: e.target.value })} className="form-select">
                        <option value="semanal">Semanal</option>
                        <option value="mensual">Mensual</option>
                    </select>
                    <small className="form-text text-muted">Esta elección será fija hasta que completes tu primera rutina.</small>
                </div>
                <button className="btn btn-primary">Registrarme</button>
            </form>
        </div>
    );
}
