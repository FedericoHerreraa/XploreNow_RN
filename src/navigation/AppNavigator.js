import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { navigationRef, flushPendingNavigation } from './navigationRef';
import { registerForPushNotificationsAsync, addNotificationListeners } from '../services/pushNotifications';

import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ActividadListScreen from '../screens/actividades/ActividadListScreen';
import ActividadDetailScreen from '../screens/actividades/ActividadDetailScreen';
import ReviewScreen from '../screens/actividades/ReviewScreen';
import MisReservasScreen from '../screens/reservas/MisReservasScreen';
import CrearReservaScreen from '../screens/reservas/CrearReservaScreen';
import ReservaDetailScreen from '../screens/reservas/ReservaDetailScreen';
import FavoritosScreen from '../screens/favoritos/FavoritosScreen';
import HistorialScreen from '../screens/historial/HistorialScreen';
import NoticiasScreen from '../screens/noticias/NoticiasScreen';
import NoticiaDetailScreen from '../screens/noticias/NoticiaDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import VoucherScreen from '../screens/voucher/VoucherScreen';
import ScanQRScreen from '../screens/voucher/ScanQRScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  home: { active: 'home', inactive: 'home-outline' },
  search: { active: 'search', inactive: 'search-outline' },
  calendar: { active: 'calendar', inactive: 'calendar-outline' },
  heart: { active: 'heart', inactive: 'heart-outline' },
  news: { active: 'newspaper', inactive: 'newspaper-outline' },
  person: { active: 'person', inactive: 'person-outline' },
};

function TabIcon({ name, focused, color, size }) {
  const iconName = focused ? TAB_ICONS[name].active : TAB_ICONS[name].inactive;
  return <Ionicons name={iconName} size={size} color={color} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: '#666666',
        headerShown: true,
        headerStyle: { backgroundColor: '#1565C0' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="home" focused={focused} color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Actividades"
        component={ActividadListScreen}
        options={{
          tabBarLabel: 'Actividades',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="search" focused={focused} color={color} size={size} />,
          title: 'Actividades',
        }}
      />
      <Tab.Screen
        name="Reservas"
        component={MisReservasScreen}
        options={{
          tabBarLabel: 'Reservas',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="calendar" focused={focused} color={color} size={size} />,
          title: 'Mis Reservas',
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="heart" focused={focused} color={color} size={size} />,
          title: 'Mis Favoritos',
        }}
      />
      <Tab.Screen
        name="Noticias"
        component={NoticiasScreen}
        options={{
          tabBarLabel: 'Noticias',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="news" focused={focused} color={color} size={size} />,
          title: 'Noticias',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="person" focused={focused} color={color} size={size} />,
          title: 'Mi Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={MainTabs} />
      <Stack.Screen name="ActividadDetail" component={ActividadDetailScreen} options={{ headerShown: true, title: 'Detalle' }} />
      <Stack.Screen name="CrearReserva" component={CrearReservaScreen} options={{ headerShown: true, title: 'Nueva Reserva' }} />
      <Stack.Screen name="ReservaDetail" component={ReservaDetailScreen} options={{ headerShown: true, title: 'Detalle de Reserva' }} />
      <Stack.Screen name="Review" component={ReviewScreen} options={{ headerShown: true, title: 'Reseña' }} />
      <Stack.Screen name="Historial" component={HistorialScreen} options={{ headerShown: true, title: 'Historial' }} />
      <Stack.Screen name="NoticiaDetail" component={NoticiaDetailScreen} options={{ headerShown: true, title: 'Noticia' }} />
      <Stack.Screen name="Voucher" component={VoucherScreen} options={{ headerShown: true, title: 'Voucher' }} />
      <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ headerShown: true, title: 'Check-in QR' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!token) return;
    registerForPushNotificationsAsync();
  }, [token]);

  useEffect(() => {
    const removeListeners = addNotificationListeners();
    return removeListeners;
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={flushPendingNavigation}>
      {token ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});