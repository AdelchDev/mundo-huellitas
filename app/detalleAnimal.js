import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    getAnimales,
    marcarAnimalAdoptado,
} from '../services/animales';
import { getCurrentUser } from '../services/authService';
import {
    getInfoRefugio,
    normalizarTelefonoWhatsApp,
} from '../services/refugios';
import SelloAdoptado from '../components/selloAdoptado';
import MapaRefugio from '../components/mapaRefugio';

const colors = {
    primary: '#795548',
    secondary: '#8A776B',
    background: '#F4E9DF',
    card: '#FFFCF8',
    accent: '#C98276',
    whatsapp: '#25D366',
    danger: '#B85C4E',
};

const DetalleAnimal = () => {
    const { idAnimal } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [animal, setAnimal] = useState(null);
    const [refugio, setRefugio] = useState(null);
    const [esDueno, setEsDueno] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [marcando, setMarcando] = useState(false);

    useEffect(() => {
        const cargarAnimal = async () => {
            try {
                const [animales, usuario] = await Promise.all([
                    getAnimales(),
                    getCurrentUser(),
                ]);

                const animalEncontrado = animales.find(
                    (item) => item.id === Number(idAnimal)
                );

                setAnimal(animalEncontrado);
                setEsDueno(
                    Boolean(
                        usuario?.id &&
                            animalEncontrado?.idUsuario === usuario.id
                    )
                );

                if (animalEncontrado) {
                    const info = await getInfoRefugio(
                        animalEncontrado.idUsuario,
                        animalEncontrado.nombreRefugio
                    );
                    setRefugio(info);
                }
            } catch (error) {
                console.log('Error al cargar el animal:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarAnimal();
    }, [idAnimal]);

    const handleMarcarAdoptado = () => {
        if (!animal || !esDueno) return;

        Alert.alert(
            'Marcar como adoptado',
            `¿Confirmás que ${animal.nombre} ya fue adoptado?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            setMarcando(true);
                            const usuario = await getCurrentUser();
                            const actualizado = await marcarAnimalAdoptado(
                                animal.id,
                                usuario.id
                            );
                            setAnimal(actualizado);
                        } catch (error) {
                            Alert.alert(
                                'Error',
                                error.message ||
                                    'No se pudo marcar como adoptado.'
                            );
                        } finally {
                            setMarcando(false);
                        }
                    },
                },
            ]
        );
    };

    const contactarWhatsApp = async () => {
        const telefono = normalizarTelefonoWhatsApp(refugio?.telefono);

        if (!telefono) {
            Alert.alert(
                'Sin teléfono',
                'Este refugio todavía no cargó un número de WhatsApp.'
            );
            return;
        }

        const mensaje = encodeURIComponent(
            `Hola! Me interesa adoptar a ${animal.nombre}. Vi su publicación en Mundo Huellitas.`
        );
        const url = `https://wa.me/${telefono}?text=${mensaje}`;

        try {
            const soportado = await Linking.canOpenURL(url);

            if (!soportado) {
                Alert.alert(
                    'No se pudo abrir WhatsApp',
                    'Verificá que WhatsApp esté instalado en el dispositivo.'
                );
                return;
            }

            await Linking.openURL(url);
        } catch (error) {
            Alert.alert(
                'Error',
                'No se pudo abrir el chat de WhatsApp.'
            );
        }
    };

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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.imagenContainer}>
                        <Image
                            source={{ uri: animal.imagen }}
                            style={styles.imagen}
                            resizeMode="cover"
                        />

                        <SelloAdoptado visible={animal.adoptado} />

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
                                Publicado por{' '}
                                <Text style={styles.refugioNombre}>
                                    {refugio?.nombre ||
                                        animal.nombreRefugio ||
                                        'Refugio'}
                                </Text>
                                .
                            </Text>

                            <Text style={styles.publicaciones}>
                                {refugio?.cantidadPublicaciones ??
                                    animal.cantidadPublicaciones ??
                                    0}{' '}
                                {(refugio?.cantidadPublicaciones ??
                                    animal.cantidadPublicaciones ??
                                    0) === 1
                                    ? 'publicación'
                                    : 'publicaciones'}{' '}
                                activas
                            </Text>

                            <View style={styles.mapaSeccion}>
                                <Text style={styles.tituloSeccion}>
                                    Ubicación
                                </Text>
                                <MapaRefugio
                                    latitude={refugio?.latitude}
                                    longitude={refugio?.longitude}
                                    nombre={
                                        refugio?.nombre ||
                                        animal.nombreRefugio
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View
                    style={[
                        styles.footer,
                        { paddingBottom: Math.max(insets.bottom, 12) + 8 },
                    ]}
                >
                    {esDueno && !animal.adoptado ? (
                        <Pressable
                            style={[
                                styles.adoptadoButton,
                                marcando && styles.buttonDisabled,
                            ]}
                            onPress={handleMarcarAdoptado}
                            disabled={marcando}
                        >
                            {marcando ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.adoptadoButtonText}>
                                    Marcar como adoptado
                                </Text>
                            )}
                        </Pressable>
                    ) : null}

                    {!animal.adoptado ? (
                        <Pressable
                            style={styles.whatsappButton}
                            onPress={contactarWhatsApp}
                        >
                            <Ionicons
                                name="logo-whatsapp"
                                size={22}
                                color="#FFFFFF"
                            />
                            <Text style={styles.whatsappText}>
                                Contactar por WhatsApp
                            </Text>
                        </Pressable>
                    ) : (
                        <Text style={styles.adoptadoMensaje}>
                            Esta mascota ya fue adoptada.
                        </Text>
                    )}
                </View>
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
        height: 300,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: colors.background,
    },
    imagen: {
        width: '100%',
        height: '100%',
    },
    botonVolver: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 3,
        backgroundColor: colors.card,
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 16,
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
    refugioNombre: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    publicaciones: {
        marginTop: 8,
        fontSize: 14,
        color: colors.secondary,
    },
    mapaSeccion: {
        marginTop: 20,
        gap: 10,
    },
    footer: {
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E8DCD1',
        gap: 10,
    },
    adoptadoButton: {
        backgroundColor: colors.danger,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    adoptadoButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    whatsappButton: {
        backgroundColor: colors.whatsapp,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    whatsappText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    adoptadoMensaje: {
        textAlign: 'center',
        color: colors.secondary,
        fontSize: 14,
        fontWeight: '600',
        paddingVertical: 8,
    },
});

export default DetalleAnimal;
