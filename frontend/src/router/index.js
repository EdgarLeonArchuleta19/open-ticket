import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, getUser, homeRouteFor } from '@/services/auth';

const routes = [
  {
    path: '/',
    redirect: () => (isAuthenticated() ? '/dashboard' : '/login'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true, showNavbar: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { roles: ['admin', 'agent', 'requester'] },
  },
  {
    path: '/tickets',
    name: 'Tickets',
    component: () => import('@/views/Tickets.vue'),
    meta: { roles: ['admin', 'agent', 'requester'] },
  },
  {
    path: '/tickets/:id',
    name: 'DetalleTicket',
    component: () => import('@/views/DetalleTicket.vue'),
    meta: { roles: ['admin', 'agent', 'requester'] },
  },
  {
    path: '/departamentos',
    name: 'Departamentos',
    component: () => import('@/views/Departamentos.vue'),
    meta: { roles: ['admin'] },
  },
  {
    path: '/catalogos',
    name: 'Catalogos',
    component: () => import('@/views/Catalogos.vue'),
    meta: { roles: ['admin'] },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('@/views/Usuarios.vue'),
    meta: { roles: ['admin'] },
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/Perfil.vue'),
    meta: { roles: ['admin', 'agent', 'requester'] },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
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
    return { path: '/login' };
  }

  const user = getUser();
  if (to.meta.roles && !to.meta.roles.includes(user?.role)) {
    return { path: '/dashboard' };
  }

  return true;
});

export default router;
