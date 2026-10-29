<template>
  <header class="sticky top-0 z-40 bg-zinc-100/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 transition-colors shadow-2xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Navbar con altura generosa (h-20) más gordito y espacioso -->
      <div class="flex items-center justify-between h-20">
        <!-- Logo e Identidad OpenTicket -->
        <div class="flex items-center gap-6 lg:gap-8">
          <router-link to="/dashboard" class="flex items-center gap-3 text-decoration-none group">
            <!-- Icono Ticket Esmeralda Plano (Sin Degradados) -->
            <div class="w-10 h-10 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                <path d="M13 5v2"/>
                <path d="M13 17v2"/>
                <path d="M13 11v2"/>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none">
                Open<span class="text-emerald-700 dark:text-emerald-400">Ticket</span>
              </span>
            </div>
          </router-link>

          <!-- Navegación Principal en Desktop -->
          <nav class="hidden md:flex items-center gap-1.5 lg:gap-2">
            <!-- 1. Opción Dashboard -->
            <router-link
              to="/dashboard"
              class="px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
              :class="$route.path === '/dashboard' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-2xs border border-zinc-200/90 dark:border-zinc-700' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              <span>Dashboard</span>
            </router-link>

            <!-- 2. Opción Tickets con Subopciones -->
            <div class="relative" ref="ticketsDropdown">
              <button
                @click="toggleMenu('tickets')"
                class="px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                :class="isTicketsActive ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-2xs border border-zinc-200/90 dark:border-zinc-700' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M9 12h6"/></svg>
                <span>Tickets</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-150" :class="{ 'rotate-180': openMenu === 'tickets' }"><path d="m6 9 6 6 6-6"/></svg>
              </button>

              <!-- Menú Desplegable de Tickets -->
              <div
                v-if="openMenu === 'tickets'"
                class="absolute left-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 text-xs"
              >
                <router-link
                  to="/tickets"
                  @click="openMenu = null"
                  class="flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400 dark:text-zinc-500"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
                  <span>Todos los tickets</span>
                </router-link>

                <router-link
                  to="/tickets?status=nuevo"
                  @click="openMenu = null"
                  class="flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
                >
                  <div class="w-2 h-2 rounded-full bg-emerald-600"></div>
                  <span>Nuevos</span>
                </router-link>

                <router-link
                  to="/tickets?status=en_proceso"
                  @click="openMenu = null"
                  class="flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
                >
                  <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>En proceso</span>
                </router-link>

                <router-link
                  to="/tickets?status=resuelto"
                  @click="openMenu = null"
                  class="flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
                >
                  <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Resueltos</span>
                </router-link>
              </div>
            </div>

            <!-- 3. Opción Administración con Subopciones (Solo Admin) -->
            <div v-if="user?.role === 'admin'" class="relative" ref="adminDropdown">
              <button
                @click="toggleMenu('admin')"
                class="px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                :class="isAdminActive ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-2xs border border-zinc-200/90 dark:border-zinc-700' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Administración</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-150" :class="{ 'rotate-180': openMenu === 'admin' }"><path d="m6 9 6 6 6-6"/></svg>
              </button>

              <!-- Menú Desplegable de Administración -->
              <div
                v-if="openMenu === 'admin'"
                class="absolute left-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 text-xs"
              >
                <router-link
                  to="/departamentos"
                  @click="openMenu = null"
                  class="flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400 dark:text-zinc-500"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>
                  <span>Departamentos</span>
                </router-link>

                <router-link
                  to="/catalogos"
                  @click="openMenu = null"
                  class="flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400 dark:text-zinc-500"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>
                  <span>Categorías & Causas</span>
                </router-link>

                <router-link
                  to="/usuarios"
                  @click="openMenu = null"
                  class="flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400 dark:text-zinc-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>Usuarios & Roles</span>
                </router-link>
              </div>
            </div>
          </nav>
        </div>

        <!-- Acciones a la Derecha -->
        <div class="flex items-center gap-3">
          <!-- Sistema de Notificaciones (Campana con Badge y Dropdown) -->
          <div class="relative" ref="notificationsDropdown">
            <button
              @click="toggleMenu('notifications')"
              class="relative p-2.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-transparent"
              :class="{ 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs border-zinc-200/90 dark:border-zinc-700': openMenu === 'notifications' }"
              title="Notificaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>

              <!-- Badge Indicador de No Leídas -->
              <span
                v-if="unreadCount > 0"
                class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-100 dark:border-zinc-900"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Dropdown Notificaciones -->
            <div
              v-if="openMenu === 'notifications'"
              class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 text-xs"
            >
              <div class="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-zinc-900 dark:text-white text-sm">Notificaciones</span>
                  <span v-if="unreadCount > 0" class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold rounded-full text-[10px]">
                    {{ unreadCount }} nuevas
                  </span>
                </div>
                <button
                  v-if="unreadCount > 0"
                  @click="markAllRead"
                  class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Marcar todas leídas
                </button>
              </div>

              <!-- Lista de Notificaciones -->
              <div class="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                <div
                  v-for="item in notifications"
                  :key="item.id"
                  @click="handleNotificationClick(item)"
                  class="p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors flex items-start gap-3"
                  :class="{ 'bg-emerald-50/40 dark:bg-emerald-950/20': !item.is_read }"
                >
                  <div class="mt-1 flex-shrink-0">
                    <span
                      class="w-2.5 h-2.5 rounded-full inline-block"
                      :class="!item.is_read ? 'bg-emerald-600 dark:bg-emerald-400 ring-4 ring-emerald-100 dark:ring-emerald-950' : 'bg-zinc-300 dark:bg-zinc-600'"
                    ></span>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1 mb-0.5">
                      <span class="font-bold text-zinc-900 dark:text-white truncate text-xs">{{ item.title }}</span>
                      <span class="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{{ formatRelativeTime(item.created_at) }}</span>
                    </div>
                    <p class="text-zinc-600 dark:text-zinc-300 text-[11px] leading-snug line-clamp-2">{{ item.message }}</p>
                    <div v-if="item.ticket_folio" class="mt-1.5 flex items-center gap-1.5">
                      <span class="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                        {{ item.ticket_folio }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Estado Vacío -->
                <div v-if="notifications.length === 0" class="py-8 px-4 text-center">
                  <div class="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  </div>
                  <p class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Estás al día</p>
                  <p class="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">No tienes notificaciones pendientes</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón de Alternar Modo Claro / Oscuro -->
          <button
            @click="toggleDarkMode"
            class="p-2.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            <!-- Sol cuando está en modo oscuro -->
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            <!-- Luna cuando está en modo claro -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          </button>

          <!-- Perfil y Cuenta de Usuario (Dropdown) -->
          <div class="relative" ref="userDropdown">
            <button
              @click="toggleMenu('user')"
              class="flex items-center gap-2.5 p-1.5 pl-2.5 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-250 dark:border-zinc-800 text-left bg-white/70 dark:bg-zinc-800/40 shadow-2xs"
            >
              <div class="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {{ userInitials }}
              </div>
              <div class="hidden sm:block">
                <div class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                  {{ user?.full_name?.split(' ')[0] || user?.username }}
                </div>
                <div class="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize leading-tight">
                  {{ roleLabel }}
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400 dark:text-zinc-500 pr-1"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <!-- Menú Desplegable de Usuario -->
            <div
              v-if="openMenu === 'user'"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 text-xs"
            >
              <div class="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div class="font-bold text-zinc-900 dark:text-white truncate">{{ user?.full_name || user?.username }}</div>
                <div class="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">@{{ user?.username }} • {{ user?.email }}</div>
              </div>

              <router-link
                to="/perfil"
                @click="openMenu = null"
                class="flex items-center gap-2.5 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400 dark:text-zinc-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Mi Perfil</span>
              </router-link>

              <div class="my-1 border-t border-zinc-100 dark:border-zinc-800"></div>

              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12"/></svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          <!-- Botón Hamburguesa Móvil -->
          <button
            @click="mobileNavOpen = !mobileNavOpen"
            class="md:hidden p-2.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Menú de Navegación"
          >
            <svg v-if="!mobileNavOpen" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12"/><line x1="4" x2="20" y1="6"/><line x1="4" x2="20" y1="18"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Menú Desplegable Móvil (Tablet / Mobile Navigation) -->
      <div
        v-if="mobileNavOpen"
        class="md:hidden py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs"
      >
        <router-link
          to="/dashboard"
          @click="mobileNavOpen = false"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold"
          :class="$route.path === '/dashboard' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span>Dashboard</span>
        </router-link>

        <div class="pt-2">
          <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Tickets & Incidencias</div>
          <router-link
            to="/tickets"
            @click="mobileNavOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <span>Todos los Tickets</span>
          </router-link>
          <router-link
            to="/tickets?status=nuevo"
            @click="mobileNavOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Nuevos por atender</span>
          </router-link>
          <router-link
            to="/tickets?status=en_proceso"
            @click="mobileNavOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>En proceso</span>
          </router-link>
        </div>

        <div v-if="user?.role === 'admin'" class="pt-2">
          <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Administración</div>
          <router-link
            to="/departamentos"
            @click="mobileNavOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <span>Departamentos</span>
          </router-link>
          <router-link
            to="/catalogos"
            @click="mobileNavOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <span>Categorías & Causas</span>
          </router-link>
          <router-link
            to="/usuarios"
            @click="mobileNavOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <span>Usuarios & Roles</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import api from '@/services/api';
