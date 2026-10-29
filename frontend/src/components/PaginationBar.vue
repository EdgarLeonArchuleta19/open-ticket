<template>
  <div class="px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-zinc-900/90 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 transition-colors">
    <!-- Información y Selector de Registros por Página -->
    <div class="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
      <div>
        Mostrando
        <span class="font-bold text-slate-800 dark:text-zinc-200">{{ from }}</span> a
        <span class="font-bold text-slate-800 dark:text-zinc-200">{{ to }}</span> de
        <span class="font-bold text-slate-800 dark:text-zinc-200">{{ total }}</span> {{ itemName }}
      </div>

      <div v-if="showLimitSelector && total > 5" class="flex items-center gap-1.5">
        <span class="text-slate-400 dark:text-zinc-500">Por página:</span>
        <select
          :value="limit"
          @change="onLimitChange"
          class="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
        >
          <option v-for="opt in limitOptions" :key="opt" :value="opt" class="bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100">
            {{ opt }}
          </option>
        </select>
      </div>
    </div>

    <!-- Controles de Navegación de Página -->
    <div v-if="totalPages > 1" class="flex items-center gap-1">
      <button
        type="button"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
        title="Página anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        <span class="hidden sm:inline">Anterior</span>
      </button>

      <div class="flex items-center gap-1">
        <button
          v-for="p in visiblePages"
          :key="p"
          type="button"
          @click="goToPage(p)"
          class="min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-lg text-xs transition-colors"
          :class="p === currentPage
            ? 'bg-emerald-700 dark:bg-emerald-600 text-white font-bold shadow-2xs'
            : 'bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 font-medium'"
        >
          {{ p }}
        </button>
      </div>

      <button
        type="button"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
        title="Página siguiente"
      >
        <span class="hidden sm:inline">Siguiente</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaginationBar',
  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
      default: 10,
    },
    itemName: {
      type: String,
      default: 'registros',
    },
    limitOptions: {
      type: Array,
      default: () => [5, 10, 25, 50],
    },
    showLimitSelector: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:currentPage', 'update:limit', 'change-page'],
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.total / this.limit));
    },
    from() {
      if (this.total === 0) return 0;
      return (this.currentPage - 1) * this.limit + 1;
    },
    to() {
      return Math.min(this.currentPage * this.limit, this.total);
    },
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const cur = this.currentPage;
      const start = Math.max(1, cur - 2);
      const end = Math.min(total, cur + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    goToPage(p) {
      if (p < 1 || p > this.totalPages || p === this.currentPage) return;
      this.$emit('update:currentPage', p);
      this.$emit('change-page', p);
    },
    onLimitChange(e) {
      const newLimit = Number(e.target.value);
      this.$emit('update:limit', newLimit);
      this.$emit('update:currentPage', 1);
      this.$emit('change-page', 1);
    },
  },
};
</script>
