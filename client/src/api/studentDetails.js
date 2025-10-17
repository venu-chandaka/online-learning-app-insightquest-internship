import api from './api';

export async function stdetails() {
  const res = await api.get('/student/get-data');
  return res.data;
}