import { getUser, logout } from '@/services/auth';
import { isDark, toggleTheme } from '@/services/theme';
import { timeAgo } from '@/utils/date';
import { showToast } from '@/services/toast';
import { confirmAction } from '@/services/confirm';

export default {
  name: 'TopNav',
  data() {
    return {
      user: getUser(),
      openMenu: null, // 'tickets' | 'admin' | 'user' | 'notifications' | null
      mobileNavOpen: false,
      notifications: [],
      unreadCount: 0,
      pollInterval: null,
    };
  },
  computed: {
    isDarkMode() {
      return isDark.value;
    },
    isTicketsActive() {
      return this.$route.path.startsWith('/tickets');
    },
    isAdminActive() {
      return ['/departamentos', '/catalogos', '/usuarios'].includes(this.$route.path);
    },
    roleLabel() {
      switch (this.user?.role) {
        case 'admin': return 'Administrador';
        case 'agent': return 'Agente de Soporte';
        default: return 'Solicitante';
      }
    },
    userInitials() {
      const name = this.user?.full_name || this.user?.username || 'U';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
    document.addEventListener('keydown', this.handleKeyDown);
    this.fetchNotifications();
    // Sondeo de notificaciones cada 30 segundos
    this.pollInterval = setInterval(this.fetchNotifications, 30000);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
  methods: {
    toggleDarkMode() {
      toggleTheme();
    },
    toggleMenu(name) {
      if (this.openMenu === name) {
        this.openMenu = null;
      } else {
        this.openMenu = name;
        if (name === 'notifications') {
          this.fetchNotifications();
        }
      }
    },
    handleOutsideClick(e) {
      if (!this.$el.contains(e.target)) {
        this.openMenu = null;
      }
    },
    handleKeyDown(e) {
      if (e.key === 'Escape') {
        this.openMenu = null;
        this.mobileNavOpen = false;
      }
    },
    formatRelativeTime(date) {
      return timeAgo(date);
    },
    async fetchNotifications() {
      if (!this.user) return;
      try {
        const res = await api.get('/notifications');
        this.notifications = res.data.notifications || [];
        this.unreadCount = res.data.unread_count || 0;
      } catch (err) {
        // En caso de fallo de red silencioso
      }
    },
    async markAllRead() {
      try {
        await api.put('/notifications/read-all');
        this.notifications = this.notifications.map(n => ({ ...n, is_read: true }));
        this.unreadCount = 0;
        showToast('Notificaciones marcadas como leídas', 'info');
      } catch (err) {
        console.error('Error al marcar todas las notificaciones:', err);
        showToast('Error al actualizar notificaciones', 'error');
      }
    },
    async handleNotificationClick(item) {
      try {
        if (!item.is_read) {
          await api.put(`/notifications/${item.id}/read`);
          item.is_read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        this.openMenu = null;
        if (item.ticket_id) {
          this.$router.push(`/tickets/${item.ticket_id}`);
        }
      } catch (err) {
        console.error('Error al abrir notificación:', err);
      }
    },
    async handleLogout() {
      this.openMenu = null;
      const ok = await confirmAction({
        title: '¿Cerrar sesión?',
        message: '¿Estás seguro de que deseas salir del sistema OpenTicket?',
        confirmText: 'Cerrar sesión',
        cancelText: 'Permanecer conectado',
        type: 'warning',
      });
      if (ok) {
        showToast('Sesión cerrada correctamente', 'info');
        logout();
      }
    },
  },
};
</script>
