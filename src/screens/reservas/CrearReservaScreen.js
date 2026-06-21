import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { crearReserva } from '../../api/apiService';

export default function CrearReservaScreen({ route, navigation }) {
  const { actividadId } = route.params || {};
  const [fecha, setFecha] = useState('');
  const [horario, setHorario] = useState('');
  const [cantidadParticipantes, setCantidadParticipantes] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!fecha || !horario || !cantidadParticipantes) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }
    if (!actividadId) {
      Alert.alert('Error', 'No se especificó la actividad');
      return;
    }
    setLoading(true);
    try {
      await crearReserva({
        actividadId,
        fecha,
        horario,
        cantidadParticipantes: parseInt(cantidadParticipantes, 10),
      });
      Alert.alert('Éxito', 'Reserva creada correctamente', [
        { text: 'OK', onPress: () => navigation.navigate('Reservas') },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'No se pudo crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Nueva Reserva</Text>

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={fecha}
          onChangeText={setFecha}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Horario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 10:00"
          value={horario}
          onChangeText={setHorario}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Cantidad de participantes</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          value={cantidadParticipantes}
          onChangeText={setCantidadParticipantes}
          keyboardType="number-pad"
          placeholderTextColor="#999"
        />

        {loading ? (
          <ActivityIndicator color="#2196F3" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleConfirmar}>
            <Text style={styles.btnText}>Confirmar Reserva</Text>
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
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', marginBottom: 16, backgroundColor: '#fafafa' },
  btn: { backgroundColor: '#2196F3', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
