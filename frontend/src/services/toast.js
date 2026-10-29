import { reactive } from 'vue';

export const toastState = reactive({
  toasts: [],
});

let toastIdCounter = 0;

/**
 * Muestra una notificación flotante (toast)
 * @param {string} message - Texto del mensaje
 * @param {'success' | 'error' | 'warning' | 'info'} type - Tipo de notificación
 * @param {number} duration - Duración en milisegundos (por defecto 3500ms)
 */
export function showToast(message, type = 'success', duration = 3500) {
  const id = ++toastIdCounter;
  toastState.toasts.push({ id, message, type });

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  return id;
}

export function removeToast(id) {
  const index = toastState.toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    toastState.toasts.splice(index, 1);
  }
}
