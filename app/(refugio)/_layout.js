import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    primary: '#795548',
    inactive: '#A99A8F',
    background: '#FFFCF8',
};

export default function RefugioTabsLayout() {
    return (
        <Tabs
            initialRouteName="mis-posteos"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.inactive,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    height: 120,
                    paddingBottom: 20,
                    paddingTop: 8,
                    borderTopColor: '#E8DCD1',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="mis-posteos"
                options={{
                    title: 'Mis posteos',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="paw-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="nuevo-posteo"
                options={{
                    title: 'Nuevo',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
