import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import type { RootState } from '../store';
import { loadCircuitData, setCircuitMetadata } from '../store/circuitSlice';
import { showToast } from './Toast';

interface CircuitManagerModalProps {
  onClose: () => void;
}

const CircuitManagerModal: React.FC<CircuitManagerModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const [circuits, setCircuits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    loadCircuits();
  }, [token]);

  const loadCircuits = async () => {
    setLoading(true);
    try {
      const data = await api.getCircuits();
      setCircuits(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar circuitos');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (id: string) => {
    try {
      const c = await api.getCircuit(id);
      const parsedData = typeof c.data === 'string' ? JSON.parse(c.data) : c.data;
      dispatch(loadCircuitData(parsedData));
      dispatch(setCircuitMetadata({ id: c.id, name: c.name }));
      showToast('Circuito cargado exitosamente', 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cargar el circuito');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este circuito?')) return;
    try {
      await api.deleteCircuit(id);
      showToast('Circuito eliminado', 'info');
      loadCircuits();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-[550px] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Mis Circuitos
        </h2>

        {error && <div className="p-3 mb-4 bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-lg flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{error}</div>}

        {loading ? (
          <div className="text-center text-gray-400 py-12 flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Cargando tus circuitos...</span>
          </div>
        ) : circuits.length === 0 ? (
          <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <p className="font-semibold">No tienes circuitos guardados aún.</p>
            <p className="text-xs mt-1">Crea un circuito y presiona "Guardar Nuevo"</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {circuits.map(c => (
              <div key={c.id} className="group flex items-center justify-between bg-gray-800/80 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition-all shadow-sm">
                <div>
                  <h3 className="font-semibold text-lg text-gray-100 group-hover:text-blue-400 transition-colors">{c.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Última mod: {new Date(c.updatedAt).toLocaleDateString()} a las {new Date(c.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleLoad(c.id)} className="flex items-center gap-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-sm font-medium rounded-lg transition-colors border border-blue-600/30 hover:border-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Cargar
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="flex items-center justify-center p-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-red-600" title="Eliminar circuito">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitManagerModal;
