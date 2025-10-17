import api from './api';
export async function login(role, email, password) {
  const endpoint = role === 'mentor' ? 'mentorauth/login' : '/stauth/stlogin';
  try {
    const res = await api.post(`${endpoint}`, { email, password });
    return res.data;
  } catch (err) {
    // normalize error message
    const message = err?.response?.data?.message || err?.message || 'Failed to login';
    throw new Error(message);
  }
}
// For student and mentor registration
export async function register(role, name, email, password, expertise = "") {
  const endpoint = role === 'mentor' ? '/mentorauth/register' : '/stauth/stregister';
  // Mentors need expertise; students do not
  const payload =
    role === "mentor"
      ? { name, email, password, expertise }
      : { name, email, password };
  try {
    const res = await api.post(`${endpoint}`, payload);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'Failed to register';
    throw new Error(message);
  }
}

export async function logout() {
  const res = await api.post('/stauth/stlogout');
  return res.data;
}
