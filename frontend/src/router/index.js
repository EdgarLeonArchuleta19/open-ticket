import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, getUser, homeRouteFor } from '@/services/auth';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { showNavbar: false, public: true },
  },
  {
    path: '/crear-ticket',
    name: 'CrearTicket',
    component: () => import('@/views/CrearTicket.vue'),
    meta: { showNavbar: true, roles: ['usuarioNormal'] },
  },
  {
    path: '/ver-tickets',
    name: 'VerTickets',
    component: () => import('@/views/VerTickets.vue'),
    meta: { showNavbar: true, roles: ['administrador'] },
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/Perfil.vue'),
    meta: { showNavbar: true },
  },
  {
    path: '/detalles-ticket/:id',
    name: 'DetallesTicket',
    component: () => import('@/views/DetalleTicket.vue'),
    meta: { showNavbar: true, roles: ['tecnico'] },
  },
  {
    path: '/tickets-asignados',
    name: 'TicketsAsignados',
    component: () => import('@/views/TicketsAsignados.vue'),
    meta: { showNavbar: true, roles: ['tecnico'] },
  },
  {
    path: '/configuraciones',
    name: 'Configuraciones',
    component: () => import('@/views/AreaConfiguraciones.vue'),
    meta: { showNavbar: true, roles: ['administrador'] },
  },
  {
    path: '/detalle-ticket-cliente/:id',
    name: 'DetalleTicketCliente',
    component: () => import('@/views/DetalleTicketCliente.vue'),
    meta: { showNavbar: true, roles: ['usuarioNormal'] },
  },
  {
    path: '/personal',
    name: 'Personal',
    component: () => import('@/views/Personal.vue'),
    meta: { showNavbar: true, roles: ['administrador'] },
  },
  {
    path: '/problemas',
    name: 'Problemas',
    component: () => import('@/views/GestionDeProblemas.vue'),
    meta: { showNavbar: true, roles: ['tecnico'] },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const authed = isAuthenticated();

  if (to.meta.public) {
    return authed ? { path: homeRouteFor() } : true;
  }

  if (!authed) {
    return { path: '/' };
  }

  if (to.meta.roles && !to.meta.roles.includes(getUser()?.tipo)) {
    return { path: homeRouteFor() };
  }

  return true;
});

export default router;
