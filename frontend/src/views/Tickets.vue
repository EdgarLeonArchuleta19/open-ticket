<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header de la sección -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestión de Tickets</h1>
      </div>
      <div>
        <button
          @click="openCreateTicket"
          class="px-4 py-2 text-xs font-bold rounded-lg text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Nuevo Ticket</span>
        </button>
      </div>
    </div>

    <!-- Píldoras de Filtro Rápido de Estado -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        v-for="st in quickStatusTabs"
        :key="st.key"
        @click="selectQuickStatus(st.key)"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
        :class="filters.status === st.key ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'"
      >
        {{ st.label }}
      </button>
    </div>

    <!-- Barra de Filtros y Búsqueda -->
    <div class="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Búsqueda por Folio o Texto -->
        <div class="lg:col-span-2 relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Buscar por folio (TKT-...), título o solicitante..."
            class="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
          />
          <button
            v-if="filters.search"
            @click="filters.search = ''; loadTickets()"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Departamento -->
        <div>
          <select
            v-model="filters.department_id"
            @change="loadTickets"
            class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-700 dark:text-zinc-200"
          >
            <option value="">Todos los departamentos</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>

        <!-- Prioridad -->
        <div>
          <select
            v-model="filters.priority"
            @change="loadTickets"
            class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-700 dark:text-zinc-200"
          >
            <option value="">Todas las prioridades</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <!-- Reset -->
        <div class="flex items-center gap-2">
          <button
            @click="resetFilters"
            class="w-full py-2 px-3 text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            <span>Restablecer</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Tickets -->
    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[880px]">
          <thead class="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th class="py-3.5 px-4 w-28">Folio</th>
              <th class="py-3.5 px-4">Título</th>
              <th class="py-3.5 px-4">Solicitante</th>
              <th class="py-3.5 px-4">Departamento</th>
              <th class="py-3.5 px-4">Categoría / Causa</th>
              <th class="py-3.5 px-4">Prioridad</th>
              <th class="py-3.5 px-4">Estado</th>
              <th class="py-3.5 px-4">Responsable</th>
              <th class="py-3.5 px-4">Fecha</th>
              <th class="py-3.5 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr
              v-for="t in tickets"
              :key="t.id"
              class="hover:bg-slate-50/80 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <!-- Folio -->
              <td class="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                <router-link :to="'/tickets/' + t.id" class="hover:underline">
                  {{ t.folio }}
                </router-link>
              </td>

              <!-- Título -->
              <td class="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs">
                <router-link :to="'/tickets/' + t.id" class="hover:text-emerald-700 dark:hover:text-emerald-400 block truncate">
                  {{ t.title }}
                </router-link>
              </td>

              <!-- Solicitante -->
              <td class="py-3.5 px-4 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                <div class="font-medium">{{ t.requester_name }}</div>
                <div class="text-[10px] text-slate-400 dark:text-zinc-500">{{ t.requesting_department || 'General' }}</div>
              </td>

              <!-- Departamento Destino -->
              <td class="py-3.5 px-4 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-medium text-[11px]">
                  {{ t.target_department }}
                </span>
              </td>

              <!-- Categoría / Causa -->
              <td class="py-3.5 px-4 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                <div class="font-medium text-slate-800 dark:text-zinc-200">{{ t.category_name }}</div>
                <div class="text-[10px] text-slate-400 dark:text-zinc-500">{{ t.cause_name }}</div>
              </td>

              <!-- Prioridad -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="'priority-' + t.priority">
                  {{ t.priority }}
                </span>
              </td>

              <!-- Estado -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize" :class="'badge-' + t.status">
                  {{ formatStatus(t.status) }}
                </span>
              </td>

              <!-- Responsable -->
              <td class="py-3.5 px-4 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                <span v-if="t.assigned_to_name" class="font-medium text-slate-800 dark:text-zinc-200">
                  {{ t.assigned_to_name }}
                </span>
                <span v-else class="text-[11px] text-slate-400 dark:text-zinc-500 italic">
                  Sin asignar
                </span>
              </td>

              <!-- Fecha -->
              <td class="py-3.5 px-4 text-slate-500 dark:text-zinc-400 whitespace-nowrap text-[11px]">
                {{ formatDate(t.created_at) }}
              </td>

              <!-- Acción -->
              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <router-link
                  :to="'/tickets/' + t.id"
                  class="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded font-semibold text-slate-700 dark:text-zinc-200 text-[11px] inline-flex items-center gap-1 shadow-xs"
                >
                  <span>Ver</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </router-link>
              </td>
            </tr>

            <!-- Estado Vacío -->
            <tr v-if="!loading && tickets.length === 0">
              <td colspan="10" class="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-slate-300 dark:text-zinc-600 mb-2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
                <p class="text-sm font-bold text-slate-700 dark:text-zinc-300">No se encontraron tickets</p>
                <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Prueba ajustando los filtros de búsqueda</p>
                <button
                  @click="resetFilters"
                  class="mt-3 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors"
                >
                  Limpiar filtros
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación de Tickets -->
      <PaginationBar
        v-model:currentPage="page"
        v-model:limit="limit"
        :total="total"
        itemName="tickets"
        :limitOptions="[10, 25, 50]"
        @change-page="loadTickets"
      />
    </div>
  </div>
