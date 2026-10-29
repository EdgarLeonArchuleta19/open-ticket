<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Categorías & Causas</h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="openCategoryModal()"
          class="px-3.5 py-2 text-xs font-bold rounded-lg text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 transition-colors shadow-xs"
        >
          + Nueva Categoría
        </button>
        <button
          @click="openCauseModal()"
          class="px-4 py-2 text-xs font-bold rounded-lg text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-xs"
        >
          + Nueva Causa
        </button>
      </div>
    </div>

    <!-- Pestañas de Navegación del Módulo -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800">
      <button
        @click="activeTab = 'causas'"
        class="pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
        :class="activeTab === 'causas' ? 'border-emerald-700 dark:border-emerald-500 text-emerald-800 dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'"
      >
        <span>Causas Específicas</span>
        <span class="px-2 py-0.5 rounded text-xs" :class="activeTab === 'causas' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'">
          {{ causes.length }}
        </span>
      </button>

      <button
        @click="activeTab = 'categorias'"
        class="pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
        :class="activeTab === 'categorias' ? 'border-emerald-700 dark:border-emerald-500 text-emerald-800 dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'"
      >
        <span>Categorías Generales</span>
        <span class="px-2 py-0.5 rounded text-xs" :class="activeTab === 'categorias' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'">
          {{ categories.length }}
        </span>
      </button>
    </div>

    <!-- Tab 1: Causas Específicas -->
    <div v-show="activeTab === 'causas'" class="space-y-4">
      <!-- Filtro por Categoría -->
      <div class="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <label class="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase">Filtrar por Categoría:</label>
          <select
            v-model="selectedCategoryFilter"
            class="px-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-200 font-medium focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">Todas las categorías</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <span class="text-xs text-slate-500 dark:text-zinc-400 font-medium">{{ filteredCauses.length }} causas encontradas</span>
      </div>

      <!-- Tabla de Causas -->
      <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[750px]">
          <thead class="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th class="py-3.5 px-4 w-28">Clave</th>
              <th class="py-3.5 px-4">Causa / Motivo</th>
              <th class="py-3.5 px-4">Categoría Asociada</th>
              <th class="py-3.5 px-4">Prioridad Definida</th>
              <th class="py-3.5 px-4">Descripción</th>
              <th class="py-3.5 px-4">Tickets Registrados</th>
              <th class="py-3.5 px-4">Estado</th>
              <th class="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr v-for="cs in paginatedCauses" :key="cs.id" class="hover:bg-slate-50/80 dark:hover:bg-zinc-800/60 transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{{ cs.code }}</td>
              <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{{ cs.name }}</td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                  {{ cs.category_name }}
                </span>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="'priority-' + (cs.default_priority || 'media')">
                  {{ cs.default_priority || 'media' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-500 dark:text-zinc-400 max-w-xs truncate">{{ cs.description || 'Sin descripción' }}</td>
              <td class="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-300 whitespace-nowrap">{{ cs.tickets_count || 0 }}</td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <button
                  @click="toggleCauseActive(cs)"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                  :class="cs.is_active ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-300 dark:border-zinc-700'"
                >
                  {{ cs.is_active ? 'Activa' : 'Inactiva' }}
                </button>
              </td>
              <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                <button
                  @click="openEditCauseModal(cs)"
                  class="px-2.5 py-1 text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded font-semibold text-[11px]"
                >
                  Editar
                </button>
                <button
                  @click="deleteCause(cs)"
                  class="px-2.5 py-1 text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-300 dark:border-zinc-700 rounded font-semibold text-[11px]"
                >
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="filteredCauses.length === 0">
              <td colspan="8" class="py-8 text-center text-slate-400 dark:text-zinc-500">
                No se encontraron causas para la categoría seleccionada.
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Paginación Causas -->
        <PaginationBar
          v-model:currentPage="causePage"
          v-model:limit="causeLimit"
          :total="filteredCauses.length"
          itemName="causas específicas"
          :limitOptions="[5, 10, 20]"
        />
      </div>
    </div>

    <!-- Tab 2: Categorías Generales -->
    <div v-show="activeTab === 'categorias'" class="space-y-4">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[700px]">
          <thead class="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th class="py-3.5 px-4 w-32">Clave</th>
              <th class="py-3.5 px-4">Nombre de Categoría</th>
              <th class="py-3.5 px-4">Descripción</th>
              <th class="py-3.5 px-4">Causas Vinculadas</th>
              <th class="py-3.5 px-4">Tickets Asociados</th>
              <th class="py-3.5 px-4">Estado</th>
              <th class="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr v-for="cat in paginatedCategories" :key="cat.id" class="hover:bg-slate-50/80 dark:hover:bg-zinc-800/60 transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{{ cat.code }}</td>
              <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{{ cat.name }}</td>
              <td class="py-3.5 px-4 text-slate-500 dark:text-zinc-400 max-w-xs truncate">{{ cat.description || 'Sin descripción' }}</td>
              <td class="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-300 whitespace-nowrap">{{ cat.causes_count || 0 }} causas</td>
              <td class="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-300 whitespace-nowrap">{{ cat.tickets_count || 0 }} tickets</td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <button
                  @click="toggleCategoryActive(cat)"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  :class="cat.is_active ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-300 dark:border-zinc-700'"
                >
                  {{ cat.is_active ? 'Activa' : 'Inactiva' }}
                </button>
              </td>
              <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                <button
                  @click="openEditCategoryModal(cat)"
                  class="px-2.5 py-1 text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded font-semibold text-[11px]"
                >
                  Editar
                </button>
                <button
                  @click="deleteCategory(cat)"
                  class="px-2.5 py-1 text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-300 dark:border-zinc-700 rounded font-semibold text-[11px]"
                >
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-400 dark:text-zinc-500">
                No hay categorías registradas en el catálogo.
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Paginación Categorías -->
        <PaginationBar
          v-model:currentPage="catPage"
          v-model:limit="catLimit"
          :total="categories.length"
          itemName="categorías generales"
          :limitOptions="[5, 10, 20]"
        />
      </div>
    </div>

    <!-- Modal Categoría -->
    <div v-if="showCatModal" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/60">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ isEditingCat ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
          <button @click="showCatModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300">✕</button>
        </div>
        <form @submit.prevent="saveCategory" class="p-6 space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Clave de Categoría *</label>
            <input v-model="catForm.code" :disabled="isEditingCat" type="text" required placeholder="Ej. CAT-REDES" class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 uppercase font-mono">
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Nombre *</label>
            <input v-model="catForm.name" type="text" required placeholder="Ej. Infraestructura y Telecomunicaciones" class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600">
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Descripción</label>
            <textarea v-model="catForm.description" rows="3" class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600"></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button type="button" @click="showCatModal = false" class="px-3 py-1.5 text-slate-600 dark:text-zinc-400 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-1.5 text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 font-bold rounded-lg shadow-xs transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Causa -->
    <div v-if="showCauseModal" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/60">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ isEditingCause ? 'Editar Causa' : 'Nueva Causa' }}</h3>
          <button @click="showCauseModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300">✕</button>
        </div>
        <form @submit.prevent="saveCause" class="p-6 space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Categoría Padre *</label>
            <select v-model="causeForm.category_id" required class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600">
              <option value="" disabled>Selecciona categoría</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Clave de Causa *</label>
            <input v-model="causeForm.code" :disabled="isEditingCause" type="text" required placeholder="Ej. CS-020" class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 uppercase font-mono">
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Nombre de la Causa *</label>
            <input v-model="causeForm.name" type="text" required placeholder="Ej. Falla de enlace troncal" class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600">
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Prioridad Predeterminada (Establecida por Admin) *</label>
            <select v-model="causeForm.default_priority" required class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 font-semibold">
              <option value="baja">Baja — Requerimiento menor o rutinario</option>
              <option value="media">Media — Incidencia operativa regular</option>
              <option value="alta">Alta — Impacto operativo significativo</option>
              <option value="critica">Crítica — Paro de operaciones o servicio esencial</option>
            </select>
            <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Los tickets creados con esta causa tomarán automáticamente este nivel de severidad.</p>
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Descripción</label>
            <textarea v-model="causeForm.description" rows="3" class="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600"></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button type="button" @click="showCauseModal = false" class="px-3 py-1.5 text-slate-600 dark:text-zinc-400 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-1.5 text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 font-bold rounded-lg shadow-xs transition-colors">Guardar Causa</button>
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
  name: 'Catalogos',
  components: {
    PaginationBar,
  },
  data() {
    return {
      activeTab: 'causas',
      categories: [],
      causes: [],
      selectedCategoryFilter: '',
      causePage: 1,
      causeLimit: 10,
      catPage: 1,
      catLimit: 5,
      showCatModal: false,
      isEditingCat: false,
      catForm: { id: null, code: '', name: '', description: '' },
      showCauseModal: false,
      isEditingCause: false,
      causeForm: { id: null, code: '', name: '', description: '', category_id: '', default_priority: 'media' },
    };
  },
  watch: {
    selectedCategoryFilter() {
      this.causePage = 1;
    },
  },
  computed: {
    filteredCauses() {
      if (!this.selectedCategoryFilter) return this.causes;
      return this.causes.filter((c) => c.category_id === Number(this.selectedCategoryFilter));
    },
    paginatedCauses() {
      const start = (this.causePage - 1) * this.causeLimit;
      return this.filteredCauses.slice(start, start + this.causeLimit);
    },
    paginatedCategories() {
      const start = (this.catPage - 1) * this.catLimit;
      return this.categories.slice(start, start + this.catLimit);
    },
  },
  methods: {
    async loadCategories() {
      try {
        const { data } = await api.get('/categories');
        this.categories = data || [];
      } catch (err) {
        console.error(err);
      }
    },
    async loadCauses() {
      try {
        const { data } = await api.get('/causes');
        this.causes = data || [];
      } catch (err) {
        console.error(err);
      }
    },
    openCategoryModal() {
      this.isEditingCat = false;
      this.catForm = { id: null, code: '', name: '', description: '' };
      this.showCatModal = true;
    },
    openEditCategoryModal(cat) {
      this.isEditingCat = true;
      this.catForm = { id: cat.id, code: cat.code, name: cat.name, description: cat.description };
      this.showCatModal = true;
    },
    async saveCategory() {
      try {
        if (this.isEditingCat) {
          await api.put(`/categories/${this.catForm.id}`, this.catForm);
          showToast(`Categoría "${this.catForm.name}" actualizada`, 'success');
        } else {
          await api.post('/categories', this.catForm);
          showToast(`Categoría "${this.catForm.name}" registrada con éxito`, 'success');
        }
        this.showCatModal = false;
        await this.loadCategories();
      } catch (err) {
        showToast(err.response?.data?.error || 'Error al guardar categoría', 'error');
      }
    },
    async toggleCategoryActive(cat) {
      try {
        await api.put(`/categories/${cat.id}`, { is_active: !cat.is_active });
        showToast(`Categoría "${cat.name}" ${!cat.is_active ? 'activada' : 'desactivada'}`, 'info');
        await this.loadCategories();
      } catch (err) {
        showToast(err.response?.data?.error || 'Error al cambiar estado', 'error');
      }
    },
    async deleteCategory(cat) {
      const confirmed = await confirmAction({
        title: '¿Eliminar categoría?',
        message: `¿Estás seguro de que deseas eliminar permanentemente la categoría "${cat.name}"? Solo es posible si no contiene causas asociadas.`,
        confirmText: 'Eliminar Categoría',
        type: 'danger',
      });
      if (!confirmed) return;

      try {
        await api.delete(`/categories/${cat.id}`);
        showToast(`Categoría "${cat.name}" eliminada`, 'success');
        await this.loadCategories();
        await this.loadCauses();
      } catch (err) {
        showToast(err.response?.data?.error || 'Error al eliminar categoría', 'error');
      }
    },
    openCauseModal() {
      this.isEditingCause = false;
      this.causeForm = {
        id: null,
        code: '',
        name: '',
        description: '',
        category_id: this.categories[0]?.id || '',
        default_priority: 'media',
      };
      this.showCauseModal = true;
    },
    openEditCauseModal(cs) {
      this.isEditingCause = true;
      this.causeForm = {
        id: cs.id,
        code: cs.code,
        name: cs.name,
        description: cs.description,
        category_id: cs.category_id,
        default_priority: cs.default_priority || 'media',
      };
      this.showCauseModal = true;
    },
    async saveCause() {
      try {
        if (this.isEditingCause) {
          await api.put(`/causes/${this.causeForm.id}`, this.causeForm);
          showToast(`Causa "${this.causeForm.name}" actualizada`, 'success');
        } else {
          await api.post('/causes', this.causeForm);
          showToast(`Causa "${this.causeForm.name}" registrada con éxito`, 'success');
        }
        this.showCauseModal = false;
        await this.loadCauses();
      } catch (err) {
        showToast(err.response?.data?.error || 'Error al guardar causa', 'error');
      }
    },
    async toggleCauseActive(cs) {
      try {
        await api.put(`/causes/${cs.id}`, { is_active: !cs.is_active });
        showToast(`Causa "${cs.name}" ${!cs.is_active ? 'activada' : 'desactivada'}`, 'info');
        await this.loadCauses();
      } catch (err) {
        showToast(err.response?.data?.error || 'Error al cambiar estado', 'error');
      }
    },
    async deleteCause(cs) {
      const confirmed = await confirmAction({
        title: '¿Eliminar causa?',
        message: `¿Estás seguro de que deseas eliminar permanentemente la causa "${cs.name}"? Solo es posible si no se encuentra en uso por ningún ticket.`,
        confirmText: 'Eliminar Causa',
        type: 'danger',
      });
      if (!confirmed) return;

      try {
        await api.delete(`/causes/${cs.id}`);
        showToast(`Causa "${cs.name}" eliminada`, 'success');
        await this.loadCauses();
      } catch (err) {
        showToast(err.response?.data?.error || 'Error al eliminar causa', 'error');
      }
    },
  },
  mounted() {
    this.loadCategories();
    this.loadCauses();
  },
};
</script>
