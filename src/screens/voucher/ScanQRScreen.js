import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScanQRScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [resultado, setResultado] = useState(null); // { ok: true/false, mensaje }

  // Permiso aún no resuelto
  if (!permission) {
    return <View style={styles.centered}><Text>Cargando cámara…</Text></View>;
  }

  // Permiso denegado: pedirlo
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.info}>Necesitamos permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = (scan) => {
    setEscaneado(true);
    try {
      // El QR del guía trae un JSON. Lo parseamos.
      const datos = JSON.parse(scan.data);
      if (datos && datos.checkin) {
        setResultado({ ok: true, mensaje: '✅ Asistencia confirmada' });
      } else {
        setResultado({ ok: false, mensaje: '❌ QR inválido' });
      }
    } catch (e) {
      setResultado({ ok: false, mensaje: '❌ QR inválido' });
    }
  };

  const reintentar = () => {
    setEscaneado(false);
    setResultado(null);
  };

  // Mostrar resultado (verde o rojo)
  if (resultado) {
    return (
      <View style={[styles.centered, { backgroundColor: resultado.ok ? '#4CAF50' : '#F44336' }]}>
        <Text style={styles.resultadoText}>{resultado.mensaje}</Text>
        <TouchableOpacity style={styles.btnBlanco} onPress={reintentar}>
          <Text style={styles.btnBlancoText}>Escanear otro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnBlanco} onPress={() => navigation.goBack()}>
          <Text style={styles.btnBlancoText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Cámara activa
  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={escaneado ? undefined : handleScan}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Apuntá la cámara al QR del guía</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8F9FA' },
  info: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#2196F3', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 14 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  overlay: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
  overlayText: { color: '#fff', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  resultadoText: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 32 },
  btnBlanco: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 12 },
  btnBlancoText: { color: '#333', fontWeight: '700', fontSize: 15 },
});