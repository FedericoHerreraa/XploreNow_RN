import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, updateProfile, getMisReservas } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';

const PREFERENCIAS = ['aventura', 'cultura', 'gastronomia', 'naturaleza', 'relax'];

const ESTADO_COLORS = {
  confirmada: { bg: '#E8F5E9', text: '#2e7d32' },
  cancelada:  { bg: '#FFEBEE', text: '#C62828' },
  finalizada: { bg: '#F3E5F5', text: '#6A1B9A' },
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [apellido, setApellido] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [photoUri, setPhotoUri] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [profileRes, savedPhoto] = await Promise.all([
        getProfile(),
        AsyncStorage.getItem('profilePhoto'),
      ]);
      const data = profileRes.data.user || profileRes.data;
      setProfile(data);
      setName(data.name || '');
      setApellido(data.apellido || '');
      setPhone(data.phone || '');
      setPreferences(data.preferences || []);
      if (savedPhoto) setPhotoUri(savedPhoto);

      try {
        const reservasRes = await getMisReservas();
        setReservas(reservasRes.data?.reservas || reservasRes.data || []);
      } catch {
        // reservas opcionales, no bloqueamos si falla
      }
    } catch {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePickPhoto = async () => {
    Alert.alert('Foto de perfil', '¿De dónde querés subir la foto?', [
      {
        text: 'Galería',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería en Configuración');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setPhotoUri(uri);
            await AsyncStorage.setItem('profilePhoto', uri);
          }
        },
      },
      {
        text: 'Cámara',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara en Configuración');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setPhotoUri(uri);
            await AsyncStorage.setItem('profilePhoto', uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const togglePreference = (pref) => {
    setPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, apellido, phone, preferences });
      setProfile(prev => ({ ...prev, name, apellido, phone, preferences }));
      setEditMode(false);
      Alert.alert('Éxito', 'Perfil actualizado');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  const reservasActivas     = reservas.filter(r => r.estado === 'confirmada');
  const reservasFinalizadas = reservas.filter(r => r.estado === 'finalizada');

  return (
    <View style={styles.wrapper}>
    <ScrollView contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarWrapper}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            : <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{(profile?.name?.[0] || 'U').toUpperCase()}</Text>
              </View>
          }
          <View style={styles.cameraIcon}><Text style={{ fontSize: 12 }}>📷</Text></View>
        </TouchableOpacity>
        {!editMode && (
          <>
            <Text style={styles.headerName}>{[profile?.name, profile?.apellido].filter(Boolean).join(' ') || 'Sin nombre'}</Text>
            <Text style={styles.headerEmail}>{profile?.email}</Text>
          </>
        )}
      </View>

      {/* Resumen reservas */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reservasActivas.length}</Text>
          <Text style={styles.statLabel}>Activas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reservasFinalizadas.length}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reservas.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Últimas reservas */}
      {reservas.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Últimas reservas</Text>
          {reservas.slice(0, 3).map((r, i) => {
            const colors = ESTADO_COLORS[r.estado] || { bg: '#F5F5F5', text: '#666' };
            return (
              <View key={r._id || i} style={styles.reservaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reservaNombre} numberOfLines={1}>
                    {r.actividad?.nombre || r.nombre || 'Actividad'}
                  </Text>
                  <Text style={styles.reservaFecha}>
                    {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR') : ''}
                  </Text>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.estadoText, { color: colors.text }]}>{r.estado}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Info / Edición */}
      <View style={styles.card}>
        {editMode ? (
          <>
            <Text style={styles.cardTitle}>Editar perfil</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />

            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={apellido}
              onChangeText={setApellido}
              autoCorrect={false}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Preferencias de viaje</Text>
            <View style={styles.prefsRow}>
              {PREFERENCIAS.map(pref => (
                <TouchableOpacity
                  key={pref}
                  style={[styles.prefChip, preferences.includes(pref) && styles.prefChipActive]}
                  onPress={() => togglePreference(pref)}
                >
                  <Text style={[styles.prefChipText, preferences.includes(pref) && styles.prefChipTextActive]}>
                    {pref}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {saving ? (
              <ActivityIndicator color="#2196F3" style={{ marginTop: 16 }} />
            ) : (
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.btn, { flex: 1, marginRight: 8, backgroundColor: '#eee' }]}
                  onPress={() => setEditMode(false)}
                >
                  <Text style={[styles.btnText, { color: '#333' }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleGuardar}>
                  <Text style={styles.btnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>Información personal</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{profile?.name || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Apellido</Text>
              <Text style={styles.infoValue}>{profile?.apellido || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{profile?.email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{profile?.phone || '—'}</Text>
            </View>
            <View style={styles.divider} />

            <Text style={styles.label}>Preferencias de viaje</Text>
            <View style={styles.prefsRow}>
              {(profile?.preferences || []).map(pref => (
                <View key={pref} style={styles.prefChipActive}>
                  <Text style={styles.prefChipTextActive}>{pref}</Text>
                </View>
              ))}
              {(!profile?.preferences || profile.preferences.length === 0) && (
                <Text style={styles.noPrefs}>Sin preferencias configuradas</Text>
              )}
            </View>

            <TouchableOpacity style={styles.btn} onPress={() => setEditMode(true)}>
              <Text style={styles.btnText}>Editar perfil</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
        <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:     { flex: 1, backgroundColor: '#F8F9FA' },
  content:     { paddingBottom: 40 },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:      { alignItems: 'center', paddingVertical: 28, backgroundColor: '#2196F3' },
  avatarWrapper:  { position: 'relative', marginBottom: 12 },
  avatarCircle:   { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarImage:    { width: 84, height: 84, borderRadius: 42 },
  avatarText:     { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  cameraIcon:     { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  headerName:     { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerEmail:    { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  statsRow:    { flexDirection: 'row', margin: 16, gap: 10 },
  statCard:    { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  statNumber:  { fontSize: 24, fontWeight: '700', color: '#2196F3' },
  statLabel:   { fontSize: 12, color: '#888', marginTop: 2 },
  card:        { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  cardTitle:   { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  reservaRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  reservaNombre: { fontSize: 14, fontWeight: '600', color: '#333' },
  reservaFecha:  { fontSize: 12, color: '#999', marginTop: 2 },
  estadoBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  estadoText:    { fontSize: 12, fontWeight: '600' },
  label:       { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 12 },
  input:       { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', marginBottom: 4, backgroundColor: '#fafafa' },
  prefsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  prefChip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa' },
  prefChipActive:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#2196F3' },
  prefChipText:        { fontSize: 13, color: '#666' },
  prefChipTextActive:  { fontSize: 13, color: '#fff', fontWeight: '600' },
  noPrefs:     { color: '#999', fontSize: 13 },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel:   { fontSize: 14, color: '#666' },
  infoValue:   { fontSize: 14, fontWeight: '600', color: '#333', flex: 1, textAlign: 'right' },
  divider:     { height: 1, backgroundColor: '#f0f0f0' },
  row:         { flexDirection: 'row', marginTop: 8 },
  btn:         { backgroundColor: '#2196F3', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  btnText:     { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnLogout:   { marginHorizontal: 16, marginTop: 4, borderWidth: 1, borderColor: '#F44336', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnLogoutText: { color: '#F44336', fontSize: 15, fontWeight: '600' },
});
