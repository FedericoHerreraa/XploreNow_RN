import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { getActividades, addFavorito, removeFavorito, checkFavorito } from '../../api/apiService';

const CATEGORIAS = ['', 'aventura', 'cultura', 'gastronomia', 'naturaleza', 'relax'];

function ActividadItem({ item, onPress, onToggleFav }) {
  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(item)}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, { backgroundColor: '#ddd' }]} />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemNombre} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.itemDestino}>{item.destino}</Text>
        <Text style={styles.itemCategoria}>{item.categoria}</Text>
        <Text style={styles.itemPrecio}>{item.precio === 0 ? 'Gratis' : `$${item.precio}`}</Text>
      </View>
      <TouchableOpacity onPress={() => onToggleFav(item)} style={styles.favBtn}>
        <Text style={{ fontSize: 22 }}>{item.esFavorito ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function ActividadListScreen({ navigation }) {
  const [destino, setDestino] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [fecha, setFecha] = useState('');
  const [actividades, setActividades] = useState([]);
  const [destacadas, setDestacadas] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchDestacadas();
    fetchActividades(1, true);
  }, []);

  const fetchDestacadas = async () => {
    try {
      const res = await getActividades({ destacadas: true, limit: 10 });
      setDestacadas(res.data?.destacadas || []);
    } catch {
      // silencioso
    }
  };

  const fetchActividades = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = { page: pageNum, limit: 10 };
      if (destino) params.destino = destino;
      if (categoria) params.categoria = categoria;
      if (precioMin) params.precio_min = precioMin;
      if (precioMax) params.precio_max = precioMax;
      if (fecha) params.fecha = fecha;
      const res = await getActividades(params);
      const items = res.data?.results || [];
      const totalPages = res.data?.total_pages || 1;
      setActividades(prev => reset ? items : [...prev, ...items]);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar las actividades');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleBuscar = () => fetchActividades(1, true);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) fetchActividades(page + 1);
  };

  const handlePress = (item) => {
    navigation.navigate('ActividadDetail', { actividadId: item._id || item.id });
  };

  const handleToggleFav = async (item) => {
    const id = item._id || item.id;
    try {
      if (item.esFavorito) {
        await removeFavorito(id);
      } else {
        await addFavorito(id);
      }
      setActividades(prev =>
        prev.map(a => (a._id || a.id) === id ? { ...a, esFavorito: !a.esFavorito } : a)
      );
    } catch {
      Alert.alert('Error', 'No se pudo actualizar favorito');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterBox}>
        <TextInput
          style={styles.input}
          placeholder="Destino"
          value={destino}
          onChangeText={setDestino}
          placeholderTextColor="#999"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, categoria === cat && styles.catChipActive]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={[styles.catChipText, categoria === cat && styles.catChipTextActive]}>
                {cat || 'Todas'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Precio mín" value={precioMin} onChangeText={setPrecioMin} keyboardType="numeric" placeholderTextColor="#999" />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Precio máx" value={precioMax} onChangeText={setPrecioMax} keyboardType="numeric" placeholderTextColor="#999" />
        </View>
        <TextInput style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} placeholderTextColor="#999" />
        <TouchableOpacity style={styles.btnBuscar} onPress={handleBuscar}>
          <Text style={styles.btnBuscarText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={actividades}
        keyExtractor={(item) => String(item._id || item.id)}
        renderItem={({ item }) => <ActividadItem item={item} onPress={handlePress} onToggleFav={handleToggleFav} />}
        ListHeaderComponent={() => (
          <>
            {destacadas.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Destacadas</Text>
                <FlatList
                  data={destacadas}
                  horizontal
                  keyExtractor={(item) => `dest-${item._id || item.id}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.destacadaCard} onPress={() => handlePress(item)}>
                      {item.imagen ? <Image source={{ uri: item.imagen }} style={styles.destacadaImage} /> : <View style={[styles.destacadaImage, { backgroundColor: '#ddd' }]} />}
                      <Text style={styles.destacadaNombre} numberOfLines={1}>{item.nombre}</Text>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
                />
                <Text style={styles.sectionTitle}>Resultados</Text>
              </View>
            )}
          </>
        )}
        ListEmptyComponent={!loading && <Text style={styles.emptyText}>Sin resultados</Text>}
        ListFooterComponent={() => (
          <>
            {loadingMore && <ActivityIndicator color="#2196F3" style={{ margin: 16 }} />}
            {hasMore && !loadingMore && (
              <TouchableOpacity style={styles.btnMore} onPress={handleLoadMore}>
                <Text style={styles.btnMoreText}>Cargar más</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  filterBox: { backgroundColor: '#fff', padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8, fontSize: 14, color: '#333', backgroundColor: '#fafafa' },
  row: { flexDirection: 'row' },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fafafa' },
  catChipActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  catChipText: { fontSize: 13, color: '#666' },
  catChipTextActive: { color: '#fff' },
  btnBuscar: { backgroundColor: '#2196F3', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnBuscarText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  item: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  itemImage: { width: 90, height: 90 },
  itemInfo: { flex: 1, padding: 10 },
  itemNombre: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemDestino: { fontSize: 12, color: '#666', marginTop: 2 },
  itemCategoria: { fontSize: 11, color: '#999', marginTop: 2 },
  itemPrecio: { fontSize: 14, fontWeight: '700', color: '#2196F3', marginTop: 4 },
  favBtn: { padding: 12, justifyContent: 'center' },
  destacadaCard: { width: 130, marginRight: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', elevation: 1 },
  destacadaImage: { width: '100%', height: 80 },
  destacadaNombre: { fontSize: 12, fontWeight: '600', color: '#333', padding: 6 },
  emptyText: { textAlign: 'center', color: '#999', margin: 24 },
  btnMore: { margin: 16, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2196F3', alignItems: 'center' },
  btnMoreText: { color: '#2196F3', fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(248,249,250,0.7)' },
});