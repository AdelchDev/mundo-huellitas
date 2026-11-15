import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiRequest(endpoint, options = {}) {
    if (!API_URL) {
        throw new Error("No está configurada EXPO_PUBLIC_API_URL");
    }

    const token = await SecureStore.getItemAsync("authToken");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Si hay un token guardado, lo enviamos al backend
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Error en la petición");
    }

    return data;
}