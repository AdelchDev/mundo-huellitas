import * as SecureStore from "expo-secure-store";
import { apiRequest } from "./api";

const USE_AUTH_MOCK = process.env.EXPO_PUBLIC_USE_AUTH_MOCK === "true";
const AUTH_USER_KEY = "authUser";
const MOCK_USERS_KEY = "mockUsers";

async function getMockUsers() {
    const raw = await SecureStore.getItemAsync(MOCK_USERS_KEY);
    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

async function saveMockSession(user) {
    const data = {
        token: "mock-token",
        user,
    };

    await SecureStore.setItemAsync("authToken", data.token);
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));

    return data;
}

function crearIdUsuario(rol) {
    const prefijo = rol === "refugio" ? "refugio" : "adoptante";
    return `${prefijo}_${Date.now()}`;
}

// Registrar usuario
export async function registerUser(userData) {
    if (USE_AUTH_MOCK) {
        const email = userData.email.trim().toLowerCase();
        const rol = userData.rol || "adoptante";
        const users = await getMockUsers();
        const existente = users[email];

        const user = {
            id: existente?.id || crearIdUsuario(rol),
            nombre: userData.nombre,
            email,
            telefono: userData.telefono || "",
            direccion: userData.direccion || "",
            rol,
        };

        users[email] = user;
        await SecureStore.setItemAsync(MOCK_USERS_KEY, JSON.stringify(users));

        return saveMockSession(user);
    }

    const data = await apiRequest("/api/users/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });

    if (data.token) {
        await SecureStore.setItemAsync("authToken", data.token);
    }

    if (data.user) {
        await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(data.user));
    }

    return data;
}

// Iniciar sesión
export async function loginUser(credentials) {
    if (USE_AUTH_MOCK) {
        const email = credentials.email.trim().toLowerCase();
        const users = await getMockUsers();
        const savedUser = users[email];

        const user = savedUser || {
            id: crearIdUsuario("adoptante"),
            email,
            telefono: "",
            direccion: "",
            rol: "adoptante",
        };

        return saveMockSession(user);
    }

    const data = await apiRequest("/api/users/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    if (data.token) {
        await SecureStore.setItemAsync("authToken", data.token);
    }

    if (data.user) {
        await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(data.user));
    }

    return data;
}

export async function getCurrentUser() {
    const raw = await SecureStore.getItemAsync(AUTH_USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export async function getUserById(idUsuario) {
    if (!idUsuario) return null;

    const users = await getMockUsers();
    return (
        Object.values(users).find((user) => user.id === idUsuario) || null
    );
}

export async function getUsuariosMock() {
    const users = await getMockUsers();
    return Object.values(users);
}

export async function updateCurrentUser(partial) {
    const current = await getCurrentUser();

    if (!current) {
        throw new Error("No hay una sesión activa.");
    }

    const updated = {
        ...current,
        ...partial,
        email: current.email,
        id: current.id,
        rol: current.rol,
    };

    if (USE_AUTH_MOCK) {
        const users = await getMockUsers();
        users[updated.email] = updated;
        await SecureStore.setItemAsync(MOCK_USERS_KEY, JSON.stringify(users));
        return saveMockSession(updated);
    }

    const data = await apiRequest("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(partial),
    });

    const user = data.user || { ...current, ...partial };
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
    return { token: data.token, user };
}

// Cerrar sesión (solo token + usuario actual)
export async function logoutUser() {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
}

/**
 * Borra TODO el almacenamiento local mock (sesión + usuarios guardados).
 * Útil en desarrollo: `npx expo start -c` NO limpia SecureStore del celular.
 */
export async function clearAllLocalData() {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
    await SecureStore.deleteItemAsync(MOCK_USERS_KEY);
}
