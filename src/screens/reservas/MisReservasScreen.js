import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getMisReservas } from '../../api/apiService';

const ESTADO_COLORS = {
  pendiente: '#FF9800',
  confirmada: '#4CAF50',
  finalizada: '#607D8B',
  cancelada: '#F44336',
};

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'confirmada', label: 'Confirmadas' },
  { key: 'finalizada', label: 'Finalizadas' },
  { key: 'cancelada', label: 'Canceladas' },
];

function ReservaItem({ item, onPress }) {
  const estado = (item.estado || 'pendiente').toLowerCase();
  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(item)}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemNombre} numberOfLines={1}>
          {item.actividad?.nombre || item.actividadNombre || 'Actividad'}
        </Text>
        <View style={[styles.estadoBadge, { backgroundColor: ESTADO_COLORS[estado] || '#999' }]}>
          <Text style={styles.estadoText}>{estado}</Text>
        </View>
      </View>
      <View style={styles.itemLinea}>
        <Ionicons name="calendar-outline" size={13} color="#666" style={styles.itemIcon} />
        <Text style={styles.itemLineaText}>{item.fecha || '—'}</Text>
      </View>
      <View style={styles.itemLinea}>
        <Ionicons name="time-outline" size={13} color="#666" style={styles.itemIcon} />
        <Text style={styles.itemLineaText}>{item.horario || '—'}</Text>
      </View>
      <View style={styles.itemLinea}>
        <Ionicons name="people-outline" size={13} color="#666" style={styles.itemIcon} />
        <Text style={styles.itemLineaText}>
          {item.cantidadParticipantes} participante{item.cantidadParticipantes !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MisReservasScreen({ navigation }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas');

  const fetchReservas = useCallback(async () => {
    const res = await getMisReservas();
    setReservas(res.data?.reservas || res.data || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        try {
          await fetchReservas();
        } catch {
          if (activo) Alert.alert('Error', 'No se pudieron cargar las reservas');
        } finally {
          if (activo) setLoading(false);
        }
      })();
      return () => {
        activo = false;
      };
    }, [fetchReservas])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReservas();
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setRefreshing(false);
    }
  }, [fetchReservas]);

  const handlePress = (item) => {
    navigation.navigate('ReservaDetail', {
      reservaId: item._id || item.id,
      actividadId: item.actividad?._id || item.actividad?.id || item.actividadId,
      nombre: item.actividad?.nombre || item.actividadNombre,
      fecha: item.fecha,
      horario: item.horario,
      cantidadParticipantes: item.cantidadParticipantes,
      estado: (item.estado || 'confirmada').toLowerCase(),
    });
  };

  const filtradas =
    filtro === 'todas'
      ? reservas
      : reservas.filter((r) => (r.estado || '').toLowerCase() === filtro);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtradas}
        keyExtractor={(item) => String(item._id || item.id)}
        renderItem={({ item }) => <ReservaItem item={item} onPress={handlePress} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1565C0']} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtros}>
              {FILTROS.map((f) => {
                const sel = filtro === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.filtroChip, sel && styles.filtroChipSel]}
                    onPress={() => setFiltro(f.key)}
                  >
                    <Text style={[styles.filtroText, sel && styles.filtroTextSel]}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.btnNueva}
              onPress={() => navigation.navigate('Actividades')}
            >
              <Text style={styles.btnNuevaText}>+ Nueva</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {filtro === 'todas'
              ? 'No tenés reservas aún'
              : `No tenés reservas ${FILTROS.find((f) => f.key === filtro)?.label.toLowerCase()}`}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  filtros: { flexDirection: 'row', flex: 1 },
  filtroChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#fff' },
  filtroChipSel: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  filtroText: { fontSize: 13, color: '#555' },
  filtroTextSel: { color: '#fff', fontWeight: '600' },
  btnNueva: { backgroundColor: '#1565C0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginLeft: 4 },
  btnNuevaText: { color: '#fff', fontWeight: '600' },

  item: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemNombre: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  estadoText: { fontSize: 11, color: '#fff', fontWeight: '600', textTransform: 'capitalize' },
  itemLinea: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  itemIcon: { marginRight: 6 },
  itemLineaText: { fontSize: 13, color: '#666' },

  emptyText: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
});