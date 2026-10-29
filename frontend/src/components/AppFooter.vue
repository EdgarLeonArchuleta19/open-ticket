<template>
  <footer class="mt-auto bg-zinc-100/95 dark:bg-zinc-900/95 border-t border-zinc-250 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs transition-colors shadow-2xs">
    <!-- Altura generosa y espaciosa (gordito) con padding vertical amplio -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
        <!-- Izquierda: Identidad y Derechos Reservados -->
        <div class="flex items-center gap-3.5 text-center sm:text-left">
          <div class="w-9 h-9 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
              <path d="M13 5v2"/>
              <path d="M13 17v2"/>
              <path d="M13 11v2"/>
            </svg>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
            <span class="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none">
              Open<span class="text-emerald-700 dark:text-emerald-400">Ticket</span>
            </span>
            <span class="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <span class="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1 sm:mt-0">
              © {{ currentYear }} OpenTicket. Todos los derechos reservados.
            </span>
          </div>
        </div>

        <!-- Derecha: Estado Operativo y Versión -->
        <div class="flex items-center gap-4 text-xs flex-wrap justify-center">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Sistema Operativo</span>
          </div>

          <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-400 shadow-2xs">
            v1.2.0
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
  },
};
</script>
