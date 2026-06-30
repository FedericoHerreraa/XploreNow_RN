import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { getActividadById, checkFavorito, addFavorito, removeFavorito } from '../../api/apiService';

export default function ActividadDetailScreen({ route, navigation }) {
  const { actividadId } = route.params;
  const [actividad, setActividad] = useState(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [actRes, favRes] = await Promise.all([
          getActividadById(actividadId),
          checkFavorito(actividadId),
        ]);
        setActividad(actRes.data);
        setEsFavorito(favRes.data?.esFavorito ?? false);
      } catch (e) {
        Alert.alert('Error', 'No se pudo cargar la actividad');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actividadId]);

  const handleToggleFav = async () => {
    try {
      if (esFavorito) {
        await removeFavorito(actividadId);
      } else {
        await addFavorito(actividadId);
      }
      setEsFavorito(prev => !prev);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar favorito');
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  if (!actividad) return null;

  const imagenes = actividad.imagenes || (actividad.imagen ? [actividad.imagen] : []);

  return (
    <ScrollView style={styles.container}>
      {imagenes.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galeria}>
          {imagenes.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.galeriaImg} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.galeriaPlaceholder} />
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.nombre}>{actividad.nombre}</Text>
          <TouchableOpacity onPress={handleToggleFav}>
            <Text style={{ fontSize: 28 }}>{esFavorito ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.destino}>📍 {actividad.destino}</Text>
          <Text style={styles.categoria}>{actividad.categoria}</Text>
        </View>

        <Text style={styles.precio}>
          {actividad.precio === 0 ? 'Gratis' : `$${actividad.precio}`}
        </Text>

        {actividad.rating && (
          <Text style={styles.rating}>⭐ {actividad.rating.toFixed(1)} promedio</Text>
        )}

        {/* Datos rápidos: duración, idioma, cupos */}
        <View style={styles.infoRapida}>
          {actividad.duracion && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏱️</Text>
              <Text style={styles.infoLabel}>Duración</Text>
              <Text style={styles.infoValor}>{actividad.duracion}</Text>
            </View>
          )}
          {actividad.idioma && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🗣️</Text>
              <Text style={styles.infoLabel}>Idioma</Text>
              <Text style={styles.infoValor}>{actividad.idioma}</Text>
            </View>
          )}
          {actividad.cuposDisponibles != null && (
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🎟️</Text>
              <Text style={styles.infoLabel}>Cupos</Text>
              <Text style={styles.infoValor}>{actividad.cuposDisponibles}</Text>
            </View>
          )}
        </View>

        {/* Descripción */}
        <Text style={styles.seccionLabel}>Descripción</Text>
        <Text style={styles.parrafo}>{actividad.descripcion}</Text>

        {/* Qué incluye */}
        {actividad.que_incluye && (
          <>
            <Text style={styles.seccionLabel}>Qué incluye</Text>
            <Text style={styles.parrafo}>{actividad.que_incluye}</Text>
          </>
        )}

        {/* Punto de encuentro */}
        {actividad.punto_encuentro && (
          <>
            <Text style={styles.seccionLabel}>Punto de encuentro</Text>
            <Text style={styles.parrafo}>📍 {actividad.punto_encuentro}</Text>
          </>
        )}

        {/* Guía asignado */}
        {actividad.guia && (
          <>
            <Text style={styles.seccionLabel}>Guía asignado</Text>
            <Text style={styles.parrafo}>👤 {actividad.guia}</Text>
          </>
        )}

        {/* Política de cancelación */}
        {actividad.politica_cancelacion && (
          <>
            <Text style={styles.seccionLabel}>Política de cancelación</Text>
            <Text style={styles.parrafo}>{actividad.politica_cancelacion}</Text>
          </>
        )}

        {/* Horarios (si el backend los manda) */}
        {actividad.horarios && actividad.horarios.length > 0 && (
          <>
            <Text style={styles.seccionLabel}>Horarios disponibles</Text>
            {actividad.horarios.map((h, i) => (
              <Text key={i} style={styles.horario}>• {h}</Text>
            ))}
          </>
        )}

        <TouchableOpacity
          style={styles.btnReservar}
          onPress={() => navigation.navigate('CrearReserva', { actividadId })}
        >
          <Text style={styles.btnReservarText}>Reservar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnReview}
          onPress={() => navigation.navigate('Review', { actividadId })}
        >
          <Text style={styles.btnReviewText}>Calificar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  galeria: { backgroundColor: '#000' },
  galeriaImg: { width: 300, height: 220, marginRight: 2 },
  galeriaPlaceholder: { height: 220, backgroundColor: '#ddd' },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  nombre: { fontSize: 22, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
  destino: { fontSize: 14, color: '#666', marginRight: 12 },
  categoria: { fontSize: 12, color: '#2196F3', backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  precio: { fontSize: 24, fontWeight: 'bold', color: '#2196F3', marginBottom: 6 },
  rating: { fontSize: 14, color: '#FF9800', marginBottom: 16 },
  infoRapida: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, marginTop: 12, marginBottom: 4 },
  infoItem: { alignItems: 'center', flex: 1, paddingHorizontal: 4 },
  infoIcon: { fontSize: 20, marginBottom: 4 },
  infoLabel: { fontSize: 11, color: '#999', marginBottom: 2 },
  infoValor: { fontSize: 13, color: '#333', fontWeight: '600', textAlign: 'center' },
  seccionLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8, marginTop: 18 },
  parrafo: { fontSize: 14, color: '#555', lineHeight: 22 },
  horario: { fontSize: 13, color: '#666', marginBottom: 4 },
  btnReservar: { backgroundColor: '#2196F3', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  btnReservarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnReview: { borderWidth: 1, borderColor: '#2196F3', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12, marginBottom: 24 },
  btnReviewText: { color: '#2196F3', fontSize: 15, fontWeight: '600' },
});