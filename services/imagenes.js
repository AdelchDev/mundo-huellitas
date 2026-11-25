import * as FileSystem from 'expo-file-system/legacy';

import { apiRequest } from './api';

async function leerBase64(uri) {
    try {
        return await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
    } catch (error) {
        const destino = `${FileSystem.cacheDirectory}foto-${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: uri, to: destino });
        return FileSystem.readAsStringAsync(destino, {
            encoding: FileSystem.EncodingType.Base64,
        });
    }
}

/**
 * Lee la foto del teléfono y la guarda en el backend.
 * Devuelve una URL http para persistir en la publicación.
 */
export async function subirFoto(uri, mime = 'image/jpeg') {
    const tipo = mime.startsWith('image/') ? mime : 'image/jpeg';
    const base64 = await leerBase64(uri);

    const data = await apiRequest('/api/imagenes/local-json', {
        method: 'POST',
        body: JSON.stringify({ base64, mime: tipo }),
    });

    if (!data?.url) {
        throw new Error('El servidor no devolvió la dirección de la foto.');
    }

    return data.url;
}
