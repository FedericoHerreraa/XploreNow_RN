import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pending = null;

// Si el contenedor todavía no montó (p. ej. cold start desde una notificación),
// guarda la navegación y la aplica apenas esté listo.
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    pending = { name, params };
  }
}

export function flushPendingNavigation() {
  if (pending && navigationRef.isReady()) {
    navigationRef.navigate(pending.name, pending.params);
    pending = null;
  }
}
