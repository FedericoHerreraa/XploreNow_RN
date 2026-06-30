import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getActividadById, crearReserva } from '../../api/apiService';

function getProximosDias(n) {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const out = [];
  const hoy = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push({ value: `${y}-${m}-${day}`, label: `${dias[d.getDay()]} ${day}/${m}` });
  }
  return out;
}

const PROXIMOS_DIAS = getProximosDias(14);

export default function CrearReservaScreen({ route, navigation }) {
  const { actividadId } = route.params || {};

  const [actividad, setActividad] = useState(null);
  const [loadingAct, setLoadingAct] = useState(true);

  const [fecha, setFecha] = useState('');
  const [horario, setHorario] = useState('');
  const [participantes, setParticipantes] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const cargarActividad = useCallback(async () => {
    if (!actividadId) {
      setLoadingAct(false);
      return;
    }
    try {
      const res = await getActividadById(actividadId);
      setActividad(res.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar la actividad');
    } finally {
      setLoadingAct(false);
    }
  }, [actividadId]);

  useFocusEffect(
    useCallback(() => {
      cargarActividad();
    }, [cargarActividad])
  );

  const cupos = actividad?.cuposDisponibles ?? null;
  const sinCupos = cupos != null && cupos <= 0;
  const excedeCupos = cupos != null && participantes > cupos;

  const horarios = actividad?.horarios || [];
  const tieneHorarios = horarios.length > 0;

  const puedeConfirmar =
    !!actividadId &&
    !!fecha &&
    !!horario &&
    participantes >= 1 &&
    !excedeCupos &&
    !sinCupos &&
    !submitting;

  const incParticipantes = () =>
    setParticipantes((p) => (cupos != null ? Math.min(p + 1, Math.max(cupos, 1)) : p + 1));
  const decParticipantes = () => setParticipantes((p) => Math.max(1, p - 1));

  const handleConfirmar = async () => {
    if (!actividadId) {
      Alert.alert('Error', 'No se especificó la actividad');
      return;
    }
    if (!fecha || !horario) {
      Alert.alert('Faltan datos', 'Elegí una fecha y un horario.');
      return;
    }

    setSubmitting(true);
    let cuposActuales = cupos;
    try {
      try {
        const fresh = await getActividadById(actividadId);
        setActividad(fresh.data);
        cuposActuales = fresh.data?.cuposDisponibles ?? cuposActuales;
      } catch {
      }

      if (cuposActuales != null && participantes > cuposActuales) {
        Alert.alert(
          'Cupos insuficientes',
          `Solo quedan ${cuposActuales} cupo(s) disponibles para esta actividad.`
        );
        setSubmitting(false);
        return;
      }

      await crearReserva({
        actividadId,
        fecha,
        horario,
        cantidadParticipantes: participantes,
      });

      Alert.alert('Reserva confirmada', 'Tu reserva se creó correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Home', { screen: 'Reservas' }) },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'No se pudo crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAct) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!actividadId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}>🧭</Text>
        <Text style={styles.emptyTitle}>Elegí una actividad</Text>
        <Text style={styles.emptyText}>
          Para reservar, primero seleccioná una actividad desde el catálogo.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Actividades')}
        >
          <Text style={styles.btnText}>Ver actividades</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Resumen de la actividad */}
      {actividad && (
        <View style={styles.resumen}>
          <Text style={styles.resumenNombre}>{actividad.nombre}</Text>
          <Text style={styles.resumenDestino}>📍 {actividad.destino}</Text>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenPrecio}>
              {actividad.precio === 0 ? 'Gratis' : `$${actividad.precio}`}
            </Text>
            {cupos != null && (
              <Text style={[styles.cuposPill, sinCupos && styles.cuposPillRojo]}>
                {sinCupos ? 'Sin cupos' : `${cupos} cupos disponibles`}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.card}>
        {/* Fecha */}
        <Text style={styles.label}>Fecha</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {PROXIMOS_DIAS.map((d) => {
            const sel = fecha === d.value;
            return (
              <TouchableOpacity
                key={d.value}
                style={[styles.chip, sel && styles.chipSel]}
                onPress={() => setFecha(d.value)}
              >
                <Text style={[styles.chipText, sel && styles.chipTextSel]}>{d.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Horario */}
        <Text style={styles.label}>Horario disponible</Text>
        {tieneHorarios ? (
          <View style={styles.chipsWrap}>
            {horarios.map((h, i) => {
              const sel = horario === h;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, sel && styles.chipSel]}
                  onPress={() => setHorario(h)}
                >
                  <Text style={[styles.chipText, sel && styles.chipTextSel]}>{h}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Ej: 10:00"
            value={horario}
            onChangeText={setHorario}
            placeholderTextColor="#999"
          />
        )}

        {/* Participantes con stepper */}
        <Text style={styles.label}>Cantidad de participantes</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={[styles.stepBtn, participantes <= 1 && styles.stepBtnDisabled]}
            onPress={decParticipantes}
            disabled={participantes <= 1}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepValue}>{participantes}</Text>
          <TouchableOpacity
            style={[
              styles.stepBtn,
              (excedeCupos || (cupos != null && participantes >= cupos)) && styles.stepBtnDisabled,
            ]}
            onPress={incParticipantes}
            disabled={cupos != null && participantes >= cupos}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback de validación en tiempo real */}
        {sinCupos && (
          <Text style={styles.errorMsg}>Esta actividad no tiene cupos disponibles.</Text>
        )}
        {!sinCupos && excedeCupos && (
          <Text style={styles.errorMsg}>
            Solo quedan {cupos} cupo(s). Reducí la cantidad de participantes.
          </Text>
        )}

        {/* Confirmar */}
        {submitting ? (
          <ActivityIndicator color="#2196F3" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity
            style={[styles.btn, !puedeConfirmar && styles.btnDisabled]}
            onPress={handleConfirmar}
            disabled={!puedeConfirmar}
          >
            <Text style={styles.btnText}>Confirmar reserva</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8F9FA' },

  resumen: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  resumenNombre: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  resumenDestino: { fontSize: 13, color: '#666', marginBottom: 10 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumenPrecio: { fontSize: 18, fontWeight: 'bold', color: '#2196F3' },
  cuposPill: { fontSize: 12, color: '#2E7D32', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  cuposPillRojo: { color: '#C62828', backgroundColor: '#FFEBEE' },

  card: { margin: 20, backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 6 },

  chipsRow: { flexDirection: 'row', marginBottom: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8, backgroundColor: '#fafafa' },
  chipSel: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextSel: { color: '#fff', fontWeight: '600' },

  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', marginBottom: 12, backgroundColor: '#fafafa' },

  stepper: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  stepBtnDisabled: { backgroundColor: '#f0f0f0' },
  stepBtnText: { fontSize: 22, color: '#2196F3', fontWeight: '700' },
  stepValue: { fontSize: 18, fontWeight: '700', color: '#333', minWidth: 56, textAlign: 'center' },

  errorMsg: { color: '#C62828', fontSize: 13, marginTop: 4, marginBottom: 4 },

  btn: { backgroundColor: '#2196F3', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 16 },
  btnDisabled: { backgroundColor: '#B0BEC5' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
});