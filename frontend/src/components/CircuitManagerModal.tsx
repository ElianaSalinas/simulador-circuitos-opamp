import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import type { RootState } from '../store';
import { loadCircuitData, setCircuitMetadata } from '../store/circuitSlice';

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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cargar el circuito');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este circuito?')) return;
    try {
      await api.deleteCircuit(id);
      loadCircuits();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[500px] text-white shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">×</button>
        
        <h2 className="text-xl font-bold mb-4">Mis Circuitos</h2>

        {error && <div className="p-2 mb-4 bg-red-500/20 border border-red-500/50 text-red-400 text-sm rounded">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-400 py-8">Cargando...</div>
        ) : circuits.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border border-dashed border-gray-700 rounded">
            No tienes circuitos guardados aún.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {circuits.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-700 hover:border-gray-500 transition-colors">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-xs text-gray-500">Última mod: {new Date(c.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleLoad(c.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors">
                    Cargar
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors">
                    Borrar
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
