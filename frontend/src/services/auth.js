const TOKEN_KEY = 'openticket_token';
const USER_KEY = 'openticket_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('quickticket_token');
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('quickticket_user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('quickticket_token');
  localStorage.removeItem('quickticket_user');
}

export function logout() {
  clearSession();
  window.location.href = '/login';
}

export function updateStoredUser(partial) {
  const user = getUser();
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...partial }));
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

export function hasRole(...roles) {
  const user = getUser();
  return Boolean(user && roles.includes(user.role));
}

export function homeRouteFor(user = getUser()) {
  if (!user) return '/login';
  return '/dashboard';
}
