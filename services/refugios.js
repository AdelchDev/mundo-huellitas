import { getUserById } from './authService';
import { getPosteos } from './posteos';

const REFUGIOS_MOCK = {
    refugio1: {
        id: 'refugio1',
        nombre: 'Refugio Patitas Felices',
        telefono: '5491155551234',
        ubicacion: 'Buenos Aires',
        cantidadPublicaciones: 5,
    },
};

const contarPublicaciones = async (idUsuario) => {
    const posteos = await getPosteos();
    return posteos.filter((posteo) => posteo.idUsuario === idUsuario).length;
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
            cantidadPublicaciones: 0,
        };
    }

    const cantidadPublicaciones = await contarPublicaciones(idUsuario);
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
        cantidadPublicaciones,
    };
};

export {
    REFUGIOS_MOCK,
    getInfoRefugio,
    contarPublicaciones,
    normalizarTelefonoWhatsApp,
    validarTelefono,
};
