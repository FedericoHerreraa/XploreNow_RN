import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getRecomendadas, getNoticias } from '../../api/apiService';

function ActividadCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.actividadCard} onPress={() => onPress(item)}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
      )}
      <Text style={styles.cardNombre} numberOfLines={1}>{item.nombre}</Text>
      <Text style={styles.cardDestino}>{item.destino}</Text>
      <Text style={styles.cardPrecio}>${item.precio}</Text>
    </TouchableOpacity>
  );
}

function NoticiaCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.noticiaCard} onPress={() => onPress(item)}>
      <Text style={styles.noticiaTitulo} numberOfLines={2}>{item.titulo}</Text>
      <Text style={styles.noticiaDesc} numberOfLines={3}>{item.descripcion}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [recomendadas, setRecomendadas] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const preferencias = user?.preferences || [];
        const [recRes, notRes] = await Promise.all([
          getRecomendadas(preferencias),
          getNoticias(),
        ]);
        setRecomendadas(recRes.data);
        setNoticias(notRes.data);
      } catch (e) {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleActividadPress = (item) => {
    navigation.navigate('ActividadDetail', { actividadId: item._id || item.id });
  };

  const handleNoticiaPress = (item) => {
    if (item.actividadRelacionadaId) {
      navigation.navigate('ActividadDetail', { actividadId: item.actividadRelacionadaId });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saludo}>¡Hola, {user?.nombre || 'Viajero'}!</Text>
          <Text style={styles.subSaludo}>¿A dónde viajamos hoy?</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.nombre?.[0] || 'U').toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recomendados para vos</Text>
      {recomendadas.length === 0 ? (
        <Text style={styles.emptyText}>Sin recomendaciones por ahora</Text>
      ) : (
        <FlatList
          data={recomendadas}
          horizontal
          keyExtractor={(item) => String(item._id || item.id)}
          renderItem={({ item }) => <ActividadCard item={item} onPress={handleActividadPress} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      )}

      <Text style={styles.sectionTitle}>Novedades y Ofertas</Text>
      {noticias.length === 0 ? (
        <Text style={styles.emptyText}>Sin novedades por ahora</Text>
      ) : (
        <FlatList
          data={noticias}
          horizontal
          keyExtractor={(item) => String(item._id || item.id)}
          renderItem={({ item }) => <NoticiaCard item={item} onPress={handleNoticiaPress} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2196F3' },
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196F3',
  },
  saludo: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subSaludo: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: { color: '#999', marginHorizontal: 16, marginBottom: 12 },
  actividadCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { width: '100%', height: 100 },
  cardImagePlaceholder: { backgroundColor: '#ddd' },
  cardNombre: { fontSize: 13, fontWeight: '600', color: '#333', padding: 8, paddingBottom: 2 },
  cardDestino: { fontSize: 12, color: '#666', paddingHorizontal: 8 },
  cardPrecio: { fontSize: 13, fontWeight: '700', color: '#2196F3', padding: 8, paddingTop: 4 },
  noticiaCard: {
    width: 200,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  noticiaTitulo: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 6 },
  noticiaDesc: { fontSize: 12, color: '#666', lineHeight: 18 },
});
