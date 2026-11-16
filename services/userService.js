import { updateCurrentUser } from "./authService";
import { apiRequest } from "./api";

// Completar / editar perfil de refugio
export async function updateRefugioProfile(profileData) {
    const useMock = process.env.EXPO_PUBLIC_USE_AUTH_MOCK === "true";

    if (useMock) {
        return updateCurrentUser(profileData);
    }

    return await apiRequest("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
    });
}