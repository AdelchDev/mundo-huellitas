import { StyleSheet, Text, View } from 'react-native';

const SelloAdoptado = ({ visible, compact = false }) => {
    if (!visible) return null;

    return (
        <View style={styles.overlay} pointerEvents="none">
            <View style={[styles.badge, compact && styles.badgeCompact]}>
                <Text style={[styles.texto, compact && styles.textoCompact]}>
                    ADOPTADO
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 2,
    },
    badge: {
        backgroundColor: 'rgba(185, 92, 78, 0.95)',
        paddingVertical: 10,
        paddingHorizontal: 22,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeCompact: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    texto: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        letterSpacing: 2,
        textAlign: 'center',
    },
    textoCompact: {
        fontSize: 20,
        letterSpacing: 1,
    },
});

export default SelloAdoptado;
