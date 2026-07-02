import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import * as apiService from '../api/apiService';
import { navigate } from '../navigation/navigationRef';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    null
  );
}

// Registra el dispositivo para recibir push notifications y envía el token al backend.
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = getProjectId();
  let pushToken;
  try {
    const result = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    pushToken = result.data;
  } catch {
    // Expo Go (SDK 53+) no soporta push remotas: hace falta un development build.
    return null;
  }

  try {
    await apiService.registerDevice(pushToken, Platform.OS);
  } catch {
    // El registro remoto puede reintentarse en el próximo login.
  }

  return pushToken;
}

// Busca la reserva y su actividad para abrir el voucher completo desde una notificación.
async function openVoucherFromReservaId(reservaId) {
  try {
    const res = await apiService.getMisReservas();
    const reservas = res.data?.reservas || res.data || [];
    const reserva = reservas.find((r) => String(r._id || r.id) === String(reservaId));
    if (!reserva) {
      navigate('Home', { screen: 'Reservas' });
      return;
    }

    const actividadId = reserva.actividad?._id || reserva.actividad?.id || reserva.actividadId;
    let actividad = null;
    if (actividadId) {
      try {
        const actRes = await apiService.getActividadById(actividadId);
        actividad = actRes.data;
      } catch {
        // seguimos con los datos disponibles en la reserva
      }
    }

    navigate('Voucher', {
      reservaId: reserva._id || reserva.id,
      actividadId,
      nombre: reserva.actividad?.nombre || reserva.actividadNombre || actividad?.nombre,
      fecha: reserva.fecha,
      horario: reserva.horario,
      cantidadParticipantes: reserva.cantidadParticipantes,
      puntoEncuentro: actividad?.punto_encuentro,
      guia: actividad?.guia,
    });
  } catch {
    navigate('Home', { screen: 'Reservas' });
  }
}

function handleResponse(response) {
  const data = response?.notification?.request?.content?.data || {};
  if (data.reservaId) {
    openVoucherFromReservaId(data.reservaId);
  }
}

// Suscribe los listeners de notificaciones (tap y recepción) y devuelve una función de limpieza.
export function addNotificationListeners() {
  // Cubre el caso de cold start: la app se abrió tocando la notificación.
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) handleResponse(response);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener(handleResponse);

  return () => {
    responseSub.remove();
  };
}