</template>

<script>
import PaginationBar from '@/components/PaginationBar.vue';
import api from '@/services/api';
import { openCreateTicketModal } from '@/services/modal';

export default {
  name: 'Tickets',
  components: {
    PaginationBar,
  },
  data() {
    return {
      loading: false,
      tickets: [],
      departments: [],
      total: 0,
      page: 1,
      totalPages: 1,
      limit: 10,
      searchTimer: null,
      filters: {
        search: '',
        status: this.$route.query.status || '',
        priority: this.$route.query.priority || '',
        department_id: '',
      },
      quickStatusTabs: [
        { key: '', label: 'Todos' },
        { key: 'nuevo', label: 'Nuevos' },
        { key: 'abierto', label: 'Abiertos' },
        { key: 'en_proceso', label: 'En Proceso' },
        { key: 'en_espera', label: 'En Espera' },
        { key: 'resuelto', label: 'Resueltos' },
        { key: 'cerrado', label: 'Cerrados' },
      ],
    };
  },
  computed: {
    paginationFrom() {
      if (this.total === 0) return 0;
      return (this.page - 1) * this.limit + 1;
    },
    paginationTo() {
      return Math.min(this.page * this.limit, this.total);
    },
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.page;
      const start = Math.max(1, current - 2);
      const end = Math.min(total, current + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  watch: {
    '$route.query'(newQuery) {
      if (newQuery.status !== undefined) {
        this.filters.status = newQuery.status || '';
      }
      if (newQuery.priority !== undefined) {
        this.filters.priority = newQuery.priority || '';
      }
      this.page = 1;
      this.loadTickets();
    },
  },
  methods: {
    openCreateTicket() {
      openCreateTicketModal();
    },
    debouncedSearch() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.page = 1;
        this.loadTickets();
      }, 300);
    },
    selectQuickStatus(st) {
      this.filters.status = st;
      this.page = 1;
      this.loadTickets();
    },
    resetFilters() {
      this.filters = { search: '', status: '', priority: '', department_id: '' };
      this.page = 1;
      this.loadTickets();
    },
    changePage(p) {
      if (p >= 1 && p <= this.totalPages) {
        this.page = p;
        this.loadTickets();
      }
    },
    changeLimit() {
      this.page = 1;
      this.loadTickets();
    },
    async loadDepartments() {
      try {
        const { data } = await api.get('/departments?only_active=true');
        this.departments = data || [];
      } catch (err) {
        console.error(err);
      }
    },
    async loadTickets() {
      this.loading = true;
      try {
        const params = {
          page: this.page,
          limit: this.limit,
          search: this.filters.search,
          status: this.filters.status,
          priority: this.filters.priority,
          department_id: this.filters.department_id,
        };
        const { data } = await api.get('/tickets', { params });
        this.tickets = data.tickets || [];
        this.total = data.total || 0;
        this.totalPages = data.totalPages || 1;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    formatStatus(st) {
      if (!st) return '';
      return st.replace('_', ' ');
    },
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
  },
  mounted() {
    this.loadDepartments();
    this.loadTickets();
  },
};
</script>
