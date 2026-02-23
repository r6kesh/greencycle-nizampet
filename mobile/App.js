import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './src/theme';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import BookPickupScreen from './src/screens/BookPickupScreen';
import BookingHistoryScreen from './src/screens/BookingHistoryScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Auth Context
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: COLORS.bgSecondary,
                borderTopColor: COLORS.border,
                borderTopWidth: 1,
                height: 65,
                paddingBottom: 8,
                paddingTop: 8,
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
            },
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
                else if (route.name === 'Prices') iconName = focused ? 'pricetag' : 'pricetag-outline';
                else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                return <Ionicons name={iconName} size={22} color={color} />;
            },
        })}
    >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Bookings" component={BookingHistoryScreen} />
        <Tab.Screen name="Prices" component={CategoriesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        console.log('--- Checking Auth ---');
        // Fallback timeout to ensure splash screen ALWAYS clears
        const timeout = setTimeout(() => {
            console.log('--- Auth Check Timeout Reached (Forcing Load) ---');
            setIsLoading(false);
        }, 3000);

        try {
            const savedToken = await AsyncStorage.getItem('gc_token');
            const savedUser = await AsyncStorage.getItem('gc_user');
            const hasSeenOnboarding = await AsyncStorage.getItem('gc_onboarding_done');

            console.log('--- Auth Data Loaded ---', { hasToken: !!savedToken });

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
            if (hasSeenOnboarding) {
                setShowOnboarding(false);
            }
        } catch (e) {
            console.error('Auth check error:', e);
        } finally {
            clearTimeout(timeout);
            console.log('--- Finalizing Loading State ---');
            setIsLoading(false);
        }
    };

    const login = async (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        await AsyncStorage.setItem('gc_token', authToken);
        await AsyncStorage.setItem('gc_user', JSON.stringify(userData));
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('gc_token');
        await AsyncStorage.removeItem('gc_user');
    };

    const finishOnboarding = async () => {
        setShowOnboarding(false);
        await AsyncStorage.setItem('gc_onboarding_done', 'true');
    };

    if (isLoading) {
        return (
            <>
                <StatusBar style="light" />
                <SplashScreen />
            </>
        );
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
            <NavigationContainer
                theme={{
                    dark: true,
                    colors: {
                        primary: COLORS.primary,
                        background: COLORS.bgPrimary,
                        card: COLORS.bgSecondary,
                        text: COLORS.textPrimary,
                        border: COLORS.border,
                        notification: COLORS.danger,
                    }
                }}
            >
                <StatusBar style="light" />
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right',
                        contentStyle: { backgroundColor: COLORS.bgPrimary }
                    }}
                >
                    {showOnboarding && !token ? (
                        <Stack.Screen name="Onboarding">
                            {(props) => <OnboardingScreen {...props} onFinish={finishOnboarding} />}
                        </Stack.Screen>
                    ) : !token ? (
                        <Stack.Screen name="Login" component={LoginScreen} />
                    ) : (
                        <>
                            <Stack.Screen name="MainTabs" component={MainTabs} />
                            <Stack.Screen name="BookPickup" component={BookPickupScreen} />
                            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
                            <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
