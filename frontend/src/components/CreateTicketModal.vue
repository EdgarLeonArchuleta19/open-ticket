<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
    <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-colors my-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/60 flex-shrink-0">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Nuevo Requerimiento</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">Registrar Ticket de Soporte</h3>
        </div>
        <button @click="close" class="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
        <div v-if="error" class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-400 font-medium">
          {{ error }}
        </div>

        <!-- Título -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Título o Asunto del Ticket <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Ej. Falla en conexión de red o error al generar reporte"
            class="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
          />
        </div>

        <!-- Departamento Destino & Categoría General -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
              Departamento Destino <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.target_department_id"
              required
              class="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            >
              <option value="" disabled>Selecciona un departamento</option>
              <option v-for="d in activeDepartments" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
              Categoría General <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.category_id"
              required
              @change="onCategoryChange"
              class="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            >
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Causa Específica (La prioridad se asigna automáticamente según la causa configurada) -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Causa Específica <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.cause_id"
            required
            @change="onCauseChange"
            :disabled="!form.category_id || availableCauses.length === 0"
            class="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white disabled:opacity-50"
          >
            <option value="" disabled>
              {{ form.category_id ? (availableCauses.length ? 'Selecciona una causa' : 'Sin causas asociadas') : 'Primero selecciona una categoría' }}
            </option>
            <option v-for="cs in availableCauses" :key="cs.id" :value="cs.id">
              {{ cs.name }}
            </option>
          </select>
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Descripción Detallada <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            required
            placeholder="Describe qué ocurrió, mensajes de error, pasos para reproducirlo y cualquier detalle útil..."
            class="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
          ></textarea>
        </div>

        <!-- Footer / Acciones -->
        <div class="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-5 py-2 text-xs font-bold rounded-lg text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="loading">Registrando...</span>
            <span v-else>Crear Ticket</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { showToast } from '@/services/toast';

export default {
  name: 'CreateTicketModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'ticket-created'],
  data() {
    return {
      loading: false,
      error: null,
      departments: [],
      categories: [],
      causes: [],
      form: {
        title: '',
        description: '',
        priority: 'media',
        target_department_id: '',
        category_id: '',
        cause_id: '',
      },
    };
  },
  computed: {
    activeDepartments() {
      return this.departments.filter((d) => d.is_active);
    },
    availableCauses() {
      if (!this.form.category_id) return [];
      return this.causes.filter(
        (c) => Number(c.category_id) === Number(this.form.category_id) && c.is_active
      );
    },
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.resetForm();
        this.loadCatalogs();
      }
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    resetForm() {
      this.error = null;
      this.form = {
        title: '',
        description: '',
        priority: 'media',
        target_department_id: '',
        category_id: '',
        cause_id: '',
      };
    },
    onCategoryChange() {
      this.form.cause_id = '';
      this.form.priority = 'media';
    },
    onCauseChange() {
      const selected = this.availableCauses.find((c) => Number(c.id) === Number(this.form.cause_id));
      if (selected && selected.default_priority) {
        this.form.priority = selected.default_priority;
      }
    },
    async loadCatalogs() {
      try {
        const [depRes, catRes, cauRes] = await Promise.all([
          api.get('/departments?only_active=true'),
          api.get('/categories?only_active=true'),
          api.get('/causes?only_active=true'),
        ]);
        this.departments = depRes.data || [];
        this.categories = catRes.data || [];
        this.causes = cauRes.data || [];
      } catch (err) {
        console.error('Error al cargar catálogos en modal:', err);
      }
    },
    async handleSubmit() {
      this.loading = true;
      this.error = null;
      try {
        const selectedCause = this.availableCauses.find((c) => Number(c.id) === Number(this.form.cause_id));
        const payload = {
          title: this.form.title,
          description: this.form.description,
          priority: selectedCause?.default_priority || this.form.priority || 'media',
          target_department_id: Number(this.form.target_department_id),
          category_id: Number(this.form.category_id),
          cause_id: Number(this.form.cause_id),
        };

        const res = await api.post('/tickets', payload);
        showToast(`Ticket ${res.data.ticket?.folio || ''} registrado exitosamente`, 'success');
        this.$emit('ticket-created', res.data.ticket);
        this.close();
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al registrar el ticket. Revisa los campos.';
        showToast(this.error, 'error');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
