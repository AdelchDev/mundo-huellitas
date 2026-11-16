import { getAnimales } from './animales';
import { getUserById, getUsuariosMock } from './authService';
import { getPosteos } from './posteos';

// Posición por defecto: Obelisco, CABA
const UBICACION_DEFAULT = {
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
};

const REFUGIOS_MOCK = {
    refugio1: {
        id: 'refugio1',
        nombre: 'Refugio Patitas Felices',
        telefono: '5491155551234',
        ubicacion: 'Palermo, CABA',
        latitude: -34.5875,
        longitude: -58.4200,
        cantidadPublicaciones: 5,
    },
    refugio2: {
        id: 'refugio2',
        nombre: 'Huellitas del Norte',
        telefono: '5491166662345',
        ubicacion: 'Belgrano, CABA',
        latitude: -34.5627,
        longitude: -58.4584,
        cantidadPublicaciones: 0,
    },
    refugio3: {
        id: 'refugio3',
        nombre: 'Amor Animal San Telmo',
        telefono: '5491177773456',
        ubicacion: 'San Telmo, CABA',
        latitude: -34.6211,
        longitude: -58.3731,
        cantidadPublicaciones: 0,
    },
    refugio4: {
        id: 'refugio4',
        nombre: 'Refugio Sur Avellaneda',
        telefono: '5491188884567',
        ubicacion: 'Avellaneda, GBA',
        latitude: -34.6627,
        longitude: -58.3650,
        cantidadPublicaciones: 0,
    },
};

const contarPublicaciones = async (idUsuario) => {
    const posteos = await getPosteos();
    return posteos.filter((posteo) => posteo.idUsuario === idUsuario).length;
};

const contarAnimalesDisponibles = async (idUsuario) => {
    const animales = await getAnimales();
    return animales.filter(
        (animal) =>
            animal.idUsuario === idUsuario && !animal.adoptado
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

const getInfoRefugio = async (idUsuario, nombreFallback) => {
    if (!idUsuario) {
        return {
            id: null,
            nombre: nombreFallback || 'Refugio desconocido',
            telefono: '',
            ubicacion: '',
            latitude: UBICACION_DEFAULT.latitude,
            longitude: UBICACION_DEFAULT.longitude,
            cantidadPublicaciones: 0,
            animalesDisponibles: 0,
        };
    }

    const [cantidadPublicaciones, animalesDisponibles] = await Promise.all([
        contarPublicaciones(idUsuario),
        contarAnimalesDisponibles(idUsuario),
    ]);
    const mock = REFUGIOS_MOCK[idUsuario];
    const usuario = await getUserById(idUsuario);

    return {
        id: idUsuario,
        nombre:
            mock?.nombre ||
            usuario?.nombre ||
            nombreFallback ||
            'Refugio',
        telefono: mock?.telefono || usuario?.telefono || '',
        ubicacion: mock?.ubicacion || usuario?.direccion || '',
        latitude:
            usuario?.latitude ??
            mock?.latitude ??
            UBICACION_DEFAULT.latitude,
        longitude:
            usuario?.longitude ??
            mock?.longitude ??
            UBICACION_DEFAULT.longitude,
        cantidadPublicaciones,
        animalesDisponibles,
    };
};

const getRefugiosParaMapa = async () => {
    const idsMock = Object.keys(REFUGIOS_MOCK);
    const usuarios = await getUsuariosMock();
    const idsUsuarios = usuarios
        .filter(
            (user) =>
                user.rol === 'refugio' &&
                typeof user.latitude === 'number' &&
                typeof user.longitude === 'number'
        )
        .map((user) => user.id);

    const ids = [...new Set([...idsMock, ...idsUsuarios])];

    const refugios = await Promise.all(
        ids.map((id) =>
            getInfoRefugio(id, REFUGIOS_MOCK[id]?.nombre)
        )
    );

    return refugios.filter(
        (refugio) =>
            typeof refugio.latitude === 'number' &&
            typeof refugio.longitude === 'number'
    );
};

export {
    REFUGIOS_MOCK,
    UBICACION_DEFAULT,
    getInfoRefugio,
    getRefugiosParaMapa,
    contarPublicaciones,
    normalizarTelefonoWhatsApp,
    validarTelefono,
};
