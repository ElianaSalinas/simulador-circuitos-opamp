const API_URL = 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    
    // Si es 401/403 pero no viene de login, es sesión expirada
    if ((res.status === 401 || res.status === 403) && !res.url.includes('/auth/login') && !res.url.includes('/auth/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth-expired'));
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    throw new Error(errorData.error || 'Ocurrió un error en la petición');
  }
  return res.json();
};

export const api = {
  // Auth
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  login: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Circuits
  getCircuits: async () => {
    const res = await fetch(`${API_URL}/circuits`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getCircuit: async (id: string) => {
    const res = await fetch(`${API_URL}/circuits/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createCircuit: async (data: { name: string; data: any }) => {
    const res = await fetch(`${API_URL}/circuits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  updateCircuit: async (id: string, data: { name?: string; data?: any }) => {
    const res = await fetch(`${API_URL}/circuits/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  deleteCircuit: async (id: string) => {
    const res = await fetch(`${API_URL}/circuits/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
