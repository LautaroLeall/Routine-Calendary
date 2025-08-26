// src/components/ui/NavBar.js
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/NavBar.css";
import "../../styles/NavbarPhone.css";

// NavBar con SweetAlert2 para confirmar cierre de sesión.
export default function NavBar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleMenu = () => setMenuOpen((s) => !s);
    const closeMenu = () => setMenuOpen(false);

    // Handler que muestra SweetAlert2 antes de hacer logout
    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "¿Cerrar sesión?",
            text: "Vas a salir de tu cuenta. ¿Querés continuar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            focusCancel: true,
            customClass: {
                popup: "swal2-theme-dark",
            },
        });

        if (result.isConfirmed) {
            // Ejecuta el logout del contexto
            logout();

            // redirigir a login (útil si PrivateRoute necesita la ruta)
            navigate("/login");

            // Mensaje final (opcional)
            Swal.fire({
                title: "Sesión cerrada",
                icon: "success",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1500,
            });
        }
    };

    const initials = user ? (user.username || user.email || "U").slice(0, 2).toUpperCase() : "U";

    return (
        <nav key={location.pathname} className="app-nav">
            <div className="nav-left">
                <motion.div
                    className="logo-wrap"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 14 }}
                >
                    <Link to="/dashboard" className="logo-link" onClick={closeMenu} aria-label="Ir al Dashboard">
                        <span className="logo-main">Routine Calendary</span>
                        <span className="logo-accent">App</span>
                    </Link>

                    <motion.span
                        className="logo-accent-bar"
                        animate={{ scaleX: [0, 1] }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                    />
                </motion.div>
            </div>

            <button
                className="nav-hamburger"
                onClick={toggleMenu}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
            >
                <FaBars />
            </button>

            <ul className="nav-menu">
                <li>
                    <Link to="/dashboard" className="nav-link">DASBHBOARD</Link>
                </li>
                <li>
                    <Link to="/calendar" className="nav-link">CALENDARY</Link>
                </li>
                <li>
                    <Link to="/routines" className="nav-link">ROUTINES</Link>
                </li>
            </ul>

            <div className="nav-user-panel">
                {user ? (
                    <>
                        <motion.div
                            className="user-greeting"
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45 }}
                        >
                            <Link to="/profile" className="text-decoration-none d-flex align-items-center gap-2">
                                <div className="avatar" title={user.username || user.email}>
                                    <FaUserCircle className="avatar-icon" />
                                    <span className="avatar-initials">{initials}</span>
                                </div>

                                <div className="greeting-text">
                                    <span className="small">Hola</span>
                                    <strong className="username">{user.username || user.email}</strong>
                                </div>
                            </Link>
                        </motion.div>

                        <motion.button
                            className="btn-logout"
                            onClick={handleLogout}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            title="Cerrar sesión"
                        >
                            <FaSignOutAlt className="logout-icon" />
                            <span className="logout-text">Salir</span>
                        </motion.button>
                    </>
                ) : (
                    <Link to="/login" className="btn-login" onClick={closeMenu}>
                        Iniciar sesión
                    </Link>
                )}
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.aside
                        className="mobile-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    >
                        <ul className="mobile-menu d-flex flex-column align-items-center justify-content-center">
                            <li>
                                <Link to="/dashboard" className="nav-link">DASBHBOARD</Link>
                            </li>
                            <li>
                                <Link to="/calendar" className="nav-link">CALENDARY</Link>
                            </li>
                            <li>
                                <Link to="/routines" className="nav-link">ROUTINES</Link>
                            </li>
                            <li className="mobile-separator" />
                            {user ? (
                                <>
                                    <li className="mobile-user">
                                        <strong>{user.username || user.email}</strong>
                                    </li>
                                    <li onClick={() => { closeMenu(); handleLogout(); }}>
                                        <button className="mobile-logout">Salir</button>
                                    </li>
                                </>
                            ) : (
                                <li onClick={closeMenu}><Link to="/login">Iniciar sesión</Link></li>
                            )}
                        </ul>
                    </motion.aside>
                )}
            </AnimatePresence>
        </nav>
    );
}
