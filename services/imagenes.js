import { File } from 'expo-file-system';
import { apiRequest } from './api';

export async function subirImagen(imagenUri, mimeType) {
    if (!imagenUri) {
        throw new Error('No se seleccionó ninguna imagen');
    }

    const archivo = new File(imagenUri);
    const tipoImagen = mimeType || archivo.type || 'image/jpeg';

    const data = await apiRequest('/api/imagenes', {
        method: 'POST',
        headers: {
            'Content-Type': tipoImagen,
        },
        body: archivo,
    });

    return data.url;
}

