<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="confirmState.isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-zinc-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        @click="cancel"
      ></div>

      <!-- Card Diálogo -->
      <div
        class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 z-10 transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-start gap-4">
          <!-- Icono según tipo -->
          <div
            class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
            :class="iconBgClasses"
          >
            <!-- Danger -->
            <svg
              v-if="confirmState.type === 'danger'"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-red-600 dark:text-red-400"
            >
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
            </svg>

            <!-- Warning -->
            <svg
              v-else-if="confirmState.type === 'warning'"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-amber-600 dark:text-amber-400"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
            </svg>

            <!-- Info / Success -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-emerald-600 dark:text-emerald-400"
            >
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-zinc-900 dark:text-white leading-6">
              {{ confirmState.title }}
            </h3>
            <p class="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {{ confirmState.message }}
            </p>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            @click="cancel"
            class="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700 text-center"
          >
            {{ confirmState.cancelText }}
          </button>
          <button
            type="button"
            @click="confirm"
            ref="confirmButton"
            class="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl text-white transition-all shadow-xs text-center"
            :class="confirmBtnClasses"
          >
            {{ confirmState.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue';
import { confirmState, handleConfirmResponse } from '@/services/confirm';

export default {
  name: 'ConfirmModal',
  setup() {
    const iconBgClasses = computed(() => {
      switch (confirmState.type) {
        case 'danger':
          return 'bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40';
        case 'warning':
          return 'bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40';
        default:
          return 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40';
      }
    });

    const confirmBtnClasses = computed(() => {
      switch (confirmState.type) {
        case 'danger':
          return 'bg-red-600 hover:bg-red-700 active:bg-red-800';
        case 'warning':
          return 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800';
        default:
          return 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800';
      }
    });

    const handleKeydown = (e) => {
      if (!confirmState.isOpen) return;
      if (e.key === 'Escape') {
        handleConfirmResponse(false);
      }
    };

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
    });

    return {
      confirmState,
      iconBgClasses,
      confirmBtnClasses,
      confirm: () => handleConfirmResponse(true),
      cancel: () => handleConfirmResponse(false),
    };
  },
};
</script>
