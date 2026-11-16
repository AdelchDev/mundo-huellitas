import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { getCurrentUser } from '../../services/authService';
import { crearPosteo } from '../../services/posteos';

const colors = {
    primary: '#795548',
    secondary: '#8A776B',
    background: '#F5EEE7',
    card: '#FFFCF8',
    soft: '#E8DDD2',
    accent: '#C98276',
};

const ESPECIES = ['Perro', 'Gato', 'Roedor'];
const EDADES = ['Menor de 1 año', '1 a 3 años', 'Más de 3 años'];
const SEXOS = ['Hembra', 'Macho'];

const IMAGEN_DEFAULT =
    'https://cdn-icons-png.flaticon.com/512/616/616408.png';

const edadANumero = (etiqueta) => {
    switch (etiqueta) {
        case 'Menor de 1 año':
            return 0;
        case '1 a 3 años':
            return 2;
        case 'Más de 3 años':
            return 4;
        default:
            return 0;
    }
};

const Chip = ({ label, selected, onPress }) => (
    <Pressable
        onPress={onPress}
        style={[styles.chip, selected && styles.chipSelected]}
    >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
            {label}
        </Text>
    </Pressable>
);

export default function NuevoPosteo() {
    const router = useRouter();

    const [nombre, setNombre] = useState('');
    const [especie, setEspecie] = useState('Perro');
    const [raza, setRaza] = useState('');
    const [edad, setEdad] = useState('');
    const [sexo, setSexo] = useState('Hembra');
    const [descripcion, setDescripcion] = useState('');
    const [imagenUri, setImagenUri] = useState(null);
    const [publicando, setPublicando] = useState(false);

    const elegirFoto = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Permiso requerido',
                'Necesitamos acceso a tu galería para elegir una foto.'
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
            setImagenUri(result.assets[0].uri);
        }
    };

    const handlePublicar = async () => {
        if (!nombre.trim() || !edad || !descripcion.trim()) {
            Alert.alert(
                'Campos incompletos',
                'Completá nombre, edad y descripción.'
            );
            return;
        }

        try {
            setPublicando(true);

            const usuario = await getCurrentUser();

            if (!usuario?.id) {
                Alert.alert(
                    'Sesión requerida',
                    'No pudimos identificar el refugio. Volvé a iniciar sesión.'
                );
                return;
            }

            const imagen = imagenUri || IMAGEN_DEFAULT;

            await crearPosteo({
                idUsuario: usuario.id,
                nombreRefugio: usuario.nombre || 'Mi refugio',
                nombre: nombre.trim(),
                especie,
                raza: raza.trim(),
                edad: edadANumero(edad),
                sexo,
                descripcion: descripcion.trim(),
                imagen,
            });

            Alert.alert(
                '¡Mascota publicada!',
                `${nombre.trim()} ya está disponible para adopción.`,
                [
                    {
                        text: 'Ver mis posteos',
                        onPress: () => {
                            router.replace('/(refugio)/mis-posteos');
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                'Error al publicar',
                error.message || 'No se pudo crear el posteo.'
            );
        } finally {
            setPublicando(false);
        }
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Nuevo posteo</Text>
                    <Text style={styles.subtitle}>
                        Cargá los datos de la mascota para publicarla.
                    </Text>

                    <View style={styles.card}>
                        <Text style={styles.label}>Foto</Text>
                        <Pressable
                            style={styles.photoPicker}
                            onPress={elegirFoto}
                        >
                            {imagenUri ? (
                                <Image
                                    source={{ uri: imagenUri }}
                                    style={styles.photoPreview}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Ionicons
                                        name="camera-outline"
                                        size={36}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.photoPlaceholderText}>
                                        Elegir foto de la galería
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                        {imagenUri ? (
                            <Pressable onPress={() => setImagenUri(null)}>
                                <Text style={styles.quitarFoto}>
                                    Quitar foto
                                </Text>
                            </Pressable>
                        ) : (
                            <Text style={styles.hint}>
                                Si no elegís foto, usamos una imagen por
                                defecto.
                            </Text>
                        )}

                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Luna"
                            placeholderTextColor="#B5A69B"
                            value={nombre}
                            onChangeText={setNombre}
                        />

                        <Text style={styles.label}>Raza</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Opcional — por defecto: Mestizo"
                            placeholderTextColor="#B5A69B"
                            value={raza}
                            onChangeText={setRaza}
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>Especie</Text>
                        <View style={styles.chipsRow}>
                            {ESPECIES.map((opcion) => (
                                <Chip
                                    key={opcion}
                                    label={opcion}
                                    selected={especie === opcion}
                                    onPress={() => setEspecie(opcion)}
                                />
                            ))}
                        </View>

                        <Text style={styles.label}>Edad</Text>
                        <View style={styles.chipsRow}>
                            {EDADES.map((opcion) => (
                                <Chip
                                    key={opcion}
                                    label={opcion}
                                    selected={edad === opcion}
                                    onPress={() => setEdad(opcion)}
                                />
                            ))}
                        </View>

                        <Text style={styles.label}>Sexo</Text>
                        <View style={styles.chipsRow}>
                            {SEXOS.map((opcion) => (
                                <Chip
                                    key={opcion}
                                    label={opcion}
                                    selected={sexo === opcion}
                                    onPress={() => setSexo(opcion)}
                                />
                            ))}
                        </View>

                        <Text style={styles.label}>Descripción / historia</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Contá un poco sobre la mascota..."
                            placeholderTextColor="#B5A69B"
                            value={descripcion}
                            onChangeText={setDescripcion}
                            multiline
                            textAlignVertical="top"
                        />

                        <Pressable
                            style={[
                                styles.button,
                                publicando && styles.buttonDisabled,
                            ]}
                            onPress={handlePublicar}
                            disabled={publicando}
                        >
                            {publicando ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    Publicar mascota
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.secondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 8,
        marginTop: 12,
    },
    photoPicker: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.soft,
        backgroundColor: '#FFFFFF',
    },
    photoPreview: {
        width: '100%',
        height: 180,
    },
    photoPlaceholder: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: colors.background,
    },
    photoPlaceholderText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    quitarFoto: {
        marginTop: 8,
        color: colors.accent,
        fontSize: 13,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.soft,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.primary,
    },
    textArea: {
        minHeight: 110,
        paddingTop: 12,
    },
    hint: {
        fontSize: 12,
        color: colors.secondary,
        marginTop: 6,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: colors.soft,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    chipSelected: {
        backgroundColor: colors.primary,
    },
    chipText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
