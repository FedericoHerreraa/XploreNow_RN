import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';

export default function NoticiaDetailScreen({ route, navigation }) {
  const { noticia } = route.params || {};

  if (!noticia) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No se encontró la noticia.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {noticia.imagen && <Image source={{ uri: noticia.imagen }} style={styles.imagen} />}

      <View style={styles.content}>
        <Text style={styles.titulo}>{noticia.titulo}</Text>
        {noticia.fecha ? <Text style={styles.fecha}>{noticia.fecha}</Text> : null}

        <Text style={styles.descripcion}>{noticia.descripcion}</Text>

        {noticia.actividadRelacionadaId && (
          <TouchableOpacity
            style={styles.btnVer}
            onPress={() =>
              navigation.navigate('ActividadDetail', { actividadId: noticia.actividadRelacionadaId })
            }
          >
            <Text style={styles.btnVerText}>Ver actividad relacionada</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 15 },
  imagen: { width: '100%', height: 220, backgroundColor: '#ddd' },
  content: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  fecha: { fontSize: 13, color: '#999', marginBottom: 14 },
  descripcion: { fontSize: 15, color: '#555', lineHeight: 24 },
  btnVer: { marginTop: 24, backgroundColor: '#2196F3', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnVerText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});