import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register, login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email y contraseña son obligatorios');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name || undefined);
      // Registro exitoso → auto-login
      await login(email, password);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'No se pudo crear la cuenta';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Empezá a explorar el mundo</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre (opcional)"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 20 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
              <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>¿Ya tenés cuenta? </Text>
              <Text style={styles.link}>Iniciá sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 36,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    color: '#333',
  },
  btnPrimary: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#1565C0',
    fontSize: 14,
    fontWeight: '600',
  },
});
