<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Catálogo de Departamentos</h1>
      </div>
      <div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 text-xs font-bold rounded-lg text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>Nuevo Departamento</span>
        </button>
      </div>
    </div>

    <!-- Barra de Búsqueda -->
    <div class="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div class="relative flex-1 max-w-md w-full">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre o clave..."
          class="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
        />
      </div>
      <span class="text-xs text-slate-500 dark:text-zinc-400 font-medium">{{ filteredDepartments.length }} departamentos registrados</span>
    </div>

    <!-- Tabla de Departamentos -->
    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[720px]">
          <thead class="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th class="py-3.5 px-4">Clave</th>
              <th class="py-3.5 px-4">Nombre del Departamento</th>
              <th class="py-3.5 px-4">Descripción</th>
              <th class="py-3.5 px-4">Responsable</th>
              <th class="py-3.5 px-4">Tickets Activos</th>
              <th class="py-3.5 px-4">Estado</th>
              <th class="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr v-for="d in paginatedDepartments" :key="d.id" class="hover:bg-slate-50/80 dark:hover:bg-zinc-800/60 transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                {{ d.code }}
              </td>
              <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                {{ d.name }}
              </td>
              <td class="py-3.5 px-4 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                {{ d.description || 'Sin descripción' }}
              </td>
              <td class="py-3.5 px-4 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                {{ d.manager_name || 'Sin asignar' }}
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="d.active_tickets_count > 0 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'">
                  {{ d.active_tickets_count || 0 }} activos
                </span>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <button
                  @click="toggleActive(d)"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                  :class="d.is_active ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'"
                >
                  {{ d.is_active ? 'Activo' : 'Inactivo' }}
                </button>
              </td>
              <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                <button
                  @click="openEditModal(d)"
                  class="px-2.5 py-1 text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded text-[11px] font-semibold"
                >
                  Editar
                </button>
                <button
                  @click="deleteDepartment(d)"
                  class="px-2.5 py-1 text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-300 dark:border-zinc-700 rounded text-[11px] font-semibold"
                >
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="filteredDepartments.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-400 dark:text-zinc-500">
                No se encontraron departamentos con el criterio especificado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Barra de Paginación Departamentos -->
      <PaginationBar
        v-model:currentPage="page"
        v-model:limit="limit"
        :total="filteredDepartments.length"
        itemName="departamentos"
        :limitOptions="[5, 10, 20]"
      />
    </div>

    <!-- Modal Crear / Editar Departamento -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/60">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            {{ isEditing ? 'Editar Departamento' : 'Nuevo Departamento' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="saveDepartment" class="p-6 space-y-4 text-xs">
          <div v-if="modalError" class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 font-medium">
            {{ modalError }}
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Clave Corta *</label>
            <input
              v-model="form.code"
              :disabled="isEditing"
              type="text"
              required
              placeholder="Ej. TI-SIST, RRHH, FIN"
              class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 text-slate-900 dark:text-white uppercase font-mono"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Nombre del Departamento *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Ej. Soporte Técnico e Infraestructura"
              class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Descripción</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Funciones o ámbito del área..."
              class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Responsable del Departamento</label>
            <select
              v-model="form.manager_id"
              class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            >
              <option :value="null">Sin asignar</option>
              <option v-for="u in users" :key="u.id" :value="u.id">
                {{ u.full_name }} ({{ u.role }})
              </option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" v-model="form.is_active" id="deptActive" class="rounded text-emerald-700 focus:ring-0">
            <label for="deptActive" class="font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">Departamento Activo (admite asignación de tickets)</label>
          </div>

          <div class="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg font-bold shadow-xs transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import PaginationBar from '@/components/PaginationBar.vue';
import api from '@/services/api';
import { confirmAction } from '@/services/confirm';
import { showToast } from '@/services/toast';

export default {
  name: 'Departamentos',
  components: {
    PaginationBar,
  },
  data() {
    return {
      departments: [],
      users: [],
      search: '',
      page: 1,
      limit: 5,
      showModal: false,
      isEditing: false,
      modalError: null,
      form: {
        id: null,
        code: '',
        name: '',
        description: '',
        manager_id: null,
        is_active: true,
      },
    };
  },
  watch: {
    search() {
      this.page = 1;
    },
  },
  computed: {
    filteredDepartments() {
      if (!this.search.trim()) return this.departments;
      const s = this.search.toLowerCase();
      return this.departments.filter(
        (d) => d.name.toLowerCase().includes(s) || d.code.toLowerCase().includes(s)
      );
    },
    paginatedDepartments() {
      const start = (this.page - 1) * this.limit;
      return this.filteredDepartments.slice(start, start + this.limit);
    },
  },
  methods: {
    async loadDepartments() {
      try {
        const { data } = await api.get('/departments');
        this.departments = data || [];
      } catch (err) {
        console.error(err);
      }
    },
    async loadUsers() {
      try {
        const { data } = await api.get('/users');
        this.users = data || [];
      } catch (err) {
        console.error(err);
      }
    },
    openCreateModal() {
      this.isEditing = false;
      this.modalError = null;
      this.form = {
        id: null,
        code: '',
        name: '',
        description: '',
        manager_id: null,
        is_active: true,
      };
      this.showModal = true;
    },
    openEditModal(dept) {
      this.isEditing = true;
      this.modalError = null;
      this.form = {
        id: dept.id,
        code: dept.code,
        name: dept.name,
        description: dept.description,
        manager_id: dept.manager_id,
        is_active: dept.is_active,
      };
      this.showModal = true;
    },
    async saveDepartment() {
      this.modalError = null;
      try {
        if (this.isEditing) {
          await api.put(`/departments/${this.form.id}`, this.form);
          showToast(`Departamento "${this.form.name}" actualizado`, 'success');
        } else {
          await api.post('/departments', this.form);
          showToast(`Departamento "${this.form.name}" registrado con éxito`, 'success');
        }
        this.showModal = false;
        await this.loadDepartments();
      } catch (err) {
        this.modalError = err.response?.data?.error || 'Error al guardar departamento';
        showToast(this.modalError, 'error');
      }
    },
    async toggleActive(dept) {
      try {
        await api.put(`/departments/${dept.id}`, { is_active: !dept.is_active });
        showToast(`Departamento "${dept.name}" ${!dept.is_active ? 'activado' : 'desactivado'}`, 'info');
        await this.loadDepartments();
      } catch (err) {
        showToast(err.response?.data?.error || 'Error al cambiar estado', 'error');
      }
    },
    async deleteDepartment(dept) {
      const confirmed = await confirmAction({
        title: '¿Eliminar departamento?',
        message: `¿Estás seguro de que deseas eliminar permanentemente el departamento "${dept.name}"? Esta acción solo es posible si no cuenta con tickets registrados.`,
        confirmText: 'Eliminar Departamento',
        type: 'danger',
      });
      if (!confirmed) return;

      try {
        await api.delete(`/departments/${dept.id}`);
        showToast(`Departamento "${dept.name}" eliminado correctamente`, 'success');
        await this.loadDepartments();
      } catch (err) {
        showToast(err.response?.data?.error || 'No se puede eliminar el departamento', 'error');
      }
    },
  },
  mounted() {
    this.loadDepartments();
    this.loadUsers();
  },
};
</script>
