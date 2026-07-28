import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { api } from '../api';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await api.login({ email, password });
      } else {
        data = await api.register({ email, password, name });
      }
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-96 text-white shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">×</button>
        
        <h2 className="text-xl font-bold mb-6 text-center">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-2 bg-red-500/20 border border-red-500/50 text-red-400 text-sm rounded">{error}</div>}

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded text-sm transition-colors">
            {loading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-400">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-1 text-blue-400 hover:underline">
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
