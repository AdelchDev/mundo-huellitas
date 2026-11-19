import { apiRequest } from './api';
import { normalizePosteo, normalizeId } from './normalize';

/**
 * GET /api/posteos — feed público
 */
export async function getPosteos() {
    const data = await apiRequest('/api/posteos');
    const lista = Array.isArray(data) ? data : [];
    return lista.map(normalizePosteo);
}

/**
 * GET /api/posteos/mis-posteos — Bearer + rol refugio
 */
export async function getMisPosteos() {
    const data = await apiRequest('/api/posteos/mis-posteos');
    const lista = Array.isArray(data) ? data : [];
    return lista.map(normalizePosteo);
}

/**
 * GET /api/posteos/:id
 */
export async function getPosteoById(id) {
    const data = await apiRequest(`/api/posteos/${id}`);
    return normalizePosteo(data);
}

/**
 * POST /api/posteos — Bearer + rol refugio
 * Body: titulo, texto, imagen, animal_id (debe ser del refugio)
 */
export async function crearPosteo({ titulo, texto, imagen, animal_id }) {
    const payload = {
        titulo: String(titulo || '').trim(),
        texto: String(texto || '').trim(),
        imagen: String(imagen || '').trim(),
        animal_id: normalizeId(animal_id),
    };

    const data = await apiRequest('/api/posteos', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return {
        ...data,
        posteoId: normalizeId(data.posteoId || data.insertedId),
    };
}

/**
 * PUT /api/posteos/:id
 */
export async function actualizarPosteo(id, partial) {
    return apiRequest(`/api/posteos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(partial),
    });
}

/**
 * DELETE /api/posteos/:id
 */
export async function eliminarPosteo(id) {
    return apiRequest(`/api/posteos/${id}`, {
        method: 'DELETE',
    });
}
