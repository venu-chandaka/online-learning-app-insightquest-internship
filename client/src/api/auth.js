import api from './api';

export async function login(role, email, password) {
  const endpoint = role === 'mentor' ? 'mentorlogin' : 'stlogin';
  try {
    const res = await api.post(`/auth/${endpoint}`, { email, password });
    return res.data;
  } catch (err) {
    // normalize error message
    const message = err?.response?.data?.message || err?.message || 'Failed to login';
    throw new Error(message);
  }
}

export async function register(data) {
  const res = await api.post('/stregister', data);
  return res.data;
}

export async function logout() {
  const res = await api.post('/stlogout');
  return res.data;
}
