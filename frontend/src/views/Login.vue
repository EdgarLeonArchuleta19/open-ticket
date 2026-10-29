<template>
  <div class="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
      <!-- Encabezado con Identidad OpenTicket -->
      <div class="relative p-8 pb-6 text-center border-b border-slate-100 dark:border-zinc-800">
        <!-- Switch de Tema en Login -->
        <button
          type="button"
          @click="toggleTheme"
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
          :title="isDark ? 'Modo claro' : 'Modo oscuro'"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </button>

        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-800 dark:bg-emerald-700 text-white mb-3 shadow-xs">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Open<span class="text-emerald-700 dark:text-emerald-400">Ticket</span></h1>
        <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">Sistema de Gestión de Tickets & Helpdesk</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="p-8 pt-6 space-y-4">
        <div v-if="error" class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-400 font-medium">
          {{ error }}
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
            Usuario o Correo
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input
              v-model="username"
              type="text"
              required
              placeholder="Introduce tu usuario o correo"
              class="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
            Contraseña
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/></svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50 mt-2"
        >
          <span v-if="loading">Verificando...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <div class="px-8 py-3 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 text-center">
        <p class="text-[11px] text-slate-400 dark:text-zinc-500">© 2026 OpenTicket. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { setSession, homeRouteFor } from '@/services/auth';
import { isDark, toggleTheme } from '@/services/theme';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null,
    };
  },
  computed: {
    isDark() {
      return isDark.value;
    },
  },
  methods: {
    toggleTheme() {
      toggleTheme();
    },
    async handleLogin() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post('/auth/login', {
          username: this.username,
          password: this.password,
        });

        setSession(data.token, data.user);
        this.$router.push(homeRouteFor(data.user.role));
      } catch (err) {
        this.error = err.response?.data?.error || 'Credenciales inválidas. Verifique sus datos.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
