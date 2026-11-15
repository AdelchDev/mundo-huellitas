import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getAnimales } from '../services/animales';

const colors = {
    primary: '#795548',
    secondary: '#8A776B',
    background: '#F4E9DF',
    card: '#FFFCF8',
    accent: '#C98276',
};

const DetalleAnimal = () => {
    const { idAnimal } = useLocalSearchParams();
    const router = useRouter();

    const [animal, setAnimal] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarAnimal = async () => {
            try {
                const animales = await getAnimales();

                const animalEncontrado = animales.find(
                    (animal) => animal.id === Number(idAnimal)
                );

                setAnimal(animalEncontrado);
            } catch (error) {
                console.log('Error al cargar el animal:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarAnimal();
    }, [idAnimal]);

    if (cargando) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={styles.centrado}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.mensaje}>Cargando animal...</Text>
                </View>
            </>
        );
    }

    if (!animal) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={styles.centrado}>
                    <Text style={styles.mensaje}>
                        No se encontró el animal.
                    </Text>

                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.volverTexto}>Volver</Text>
                    </Pressable>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView>
                    <View style={styles.imagenContainer}>
                        <Image
                            source={{ uri: animal.imagen }}
                            style={styles.imagen}
                            resizeMode="cover"
                        />

                        <Pressable
                            style={styles.botonVolver}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={colors.primary}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.nombre}>
                            {animal.nombre}
                        </Text>

                        <Text style={styles.raza}>
                            {animal.raza}
                        </Text>

                        <View style={styles.etiquetas}>
                            <Text style={styles.etiqueta}>
                                {animal.especie}
                            </Text>

                            <Text style={styles.etiqueta}>
                                {animal.edad === 0
                                    ? 'Menor de 1 año'
                                    : `${animal.edad} años`}
                            </Text>

                            <Text style={styles.etiqueta}>
                                {animal.sexo}
                            </Text>
                        </View>

                        <View style={styles.seccion}>
                            <Text style={styles.tituloSeccion}>
                                Sobre {animal.nombre}
                            </Text>

                            <Text style={styles.descripcion}>
                                {animal.descripcion}
                            </Text>
                        </View>

                        <View style={styles.seccion}>
                            <Text style={styles.tituloSeccion}>
                                Sobre su refugio
                            </Text>

                            <Text style={styles.descripcion}>
                                Este animal pertenece al refugio que realizó
                                la publicación.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    mensaje: {
        color: colors.secondary,
        fontSize: 16,
        marginTop: 12,
    },
    volverTexto: {
        color: colors.primary,
        fontWeight: 'bold',
        marginTop: 16,
    },
    imagenContainer: {
        position: 'relative',
    },
    imagen: {
        width: '100%',
        height: 300,
    },
    botonVolver: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: colors.card,
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    nombre: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
    },
    raza: {
        fontSize: 16,
        color: colors.secondary,
        marginTop: 4,
    },
    etiquetas: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
    },
    etiqueta: {
        backgroundColor: colors.card,
        color: colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        fontSize: 13,
    },
    seccion: {
        marginTop: 28,
    },
    tituloSeccion: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
    },
    descripcion: {
        fontSize: 15,
        color: colors.secondary,
        lineHeight: 23,
    },
});

export default DetalleAnimal;
