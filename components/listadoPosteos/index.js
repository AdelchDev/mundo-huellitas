import { useState, useEffect } from 'react';
import { FlatList, TextInput, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Posteo from '../posteo';
import { getPosteos } from '../../services/posteos';
import { getAnimales } from '../../services/animales';
import { apiRequest } from "../services/api";

const ListadoPosteos = () => {
    const [posteos, setPosteos] = useState([]);
    const [animales, setAnimales] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [especieSeleccionada, setEspecieSeleccionada] = useState('Todas');
    const [edadSeleccionada, setEdadSeleccionada] = useState('Todas');
    const [sexoSeleccionado, setSexoSeleccionado] = useState('Todos');

    useEffect(() => {
        getPosteos().then(posteos => {
            setPosteos(posteos);
        })
        .catch(error => {
            console.log('Error al obtener posteos:', error);
        });

        getAnimales().then(animales => {
            setAnimales(animales);
        })
        .catch(error => {
            console.log('Error al obtener animales:', error);
        });
    }, []);

    const posteosFiltrados = posteos.filter(posteo => {
        const animal = animales.find(
            animal => animal.id === posteo.idAnimal
        );

        const texto = busqueda.toLowerCase();

        const coincideBusqueda =
            posteo.titulo.toLowerCase().includes(texto) ||
            (animal && (
                animal.nombre.toLowerCase().includes(texto) ||
                animal.especie.toLowerCase().includes(texto) ||
                animal.raza.toLowerCase().includes(texto)
            ));

        const coincideEspecie =
            especieSeleccionada === 'Todas' ||
            (animal && animal.especie === especieSeleccionada);

        const coincideEdad =
            edadSeleccionada === 'Todas' ||
            (animal && (
                edadSeleccionada === 'Menor de 1 año'
                    ? animal.edad === 0
                    : edadSeleccionada === '1 a 3 años'
                        ? animal.edad >= 1 && animal.edad <= 3
                        : animal.edad > 3
            ));

        const coincideSexo =
            sexoSeleccionado === 'Todos' ||
            (animal && animal.sexo === sexoSeleccionado);

        return (
            coincideBusqueda &&
            coincideEspecie &&
            coincideEdad &&
            coincideSexo
        );
    });

    
return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <FlatList
            data={posteosFiltrados}
            ListHeaderComponent={
                <View>
                    <TextInput
                        placeholder="Buscar por nombre, especie o raza..."
                        value={busqueda}
                        onChangeText={setBusqueda}
                        style={{
                            backgroundColor: '#FFFFFF',
                            margin: 12,
                            padding: 12,
                            borderRadius: 10,
                        }}
                    />

                    <View style={{
                        flexDirection: 'row',
                        gap: 8,
                        margin: 12,
                        flexWrap: 'wrap',
                    }}>
                        {['Todas', 'Perro', 'Gato', 'Roedor'].map(especie => (
                            <Pressable
                                key={especie}
                                onPress={() => setEspecieSeleccionada(especie)}
                                style={{
                                    backgroundColor: especieSeleccionada === especie
                                        ? '#795548'
                                        : '#E8DDD2',
                                    padding: 10,
                                    borderRadius: 20,
                                }}
                            >
                                <Text style={{
                                    color: especieSeleccionada === especie
                                        ? '#FFFFFF'
                                        : '#795548',
                                }}>
                                    {especie}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        gap: 8,
                        margin: 12,
                        flexWrap: 'wrap',
                    }}>
                        {['Todas', 'Menor de 1 año', '1 a 3 años', 'Más de 3 años'].map(edad => (
                            <Pressable
                                key={edad}
                                onPress={() => setEdadSeleccionada(edad)}
                                style={{
                                    backgroundColor: edadSeleccionada === edad
                                        ? '#795548'
                                        : '#E8DDD2',
                                    padding: 10,
                                    borderRadius: 20,
                                }}
                            >
                                <Text style={{
                                    color: edadSeleccionada === edad
                                        ? '#FFFFFF'
                                        : '#795548',
                                }}>
                                    {edad}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        gap: 8,
                        margin: 12,
                    }}>
                        {['Todos', 'Hembra', 'Macho'].map(sexo => (
                            <Pressable
                                key={sexo}
                                onPress={() => setSexoSeleccionado(sexo)}
                                style={{
                                    backgroundColor: sexoSeleccionado === sexo
                                        ? '#795548'
                                        : '#E8DDD2',
                                    padding: 10,
                                    borderRadius: 20,
                                }}
                            >
                                <Text style={{
                                    color: sexoSeleccionado === sexo
                                        ? '#FFFFFF'
                                        : '#795548',
                                }}>
                                    {sexo}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            }
            renderItem={({ item }) => {
                const animal = animales.find(
                    animal => animal.id === item.idAnimal
                );

                return <Posteo posteo={item} animal={animal} />;
            }}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={
                <View style={{
                    padding: 20,
                    alignItems: 'center',
                }}>
                    <Text style={{
                        color: '#795548',
                        fontSize: 16,
                    }}>
                        No se encontraron animales.
                    </Text>
                </View>
            }
        />
    </SafeAreaView>
    );
};

export default ListadoPosteos;