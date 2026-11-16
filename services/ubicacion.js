import * as Location from 'expo-location';

/**
 * Autocomplete Argentina:
 * 1) base local (barrios/partidos) → siempre muestra desplegable
 * 2) Nominatim (si la red responde)
 * 3) geocodeAsync de expo-location para resolver lat/long (I+D)
 */

const ZONAS_ARGENTINA = [
    { label: 'Palermo, CABA, Argentina', latitude: -34.5875, longitude: -58.4200 },
    { label: 'Belgrano, CABA, Argentina', latitude: -34.5627, longitude: -58.4584 },
    { label: 'Recoleta, CABA, Argentina', latitude: -34.5870, longitude: -58.3925 },
    { label: 'Caballito, CABA, Argentina', latitude: -34.6197, longitude: -58.4360 },
    { label: 'San Telmo, CABA, Argentina', latitude: -34.6211, longitude: -58.3731 },
    { label: 'Villa Crespo, CABA, Argentina', latitude: -34.5990, longitude: -58.4390 },
    { label: 'Núñez, CABA, Argentina', latitude: -34.5480, longitude: -58.4620 },
    { label: 'Flores, CABA, Argentina', latitude: -34.6350, longitude: -58.4620 },
    { label: 'Almagro, CABA, Argentina', latitude: -34.6090, longitude: -58.4200 },
    { label: 'Colegiales, CABA, Argentina', latitude: -34.5730, longitude: -58.4490 },
    { label: 'Villa Urquiza, CABA, Argentina', latitude: -34.5735, longitude: -58.4870 },
    { label: 'Saavedra, CABA, Argentina', latitude: -34.5530, longitude: -58.4880 },
    { label: 'Puerto Madero, CABA, Argentina', latitude: -34.6110, longitude: -58.3630 },
    { label: 'Avellaneda, Buenos Aires, Argentina', latitude: -34.6627, longitude: -58.3650 },
    { label: 'Quilmes, Buenos Aires, Argentina', latitude: -34.7240, longitude: -58.2540 },
    { label: 'Lanús, Buenos Aires, Argentina', latitude: -34.7080, longitude: -58.3950 },
    { label: 'San Isidro, Buenos Aires, Argentina', latitude: -34.4730, longitude: -58.5150 },
    { label: 'Vicente López, Buenos Aires, Argentina', latitude: -34.5260, longitude: -58.4800 },
    { label: 'Morón, Buenos Aires, Argentina', latitude: -34.6510, longitude: -58.6190 },
    { label: 'La Plata, Buenos Aires, Argentina', latitude: -34.9210, longitude: -57.9540 },
    { label: 'Córdoba Capital, Córdoba, Argentina', latitude: -31.4201, longitude: -64.1888 },
    { label: 'Rosario, Santa Fe, Argentina', latitude: -32.9442, longitude: -60.6505 },
    { label: 'Mendoza Capital, Mendoza, Argentina', latitude: -32.8895, longitude: -68.8458 },
    { label: 'Blanco Encalada, Belgrano, CABA, Argentina', latitude: -34.5558, longitude: -58.4555 },
    { label: 'Av. Cabildo, Belgrano, CABA, Argentina', latitude: -34.5605, longitude: -58.4565 },
    { label: 'Av. Santa Fe, Palermo, CABA, Argentina', latitude: -34.5950, longitude: -58.4100 },
    { label: 'Av. Corrientes, CABA, Argentina', latitude: -34.6037, longitude: -58.4110 },
];

const filtrarZonasLocales = (query) => {
    const q = query.toLowerCase();

    return ZONAS_ARGENTINA.filter((zona) =>
        zona.label.toLowerCase().includes(q)
    ).map((zona, index) => ({
        id: `local-${index}-${zona.label}`,
        label: zona.label,
        latitude: zona.latitude,
        longitude: zona.longitude,
        fuente: 'local',
    }));
};

const buscarNominatim = async (query) => {
    const params = new URLSearchParams({
        format: 'json',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'ar',
        q: query,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            {
                signal: controller.signal,
                headers: {
                    Accept: 'application/json',
                    'Accept-Language': 'es-AR,es;q=0.9',
                    'User-Agent': 'MundoHuellitas/1.0 (proyecto-academico-ORT)',
                },
            }
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        return data.map((item) => ({
            id: `osm-${item.place_id}`,
            label: item.display_name,
            latitude: Number(item.lat),
            longitude: Number(item.lon),
            fuente: 'nominatim',
        }));
    } catch (error) {
        console.log('Nominatim no disponible, uso sugerencias locales:', error?.message);
        return [];
    } finally {
        clearTimeout(timeout);
    }
};

const buscarDireccionesArgentina = async (texto) => {
    const query = texto.trim();

    if (query.length < 2) {
        return [];
    }

    const locales = filtrarZonasLocales(query);
    const remotas = await buscarNominatim(query);

    const opcionEscrita = {
        id: `typed-${query}`,
        label: query.toLowerCase().includes('argentina')
            ? query
            : `${query}, Argentina`,
        fuente: 'escrita',
    };

    const combinadas = [...locales, ...remotas];

    // Evitar duplicados por label similar
    const vistos = new Set();
    const unicas = [];

    for (const item of combinadas) {
        const key = item.label.toLowerCase();
        if (vistos.has(key)) continue;
        vistos.add(key);
        unicas.push(item);
    }

    // La dirección escrita siempre aparece para poder geocodificar calles libres
    if (!vistos.has(opcionEscrita.label.toLowerCase())) {
        unicas.unshift(opcionEscrita);
    }

    return unicas.slice(0, 8);
};

const geocodeDireccionExpo = async (direccion) => {
    const texto = direccion?.trim();
    if (!texto) return null;

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
        return null;
    }

    const resultados = await Location.geocodeAsync(`${texto}, Argentina`);

    if (!resultados?.length) {
        return null;
    }

    return {
        latitude: resultados[0].latitude,
        longitude: resultados[0].longitude,
    };
};

const resolverCoordenadas = async ({ label, latitude, longitude }) => {
    if (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude)
    ) {
        return { latitude, longitude, direccion: label };
    }

    const geo = await geocodeDireccionExpo(label);

    if (!geo) {
        throw new Error(
            'No pudimos obtener coordenadas para esa dirección. Elegí otra sugerencia de la lista.'
        );
    }

    return {
        latitude: geo.latitude,
        longitude: geo.longitude,
        direccion: label,
    };
};

export {
    buscarDireccionesArgentina,
    geocodeDireccionExpo,
    resolverCoordenadas,
};
