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
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { getMisAnimales } from '../../services/animales';
import { getCurrentUser } from '../../services/authService';

const colors = {
    primary: '#795548',
    secondary: '#8A776B',
    background: '#F5EEE7',
    card: '#FFFCF8',
    soft: '#E8DDD2',
    accent: '#C98276',
};

export default function AnimalesRefugio() {
    const router = useRouter();
    const [animales, setAnimales] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            let activo = true;

            const cargar = async () => {
                try {
                    setCargando(true);
                    setError('');

                    const usuario = await getCurrentUser();
                    if (!usuario?.id) {
                        router.replace('/login');
                        return;
                    }

                    const lista = await getMisAnimales();
                    if (activo) setAnimales(lista);
                } catch (err) {
                    console.log('Error al cargar animales:', err);
                    if (activo) {
                        setAnimales([]);
                        setError(
                            err.message || 'No se pudieron cargar los animales.'
                        );
                    }
                } finally {
                    if (activo) setCargando(false);
                }
            };

            cargar();

            return () => {
                activo = false;
            };
        }, [router, reloadKey])
    );

    if (cargando) {
        return (
            <SafeAreaView style={styles.centrado}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.mensaje}>Cargando animales...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <Text style={styles.title}>Mis animales</Text>
            <Text style={styles.subtitle}>
                Animales registrados de tu refugio
            </Text>

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable
                        style={styles.retryBtn}
                        onPress={() => setReloadKey((k) => k + 1)}
                    >
                        <Text style={styles.retryText}>Reintentar</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={animales}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.lista}
                    ListEmptyComponent={
                        <View style={styles.vacio}>
                            <Ionicons
                                name="paw-outline"
                                size={40}
                                color={colors.secondary}
                            />
                            <Text style={styles.vacioTitulo}>
                                No hay animales cargados
                            </Text>
                            <Text style={styles.vacioTexto}>
                                Tocá el + para dar de alta el primero.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image
                                source={{ uri: item.imagen }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <View style={styles.cardBody}>
                                <View style={styles.row}>
                                    <Text style={styles.nombre}>
                                        {item.nombre}
                                    </Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {item.estado || 'En adopción'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.meta}>
                                    {item.especie}
                                    {item.raza ? ` · ${item.raza}` : ''}
                                </Text>
                                <Text style={styles.meta}>
                                    {item.sexo}
                                    {typeof item.edad === 'number'
                                        ? ` · ${item.edad} ${
                                              item.edad === 1 ? 'año' : 'años'
                                          }`
                                        : ''}
                                </Text>
                            </View>
                        </View>
                    )}
                />
            )}

            <Pressable
                style={styles.fab}
                onPress={() => router.push('/(refugio)/nuevo-animal')}
                accessibilityLabel="Cargar nuevo animal"
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </Pressable>
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginTop: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.secondary,
        textAlign: 'center',
        marginBottom: 8,
        marginTop: 4,
        paddingHorizontal: 16,
    },
    mensaje: {
        color: colors.secondary,
        fontSize: 16,
    },
    lista: {
        paddingBottom: 100,
        flexGrow: 1,
    },
    vacio: {
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 48,
        gap: 10,
    },
    vacioTitulo: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
    },
    vacioTexto: {
        fontSize: 14,
        color: colors.secondary,
        textAlign: 'center',
    },
    errorBox: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.accent,
        gap: 12,
    },
    errorText: {
        color: colors.accent,
        fontSize: 14,
        textAlign: 'center',
    },
    retryBtn: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.primary,
    },
    retryText: {
        color: '#FFF',
        fontWeight: '600',
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: colors.soft,
        flexDirection: 'row',
        minHeight: 110,
    },
    image: {
        width: 110,
        height: '100%',
        minHeight: 110,
        backgroundColor: colors.soft,
    },
    cardBody: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    nombre: {
        flex: 1,
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.primary,
    },
    badge: {
        backgroundColor: colors.soft,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 11,
        color: colors.primary,
        fontWeight: '600',
    },
    meta: {
        fontSize: 13,
        color: colors.secondary,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
});
