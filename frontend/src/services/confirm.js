import { reactive } from 'vue';

export const confirmState = reactive({
  isOpen: false,
  title: '¿Confirmar acción?',
  message: '¿Estás seguro de que deseas continuar con esta operación?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'danger', // 'danger' | 'warning' | 'info'
  resolve: null,
});

/**
 * Muestra un modal de confirmación antes de ejecutar una acción clave o destructiva
 * @param {Object} options
 * @param {string} options.title - Título del diálogo
 * @param {string} options.message - Explicación de la acción
 * @param {string} options.confirmText - Texto del botón de confirmación
 * @param {string} options.cancelText - Texto del botón de cancelación
 * @param {'danger' | 'warning' | 'info'} options.type - Estilo visual
 * @returns {Promise<boolean>}
 */
export function confirmAction({
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
} = {}) {
  return new Promise((resolve) => {
    confirmState.title = title;
    confirmState.message = message;
    confirmState.confirmText = confirmText;
    confirmState.cancelText = cancelText;
    confirmState.type = type;
    confirmState.isOpen = true;
    confirmState.resolve = resolve;
  });
}

export function handleConfirmResponse(result) {
  confirmState.isOpen = false;
  if (typeof confirmState.resolve === 'function') {
    confirmState.resolve(result);
    confirmState.resolve = null;
  }
}
