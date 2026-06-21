import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { getMisReservas } from '../../api/apiService';

const ESTADO_COLORS = {
  pendiente: '#FF9800',
  confirmada: '#4CAF50',
  cancelada: '#F44336',
};

function ReservaItem({ item, onPress }) {
  const estado = item.estado || 'pendiente';
  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(item)}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemNombre} numberOfLines={1}>{item.actividad?.nombre || 'Actividad'}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: ESTADO_COLORS[estado] || '#999' }]}>
          <Text style={styles.estadoText}>{estado}</Text>
        </View>
      </View>
      <Text style={styles.itemFecha}>📅 {item.fecha}</Text>
      <Text style={styles.itemHorario}>🕐 {item.horario}</Text>
      <Text style={styles.itemPersonas}>👥 {item.cantidadParticipantes} participante{item.cantidadParticipantes !== 1 ? 's' : ''}</Text>
    </TouchableOpacity>
  );
}

export default function MisReservasScreen({ navigation }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMisReservas();
      setReservas(res.data?.reservas || res.data || []);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (item) => {
    navigation.navigate('ReservaDetail', {
      reservaId: item._id || item.id,
      actividadId: item.actividad?._id || item.actividad?.id || item.actividadId,
      fecha: item.fecha,
      horario: item.horario,
    });
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservas}
        keyExtractor={(item) => String(item._id || item.id)}
        renderItem={({ item }) => <ReservaItem item={item} onPress={handlePress} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No tenés reservas aún</Text>}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mis Reservas</Text>
            <TouchableOpacity
              style={styles.btnNueva}
              onPress={() => navigation.navigate('CrearReserva', {})}
            >
              <Text style={styles.btnNuevaText}>+ Nueva</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  btnNueva: { backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  btnNuevaText: { color: '#fff', fontWeight: '600' },
  item: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemNombre: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  estadoText: { fontSize: 11, color: '#fff', fontWeight: '600', textTransform: 'capitalize' },
  itemFecha: { fontSize: 13, color: '#666', marginBottom: 3 },
  itemHorario: { fontSize: 13, color: '#666', marginBottom: 3 },
  itemPersonas: { fontSize: 13, color: '#666' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
});
