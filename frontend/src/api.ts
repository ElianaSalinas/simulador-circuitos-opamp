const API_URL = 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  login: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  // Circuits
  getCircuits: async () => {
    const res = await fetch(`${API_URL}/circuits`, { headers: getHeaders() });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  getCircuit: async (id: string) => {
    const res = await fetch(`${API_URL}/circuits/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  createCircuit: async (data: { name: string; data: any }) => {
    const res = await fetch(`${API_URL}/circuits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  updateCircuit: async (id: string, data: { name?: string; data?: any }) => {
    const res = await fetch(`${API_URL}/circuits/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  deleteCircuit: async (id: string) => {
    const res = await fetch(`${API_URL}/circuits/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  }
};
