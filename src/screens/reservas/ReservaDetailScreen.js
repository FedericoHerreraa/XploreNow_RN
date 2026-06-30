import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { getActividadById, cancelarReserva } from '../../api/apiService';

const ESTADO_COLORS = {
  pendiente: '#FF9800',
  confirmada: '#4CAF50',
  finalizada: '#607D8B',
  cancelada: '#F44336',
};

export default function ReservaDetailScreen({ route, navigation }) {
  const {
    reservaId,
    actividadId,
    nombre,
    fecha,
    horario,
    cantidadParticipantes,
    estado: estadoInicial,
  } = route.params || {};

  const [actividad, setActividad] = useState(null);
  const [loadingAct, setLoadingAct] = useState(true);
  const [estado, setEstado] = useState((estadoInicial || 'confirmada').toLowerCase());
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (!actividadId) {
      setLoadingAct(false);
      return;
    }
    (async () => {
      try {
        const res = await getActividadById(actividadId);
        setActividad(res.data);
      } catch {
      } finally {
        setLoadingAct(false);
      }
    })();
  }, [actividadId]);

  const politica = actividad?.politica_cancelacion;
  const puedeCancelar = estado !== 'cancelada' && estado !== 'finalizada';

  const handleCancelar = () => {
    const detallePolitica = politica
      ? `\n\nPolítica de cancelación aplicable:\n${politica}`
      : '';
    Alert.alert(
      'Cancelar reserva',
      `¿Seguro que querés cancelar esta reserva?${detallePolitica}`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelando(true);
            try {
              await cancelarReserva(reservaId);
              setEstado('cancelada');
              Alert.alert('Reserva cancelada', 'Tu reserva fue cancelada correctamente.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e) {
              Alert.alert(
                'Error',
                e?.response?.data?.message ||
                  e?.response?.data?.error ||
                  'No se pudo cancelar la reserva'
              );
            } finally {
              setCancelando(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{nombre || actividad?.nombre || 'Detalle de reserva'}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: ESTADO_COLORS[estado] || '#999' }]}>
            <Text style={styles.estadoText}>{estado}</Text>
          </View>
        </View>

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
          <Text style={styles.label}>Participantes</Text>
          <Text style={styles.value}>{cantidadParticipantes ?? '—'}</Text>
        </View>

        {actividad?.punto_encuentro && (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Punto de encuentro</Text>
              <Text style={[styles.value, styles.valueWrap]}>{actividad.punto_encuentro}</Text>
            </View>
          </>
        )}

        {actividad?.guia && (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Guía</Text>
              <Text style={styles.value}>{actividad.guia}</Text>
            </View>
          </>
        )}
      </View>

      {/* Política de cancelación */}
      <View style={styles.card}>
        <Text style={styles.seccionLabel}>Política de cancelación</Text>
        {loadingAct ? (
          <ActivityIndicator color="#2196F3" style={{ marginTop: 8 }} />
        ) : (
          <Text style={styles.parrafo}>
            {politica || 'No se especificó una política de cancelación para esta actividad.'}
          </Text>
        )}
      </View>

      {/* Acciones */}
      <View style={styles.acciones}>
        {puedeCancelar ? (
          cancelando ? (
            <ActivityIndicator color="#F44336" style={{ marginTop: 8 }} />
          ) : (
            <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
              <Text style={styles.btnCancelarText}>Cancelar reserva</Text>
            </TouchableOpacity>
          )
        ) : (
          <Text style={styles.noCancelable}>
            {estado === 'cancelada'
              ? 'Esta reserva ya fue cancelada.'
              : 'Esta actividad ya finalizó y no puede cancelarse.'}
          </Text>
        )}

        {estado === 'confirmada' && (
          <TouchableOpacity
            style={styles.btnVoucher}
            onPress={() =>
              navigation.navigate('Voucher', {
                reservaId,
                actividadId,
                nombre: nombre || actividad?.nombre,
                fecha,
                horario,
                cantidadParticipantes,
                puntoEncuentro: actividad?.punto_encuentro,
                guia: actividad?.guia,
              })
            }
          >
            <Text style={styles.btnVoucherText}>Ver voucher</Text>
          </TouchableOpacity>
        )}

        {actividadId && (
          <TouchableOpacity
            style={styles.btnVer}
            onPress={() => navigation.navigate('ActividadDetail', { actividadId })}
          >
            <Text style={styles.btnVerText}>Ver actividad</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  card: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  estadoText: { fontSize: 11, color: '#fff', fontWeight: '600', textTransform: 'capitalize' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  label: { fontSize: 14, color: '#666', marginRight: 12 },
  value: { fontSize: 15, fontWeight: '600', color: '#333', flexShrink: 1, textAlign: 'right' },
  valueWrap: { flex: 1 },
  divider: { height: 1, backgroundColor: '#f0f0f0' },

  seccionLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  parrafo: { fontSize: 14, color: '#555', lineHeight: 22 },

  acciones: { marginHorizontal: 20, marginTop: 20 },
  btnCancelar: { borderWidth: 1, borderColor: '#F44336', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnCancelarText: { color: '#F44336', fontSize: 15, fontWeight: '600' },
  noCancelable: { textAlign: 'center', color: '#999', fontSize: 14, paddingVertical: 8 },
  btnVer: { marginTop: 12, backgroundColor: '#2196F3', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnVerText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnVoucher: { marginTop: 12, backgroundColor: '#4CAF50', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnVoucherText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});