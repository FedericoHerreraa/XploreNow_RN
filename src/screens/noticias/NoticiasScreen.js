import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { getNoticias } from '../../api/apiService';

export default function NoticiasScreen({ navigation }) {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNoticias();
        setNoticias(res.data?.noticias || res.data || []);
      } catch {
        Alert.alert('Error', 'No se pudieron cargar las noticias');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePress = (item) => {
    if (item.actividadRelacionadaId) {
      navigation.navigate('ActividadDetail', { actividadId: item.actividadRelacionadaId });
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2196F3" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={noticias}
        keyExtractor={(item) => String(item._id || item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(item)}
            activeOpacity={item.actividadRelacionadaId ? 0.7 : 1}
          >
            {item.imagen && (
              <Image source={{ uri: item.imagen }} style={styles.itemImage} />
            )}
            <View style={styles.itemContent}>
              <Text style={styles.itemTitulo}>{item.titulo}</Text>
              <Text style={styles.itemDesc} numberOfLines={4}>{item.descripcion}</Text>
              {item.actividadRelacionadaId && (
                <Text style={styles.verMas}>Ver actividad →</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Sin noticias por ahora</Text>}
        ListHeaderComponent={<Text style={styles.screenTitle}>Noticias y Novedades</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', padding: 16 },
  item: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  itemImage: { width: '100%', height: 160 },
  itemContent: { padding: 16 },
  itemTitulo: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  itemDesc: { fontSize: 14, color: '#555', lineHeight: 20 },
  verMas: { marginTop: 10, color: '#2196F3', fontWeight: '600', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
});
