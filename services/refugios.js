import { getAnimales } from './animales';
import { getCurrentUser, getUserById } from './authService';
import { normalizeId } from './normalize';
import { getPosteos } from './posteos';

// Centro por defecto solo para la cámara del mapa (no es un refugio fake)
const UBICACION_DEFAULT = {
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
};

const contarPublicaciones = async (idUsuario) => {
    const posteos = await getPosteos();
    const id = normalizeId(idUsuario);
    return posteos.filter(
        (posteo) => normalizeId(posteo.idUsuario || posteo.user_id) === id
    ).length;
};

const contarAnimalesDisponibles = async (idUsuario) => {
    const animales = await getAnimales();
    const id = normalizeId(idUsuario);
    return animales.filter(
        (animal) =>
            normalizeId(animal.idUsuario || animal.user_id) === id &&
            !animal.adoptado
    ).length;
};

const normalizarTelefonoWhatsApp = (telefono) => {
    if (!telefono) return '';
    return String(telefono).replace(/\D/g, '');
};

const validarTelefono = (telefono) => {
    const digitos = normalizarTelefonoWhatsApp(telefono);

    if (digitos.length <= 8) {
        return {
            ok: false,
            mensaje: 'El teléfono debe tener más de 8 dígitos.',
        };
    }

    return { ok: true, digitos };
};

/**
 * Info de un refugio sin datos de prueba.
 * - Si es el usuario logueado: usa SecureStore (perfil).
 * - Si no: solo contadores desde API; contacto/coords vacíos
 *   hasta que el backend exponga listado de refugios.
 */
const getInfoRefugio = async (idUsuario, nombreFallback) => {
    if (!idUsuario) {
        return {
            id: null,
            nombre: nombreFallback || 'Refugio desconocido',
            telefono: '',
            ubicacion: '',
            latitude: null,
            longitude: null,
            cantidadPublicaciones: 0,
            animalesDisponibles: 0,
        };
    }

    const id = normalizeId(idUsuario);
    const [cantidadPublicaciones, animalesDisponibles, usuario] =
        await Promise.all([
            contarPublicaciones(id),
            contarAnimalesDisponibles(id),
            getUserById(id),
        ]);

    return {
        id,
        nombre: usuario?.nombre || nombreFallback || 'Refugio',
        telefono: usuario?.telefono || '',
        ubicacion: usuario?.ubicacion || usuario?.direccion || '',
        latitude:
            typeof usuario?.latitude === 'number' ? usuario.latitude : null,
        longitude:
            typeof usuario?.longitude === 'number' ? usuario.longitude : null,
        cantidadPublicaciones,
        animalesDisponibles,
    };
};

/**
 * Refugios para el mapa: IDs reales de animales/posteos del backend.
 * Solo pins con coordenadas conocidas (perfil del usuario logueado).
 */
const getRefugiosParaMapa = async () => {
    const [animales, posteos, sesion] = await Promise.all([
        getAnimales(),
        getPosteos(),
        getCurrentUser(),
    ]);

    const ids = new Set();

    animales.forEach((animal) => {
        const id = normalizeId(animal.user_id || animal.idUsuario);
        if (id) ids.add(id);
    });

    posteos.forEach((posteo) => {
        const id = normalizeId(posteo.user_id || posteo.idUsuario);
        if (id) ids.add(id);
    });

    if (
        sesion?.rol === 'refugio' &&
        sesion.id &&
        typeof sesion.latitude === 'number' &&
        typeof sesion.longitude === 'number'
    ) {
        ids.add(normalizeId(sesion.id));
    }

    const refugios = await Promise.all(
        [...ids].map((id) => getInfoRefugio(id))
    );

    return refugios.filter(
        (refugio) =>
            typeof refugio.latitude === 'number' &&
            typeof refugio.longitude === 'number'
    );
};

export {
    UBICACION_DEFAULT,
    getInfoRefugio,
    getRefugiosParaMapa,
    contarPublicaciones,
    normalizarTelefonoWhatsApp,
    validarTelefono,
};
