import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { cancelarReserva } from '../../api/apiService';

export default function ReservaDetailScreen({ route, navigation }) {
  const { reservaId, actividadId, fecha, horario } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [cancelada, setCancelada] = useState(false);

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que querés cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await cancelarReserva(reservaId);
              setCancelada(true);
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
            } catch (e) {
              Alert.alert('Error', e?.response?.data?.message || 'No se pudo cancelar la reserva');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Detalle de Reserva</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{fecha || '—'}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Horario</Text>
          <Text style={styles.value}>{horario || '—'}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Estado</Text>
          <Text style={[styles.value, cancelada && { color: '#F44336' }]}>
            {cancelada ? 'cancelada' : 'confirmada'}
          </Text>
        </View>

        {!cancelada && (
          loading ? (
            <ActivityIndicator color="#F44336" style={{ marginTop: 24 }} />
          ) : (
            <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
              <Text style={styles.btnCancelarText}>Cancelar Reserva</Text>
            </TouchableOpacity>
          )
        )}

        {actividadId && (
          <TouchableOpacity
            style={styles.btnVer}
            onPress={() => navigation.navigate('ActividadDetail', { actividadId })}
          >
            <Text style={styles.btnVerText}>Ver Actividad</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  card: { margin: 20, backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 15, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  btnCancelar: { marginTop: 24, borderWidth: 1, borderColor: '#F44336', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#F44336', fontSize: 15, fontWeight: '600' },
  btnVer: { marginTop: 12, backgroundColor: '#2196F3', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnVerText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
