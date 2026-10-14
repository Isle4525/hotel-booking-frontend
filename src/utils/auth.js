/**
 * Demo Authentication Utilities (Frontend-only)
 * Note: This is a client-side demo flow for demonstration purposes only.
 * No real passwords or sensitive data are transmitted or stored securely.
 */

export const DEFAULT_DEMO_USER = {
  name: 'Demo Traveler',
  email: 'demo@booker.kz',
  password: 'Password123'
};

const STORAGE_USERS_KEY = 'booker_demo_users';
const STORAGE_CURRENT_USER_KEY = 'booker_current_user';

/**
 * Retrieve list of registered demo users from localStorage.
 * Seeds with DEFAULT_DEMO_USER if empty.
 */
export function getDemoUsers() {
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    if (!data) {
      const initial = [DEFAULT_DEMO_USER];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_DEMO_USER];
  } catch {
    return [DEFAULT_DEMO_USER];
  }
}

/**
 * Register a new demo user in localStorage.
 */
export function registerDemoUser({ name, email, password }) {
  const users = getDemoUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const userExists = users.some(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  if (userExists) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const newUser = {
    name: name.trim(),
    email: normalizedEmail,
    password
  };

  users.push(newUser);

  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save user to localStorage', err);
  }

  return { success: true, user: newUser };
}

/**
 * Authenticate against demo users list.
 */
export function loginDemoUser(email, password) {
  const users = getDemoUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) {
    return { success: false, error: 'Invalid email or password. Please verify your credentials or use the demo account.' };
  }

  setCurrentUser(user);
  return { success: true, user };
}

/**
 * Get currently authenticated demo user.
 */
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Persist or clear currently authenticated demo user.
 */
export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to update currentUser in localStorage', err);
  }
}

/**
 * Email format validation helper.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email.trim());
}
