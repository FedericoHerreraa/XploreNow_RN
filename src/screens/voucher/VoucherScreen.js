import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VoucherScreen({ route, navigation }) {
  const {
    reservaId,
    actividadId,
    nombre,
    fecha,
    horario,
    cantidadParticipantes,
    puntoEncuentro,
    guia,
  } = route.params || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.voucher}>
        <View style={styles.headerRow}>
          <Ionicons name="ticket-outline" size={18} color="#1565C0" style={{ marginRight: 6 }} />
          <Text style={styles.header}>Voucher Digital</Text>
        </View>
        <Text style={styles.nombre}>{nombre || 'Actividad'}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{fecha || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Horario</Text>
          <Text style={styles.value}>{horario || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Punto de encuentro</Text>
          <Text style={styles.value}>{puntoEncuentro || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Guía</Text>
          <Text style={styles.value}>{guia || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Participantes</Text>
          <Text style={styles.value}>{cantidadParticipantes ?? '—'}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.codigo}>Reserva #{reservaId ?? '—'}</Text>
      </View>

      <TouchableOpacity
        style={styles.btnScan}
        onPress={() => navigation.navigate('ScanQR', { reservaId })}
      >
        <Text style={styles.btnScanText}>Hacer check-in (escanear QR)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  voucher: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, borderWidth: 2, borderColor: '#1565C0', borderStyle: 'dashed' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  header: { fontSize: 14, color: '#1565C0', fontWeight: '700' },
  nombre: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  label: { fontSize: 13, color: '#999', marginRight: 12 },
  value: { fontSize: 14, fontWeight: '600', color: '#333', flexShrink: 1, textAlign: 'right' },
  codigo: { textAlign: 'center', fontSize: 13, color: '#666', fontWeight: '600' },
  btnScan: { backgroundColor: '#1565C0', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  btnScanText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});