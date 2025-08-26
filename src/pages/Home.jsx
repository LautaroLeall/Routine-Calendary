// src/pages/Home.jsx
import React from "react";
import "../styles/Home.css";
import { FaTachometerAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";

const Home = () => {
    // Datos de las cards, para hacer todo más dinámico
    const cards = [
        {
            title: "Dashboard",
            description: "Accede a tu panel y revisa tus rutinas y actividades.",
            link: "/dashboard",
            icon: <FaTachometerAlt />,
            color: "card-dashboard",
        },
        {
            title: "Login",
            description: "Inicia sesión si ya tienes una cuenta.",
            link: "/login",
            icon: <FaSignInAlt />,
            color: "card-login",
        },
        {
            title: "Register",
            description: "Crea una nueva cuenta para empezar a usar la app.",
            link: "/register",
            icon: <FaUserPlus />,
            color: "card-register",
        },
    ];

    return (
        <div className="home-container">
            <h1 className="home-title">Bienvenido a Routine Calendary</h1>
            <p className="home-subtitle">Selecciona una opción para comenzar:</p>

            <div className="cards-container">
                {cards.map((card, index) => (
                    <div key={index} className={`home-card ${card.color}`}>
                        <div className="card-icon">{card.icon}</div>
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                        <a href={card.link} className="card-button">
                            Ir a {card.title}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
