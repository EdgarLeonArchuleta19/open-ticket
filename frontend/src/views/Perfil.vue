<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="pb-4 border-b border-slate-200 dark:border-zinc-800">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mi Perfil</h1>
      <p class="text-sm text-slate-500 dark:text-zinc-400 mt-1">
        Consulte sus credenciales de acceso y actualice su información personal y contraseña.
      </p>
    </div>

    <!-- Feedback Message -->
    <div
      v-if="alertMessage"
      :class="[
        'p-4 rounded-xl text-sm flex items-center justify-between',
        alertType === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900'
      ]"
    >
      <div class="flex items-center gap-2">
        <i :data-lucide="alertType === 'success' ? 'check-circle' : 'alert-circle'" class="w-4 h-4"></i>
        <span>{{ alertMessage }}</span>
      </div>
      <button @click="alertMessage = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- Identity Summary Card -->
    <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
      <div class="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-2xl flex items-center justify-center shrink-0">
        {{ userInitials }}
      </div>
      <div class="flex-1 text-center sm:text-left">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ currentUser?.full_name || currentUser?.username }}</h2>
          <span
            :class="[
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold self-center sm:self-auto',
              currentUser?.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
              currentUser?.role === 'agent' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
              'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
            ]"
          >
            <i :data-lucide="currentUser?.role === 'admin' ? 'shield-check' : currentUser?.role === 'agent' ? 'headphones' : 'user'" class="w-3 h-3"></i>
            {{ roleLabel }}
          </span>
        </div>
        <p class="text-sm text-slate-500 dark:text-zinc-400 font-mono">@{{ currentUser?.username }} • {{ currentUser?.email }}</p>
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-500 dark:text-zinc-400">
          <div class="flex items-center gap-1.5">
            <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500"></i>
            <span>{{ currentUser?.department_name || 'Departamento no asignado' }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <i data-lucide="shield" class="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500"></i>
            <span>ID de cuenta: #{{ currentUser?.id }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- General Information Card -->
      <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div class="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800">
          <i data-lucide="user" class="w-5 h-5 text-emerald-700 dark:text-emerald-400"></i>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Datos Personales</h3>
        </div>

        <form @submit.prevent="updateGeneralInfo" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Nombre Completo</label>
            <input
              v-model="profileForm.full_name"
              type="text"
              required
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Correo Electrónico</label>
            <input
              v-model="profileForm.email"
              type="email"
              required
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Nombre de Usuario (no editable)</label>
            <input
              :value="currentUser?.username"
              type="text"
              disabled
              class="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700 rounded-lg cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Rol en OpenTicket</label>
            <input
              :value="roleLabel"
              type="text"
              disabled
              class="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700 rounded-lg cursor-not-allowed"
            />
          </div>

          <div class="pt-2 text-right">
            <button
              type="submit"
              :disabled="savingInfo"
              class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-xs"
            >
              {{ savingInfo ? 'Guardando...' : 'Actualizar Información' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Security / Password Card -->
      <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div class="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800">
          <i data-lucide="lock" class="w-5 h-5 text-emerald-700 dark:text-emerald-400"></i>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Seguridad y Contraseña</h3>
        </div>

        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Contraseña Actual *</label>
            <input
              v-model="securityForm.current_password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Nueva Contraseña *</label>
            <input
              v-model="securityForm.new_password"
              type="password"
              required
              minlength="6"
              placeholder="Mínimo 6 caracteres"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Confirmar Nueva Contraseña *</label>
            <input
              v-model="securityForm.confirm_password"
              type="password"
              required
              placeholder="Repita la nueva contraseña"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 dark:text-white"
            />
          </div>

          <p class="text-xs text-slate-500 dark:text-zinc-400">
            Asegúrese de usar al menos 6 caracteres combinando letras y números para mayor seguridad.
          </p>

          <div class="pt-2 text-right">
            <button
              type="submit"
              :disabled="savingPass"
              class="px-4 py-2 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-xs"
            >
              {{ savingPass ? 'Modificando...' : 'Cambiar Contraseña' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { getUser, updateStoredUser } from '@/services/auth';
import { showToast } from '@/services/toast';

export default {
  name: 'Perfil',
  data() {
    const u = getUser() || {};
    return {
      currentUser: u,
      profileForm: {
        full_name: u.full_name || '',
        email: u.email || '',
      },
      securityForm: {
        current_password: '',
        new_password: '',
        confirm_password: '',
      },
      savingInfo: false,
      savingPass: false,
      alertMessage: null,
      alertType: 'success',
    };
  },
  computed: {
    roleLabel() {
      switch (this.currentUser?.role) {
        case 'admin': return 'Administrador';
        case 'agent': return 'Agente de Soporte';
        case 'requester': return 'Solicitante';
        default: return this.currentUser?.role || 'Usuario';
      }
    },
    userInitials() {
      const name = this.currentUser?.full_name || this.currentUser?.username || 'U';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },
  },
  mounted() {
    this.refreshProfile();
    this.$nextTick(() => {
      if (window.lucide) window.lucide.createIcons();
    });
  },
  updated() {
    if (window.lucide) window.lucide.createIcons();
  },
  methods: {
    async refreshProfile() {
      try {
        const res = await api.get('/auth/me');
        this.currentUser = res.data;
        this.profileForm.full_name = res.data.full_name;
        this.profileForm.email = res.data.email;
        updateStoredUser(res.data);
      } catch (err) {
        console.error('Error al obtener perfil:', err);
      }
    },
    showAlert(msg, type = 'success') {
      this.alertMessage = msg;
      this.alertType = type;
      showToast(msg, type === 'error' ? 'error' : 'success');
      setTimeout(() => {
        if (this.alertMessage === msg) this.alertMessage = null;
      }, 5000);
    },
    async updateGeneralInfo() {
      this.savingInfo = true;
      try {
        const res = await api.put('/auth/profile', {
          full_name: this.profileForm.full_name,
          email: this.profileForm.email,
        });
        this.showAlert('Información personal actualizada con éxito', 'success');
        this.currentUser = { ...this.currentUser, ...res.data.user };
        updateStoredUser(this.currentUser);
      } catch (err) {
        this.showAlert(err.response?.data?.message || 'Error al actualizar información', 'error');
      } finally {
        this.savingInfo = false;
      }
    },
    async updatePassword() {
      if (this.securityForm.new_password !== this.securityForm.confirm_password) {
        this.showAlert('Las contraseñas nuevas no coinciden', 'error');
        return;
      }
      if (this.securityForm.new_password.length < 6) {
        this.showAlert('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      this.savingPass = true;
      try {
        await api.put('/auth/profile', {
          current_password: this.securityForm.current_password,
          new_password: this.securityForm.new_password,
        });
        this.showAlert('Contraseña cambiada exitosamente', 'success');
        this.securityForm = {
          current_password: '',
          new_password: '',
          confirm_password: '',
        };
      } catch (err) {
        this.showAlert(err.response?.data?.message || 'Error al cambiar contraseña', 'error');
      } finally {
        this.savingPass = false;
      }
    },
  },
};
</script>
