import * as SecureStore from "expo-secure-store";
import { apiRequest } from "./api";

// Registrar usuario
export async function registerUser(userData) {
    const data = await apiRequest("/api/users/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });

    // Guardar el token recibido
    if (data.token) {
        await SecureStore.setItemAsync("authToken", data.token);
    }

    return data;
}

// Iniciar sesión
export async function loginUser(credentials) {
    const data = await apiRequest("/api/users/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    // Guardar el token recibido
    if (data.token) {
        await SecureStore.setItemAsync("authToken", data.token);
    }

    return data;
}

// Cerrar sesión
export async function logoutUser() {
    await SecureStore.deleteItemAsync("authToken");
}