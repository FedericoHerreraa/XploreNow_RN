import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMisFavoritos, removeFavorito } from '../../api/apiService';

export default function FavoritosScreen({ navigation }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMisFavoritos();
      setFavoritos(res.data?.favoritos || res.data || []);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item) => {
    const id = item._id || item.id;
    try {
      await removeFavorito(id);
      setFavoritos(prev => prev.filter(f => (f._id || f.id) !== id));
    } catch {
      Alert.alert('Error', 'No se pudo quitar de favoritos');
    }
  };

  const handlePress = (item) => {
    navigation.navigate('ActividadDetail', { actividadId: item._id || item.id });
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Mis Favoritos</Text>
      <FlatList
        data={favoritos}
        keyExtractor={(item) => String(item._id || item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
            {item.imagen ? (
              <Image source={{ uri: item.imagen }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, { backgroundColor: '#ddd' }]} />
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre} numberOfLines={1}>{item.nombre}</Text>
              <Text style={styles.itemDestino}>{item.destino}</Text>
              <Text style={styles.itemPrecio}>${item.precio}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
              <Ionicons name="heart" size={24} color="#F44336" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No tenés favoritos aún</Text>}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', padding: 16, paddingBottom: 8 },
  item: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  itemImage: { width: 90, height: 90 },
  itemInfo: { flex: 1, padding: 12 },
  itemNombre: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemDestino: { fontSize: 12, color: '#666', marginTop: 3 },
  itemPrecio: { fontSize: 14, fontWeight: '700', color: '#2196F3', marginTop: 6 },
  removeBtn: { padding: 12, justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
});
