import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { getMisReservas } from '../../api/apiService';

const CALIFICACION_HORAS = 48;

const getActividadId = (item) =>
  item.actividadId || item.actividad?._id || item.actividad?.id || item._id || item.id;

const getActividadDate = (item) => {
  if (!item.fecha) return null;

  const fechaBase = String(item.fecha).split('T')[0];
  const horario = item.horario || '00:00';
  const fecha = new Date(`${fechaBase}T${horario}:00`);

  if (Number.isNaN(fecha.getTime())) {
    const fallback = new Date(item.fecha);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  return fecha;
};

const isCalificable = (item) => {
  const fechaActividad = getActividadDate(item);
  if (!fechaActividad) return false;

  const limite = new Date(fechaActividad.getTime() + CALIFICACION_HORAS * 60 * 60 * 1000);
  return new Date() <= limite;
};

export default function HistorialScreen({ navigation }) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [destino, setDestino] = useState('');
  const [historialCompleto, setHistorialCompleto] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [fechaInicio, fechaFin, destino, historialCompleto]);

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const res = await getMisReservas();
      const reservas = res.data?.reservas || res.data || [];
      const finalizadas = reservas.filter(item => item.estado === 'finalizada');
      setHistorialCompleto(finalizadas);
      setHistorial(finalizadas);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let items = [...historialCompleto];

    if (fechaInicio) {
      const inicio = new Date(`${fechaInicio}T00:00:00`);
      items = items.filter(item => {
        const fechaActividad = getActividadDate(item);
        return fechaActividad && fechaActividad >= inicio;
      });
    }

    if (fechaFin) {
      const fin = new Date(`${fechaFin}T23:59:59`);
      items = items.filter(item => {
        const fechaActividad = getActividadDate(item);
        return fechaActividad && fechaActividad <= fin;
      });
    }

    if (destino) {
      const destinoBuscado = destino.toLowerCase();
      items = items.filter(item => {
        const itemDestino = item.destino || item.actividad?.destino || '';
        return itemDestino.toLowerCase().includes(destinoBuscado);
      });
    }

    setHistorial(items);
  };

  const handleFiltrar = () => {
    aplicarFiltros();
  };

  const handlePressItem = (item) => {
    navigation.navigate('ActividadDetail', { actividadId: getActividadId(item) });
  };

  const handleCalificar = (item) => {
    navigation.navigate('Review', {
      actividadId: getActividadId(item),
      fecha: item.fecha,
      horario: item.horario,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterBox}>
        <Text style={styles.filterTitle}>Filtrar historial</Text>
        <TextInput style={styles.input} placeholder="Fecha inicio (YYYY-MM-DD)" value={fechaInicio} onChangeText={setFechaInicio} placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Fecha fin (YYYY-MM-DD)" value={fechaFin} onChangeText={setFechaFin} placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Destino" value={destino} onChangeText={setDestino} placeholderTextColor="#999" />
        <TouchableOpacity style={styles.btnFiltrar} onPress={handleFiltrar}>
          <Text style={styles.btnFiltrarText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item, i) => String(item._id || item.id || i)}
          renderItem={({ item }) => {
            const calificable = isCalificable(item);
            const tieneReview = item.tieneReview === true;
            const actividadId = getActividadId(item);

            return (
              <View style={styles.item}>
                <TouchableOpacity style={styles.itemContent} onPress={() => handlePressItem(item)}>
                  <Text style={styles.itemNombre}>{item.actividad?.nombre || item.nombre || 'Actividad'}</Text>
                  <Text style={styles.itemFecha}>Fecha: {item.fecha}</Text>
                  {!!item.horario && <Text style={styles.itemHorario}>Horario: {item.horario}</Text>}
                  <Text style={styles.itemDestino}>{item.destino || item.actividad?.destino || 'Destino no disponible'}</Text>
                </TouchableOpacity>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btnCalificar, (!tieneReview && (!calificable || !actividadId)) && styles.btnCalificarDisabled]}
                    onPress={() => handleCalificar(item)}
                    disabled={!tieneReview && (!calificable || !actividadId)}
                  >
                    <Text style={styles.btnCalificarText}>{tieneReview ? 'Ver reseña' : 'Calificar'}</Text>
                  </TouchableOpacity>
                  {!tieneReview && !calificable && (
                    <Text style={styles.vencidaText}>Ventana de calificación vencida</Text>
                  )}
                </View>
              </View>
            );
          }}
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
  btnFiltrar: { backgroundColor: '#1565C0', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnFiltrarText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  item: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 12, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  itemContent: { marginBottom: 12 },
  itemNombre: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  itemFecha: { fontSize: 13, color: '#666', marginBottom: 2 },
  itemHorario: { fontSize: 13, color: '#666', marginBottom: 2 },
  itemDestino: { fontSize: 13, color: '#666' },
  actions: { alignItems: 'flex-start' },
  btnCalificar: { backgroundColor: '#1565C0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  btnCalificarDisabled: { opacity: 0.4 },
  btnCalificarText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  vencidaText: { color: '#999', fontSize: 12, marginTop: 6 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
});
