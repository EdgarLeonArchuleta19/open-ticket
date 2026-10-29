<template>
  <div id="app" class="min-h-screen bg-slate-50/70 dark:bg-zinc-950 flex flex-col font-sans text-slate-800 dark:text-zinc-100 transition-colors">
    <TopNav v-if="showNavigation" />
    <main class="flex-1">
      <router-view :key="$route.fullPath" />
    </main>

    <!-- Footer Corporativo de Derechos Reservados -->
    <AppFooter v-if="showNavigation" />

    <!-- Modal Global de Nuevo Ticket -->
    <CreateTicketModal
      :isOpen="modalState.isCreateTicketOpen"
      @close="closeCreateTicketModal"
      @ticket-created="handleTicketCreated"
    />

    <!-- Diálogo Modal de Confirmación Global -->
    <ConfirmModal />

    <!-- Notificaciones Toast Flotantes Globales -->
    <ToastContainer />
  </div>
</template>

<script>
import TopNav from '@/components/TopNav.vue';
import AppFooter from '@/components/AppFooter.vue';
import CreateTicketModal from '@/components/CreateTicketModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import { isAuthenticated } from '@/services/auth';
import { modalState, closeCreateTicketModal } from '@/services/modal';

export default {
  name: 'App',
  components: {
    TopNav,
    AppFooter,
    CreateTicketModal,
    ConfirmModal,
    ToastContainer,
  },
  setup() {
    return {
      modalState,
      closeCreateTicketModal,
    };
  },
  computed: {
    showNavigation() {
      return this.$route.name !== 'Login' && isAuthenticated();
    },
  },
  methods: {
    handleTicketCreated(ticket) {
      closeCreateTicketModal();
      if (this.$route.path === '/tickets') {
        window.location.reload();
      } else {
        this.$router.push(`/tickets/${ticket.id}`);
      }
    },
  },
};
</script>
