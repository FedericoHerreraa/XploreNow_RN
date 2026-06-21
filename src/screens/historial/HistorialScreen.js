import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { getHistorial } from '../../api/apiService';

export default function HistorialScreen({ navigation }) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [destino, setDestino] = useState('');
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      if (destino) params.destino = destino;
      const res = await getHistorial(params);
      setHistorial(res.data?.historial || res.data || []);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterBox}>
        <Text style={styles.filterTitle}>Filtrar historial</Text>
        <TextInput style={styles.input} placeholder="Fecha inicio (YYYY-MM-DD)" value={fechaInicio} onChangeText={setFechaInicio} placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Fecha fin (YYYY-MM-DD)" value={fechaFin} onChangeText={setFechaFin} placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Destino" value={destino} onChangeText={setDestino} placeholderTextColor="#999" />
        <TouchableOpacity style={styles.btnFiltrar} onPress={fetchHistorial}>
          <Text style={styles.btnFiltrarText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item, i) => String(item._id || item.id || i)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('ActividadDetail', { actividadId: item.actividadId || item._id })}
            >
              <Text style={styles.itemNombre}>{item.actividad?.nombre || item.nombre || 'Actividad'}</Text>
              <Text style={styles.itemFecha}>📅 {item.fecha}</Text>
              <Text style={styles.itemDestino}>📍 {item.destino || item.actividad?.destino}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Sin registros en el historial</Text>}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  filterBox: { backgroundColor: '#fff', padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  filterTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8, fontSize: 14, color: '#333', backgroundColor: '#fafafa' },
  btnFiltrar: { backgroundColor: '#2196F3', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnFiltrarText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  item: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 12, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  itemNombre: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  itemFecha: { fontSize: 13, color: '#666', marginBottom: 2 },
  itemDestino: { fontSize: 13, color: '#666' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
});
