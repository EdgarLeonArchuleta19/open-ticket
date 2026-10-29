<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toastState.toasts"
        :key="toast.id"
        class="pointer-events-auto rounded-xl p-3.5 shadow-lg border text-xs flex items-start gap-3 backdrop-blur-md transition-all"
        :class="toastClasses(toast.type)"
      >
        <!-- Icono según tipo -->
        <div class="mt-0.5 flex-shrink-0">
          <!-- Success: Check -->
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600 dark:text-emerald-400">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <!-- Error: Alert Circle -->
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-600 dark:text-red-400">
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <!-- Warning: Alert Triangle -->
          <svg v-else-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600 dark:text-amber-400">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
          </svg>
          <!-- Info: Info -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-600 dark:text-zinc-400">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
        </div>

        <!-- Mensaje -->
        <div class="flex-1 font-medium leading-snug">
          {{ toast.message }}
        </div>

        <!-- Botón Cerrar -->
        <button
          @click="closeToast(toast.id)"
          class="flex-shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-0.5 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { toastState, removeToast } from '@/services/toast';

export default {
  name: 'ToastContainer',
  setup() {
    return {
      toastState,
    };
  },
  methods: {
    closeToast(id) {
      removeToast(id);
    },
    toastClasses(type) {
      switch (type) {
        case 'success':
          return 'bg-emerald-50/95 dark:bg-zinc-900/95 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200';
        case 'error':
          return 'bg-red-50/95 dark:bg-zinc-900/95 border-red-300 dark:border-red-900 text-red-950 dark:text-red-200';
        case 'warning':
          return 'bg-amber-50/95 dark:bg-zinc-900/95 border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-200';
        default:
          return 'bg-white/95 dark:bg-zinc-900/95 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200';
      }
    },
  },
};
</script>
