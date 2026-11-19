import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiRequest(endpoint, options = {}) {
    if (!API_URL) {
        throw new Error('No está configurada EXPO_PUBLIC_API_URL');
    }

    const token = await SecureStore.getItemAsync('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });
    } catch (error) {
        throw new Error(
            'No se pudo conectar con el servidor. Verificá que el backend esté corriendo y la IP en EXPO_PUBLIC_API_URL.'
        );
    }

    const raw = await response.text();
    let data = null;

    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch {
            data = { message: raw };
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message || data?.error || `Error HTTP ${response.status}`
        );
    }

    return data;
}

export function getApiUrl() {
    return API_URL;
}
