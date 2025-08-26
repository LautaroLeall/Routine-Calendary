// src/routes/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Calendar from "../pages/Calendar";
import Routines from "../pages/Routines";

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
            path="/dashboard"
            element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            }
        />
        <Route
            path="/profile"
            element={
                <PrivateRoute>
                    <Profile />
                </PrivateRoute>
            }
        />
        <Route
            path="/calendar"
            element={
                <PrivateRoute>
                    <Calendar />
                </PrivateRoute>
            }
        />
        <Route
            path="/routines"
            element={
                <PrivateRoute>
                    <Routines />
                </PrivateRoute>
            }
        />
    </Routes>
);

export default AppRoutes;