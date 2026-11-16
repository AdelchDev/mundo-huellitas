import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { getCurrentUser } from '../../services/authService';
import { getPosteos } from '../../services/posteos';
import { getAnimales } from '../../services/animales';
import SelloAdoptado from '../../components/selloAdoptado';

const colors = {
    primary: '#795548',
    secondary: '#8A776B',
    background: '#F5EEE7',
    card: '#FFFCF8',
    soft: '#F4E9DF',
};

export default function MisPosteos() {
    const router = useRouter();

    const [items, setItems] = useState([]);
    const [cargando, setCargando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let activo = true;

            const cargar = async () => {
                try {
                    setCargando(true);

                    const usuario = await getCurrentUser();
                    const idRefugio = usuario?.id;

                    const [posteos, animales] = await Promise.all([
                        getPosteos(),
                        getAnimales(),
                    ]);

                    if (!activo) return;

                    // Sin id de sesión no mostramos posteos ajenos
                    if (!idRefugio) {
                        setItems([]);
                        return;
                    }

                    const misPosteos = posteos
                        .filter((posteo) => posteo.idUsuario === idRefugio)
                        .map((posteo) => ({
                            posteo,
                            animal: animales.find(
                                (animal) => animal.id === posteo.idAnimal
                            ),
                        }));

                    setItems(misPosteos);
                } catch (error) {
                    console.log('Error al cargar mis posteos:', error);
                    if (activo) setItems([]);
                } finally {
                    if (activo) setCargando(false);
                }
            };

            cargar();

            return () => {
                activo = false;
            };
        }, [])
    );

    const abrirDetalle = (animal) => {
        if (!animal) return;

        router.push({
            pathname: '/detalleAnimal',
            params: { idAnimal: animal.id },
        });
    };

    const irANuevoPosteo = () => {
        router.push('/(refugio)/nuevo-posteo');
    };

    if (cargando) {
        return (
            <SafeAreaView style={styles.centrado}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.mensaje}>Cargando tus posteos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.posteo.id.toString()}
                contentContainerStyle={
                    items.length === 0 ? styles.listaVacia : undefined
                }
                ListHeaderComponent={
                    <Text style={styles.title}>Mis posteos</Text>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.mensaje}>
                            Todavía no publicaste ninguna mascota.
                        </Text>
                        <Pressable
                            style={styles.emptyButton}
                            onPress={irANuevoPosteo}
                        >
                            <Text style={styles.emptyButtonText}>
                                Crear nuevo posteo
                            </Text>
                        </Pressable>
                    </View>
                }
                renderItem={({ item }) => {
                    const { posteo, animal } = item;

                    return (
                        <Pressable
                            style={styles.card}
                            onPress={() => abrirDetalle(animal)}
                        >
                            {posteo.imagen ? (
                                <View style={styles.imageWrap}>
                                    <Image
                                        source={{ uri: posteo.imagen }}
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                    <SelloAdoptado visible={animal?.adoptado} compact />
                                </View>
                            ) : null}

                            <View style={styles.content}>
                                <Text style={styles.titulo}>{posteo.titulo}</Text>

                                {animal ? (
                                    <View style={styles.animalInfo}>
                                        <Text style={styles.animalName}>
                                            {animal.nombre}
                                        </Text>
                                        <Text style={styles.tag}>
                                            {animal.especie}
                                        </Text>
                                        <Text style={styles.tag}>
                                            {animal.raza || 'Mestizo'}
                                        </Text>
                                        <Text style={styles.tag}>
                                            {animal.sexo}
                                        </Text>
                                    </View>
                                ) : null}

                                <Text style={styles.texto} numberOfLines={2}>
                                    {posteo.texto}
                                </Text>

                                <Text style={styles.refugio}>
                                    {animal?.nombreRefugio ||
                                        posteo.nombreRefugio ||
                                        'Tu refugio'}
                                    {' · '}
                                    {animal?.cantidadPublicaciones ??
                                        posteo.cantidadPublicaciones ??
                                        0}{' '}
                                    {(animal?.cantidadPublicaciones ??
                                        posteo.cantidadPublicaciones ??
                                        0) === 1
                                        ? 'publicación'
                                        : 'publicaciones'}
                                </Text>

                                <Text style={styles.fecha}>{posteo.fecha}</Text>
                            </View>
                        </Pressable>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centrado: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    listaVacia: {
        flexGrow: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        margin: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 40,
        gap: 20,
    },
    mensaje: {
        textAlign: 'center',
        color: colors.secondary,
        fontSize: 16,
        lineHeight: 22,
    },
    emptyButton: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 12,
        marginBottom: 12,
        elevation: 3,
    },
    imageWrap: {
        height: 190,
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: colors.soft,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 16,
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
    },
    animalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    animalName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    tag: {
        backgroundColor: colors.soft,
        color: colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 10,
        fontSize: 12,
        overflow: 'hidden',
    },
    texto: {
        fontSize: 14,
        color: colors.secondary,
        lineHeight: 21,
    },
    refugio: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
        marginTop: 12,
    },
    fecha: {
        fontSize: 12,
        color: colors.secondary,
        marginTop: 8,
    },
});
