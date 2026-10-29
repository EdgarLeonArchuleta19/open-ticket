<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestión de Usuarios</h1>
      </div>
      <div>
        <button
          @click="openCreateModal"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          <span>Nuevo Usuario</span>
        </button>
      </div>
    </div>

    <!-- Stats Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div class="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Usuarios</div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{{ users.length }}</div>
      </div>
      <div class="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Activos</div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{{ activeCount }}</div>
      </div>
      <div class="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Agentes</div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{{ agentCount }}</div>
      </div>
      <div class="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Administradores</div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{{ adminCount }}</div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3.5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md w-full">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            class="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
            @input="debounceSearch"
          />
          <button
            v-if="filters.search"
            @click="filters.search = ''; fetchUsers()"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </div>

        <!-- Department Filter -->
        <div class="w-full sm:w-64 shrink-0">
          <select
            v-model="filters.department_id"
            @change="fetchUsers"
            class="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">Todos los departamentos</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Role Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <span class="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mr-1 shrink-0">Rol:</span>
        <button
          v-for="r in roleFilters"
          :key="r.value"
          @click="filters.role = r.value; fetchUsers()"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0',
            filters.role === r.value
              ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
          ]"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- Feedback Message -->
    <div
      v-if="alertMessage"
      :class="[
        'p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between',
        alertType === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900'
      ]"
    >
      <div class="flex items-center gap-2">
        <svg v-if="alertType === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        <span>{{ alertMessage }}</span>
      </div>
      <button @click="alertMessage = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
      </button>
    </div>

    <!-- Users Table Card -->
    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
      <div v-if="loading" class="p-12 text-center text-slate-400 dark:text-zinc-500">
        <div class="inline-block animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
        <p class="text-xs">Cargando usuarios...</p>
      </div>

      <div v-else-if="users.length === 0" class="p-12 text-center text-slate-500 dark:text-zinc-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-slate-300 dark:text-zinc-600 mb-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h3 class="text-sm font-semibold text-slate-800 dark:text-zinc-200">No se encontraron usuarios</h3>
        <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">Pruebe ajustando los filtros de búsqueda o registre un nuevo usuario.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[760px]">
          <thead class="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th class="py-3.5 px-4 sm:px-5">Usuario</th>
              <th class="py-3.5 px-4">Correo</th>
              <th class="py-3.5 px-4">Rol</th>
              <th class="py-3.5 px-4">Departamento</th>
              <th class="py-3.5 px-4 text-center">Carga de Tickets</th>
              <th class="py-3.5 px-4 text-center">Estado</th>
              <th class="py-3.5 px-4 sm:px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr v-for="u in paginatedUsers" :key="u.id" class="hover:bg-slate-50/80 dark:hover:bg-zinc-800/60 transition-colors">
              <!-- Name & Username -->
              <td class="py-3.5 px-4 sm:px-5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {{ getInitials(u.full_name || u.username) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white">{{ u.full_name }}</div>
                    <div class="text-[11px] text-slate-500 dark:text-zinc-400">@{{ u.username }}</div>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="py-3.5 px-4 text-slate-600 dark:text-zinc-300">
                <span class="font-mono text-xs">{{ u.email }}</span>
              </td>

              <!-- Role -->
              <td class="py-3.5 px-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                    u.role === 'agent' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                    'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                  ]"
                >
                  <svg v-if="u.role === 'admin'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                  <svg v-else-if="u.role === 'agent'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>{{ roleLabel(u.role) }}</span>
                </span>
              </td>

              <!-- Department -->
              <td class="py-3.5 px-4 text-slate-700 dark:text-zinc-300">
                <div v-if="u.department_name" class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 dark:text-zinc-500 shrink-0"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                  <span>{{ u.department_name }}</span>
                </div>
                <span v-else class="text-xs text-slate-400 dark:text-zinc-500 italic">Sin departamento</span>
              </td>

              <!-- Ticket Workload -->
              <td class="py-3.5 px-4 text-center">
                <div v-if="u.role === 'agent'" class="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-semibold">
                  <span>{{ u.active_assigned_tickets || 0 }} asignados</span>
                </div>
                <div v-else class="text-xs text-slate-500 dark:text-zinc-400">
                  <span>{{ u.requested_tickets_count || 0 }} creados</span>
                </div>
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4 text-center">
                <span
                  :class="[
                    'inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    u.is_active ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 line-through'
                  ]"
                >
                  {{ u.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 sm:px-5 text-right">
                <div class="inline-flex items-center justify-end gap-1">
                  <button
                    @click="openEditModal(u)"
                    title="Editar datos"
                    class="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>

                  <button
                    @click="toggleActive(u)"
                    :title="u.is_active ? 'Desactivar usuario' : 'Activar usuario'"
                    :class="[
                      'p-1.5 rounded-lg transition-colors',
                      u.is_active ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    ]"
                  >
                    <svg v-if="u.is_active" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                  </button>

                  <button
                    @click="confirmDelete(u)"
                    title="Eliminar usuario"
                    class="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación de Usuarios -->
      <PaginationBar
        v-model:currentPage="page"
        v-model:limit="pageSize"
        :total="users.length"
        itemName="usuarios"
        :limitOptions="[5, 10, 25, 50]"
      />
    </div>

    <!-- Create / Edit User Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div class="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors my-auto">
        <div class="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/60">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <svg v-if="isEditing" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              {{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
            </h3>
          </div>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 p-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </div>

        <form @submit.prevent="saveUser" class="p-5 sm:p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <!-- Full Name -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Nombre Completo *</label>
            <input
              v-model="formData.full_name"
              type="text"
              required
              placeholder="Ej. Sofia Gomez Morales"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            />
          </div>

          <!-- Username & Email Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Usuario *</label>
              <input
                v-model="formData.username"
                type="text"
                :disabled="isEditing"
                required
                placeholder="ej. sgomez"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-zinc-800/50 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Correo Electrónico *</label>
              <input
                v-model="formData.email"
                type="email"
                required
                placeholder="sgomez@empresa.com"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <!-- Role & Department Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Rol de Acceso *</label>
              <select
                v-model="formData.role"
                required
                class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
              >
                <option value="requester">Solicitante</option>
                <option value="agent">Agente de Soporte</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Departamento</label>
              <select
                v-model="formData.department_id"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
              >
                <option :value="null">Ninguno / General</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
              {{ isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña de Acceso *' }}
            </label>
            <input
              v-model="formData.password"
              type="password"
              :required="!isEditing"
              placeholder="Mínimo 6 caracteres"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            />
          </div>

          <!-- Active status -->
          <div v-if="isEditing" class="flex items-center gap-2 pt-1">
            <input
              id="is_active_toggle"
              type="checkbox"
              v-model="formData.is_active"
              class="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-zinc-700 focus:ring-emerald-500"
            />
            <label for="is_active_toggle" class="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Usuario activo
            </label>
          </div>

          <!-- Modal buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              @click="showModal = false"
              class="px-3 py-1.5 text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50 transition-colors shadow-xs"
            >
              {{ saving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario') }}
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
  name: 'Usuarios',
  components: {
    PaginationBar,
  },
  data() {
    return {
      users: [],
      departments: [],
      loading: false,
      saving: false,
      showModal: false,
      isEditing: false,
      alertMessage: null,
      alertType: 'success',
      searchTimeout: null,
      page: 1,
      pageSize: 10,
      filters: {
        search: '',
        role: '',
        department_id: '',
      },
      roleFilters: [
        { label: 'Todos', value: '' },
        { label: 'Administradores', value: 'admin' },
        { label: 'Agentes', value: 'agent' },
        { label: 'Solicitantes', value: 'requester' },
      ],
      formData: {
        id: null,
        full_name: '',
        username: '',
        email: '',
        role: 'requester',
        department_id: null,
        password: '',
        is_active: true,
      },
    };
  },
  computed: {
    activeCount() {
      return this.users.filter((u) => u.is_active).length;
    },
    agentCount() {
      return this.users.filter((u) => u.role === 'agent').length;
    },
    adminCount() {
      return this.users.filter((u) => u.role === 'admin').length;
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.users.length / this.pageSize));
    },
    paginatedUsers() {
      const start = (this.page - 1) * this.pageSize;
      return this.users.slice(start, start + this.pageSize);
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchDepartments();
  },
  methods: {
    async fetchUsers() {
      this.page = 1;
      this.loading = true;
      try {
        const params = {};
        if (this.filters.search) params.search = this.filters.search;
        if (this.filters.role) params.role = this.filters.role;
        if (this.filters.department_id) params.department_id = this.filters.department_id;

        const res = await api.get('/users', { params });
        this.users = res.data;
      } catch (err) {
        this.showAlert(err.response?.data?.message || 'Error al cargar usuarios', 'error');
      } finally {
        this.loading = false;
      }
    },
    async fetchDepartments() {
      try {
        const res = await api.get('/departments');
        this.departments = res.data;
      } catch (err) {
        console.error('Error al cargar departamentos:', err);
      }
    },
    debounceSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchUsers();
      }, 350);
    },
    roleLabel(role) {
      switch (role) {
        case 'admin': return 'Administrador';
        case 'agent': return 'Agente';
        case 'requester': return 'Solicitante';
        default: return role;
      }
    },
    getInitials(name) {
      if (!name) return 'U';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    },
    showAlert(msg, type = 'success') {
      this.alertMessage = msg;
      this.alertType = type;
      showToast(msg, type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'success'));
      setTimeout(() => {
        if (this.alertMessage === msg) this.alertMessage = null;
      }, 5000);
    },
    openCreateModal() {
      this.isEditing = false;
      this.formData = {
        id: null,
        full_name: '',
        username: '',
        email: '',
        role: 'requester',
        department_id: null,
        password: '',
        is_active: true,
      };
      this.showModal = true;
    },
    openEditModal(user) {
      this.isEditing = true;
      this.formData = {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        password: '',
        is_active: user.is_active,
      };
      this.showModal = true;
    },
    async saveUser() {
      this.saving = true;
      try {
        if (this.isEditing) {
          const payload = {
            full_name: this.formData.full_name,
            email: this.formData.email,
            role: this.formData.role,
            department_id: this.formData.department_id,
            is_active: this.formData.is_active,
          };
          if (this.formData.password) {
            payload.password = this.formData.password;
          }
          await api.put(`/users/${this.formData.id}`, payload);
          this.showAlert('Usuario actualizado con éxito', 'success');
        } else {
          await api.post('/users', this.formData);
          this.showAlert('Usuario creado con éxito', 'success');
        }
        this.showModal = false;
        await this.fetchUsers();
      } catch (err) {
        this.showAlert(err.response?.data?.message || 'Error al guardar usuario', 'error');
      } finally {
        this.saving = false;
      }
    },
    async toggleActive(user) {
      const action = user.is_active ? 'desactivar' : 'activar';
      const confirmed = await confirmAction({
        title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
        message: `¿Estás seguro de que deseas ${action} la cuenta del usuario "${user.full_name}"?`,
        confirmText: `${action.charAt(0).toUpperCase() + action.slice(1)} usuario`,
        type: user.is_active ? 'warning' : 'info',
      });
      if (!confirmed) return;

      try {
        await api.put(`/users/${user.id}`, {
          is_active: !user.is_active,
        });
        this.showAlert(`Usuario ${action}do exitosamente`, 'success');
        await this.fetchUsers();
      } catch (err) {
        this.showAlert(err.response?.data?.message || `Error al ${action} usuario`, 'error');
      }
    },
    async confirmDelete(user) {
      const confirmed = await confirmAction({
        title: '¿Eliminar o retirar usuario?',
        message: `¿Deseas eliminar al usuario "${user.full_name}"? Si posee tickets registrados o asignados, el sistema desactivará su cuenta de manera segura para preservar la integridad histórica.`,
        confirmText: 'Proceder con Eliminación',
        type: 'danger',
      });
      if (!confirmed) return;

      try {
        const res = await api.delete(`/users/${user.id}`);
        this.showAlert(res.data?.message || 'Usuario procesado exitosamente', 'success');
        await this.fetchUsers();
      } catch (err) {
        this.showAlert(err.response?.data?.message || 'Error al procesar eliminación', 'error');
      }
    },
  },
};
</script>
