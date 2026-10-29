<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Barra superior de navegación y estado -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
      <div class="flex items-center gap-3">
        <router-link
          to="/tickets"
          class="w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 transition-colors shadow-xs"
          title="Volver al listado"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </router-link>
        <div>
          <div class="flex items-center gap-2 mb-0.5">
            <span class="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {{ ticket.folio }}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="'priority-' + ticket.priority">
              {{ ticket.priority }}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize" :class="'badge-' + ticket.status">
              {{ formatStatus(ticket.status) }}
            </span>
          </div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">{{ ticket.title }}</h1>
        </div>
      </div>

      <!-- Acciones de Estado Rápidas -->
      <div class="flex items-center gap-2">
        <button
          v-if="canResolve"
          @click="showResolveModal = true"
          class="px-3.5 py-1.5 text-xs font-bold rounded-lg text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 transition-colors shadow-xs"
        >
          Resolver Ticket
        </button>

        <button
          v-if="canClose"
          @click="closeTicket"
          class="px-3.5 py-1.5 text-xs font-bold rounded-lg text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 transition-colors shadow-xs"
        >
          Confirmar y Cerrar
        </button>

        <button
          v-if="canReopen"
          @click="showReopenModal = true"
          class="px-3.5 py-1.5 text-xs font-bold rounded-lg text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900 border border-orange-300 dark:border-orange-800 transition-colors shadow-xs"
        >
          Reabrir Ticket
        </button>
      </div>
    </div>

    <!-- Contenido Principal: 2 Columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna Izquierda (2 cols): Descripción y Comentarios / Notas -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tarjeta de Descripción -->
        <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs">
          <h3 class="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Descripción del Requerimiento</h3>
          <p class="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{{ ticket.description }}</p>
        </div>

        <!-- Conversación y Notas de Seguimiento -->
        <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/60">
            <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Seguimiento & Comentarios</span>
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-normal">
                {{ comments.length }}
              </span>
            </h3>
          </div>

          <!-- Listado de Comentarios -->
          <div class="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            <div
              v-for="c in paginatedComments"
              :key="c.id"
              class="p-4 rounded-xl border text-xs space-y-1.5"
              :class="c.is_internal ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800'"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 dark:text-white">{{ c.user_name }}</span>
                  <span v-if="c.is_internal" class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    Nota Interna
                  </span>
                  <span v-else class="text-[10px] text-slate-400 dark:text-zinc-500 capitalize">({{ c.user_role }})</span>
                </div>
                <span class="text-[10px] text-slate-400 dark:text-zinc-500">{{ formatDateTime(c.created_at) }}</span>
              </div>
              <p class="text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm">{{ c.content }}</p>
            </div>

            <div v-if="comments.length === 0" class="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
              No hay comentarios registrados todavía en este ticket.
            </div>
          </div>

          <!-- Paginación de Comentarios -->
          <PaginationBar
            v-if="comments.length > 5"
            v-model:currentPage="commentPage"
            v-model:limit="commentLimit"
            :total="comments.length"
            itemName="comentarios"
            :limitOptions="[5, 10, 20]"
          />

          <!-- Formulario de Respuesta / Nota -->
          <div class="p-6 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-200 dark:border-zinc-800">
            <form @submit.prevent="submitComment">
              <!-- Selector Nota Interna (Solo para Agentes o Admin) -->
              <div v-if="canPostInternal" class="flex items-center gap-2 mb-2">
                <label class="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input type="checkbox" v-model="commentForm.is_internal" class="rounded text-emerald-700 focus:ring-0">
                  <span>Marcar como Nota Interna (oculta para el solicitante)</span>
                </label>
              </div>

              <textarea
                v-model="commentForm.content"
                rows="3"
                required
                :placeholder="commentForm.is_internal ? 'Escribe una nota interna para el equipo técnico...' : 'Escribe un comentario público o respuesta para el solicitante...'"
                class="w-full p-3 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
              ></textarea>

              <div class="flex items-center justify-between mt-2.5">
                <span class="text-[11px] text-slate-400 dark:text-zinc-500">
                  {{ commentForm.is_internal ? '🔒 Visible solo para Administradores y Agentes' : '🌐 Visible para el solicitante' }}
                </span>
                <button
                  type="submit"
                  :disabled="sendingComment || !commentForm.content.trim()"
                  class="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  <span v-if="sendingComment">Enviando...</span>
                  <span v-else>{{ commentForm.is_internal ? 'Guardar Nota Interna' : 'Enviar Respuesta' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Columna Derecha (1 col): Ficha Técnica & Línea de Tiempo de Auditoría -->
      <div class="space-y-6">
        <!-- Ficha de Información General -->
        <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <h3 class="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Ficha del Requerimiento</h3>

          <div class="space-y-3 text-xs">
            <div>
              <span class="text-slate-400 dark:text-zinc-500 block mb-0.5">Solicitante</span>
              <span class="font-bold text-slate-900 dark:text-white block">{{ ticket.requester_name }}</span>
              <span class="text-slate-500 dark:text-zinc-400">{{ ticket.requester_email }}</span>
            </div>

            <div>
              <span class="text-slate-400 dark:text-zinc-500 block mb-0.5">Departamento Solicitante</span>
              <span class="font-medium text-slate-800 dark:text-zinc-200">{{ ticket.requesting_department || 'General' }}</span>
            </div>

            <div>
              <span class="text-slate-400 dark:text-zinc-500 block mb-0.5">Departamento Responsable</span>
              <span class="font-medium text-slate-800 dark:text-zinc-200">{{ ticket.target_department }}</span>
            </div>

            <div>
              <span class="text-slate-400 dark:text-zinc-500 block mb-0.5">Clasificación</span>
              <span class="font-medium text-slate-800 dark:text-zinc-200">{{ ticket.category_name }} &rsaquo; {{ ticket.cause_name }}</span>
            </div>

            <!-- Asignación de Agente (Editable por Admin / Agente) -->
            <div class="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <span class="text-slate-400 dark:text-zinc-500 block mb-1">Especialista Asignado</span>
              <div v-if="canReassign">
                <select
                  v-model="ticket.assigned_to"
                  @change="handleReassign"
                  class="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 text-slate-800 dark:text-zinc-200 font-medium"
                >
                  <option :value="null">Sin asignar</option>
                  <option v-for="ag in agents" :key="ag.id" :value="ag.id">
                    {{ ag.full_name }} ({{ ag.department_code || 'Soporte' }})
                  </option>
                </select>
              </div>
              <div v-else class="font-medium text-slate-900 dark:text-white">
                {{ ticket.assigned_to_name || 'En espera de asignación' }}
              </div>
            </div>

            <!-- Cambio de Prioridad -->
            <div class="pt-2 border-t border-slate-100 dark:border-zinc-800" v-if="canChangePriority">
              <span class="text-slate-400 dark:text-zinc-500 block mb-1">Modificar Prioridad</span>
              <select
                v-model="ticket.priority"
                @change="handlePriorityChange"
                class="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 text-slate-800 dark:text-zinc-200 font-medium"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div class="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
              <div><strong>Creado:</strong> {{ formatDateTime(ticket.created_at) }}</div>
              <div v-if="ticket.resolution_date"><strong>Resuelto:</strong> {{ formatDateTime(ticket.resolution_date) }}</div>
            </div>
          </div>
        </div>

        <!-- Línea de Tiempo de Auditoría (Historial Completo) -->
        <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs">
          <h3 class="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Línea de Tiempo (Auditoría)</h3>

          <div class="space-y-4">
            <div v-for="h in paginatedHistory" :key="h.id" class="flex items-start gap-2.5 text-xs">
              <div class="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500 mt-1.5 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 dark:text-zinc-200">{{ h.user_name || 'Sistema' }}</span>
                  <span class="text-[10px] text-slate-400 dark:text-zinc-500">{{ formatDateTime(h.created_at) }}</span>
                </div>
                <p class="text-slate-600 dark:text-zinc-400 mt-0.5 leading-snug">{{ h.description }}</p>
              </div>
            </div>
          </div>

          <!-- Paginación de Historial -->
          <div v-if="history.length > 5" class="mt-4 -mx-6 -mb-6">
            <PaginationBar
              v-model:currentPage="historyPage"
              v-model:limit="historyLimit"
              :total="history.length"
              itemName="eventos"
              :limitOptions="[5, 10, 20]"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Resolver Ticket -->
    <div v-if="showResolveModal" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4 transition-colors">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Resolver Ticket {{ ticket.folio }}</h3>
        <p class="text-xs text-slate-500 dark:text-zinc-400">Registra el dictamen o la solución técnica que se le proporcionará al solicitante:</p>
        <textarea
          v-model="solutionText"
          rows="4"
          required
          placeholder="Explica qué acciones se realizaron para solventar el problema..."
          class="w-full p-3 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
        ></textarea>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showResolveModal = false" class="px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg">
            Cancelar
          </button>
          <button @click="submitResolve" class="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors">
            Confirmar Resolución
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Reabrir Ticket -->
    <div v-if="showReopenModal" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4 transition-colors">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Reabrir Ticket {{ ticket.folio }}</h3>
        <p class="text-xs text-slate-500 dark:text-zinc-400">Indica el motivo por el cual la solución previa no fue satisfactoria o el problema persiste:</p>
        <textarea
          v-model="reopenReason"
          rows="4"
          required
          placeholder="Explica qué falla persiste..."
          class="w-full p-3 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
        ></textarea>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showReopenModal = false" class="px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg">
            Cancelar
          </button>
          <button @click="submitReopen" class="px-4 py-1.5 text-xs font-bold text-white bg-orange-700 hover:bg-orange-800 rounded-lg transition-colors">
            Reabrir Ticket
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PaginationBar from '@/components/PaginationBar.vue';
import api from '@/services/api';
import { getUser } from '@/services/auth';
import { confirmAction } from '@/services/confirm';
import { showToast } from '@/services/toast';

export default {
  name: 'DetalleTicket',
  components: {
    PaginationBar,
  },
  data() {
    return {
      user: getUser(),
      ticket: {},
      comments: [],
      history: [],
      agents: [],
      commentPage: 1,
      commentLimit: 5,
      historyPage: 1,
      historyLimit: 5,
      sendingComment: false,
      commentForm: {
        content: '',
        is_internal: false,
      },
      showResolveModal: false,
      solutionText: '',
      showReopenModal: false,
      reopenReason: '',
    };
  },
  computed: {
    paginatedComments() {
      const list = this.comments || [];
      const start = (this.commentPage - 1) * this.commentLimit;
      return list.slice(start, start + this.commentLimit);
    },
    paginatedHistory() {
      const list = this.history || [];
      const start = (this.historyPage - 1) * this.historyLimit;
      return list.slice(start, start + this.historyLimit);
    },
    canResolve() {
      return ['admin', 'agent'].includes(this.user?.role) && ['nuevo', 'abierto', 'en_proceso', 'en_espera'].includes(this.ticket.status);
    },
    canClose() {
      return this.ticket.status === 'resuelto';
    },
    canReopen() {
      return ['resuelto', 'cerrado'].includes(this.ticket.status);
    },
    canPostInternal() {
      return ['admin', 'agent'].includes(this.user?.role);
    },
    canReassign() {
      return ['admin', 'agent'].includes(this.user?.role);
    },
    canChangePriority() {
      return ['admin', 'agent'].includes(this.user?.role);
    },
  },
  methods: {
    async loadTicket() {
      try {
        const { data } = await api.get(`/tickets/${this.$route.params.id}`);
        this.ticket = data.ticket;
        this.comments = data.comments || [];
        this.history = data.history || [];
      } catch (err) {
        console.error('Error al cargar detalle del ticket:', err);
      }
    },
    async loadAgents() {
      if (!['admin', 'agent'].includes(this.user?.role)) return;
      try {
        const { data } = await api.get('/users?role=agent');
        this.agents = data || [];
      } catch (err) {
        console.error('Error al cargar agentes:', err);
      }
    },
    async submitComment() {
      if (!this.commentForm.content.trim()) return;
      this.sendingComment = true;
      try {
        await api.post(`/tickets/${this.ticket.id}/comments`, {
          content: this.commentForm.content,
          is_internal: this.commentForm.is_internal,
        });
        this.commentForm.content = '';
        this.commentForm.is_internal = false;
        showToast('Comentario registrado con éxito', 'success');
        await this.loadTicket();
      } catch (err) {
        showToast(err.response?.data?.error || 'Error al enviar comentario', 'error');
      } finally {
        this.sendingComment = false;
      }
    },
    async handleReassign() {
      const agentObj = this.agents.find(a => Number(a.id) === Number(this.ticket.assigned_to));
      const targetName = agentObj?.full_name || 'otro especialista';
      const confirmed = await confirmAction({
        title: '¿Reasignar responsable del ticket?',
        message: `¿Estás seguro de que deseas reasignar este ticket a ${targetName}?`,
        confirmText: 'Reasignar',
        type: 'info',
      });

      if (!confirmed) {
        await this.loadTicket();
        return;
      }

      try {
        await api.put(`/tickets/${this.ticket.id}`, {
          assigned_to: this.ticket.assigned_to,
          expected_updated_at: this.ticket.updated_at,
        });
        showToast('Responsable reasignado correctamente', 'success');
        await this.loadTicket();
      } catch (err) {
        if (err.response?.status === 409) {
          showToast(err.response.data?.error || 'Conflicto de concurrencia detectado. Actualizando...', 'warning');
          await this.loadTicket();
          return;
        }
        showToast(err.response?.data?.error || 'Error al reasignar especialista', 'error');
      }
    },
    async handlePriorityChange() {
      try {
        await api.put(`/tickets/${this.ticket.id}`, {
          priority: this.ticket.priority,
          expected_updated_at: this.ticket.updated_at,
        });
        showToast('Prioridad actualizada', 'info');
        await this.loadTicket();
      } catch (err) {
        if (err.response?.status === 409) {
          showToast(err.response.data?.error || 'Conflicto de concurrencia detectado. Actualizando...', 'warning');
          await this.loadTicket();
          return;
        }
        showToast(err.response?.data?.error || 'Error al cambiar prioridad', 'error');
      }
    },
    async submitResolve() {
      if (!this.solutionText.trim()) return;
      try {
        await api.post(`/tickets/${this.ticket.id}/resolve`, {
          solution: this.solutionText,
        });
        this.showResolveModal = false;
        this.solutionText = '';
        showToast('Ticket resuelto exitosamente', 'success');
        await this.loadTicket();
      } catch (err) {
        if (err.response?.status === 409) {
          showToast(err.response.data?.error || 'El estado del ticket cambió previamente.', 'warning');
          this.showResolveModal = false;
          await this.loadTicket();
          return;
        }
        showToast(err.response?.data?.error || 'Error al resolver ticket', 'error');
      }
    },
    async closeTicket() {
      const confirmed = await confirmAction({
        title: '¿Confirmar cierre del ticket?',
        message: '¿Deseas dar por confirmada la solución y cerrar definitivamente este ticket? Esta acción concluye la atención.',
        confirmText: 'Cerrar Ticket Definitivamente',
        cancelText: 'Cancelar',
        type: 'warning',
      });
      if (!confirmed) return;

      try {
        await api.post(`/tickets/${this.ticket.id}/close`);
        showToast('Ticket cerrado con éxito', 'success');
        await this.loadTicket();
      } catch (err) {
        if (err.response?.status === 409) {
          showToast(err.response.data?.error || 'El ticket ya fue cerrado.', 'warning');
          await this.loadTicket();
          return;
        }
        showToast(err.response?.data?.error || 'Error al cerrar ticket', 'error');
      }
    },
    async submitReopen() {
      if (!this.reopenReason.trim()) return;
      try {
        await api.post(`/tickets/${this.ticket.id}/reopen`, {
          reason: this.reopenReason,
        });
        this.showReopenModal = false;
        this.reopenReason = '';
        showToast('Ticket reabierto correctamente', 'warning');
        await this.loadTicket();
      } catch (err) {
        if (err.response?.status === 409) {
          showToast(err.response.data?.error || 'El estado del ticket no permite reapertura.', 'warning');
          this.showReopenModal = false;
          await this.loadTicket();
          return;
        }
        showToast(err.response?.data?.error || 'Error al reabrir ticket', 'error');
      }
    },
    formatStatus(st) {
      if (!st) return '';
      return st.replace('_', ' ');
    },
    formatDateTime(date) {
      if (!date) return '-';
      return new Date(date).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  mounted() {
    this.loadTicket();
    this.loadAgents();
  },
};
</script>
