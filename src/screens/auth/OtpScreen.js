import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const RESEND_COOLDOWN = 60;

export default function OtpScreen({ route }) {
  const { email } = route.params;
  const { verifyOtp, sendOtp } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const intervalRef = useRef(null);

  useEffect(() => {
    startCountdown();
    return () => clearInterval(intervalRef.current);
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (codigo.length !== 6) {
      Alert.alert('Error', 'El código debe tener 6 dígitos');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, codigo);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendOtp(email);
      setCodigo('');
      startCountdown();
      Alert.alert('Código enviado', `Revisá tu email: ${email}`);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error || 'No se pudo reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Verificar código</Text>
      <Text style={styles.subtitle}>
        Ingresá el código de 6 dígitos enviado a{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <TextInput
        style={styles.input}
        placeholder="000000"
        value={codigo}
        onChangeText={setCodigo}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
        placeholderTextColor="#999"
        autoFocus
      />

      {loading ? (
        <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 20 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.btn} onPress={handleVerify}>
            <Text style={styles.btnText}>Verificar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnResend, countdown > 0 && styles.btnResendDisabled]}
            onPress={handleResend}
            disabled={countdown > 0}
          >
            <Text style={[styles.btnResendText, countdown > 0 && styles.btnResendTextDisabled]}>
              {countdown > 0 ? `Reenviar código (${countdown}s)` : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  email: {
    color: '#1565C0',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 18,
    fontSize: 28,
    letterSpacing: 8,
    color: '#333',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnResend: {
    marginTop: 16,
    padding: 14,
    alignItems: 'center',
  },
  btnResendDisabled: {
    opacity: 0.4,
  },
  btnResendText: {
    color: '#1565C0',
    fontSize: 15,
    fontWeight: '600',
  },
  btnResendTextDisabled: {
    color: '#999',
  },
});
