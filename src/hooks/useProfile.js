// src/hooks/useProfile.js
// Wrapper que compone useProfileForm + useProfileAvatar.
// Toma useAuth + useAppData y devuelve la API combinada.

import { useState } from "react";
import { useAuth } from "./useAuth";
import { useAppData } from "./useAppData";
import { useProfileForm } from "./useProfileForm";
import { useProfileAvatar } from "./useProfileAvatar";

export function useProfile() {
    const { user, updateUser, changePassword, logout, deleteUser } = useAuth();
    const { userData, saveUserData } = useAppData();

    // initial values (prefiere appData.profile)
    const prof = userData?.profile;
    const initialForm = {
        email: prof?.email || user?.email || "",
        username: prof?.username || user?.username || "",
        purpose: Array.isArray(prof?.purpose) ? prof.purpose : (Array.isArray(user?.purpose) ? user.purpose : []),
    };
    const initialAvatar = prof?.avatar || user?.avatar || null;

    // modal state para propósitos
    const [isModalOpen, setIsModalOpen] = useState(false);

    // sub-hooks
    const formAPI = useProfileForm({
        user,
        userData,
        updateUser,
        saveUserData,
        changePassword,
        logout,
        deleteUser,
        initialForm,
    });

    const avatarAPI = useProfileAvatar({
        initialAvatar,
        user,
        updateUser,
        saveUserData,
    });

    // combinar y retornar una sola API
    return {
        // form
        ...formAPI,

        // avatar
        ...avatarAPI,

        // modal
        isModalOpen,
        setIsModalOpen,
    };
}
