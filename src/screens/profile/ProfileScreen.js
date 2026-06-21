import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { getProfile, updateProfile } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';

const PREFERENCIAS = ['aventura', 'cultura', 'gastronomia', 'naturaleza', 'relax'];

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      const data = res.data;
      setProfile(data);
      setNombre(data.nombre || '');
      setApellido(data.apellido || '');
      setPreferences(data.preferences || []);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (pref) => {
    setPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await updateProfile({ nombre, apellido, preferences });
      setProfile(prev => ({ ...prev, nombre, apellido, preferences }));
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(profile?.nombre?.[0] || 'U').toUpperCase()}
          </Text>
        </View>
        {!editMode && (
          <>
            <Text style={styles.nombre}>{profile?.nombre} {profile?.apellido}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        {editMode ? (
          <>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholderTextColor="#999" />

            <Text style={styles.label}>Apellido</Text>
            <TextInput style={styles.input} value={apellido} onChangeText={setApellido} placeholderTextColor="#999" />

            <Text style={styles.label}>Preferencias</Text>
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
                <TouchableOpacity style={[styles.btn, { flex: 1, marginRight: 8, backgroundColor: '#eee' }]} onPress={() => setEditMode(false)}>
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{profile?.nombre}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Apellido</Text>
              <Text style={styles.infoValue}>{profile?.apellido}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.label}>Preferencias</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#2196F3' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  nombre: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', marginBottom: 4, backgroundColor: '#fafafa' },
  prefsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  prefChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa' },
  prefChipActive: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#2196F3' },
  prefChipText: { fontSize: 13, color: '#666' },
  prefChipTextActive: { fontSize: 13, color: '#fff', fontWeight: '600' },
  noPrefs: { color: '#999', fontSize: 13 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  row: { flexDirection: 'row', marginTop: 8 },
  btn: { backgroundColor: '#2196F3', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnLogout: { margin: 16, marginTop: 4, borderWidth: 1, borderColor: '#F44336', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 32 },
  btnLogoutText: { color: '#F44336', fontSize: 15, fontWeight: '600' },
});
