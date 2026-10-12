const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (error) {
    return null;
  }
}

export function setSession(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function updateStoredUser(partial) {
  const usuario = getUser();
  if (!usuario) return;
  localStorage.setItem(USER_KEY, JSON.stringify({ ...usuario, ...partial }));
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

export function hasRole(...roles) {
  const usuario = getUser();
  return Boolean(usuario && roles.includes(usuario.tipo));
}

const DEPARTAMENTO_PROBLEMAS = 4;

export function homeRouteFor(usuario = getUser()) {
  if (!usuario) return '/';
  if (usuario.tipo === 'administrador') return '/ver-tickets';
  if (usuario.tipo === 'tecnico') {
    return usuario.departamento_id === DEPARTAMENTO_PROBLEMAS ? '/problemas' : '/tickets-asignados';
  }
  return '/crear-ticket';
}
