import { apiRequest } from "./api";

// Completar perfil de refugio
export async function updateRefugioProfile(profileData) {
    return await apiRequest("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
    });
}