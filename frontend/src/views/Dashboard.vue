<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
    <!-- Header del Dashboard -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-250 dark:border-zinc-800">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {{ userRoleLabel }}
          </span>
        </div>
        <h1 class="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Panel de Control</h1>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          @click="loadStats"
          class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-250 dark:border-zinc-700 shadow-2xs flex items-center gap-2 transition-colors"
          title="Recargar datos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'animate-spin': loading }">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/>
          </svg>
          <span>Actualizar</span>
        </button>

        <button
          @click="openCreateTicket"
          class="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          <span>Nuevo Ticket</span>
        </button>
      </div>
    </div>

    <!-- 1. Indicadores Clave de Desempeño (KPIs esenciales) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Tickets -->
      <div
        @click="$router.push('/tickets')"
        class="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-250 dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer transition-all shadow-2xs group"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total</span>
          <div class="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 group-hover:text-emerald-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
          </div>
        </div>
        <div class="text-3xl font-extrabold text-zinc-900 dark:text-white mt-2 tracking-tight">{{ counts.total || 0 }}</div>
      </div>

      <!-- Abiertos y en Atención -->
      <div
        @click="$router.push('/tickets?status=en_proceso')"
        class="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-250 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-400 cursor-pointer transition-all shadow-2xs group"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">En Atención</span>
          <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <div class="text-3xl font-extrabold text-amber-800 dark:text-amber-300 mt-2 tracking-tight">{{ activeCount }}</div>
      </div>

      <!-- Casos Críticos -->
      <div
        @click="$router.push('/tickets?priority=critica')"
        class="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-250 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-400 cursor-pointer transition-all shadow-2xs group"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Críticos</span>
          <div class="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          </div>
        </div>
        <div class="text-3xl font-extrabold text-red-800 dark:text-red-300 mt-2 tracking-tight">{{ counts.criticos_activos || 0 }}</div>
      </div>

      <!-- Resueltos -->
      <div
        @click="$router.push('/tickets?status=resuelto')"
        class="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-250 dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer transition-all shadow-2xs group"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Resueltos</span>
          <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
        </div>
        <div class="text-3xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-2 tracking-tight">{{ resolvedCount }}</div>
      </div>
    </div>

    <!-- 2. Gráficas Visuales (Donut, Tendencia y Carga Departamental) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Gráfica Tipo 1: Donut SVG de Estado -->
      <div class="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-250 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
        <div class="pb-3 border-b border-zinc-150 dark:border-zinc-800">
          <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Tickets por Estado</h3>
        </div>

        <div class="py-4 flex flex-col sm:flex-row items-center justify-around gap-4">
          <!-- Gráfica SVG Anillo -->
          <div class="relative w-36 h-36 flex-shrink-0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                class="stroke-zinc-100 dark:stroke-zinc-800"
                stroke-width="12"
                fill="none"
              />
              <circle
                v-for="seg in donutSegments"
                :key="seg.key"
                cx="50"
                cy="50"
                r="38"
                fill="none"
                :stroke="seg.color"
                stroke-width="12"
                :stroke-dasharray="seg.dashArray"
                :stroke-dashoffset="seg.dashOffset"
                class="transition-all duration-500"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-xl font-extrabold text-zinc-900 dark:text-white leading-none">{{ activeCount }}</span>
              <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Activos</span>
            </div>
          </div>

          <!-- Leyenda -->
          <div class="flex-1 w-full space-y-1.5 text-xs">
            <div
              v-for="st in statusDistribution"
              :key="st.key"
              class="flex items-center justify-between py-0.5 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: st.color }"></span>
                <span class="text-zinc-700 dark:text-zinc-300 capitalize text-[11px] font-medium">{{ st.label }}</span>
              </div>
              <div class="text-[11px] font-bold text-zinc-900 dark:text-white">
                {{ st.count }} <span class="text-zinc-400 font-normal text-[10px]">({{ st.percent }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfica Tipo 2: Curva de Tendencia Semanal -->
      <div class="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-250 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
        <div class="pb-3 border-b border-zinc-150 dark:border-zinc-800">
          <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Tendencia Semanal</h3>
        </div>

        <div class="py-3 flex-1 flex flex-col justify-center">
          <div class="relative w-full h-36">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 300 110" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="300" y2="20" class="stroke-zinc-100 dark:stroke-zinc-800" stroke-width="1" stroke-dasharray="3,3" />
              <line x1="0" y1="55" x2="300" y2="55" class="stroke-zinc-100 dark:stroke-zinc-800" stroke-width="1" stroke-dasharray="3,3" />
              <line x1="0" y1="90" x2="300" y2="90" class="stroke-zinc-200 dark:stroke-zinc-800" stroke-width="1" />

              <polygon
                :points="areaPolygonPoints"
                class="fill-emerald-100/60 dark:fill-emerald-950/40"
              />

              <polyline
                :points="trendPolylinePoints"
                fill="none"
                class="stroke-emerald-600 dark:stroke-emerald-400"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <circle
                v-for="(pt, idx) in trendCoordinates"
                :key="'pt-' + idx"
                :cx="pt.x"
                :cy="pt.y"
                r="3.5"
                class="fill-white dark:fill-zinc-900 stroke-emerald-600 dark:stroke-emerald-400"
                stroke-width="2"
              />
            </svg>
          </div>

          <div class="flex items-center justify-between px-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-2">
            <span v-for="(item, idx) in (stats.trend || [])" :key="'label-' + idx">
              {{ item.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Gráfica Tipo 3: Barras Departamentales -->
      <div class="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-250 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
        <div class="pb-3 border-b border-zinc-150 dark:border-zinc-800">
          <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Carga por Departamento</h3>
        </div>

        <div class="py-3 flex-1 flex flex-col justify-end">
          <div class="relative w-full h-36">
            <svg class="w-full h-full" viewBox="0 0 300 110">
              <line x1="0" y1="92" x2="300" y2="92" class="stroke-zinc-200 dark:stroke-zinc-800" stroke-width="1" />

              <g v-for="(bar, i) in departmentBars" :key="'bar-' + i">
                <rect
                  :x="bar.x"
                  :y="bar.y"
                  :width="bar.width"
                  :height="bar.height"
                  rx="4"
                  class="fill-emerald-700 dark:fill-emerald-600 hover:fill-emerald-600 dark:hover:fill-emerald-500 transition-colors"
                />
                <text
                  :x="bar.x + bar.width / 2"
                  :y="bar.y - 4"
                  text-anchor="middle"
                  class="text-[9px] font-bold fill-zinc-700 dark:fill-zinc-300 font-mono"
                >
                  {{ bar.count }}
                </text>
                <text
                  :x="bar.x + bar.width / 2"
                  y="104"
                  text-anchor="middle"
                  class="text-[9px] font-bold fill-zinc-400 dark:fill-zinc-500 font-mono"
                >
                  {{ bar.code }}
                </text>
              </g>

              <text
                v-if="departmentBars.length === 0"
                x="150"
                y="55"
                text-anchor="middle"
                class="text-xs fill-zinc-400"
              >
                Sin tickets
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Listados Clave: Tickets Recientes y Actividad -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Tickets Recientes (2 columnas) -->
      <div class="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-250 dark:border-zinc-800 shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          <div class="px-6 py-4 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
            <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Tickets Recientes</h3>
            <router-link
              to="/tickets"
              class="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </router-link>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs min-w-[620px]">
              <thead class="bg-zinc-50/80 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-800 text-[10px]">
                <tr>
                  <th class="py-3 px-4">Folio</th>
                  <th class="py-3 px-4">Título</th>
                  <th class="py-3 px-4">Solicitante</th>
                  <th class="py-3 px-4">Prioridad</th>
                  <th class="py-3 px-4">Estado</th>
                  <th class="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr
                  v-for="t in paginatedRecentTickets"
                  :key="t.id"
                  class="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td class="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    {{ t.folio }}
                  </td>
                  <td class="py-3 px-4 font-semibold text-zinc-900 dark:text-white max-w-xs truncate">
                    <router-link :to="'/tickets/' + t.id" class="hover:underline">
                      {{ t.title }}
                    </router-link>
                  </td>
                  <td class="py-3 px-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                    {{ t.requester_name }}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="'priority-' + t.priority">
                      {{ t.priority }}
                    </span>
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize" :class="'badge-' + t.status">
                      {{ formatStatus(t.status) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <router-link
                      :to="'/tickets/' + t.id"
                      class="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-250 dark:border-zinc-700 rounded-lg font-bold text-zinc-700 dark:text-zinc-200 text-[11px] shadow-2xs transition-colors"
                    >
                      Detalle
                    </router-link>
                  </td>
                </tr>
                <tr v-if="!stats.recent_tickets || stats.recent_tickets.length === 0">
                  <td colspan="6" class="py-8 text-center text-zinc-400 dark:text-zinc-500">
                    No hay tickets registrados
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paginación de Tickets Recientes -->
        <PaginationBar
          v-model:currentPage="recentTicketsPage"
          v-model:limit="recentTicketsLimit"
          :total="(stats.recent_tickets || []).length"
          itemName="tickets"
          :limitOptions="[5, 10]"
        />
      </div>

      <!-- Actividad Reciente (1 columna compacta) -->
      <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-250 dark:border-zinc-800 shadow-2xs p-5 flex flex-col justify-between">
        <div>
          <div class="pb-3 border-b border-zinc-150 dark:border-zinc-800 mb-4">
            <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Actividad Reciente</h3>
          </div>

          <div class="space-y-3.5">
            <div
              v-for="act in paginatedActivity"
              :key="act.id"
              class="flex items-start gap-2.5 text-xs"
            >
              <div class="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500 mt-1.5 flex-shrink-0"></div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <span class="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">{{ act.ticket_folio }}</span>
                  <span class="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{{ formatDate(act.created_at) }}</span>
                </div>
                <p class="text-zinc-700 dark:text-zinc-300 text-[11px] leading-snug mt-0.5 line-clamp-2">{{ act.description }}</p>
                <span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Por: {{ act.user_name || 'Sistema' }}</span>
              </div>
            </div>

            <div v-if="!stats.recent_activity || stats.recent_activity.length === 0" class="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
              Sin actividad reciente
            </div>
          </div>
        </div>

        <!-- Paginación de Actividad Reciente -->
        <div class="mt-4 -mx-5 -mb-5">
          <PaginationBar
            v-model:currentPage="activityPage"
            v-model:limit="activityLimit"
            :total="(stats.recent_activity || []).length"
            itemName="eventos"
            :limitOptions="[5, 10]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PaginationBar from '@/components/PaginationBar.vue';
import api from '@/services/api';
import { getUser } from '@/services/auth';
import { openCreateTicketModal } from '@/services/modal';

export default {
  name: 'Dashboard',
  components: {
    PaginationBar,
  },
  data() {
    return {
      user: getUser(),
      loading: false,
      recentTicketsPage: 1,
      recentTicketsLimit: 5,
      activityPage: 1,
      activityLimit: 5,
      stats: {
        counts: {},
        by_status: [],
        by_department: [],
        by_priority: [],
        recent_tickets: [],
        recent_activity: [],
        trend: [],
      },
    };
  },
  computed: {
    counts() {
      return this.stats.counts || {};
    },
    activeCount() {
      const c = this.counts;
      return (c.nuevos || 0) + (c.abiertos || 0) + (c.en_proceso || 0) + (c.en_espera || 0);
    },
    resolvedCount() {
      const c = this.counts;
      return (c.resueltos || 0) + (c.cerrados || 0);
    },
    resolutionRate() {
      const total = this.counts.total || 0;
      if (total === 0) return 100;
      return Math.round((this.resolvedCount / total) * 100);
    },
    paginatedRecentTickets() {
      const list = this.stats.recent_tickets || [];
      const start = (this.recentTicketsPage - 1) * this.recentTicketsLimit;
      return list.slice(start, start + this.recentTicketsLimit);
    },
    paginatedActivity() {
      const list = this.stats.recent_activity || [];
      const start = (this.activityPage - 1) * this.activityLimit;
      return list.slice(start, start + this.activityLimit);
    },
    userRoleLabel() {
      switch (this.user?.role) {
        case 'admin': return 'Panel de Administración Global';
        case 'agent': return `Mesa de Soporte: ${this.user?.department_name || 'Especialista'}`;
        default: return 'Portal del Solicitante';
      }
    },
    statusDistribution() {
      const total = this.counts.total || 1;
      const statuses = [
        { key: 'nuevo', label: 'Nuevo', color: '#94a3b8' },
        { key: 'abierto', label: 'Abierto', color: '#047857' },
        { key: 'en_proceso', label: 'En Proceso', color: '#f59e0b' },
        { key: 'en_espera', label: 'En Espera', color: '#8b5cf6' },
        { key: 'resuelto', label: 'Resuelto', color: '#10b981' },
        { key: 'cerrado', label: 'Cerrado', color: '#cbd5e1' },
      ];

      return statuses.map((s) => {
        const found = (this.stats.by_status || []).find((item) => item.status === s.key);
        const count = found ? Number(found.count) : 0;
        const percent = Math.round((count / total) * 100);
        return { ...s, count, percent };
      });
    },
    donutSegments() {
      const circumference = 2 * Math.PI * 38; // ~238.76
      const total = this.counts.total || 0;
      if (total === 0) return [];

      let accumulated = 0;
      return this.statusDistribution
        .filter((st) => st.count > 0)
        .map((st) => {
          const ratio = st.count / total;
          const strokeLength = ratio * circumference;
          const strokeOffset = -accumulated;
          accumulated += strokeLength;
          return {
            key: st.key,
            color: st.color,
            dashArray: `${strokeLength} ${circumference - strokeLength}`,
            dashOffset: strokeOffset,
          };
        });
    },
    weeklyTotalTickets() {
      const list = this.stats.trend || [];
      return list.reduce((acc, curr) => acc + Number(curr.count || 0), 0);
    },
    maxWeeklyDayCount() {
      const list = this.stats.trend || [];
      const max = Math.max(1, ...list.map((i) => Number(i.count || 0)));
      return max;
    },
    trendCoordinates() {
      const list = this.stats.trend || [];
      if (list.length === 0) return [];

      const width = 300;
      const height = 90;
      const topPadding = 15;
      const max = Math.max(2, this.maxWeeklyDayCount);
      const stepX = width / Math.max(1, list.length - 1);

      return list.map((item, idx) => {
        const x = idx * stepX;
        const val = Number(item.count || 0);
        const y = height - (val / max) * (height - topPadding);
        return { x: Math.round(x), y: Math.round(y), count: val };
      });
    },
    trendPolylinePoints() {
      return this.trendCoordinates.map((pt) => `${pt.x},${pt.y}`).join(' ');
    },
    areaPolygonPoints() {
      const pts = this.trendCoordinates;
      if (pts.length === 0) return '';
      const firstX = pts[0].x;
      const lastX = pts[pts.length - 1].x;
      const linePts = pts.map((pt) => `${pt.x},${pt.y}`).join(' ');
      return `${firstX},92 ${linePts} ${lastX},92`;
    },
    departmentBars() {
      const list = (this.stats.by_department || []).slice(0, 5);
      if (list.length === 0) return [];

      const maxCount = Math.max(1, ...list.map((d) => Number(d.count || 0)));
      const chartWidth = 300;
      const maxBarHeight = 70;
      const barWidth = 32;
      const slotWidth = chartWidth / list.length;

      return list.map((dept, i) => {
        const count = Number(dept.count || 0);
        const height = Math.max(6, Math.round((count / maxCount) * maxBarHeight));
        const x = Math.round(i * slotWidth + (slotWidth - barWidth) / 2);
        const y = 92 - height;
        return {
          name: dept.department_name,
          code: dept.department_code || 'DEP',
          count,
          x,
          y,
          width: barWidth,
          height,
        };
      });
    },
  },
  methods: {
    openCreateTicket() {
      openCreateTicketModal();
    },
    async loadStats() {
      this.loading = true;
      try {
        const { data } = await api.get('/dashboard/stats');
        this.stats = data;
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
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
      return new Date(date).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  mounted() {
    this.loadStats();
  },
};
</script>
