const MAX_ANIMALES = 5;

const REFUGIO_MOCK = {
    idUsuario: 'refugio1',
    nombreRefugio: 'Refugio Patitas Felices',
    cantidadPublicaciones: 5,
};

const animalesDisponibles = [
    {
        nombre: 'Luna',
        especie: 'Perro',
        raza: 'Golden retriever',
        edad: 0,
        descripcion: 'Es muy cariñosa y juguetona. Busca una familia que le dé mucho amor.',
        sexo: 'Hembra',
        imagen: 'https://images.unsplash.com/photo-1611003229186-80e40cd54966?auto=format&fit=crop&w=800&q=80'
    },
    {
        nombre: 'Oreo',
        especie: 'Gato',
        raza: 'Mestizo',
        edad: 2,
        descripcion: 'Es tranquilo, curioso y le encanta dormir al sol.',
        sexo: 'Macho',
        imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
    },
    {
        nombre: 'Canela',
        especie: 'Perro',
        raza: 'Caniche',
        edad: 3,
        descripcion: 'Es sociable y disfruta mucho de los paseos.',
        sexo: 'Hembra',
        imagen: 'https://images.unsplash.com/photo-1630250348519-173c58a3dad4?auto=format&fit=crop&w=800&q=80'
    },
    {
        nombre: 'Simba',
        especie: 'Gato',
        raza: 'Mestizo',
        edad: 2,
        descripcion: 'Es dulce y un poco tímido al principio.',
        sexo: 'Macho',
        imagen: 'https://images.unsplash.com/photo-1628793784919-9b7f599f6931?auto=format&fit=crop&w=800&q=80'
    },
    {
        nombre: 'Cookie',
        especie: 'Roedor',
        raza: 'Cobayo',
        edad: 0,
        descripcion: 'Es tranquilo y muy sociable.',
        sexo: 'Macho',
        imagen: 'https://images.unsplash.com/photo-1681141289794-ff2f3b2002c3?auto=format&fit=crop&w=800&q=80'
    },
];

const crearAnimalMock = (index) => {
    const animal = animalesDisponibles[index % animalesDisponibles.length];

    return {
        id: index + 1,
        ...animal,
        ...REFUGIO_MOCK,
        adoptado: false,
    };
};

let animales = Array.from(
    { length: MAX_ANIMALES },
    (_, index) => crearAnimalMock(index)
);

let nextAnimalId = MAX_ANIMALES + 1;

const getAnimales = () => {
    // TODO: Implementar la logica para obtener los animales desde una API.
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...animales]);
        }, 300);
    });
};

const agregarAnimal = (animalData) => {
    const raza =
        typeof animalData.raza === 'string' && animalData.raza.trim()
            ? animalData.raza.trim()
            : 'Mestizo';

    const animal = {
        id: nextAnimalId++,
        ...animalData,
        raza,
        adoptado: false,
    };

    animales = [animal, ...animales];

    return Promise.resolve(animal);
};

const marcarAnimalAdoptado = (idAnimal, idUsuario) => {
    const animal = animales.find((item) => item.id === Number(idAnimal));

    if (!animal) {
        return Promise.reject(new Error('No se encontró el animal.'));
    }

    if (animal.idUsuario !== idUsuario) {
        return Promise.reject(
            new Error('Solo el refugio que publicó puede marcarlo como adoptado.')
        );
    }

    if (animal.adoptado) {
        return Promise.resolve(animal);
    }

    animales = animales.map((item) =>
        item.id === Number(idAnimal) ? { ...item, adoptado: true } : item
    );

    return Promise.resolve(
        animales.find((item) => item.id === Number(idAnimal))
    );
};

const actualizarCantidadPublicaciones = (idUsuario, cantidadPublicaciones) => {
    animales = animales.map((animal) =>
        animal.idUsuario === idUsuario
            ? { ...animal, cantidadPublicaciones }
            : animal
    );
};

const actualizarDatosRefugio = (idUsuario, datos) => {
    animales = animales.map((animal) =>
        animal.idUsuario === idUsuario
            ? {
                  ...animal,
                  nombreRefugio: datos.nombreRefugio ?? animal.nombreRefugio,
                  telefono: datos.telefono ?? animal.telefono,
              }
            : animal
    );
};

export {
    getAnimales,
    agregarAnimal,
    marcarAnimalAdoptado,
    actualizarCantidadPublicaciones,
    actualizarDatosRefugio,
};
