import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { useAuth } from '../context/AuthContext';

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
import ProfileScreen from '../screens/profile/ProfileScreen';
import VoucherScreen from '../screens/voucher/VoucherScreen';
import ScanQRScreen from '../screens/voucher/ScanQRScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name }) {
  const icons = { home: '🏠', search: '🔍', calendar: '📅', heart: '❤️', person: '👤' };
  return <Text style={{ fontSize: 20 }}>{icons[name]}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666666',
        headerShown: true,
        headerStyle: { backgroundColor: '#2196F3' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: () => <TabIcon name="home" />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Actividades"
        component={ActividadListScreen}
        options={{
          tabBarLabel: 'Actividades',
          tabBarIcon: () => <TabIcon name="search" />,
          title: 'Actividades',
        }}
      />
      <Tab.Screen
        name="Reservas"
        component={MisReservasScreen}
        options={{
          tabBarLabel: 'Reservas',
          tabBarIcon: () => <TabIcon name="calendar" />,
          title: 'Mis Reservas',
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          tabBarLabel: 'Favoritos',
          tabBarIcon: () => <TabIcon name="heart" />,
          title: 'Mis Favoritos',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: () => <TabIcon name="person" />,
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
      <Stack.Screen name="Noticias" component={NoticiasScreen} options={{ headerShown: true, title: 'Noticias' }} />
      <Stack.Screen name="Voucher" component={VoucherScreen} options={{ headerShown: true, title: 'Voucher' }} />
      <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ headerShown: true, title: 'Check-in QR' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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
