import api from './api';

export async function stdetails() {
  const res = await api.get('/student/stData');
  return res.data;
}
