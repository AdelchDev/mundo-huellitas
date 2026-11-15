import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFavoritos } from '../../context/favoritosContext';
import { useRouter } from 'expo-router';
import { apiRequest } from "../services/api";

const colors = {
    card: '#FFFCF8',
    primary: '#795548',
    secondary: '#8A776B',
    background: '#F4E9DF',
    accent: '#C98276',
};

const Posteo = ({ posteo, animal }) => {
    const { toggleFavorito, esFavorito } = useFavoritos();
    
    const router = useRouter();

    const favorito = animal ? esFavorito(animal.id) : false;

    const abrirDetalle = () => {
        if (animal) {
            router.push({
                pathname: '/detalleAnimal',
                params: { idAnimal: animal.id },
            });
        }
    };

    useEffect(() => {
        console.log('Posteo renderizado', posteo.titulo);

        return () => {
            console.log('Posteo desmontado', posteo.titulo);
        };
    }, []);

    return (
        <View style={styles.card}>
            {posteo.imagen ? (
                <Pressable onPress={abrirDetalle}>
                    <Image
                        source={{ uri: posteo.imagen }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </Pressable>
            ) : null}

            <View style={styles.content}>
                <View style={styles.tituloContainer}>
                    <Pressable
                        onPress={abrirDetalle}
                        style={styles.tituloPressable}
                    >
                        <Text style={styles.titulo}>
                            {posteo.titulo}
                        </Text>
                    </Pressable>

                    {animal && (
                        <Pressable
                            style={styles.fav}
                            onPress={() => toggleFavorito(animal.id)}
                        >
                            <MaterialIcons
                                name={favorito ? 'favorite' : 'favorite-border'}
                                size={24}
                                color={colors.accent}
                            />
                        </Pressable>
                    )}
                </View>

                {animal && (
                    <Pressable onPress={abrirDetalle}>
                        <View style={styles.animalInfo}>
                            <Text style={styles.animalName}>
                                {animal.nombre}
                            </Text>

                            <Text style={styles.animalType}>
                                {animal.especie}
                            </Text>
                        </View>

                        <Text style={styles.texto}>
                            {posteo.texto}
                        </Text>

                        <Text style={styles.fecha}>
                            {posteo.fecha}
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        margin: 12,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 190,
    },
    content: {
        padding: 16,
    },
    tituloContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    titulo: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    fav: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    animalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    animalName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    animalType: {
        backgroundColor: colors.background,
        color: colors.secondary,
        padding: 6,
        borderRadius: 10,
        fontSize: 12,
    },
    texto: {
        fontSize: 14,
        color: colors.secondary,
        lineHeight: 21,
    },
    fecha: {
        fontSize: 12,
        color: colors.secondary,
        marginTop: 14,
    },
});

export default Posteo;
