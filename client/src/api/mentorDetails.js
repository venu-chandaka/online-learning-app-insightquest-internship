import api from './api';

export async function mntrdetails() {
  const res = await api.get('/mentor/get-data');
  return res.data;
}




