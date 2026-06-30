import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { postReview, getReview } from '../../api/apiService';
import { useAuth } from '../../context/AuthContext';

const CALIFICACION_HORAS = 48;

const getActividadDate = (fecha, horario) => {
  if (!fecha) return null;

  const fechaBase = String(fecha).split('T')[0];
  const horaBase = horario || '00:00';
  const fechaActividad = new Date(`${fechaBase}T${horaBase}:00`);

  if (Number.isNaN(fechaActividad.getTime())) {
    const fallback = new Date(fecha);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  return fechaActividad;
};

const isCalificable = (fecha, horario) => {
  const fechaActividad = getActividadDate(fecha, horario);
  if (!fechaActividad) return false;

  const limite = new Date(fechaActividad.getTime() + CALIFICACION_HORAS * 60 * 60 * 1000);
  return new Date() <= limite;
};

export default function ReviewScreen({ route }) {
  const { actividadId, fecha, horario } = route.params;
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  const [calificacionActividad, setCalificacionActividad] = useState(0);
  const [calificacionGuia, setCalificacionGuia] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getReview(user?.uid, actividadId);
        if (res.data?.review) setReview(res.data.review);
      } catch (e) {
        // 404 = no existe reseña previa, mostrar formulario
        if (e?.response?.status !== 404) {
          Alert.alert('Error', 'No se pudo verificar la reseña existente');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actividadId]);

  const handleEnviar = async () => {
    if (fecha && !isCalificable(fecha, horario)) {
      Alert.alert('Error', 'El plazo para calificar esta actividad venció');
      return;
    }
    if (calificacionActividad === 0 || calificacionGuia === 0) {
      Alert.alert('Error', 'Calificá tanto la actividad como el guía');
      return;
    }
    setSubmitting(true);
    try {
      await postReview({ actividadId, calificacionActividad, calificacionGuia, comentario });
      Alert.alert('Éxito', 'Reseña enviada correctamente');
      const res = await getReview(user?.uid, actividadId);
      setReview(res.data.review);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'No se pudo enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  if (review) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Tu reseña</Text>
          <Text style={styles.label}>Actividad</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Text key={i} style={styles.starStatic}>{i <= review.calificacionActividad ? '⭐' : '☆'}</Text>
            ))}
          </View>
          <Text style={styles.label}>Guía</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Text key={i} style={styles.starStatic}>{i <= review.calificacionGuia ? '⭐' : '☆'}</Text>
            ))}
          </View>
          {review.comentario ? (
            <Text style={styles.comentarioText}>{review.comentario}</Text>
          ) : (
            <Text style={styles.noComentario}>Sin comentario</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  if (fecha && !isCalificable(fecha, horario)) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Plazo vencido</Text>
          <Text style={styles.noComentario}>El plazo para calificar esta actividad venció</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Calificá esta actividad</Text>

        <Text style={styles.label}>Calificación de la actividad</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} onPress={() => setCalificacionActividad(i)}>
              <Text style={styles.starBtn}>{i <= calificacionActividad ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Calificación del guía</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} onPress={() => setCalificacionGuia(i)}>
              <Text style={styles.starBtn}>{i <= calificacionGuia ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Comentario (opcional)</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Contá tu experiencia..."
          value={comentario}
          onChangeText={setComentario}
          multiline
          numberOfLines={5}
          placeholderTextColor="#999"
          textAlignVertical="top"
          maxLength={300}
        />
        <Text style={styles.counterText}>{comentario.length}/300</Text>

        {submitting ? (
          <ActivityIndicator color="#2196F3" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleEnviar}>
            <Text style={styles.btnText}>Enviar Reseña</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 20, backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 4 },
  starsRow: { flexDirection: 'row', marginBottom: 16 },
  starBtn: { fontSize: 34, marginRight: 4 },
  starStatic: { fontSize: 26, marginRight: 4 },
  textarea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', minHeight: 120, marginBottom: 6 },
  counterText: { color: '#999', fontSize: 12, textAlign: 'right', marginBottom: 16 },
  btn: { backgroundColor: '#2196F3', borderRadius: 10, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  comentarioText: { fontSize: 15, color: '#555', marginTop: 12, lineHeight: 22 },
  noComentario: { fontSize: 14, color: '#999', marginTop: 8, fontStyle: 'italic' },
});
