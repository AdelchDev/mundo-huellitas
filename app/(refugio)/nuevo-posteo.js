import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';

import { getMisAnimales } from '../../services/animales';
import { crearPosteo } from '../../services/posteos';
import { getCurrentUser } from '../../services/authService';
import { subirImagen } from '../../services/imagenes';

const colors = {
    primary: '#795548',
    secondary: '#8A776B',
    background: '#F5EEE7',
    card: '#FFFCF8',
    soft: '#E8DDD2',
    accent: '#C98276',
};

const IMAGEN_DEFAULT =
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80';

export default function NuevoPosteo() {
    const router = useRouter();

    const [animales, setAnimales] = useState([]);
    const [animalId, setAnimalId] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [texto, setTexto] = useState('');
    const [imagenUri, setImagenUri] = useState(null);
    const [imagenMimeType, setImagenMimeType] = useState(null);
    const [cargandoAnimales, setCargandoAnimales] = useState(true);
    const [publicando, setPublicando] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let activo = true;

            const cargar = async () => {
                try {
                    setCargandoAnimales(true);
                    const usuario = await getCurrentUser();
                    if (!usuario?.id) {
                        router.replace('/login');
                        return;
                    }

                    const lista = await getMisAnimales();
                    if (!activo) return;

                    setAnimales(lista);
                    if (lista.length && !animalId) {
                        setAnimalId(lista[0].id);
                        if (!titulo.trim()) {
                            setTitulo(`${lista[0].nombre} busca una familia`);
                        }
                        if (!texto.trim() && lista[0].descripcion) {
                            setTexto(lista[0].descripcion);
                        }
                        if (!imagenUri && lista[0].imagen) {
                            setImagenUri(lista[0].imagen);
                        }
                    }
                } catch (error) {
                    Alert.alert(
                        'Error',
                        error.message || 'No se pudieron cargar los animales.'
                    );
                } finally {
                    if (activo) setCargandoAnimales(false);
                }
            };

            cargar();
            return () => {
                activo = false;
            };
        }, [router])
    );

    const seleccionarAnimal = (animal) => {
        setAnimalId(animal.id);
        setTitulo(`${animal.nombre} busca una familia`);
        if (animal.descripcion) setTexto(animal.descripcion);
        if (animal.imagen) setImagenUri(animal.imagen);
    };

    const elegirFoto = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    'Permiso requerido',
                    'Necesitamos acceso a tu galería.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                setImagenUri(asset.uri);
                setImagenMimeType(asset.mimeType || 'image/jpeg');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo abrir la galería.');
        }
    };

    const handlePublicar = async () => {
        if (!animalId) {
            Alert.alert(
                'Sin animal',
                'Primero registrá un animal en la pestaña Animales.'
            );
            return;
        }

        if (!titulo.trim() || !texto.trim()) {
            Alert.alert(
                'Campos incompletos',
                'Completá título y texto del posteo.'
            );
            return;
        }

        try {
            setPublicando(true);

            let imagen = IMAGEN_DEFAULT;

            if (imagenUri) {
                if (/^https?:\/\//i.test(imagenUri)) {
                    imagen = imagenUri;
                } else {
                    imagen = await subirImagen(imagenUri, imagenMimeType);
                }
            }
            await crearPosteo({
                titulo: titulo.trim(),
                texto: texto.trim(),
                imagen,
                animal_id: animalId,
            });

            Alert.alert('¡Posteo publicado!', 'Ya está visible en el feed.', [
                {
                    text: 'Ver mis posteos',
                    onPress: () => router.replace('/(refugio)/posteos'),
                },
            ]);
        } catch (error) {
            Alert.alert(
                'Error al publicar',
                error.message || 'No se pudo crear el posteo.'
            );
        } finally {
            setPublicando(false);
        }
    };

    if (cargandoAnimales) {
        return (
            <SafeAreaView style={styles.centrado}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.mensaje}>Cargando animales...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.back}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={colors.primary}
                        />
                        <Text style={styles.backText}>Volver</Text>
                    </Pressable>

                    <Text style={styles.title}>Nuevo posteo</Text>
                    <Text style={styles.subtitle}>
                        Asociá un animal de tu refugio y publicá
                    </Text>

                    <Text style={styles.label}>Animal asociado</Text>
                    {animales.length === 0 ? (
                        <View style={styles.emptyAnimals}>
                            <Text style={styles.emptyText}>
                                No tenés animales. Primero dales de alta.
                            </Text>
                            <Pressable
                                style={styles.linkBtn}
                                onPress={() =>
                                    router.push('/(refugio)/nuevo-animal')
                                }
                            >
                                <Text style={styles.linkBtnText}>
                                    Cargar animal
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.chips}>
                            {animales.map((animal) => (
                                <Pressable
                                    key={animal.id}
                                    style={[
                                        styles.chip,
                                        animalId === animal.id &&
                                            styles.chipActive,
                                    ]}
                                    onPress={() => seleccionarAnimal(animal)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            animalId === animal.id &&
                                                styles.chipTextActive,
                                        ]}
                                    >
                                        {animal.nombre}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    <Pressable style={styles.photoBox} onPress={elegirFoto}>
                        {imagenUri ? (
                            <Image
                                source={{ uri: imagenUri }}
                                style={styles.photo}
                            />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Ionicons
                                    name="image-outline"
                                    size={32}
                                    color={colors.secondary}
                                />
                                <Text style={styles.photoText}>
                                    Imagen del posteo
                                </Text>
                            </View>
                        )}
                    </Pressable>

                    <Text style={styles.label}>Título</Text>
                    <TextInput
                        style={styles.input}
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Título del posteo"
                        placeholderTextColor={colors.secondary}
                    />

                    <Text style={styles.label}>Texto</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={texto}
                        onChangeText={setTexto}
                        placeholder="Contá la historia..."
                        placeholderTextColor={colors.secondary}
                        multiline
                    />

                    <Pressable
                        style={[
                            styles.submit,
                            (publicando || !animalId) && styles.submitDisabled,
                        ]}
                        onPress={handlePublicar}
                        disabled={publicando || !animalId}
                    >
                        {publicando ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitText}>
                                Publicar posteo
                            </Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: colors.background },
    centrado: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    mensaje: { color: colors.secondary, fontSize: 16 },
    content: { padding: 16, paddingBottom: 40 },
    back: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    backText: { color: colors.primary, fontWeight: '600' },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: colors.secondary,
        textAlign: 'center',
        marginBottom: 16,
        marginTop: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 6,
        marginTop: 8,
    },
    emptyAnimals: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.soft,
        gap: 10,
        marginBottom: 8,
    },
    emptyText: { color: colors.secondary, fontSize: 14 },
    linkBtn: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    linkBtnText: { color: '#FFF', fontWeight: '600' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.soft,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: { color: colors.secondary, fontSize: 13 },
    chipTextActive: { color: '#FFF', fontWeight: '600' },
    photoBox: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.soft,
        marginVertical: 8,
    },
    photo: { width: '100%', height: '100%' },
    photoPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    photoText: { color: colors.secondary },
    input: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.soft,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: colors.primary,
        marginBottom: 4,
    },
    textArea: { minHeight: 110, textAlignVertical: 'top' },
    submit: {
        marginTop: 20,
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitDisabled: { opacity: 0.7 },
    submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
