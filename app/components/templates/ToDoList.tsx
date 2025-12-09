'use client';

import { useState } from 'react';
import BottomNavBar from '../molecules/BottomNavBar';
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks';
import { addPanorama, updatePanoramaStatus, type Panorama, type PanoramaStatus } from '@/app/lib/store/slices/panoramaSlice';

export default function ToDoListTemplate() {
  const dispatch = useAppDispatch();
  const panoramas = useAppSelector((state) => state.panorama.panoramas);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PanoramaStatus>('todo');
  const [newPanorama, setNewPanorama] = useState({
    name: '',
    description: '',
    date: '',
  });

  const handleAddPanorama = () => {
    if (newPanorama.name.trim() && newPanorama.description.trim()) {
      const panorama: Panorama = {
        id: Date.now().toString() + Math.random(),
        name: newPanorama.name.trim(),
        description: newPanorama.description.trim(),
        date: newPanorama.date || undefined,
        status: 'todo',
        createdAt: new Date().toISOString(),
      };
      dispatch(addPanorama(panorama));
      setNewPanorama({ name: '', description: '', date: '' });
      setShowAddPopup(false);
    }
  };

  const handleStatusChange = (id: string, status: PanoramaStatus) => {
    dispatch(updatePanoramaStatus({ id, status }));
  };

  const filteredPanoramas = panoramas.filter(p => p.status === selectedFilter);

  const filters: { status: PanoramaStatus; label: string }[] = [
    { status: 'todo', label: 'To do' },
    { status: 'doing', label: 'Haciendo' },
    { status: 'done', label: 'Hecho' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20 pt-12">
      <div className="max-w-screen-xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panoramas
          </h1>
          <button
            onClick={() => setShowAddPopup(true)}
            className="w-12 h-12 bg-teal-500 hover:bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-light transition-all shadow-lg"
          >
            +
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          {filters.map(filter => (
            <button
              key={filter.status}
              onClick={() => setSelectedFilter(filter.status)}
              className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
                selectedFilter === filter.status
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Panoramas List */}
        <div className="space-y-4">
          {filteredPanoramas.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
              <p className="text-gray-400 text-sm">
                No hay panoramas en esta categoría
              </p>
            </div>
          ) : (
            filteredPanoramas.map(panorama => (
              <div
                key={panorama.id}
                className="bg-white rounded-3xl shadow-sm p-6 flex gap-4"
              >
                <div className="w-1 bg-teal-500 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {panorama.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {panorama.description}
                  </p>
                  {panorama.date && (
                    <p className="text-xs text-gray-500 mb-3">
                      📅 {new Date(panorama.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                  
                  {/* Status Buttons */}
                  <div className="flex gap-2">
                    {panorama.status !== 'todo' && (
                      <button
                        onClick={() => handleStatusChange(panorama.id, 'todo')}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium text-gray-700 transition-all"
                      >
                        To do
                      </button>
                    )}
                    {panorama.status !== 'doing' && (
                      <button
                        onClick={() => handleStatusChange(panorama.id, 'doing')}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg text-xs font-medium text-blue-700 transition-all"
                      >
                        Haciendo
                      </button>
                    )}
                    {panorama.status !== 'done' && (
                      <button
                        onClick={() => handleStatusChange(panorama.id, 'done')}
                        className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg text-xs font-medium text-green-700 transition-all"
                      >
                        Hecho
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Panorama Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Agregar Panorama
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newPanorama.name}
                  onChange={(e) => setNewPanorama({ ...newPanorama, name: e.target.value })}
                  placeholder="Nombre del panorama"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:opacity-40 text-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Descripción
                </label>
                <textarea
                  value={newPanorama.description}
                  onChange={(e) => setNewPanorama({ ...newPanorama, description: e.target.value })}
                  placeholder="Breve descripción de la tarea"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:opacity-40 text-gray-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fecha (opcional)
                </label>
                <input
                  type="date"
                  value={newPanorama.date}
                  onChange={(e) => setNewPanorama({ ...newPanorama, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddPopup(false);
                  setNewPanorama({ name: '', description: '', date: '' });
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPanorama}
                disabled={!newPanorama.name.trim() || !newPanorama.description.trim()}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  newPanorama.name.trim() && newPanorama.description.trim()
                    ? 'bg-teal-500 hover:bg-teal-600'
                    : 'bg-teal-300 cursor-not-allowed'
                }`}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}