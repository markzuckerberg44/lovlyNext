'use client';

import { useState, useEffect } from 'react';
import BottomNavBar from '../molecules/BottomNavBar';
import { FaDice, FaCalendar } from "react-icons/fa";

type TodoStatus = 'todo' | 'doing' | 'done';

interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  target_time: string | null;
  status: TodoStatus;
  completed: boolean;
  created_at: string;
}

export default function ToDoListTemplate() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showRandomPopup, setShowRandomPopup] = useState(false);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [randomTodo, setRandomTodo] = useState<TodoItem | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<TodoStatus>(() => {
    // Cargar filtro guardado al inicializar el estado
    if (typeof window !== 'undefined') {
      const savedFilter = localStorage.getItem('todoFilter');
      if (savedFilter && (savedFilter === 'todo' || savedFilter === 'doing' || savedFilter === 'done')) {
        return savedFilter as TodoStatus;
      }
    }
    return 'todo';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newTodo, setNewTodo] = useState({
    name: '',
    description: '',
    date: '',
  });

  useEffect(() => {
    localStorage.setItem('todoFilter', selectedFilter);
  }, [selectedFilter]);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const res = await fetch('/api/panoramas', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTodos(data.data || []);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const handleAddTodo = async () => {
    if (newTodo.name.trim() && newTodo.description.trim() && !isLoading) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/panoramas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: newTodo.name.trim(),
            description: newTodo.description.trim(),
            target_date: newTodo.date || null,
            target_time: null,
          }),
        });

        if (res.ok) {
          await loadTodos();
          setNewTodo({ name: '', description: '', date: '' });
          setShowAddPopup(false);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStatusChange = async (id: string, status: TodoStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/panoramas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          status,
          completed: status === 'done',
        }),
      });

      if (res.ok) {
        await loadTodos();
        setShowStatusPopup(false);
        setSelectedTodoId(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStatusPopup = (id: string) => {
    setSelectedTodoId(id);
    setShowStatusPopup(true);
  };

  const handleRandomTodo = () => {
    const todoItems = todos.filter(t => t.status === 'todo');
    if (todoItems.length === 0) {
      setShowEmptyAlert(true);
      return;
    }
    const randomIndex = Math.floor(Math.random() * todoItems.length);
    setRandomTodo(todoItems[randomIndex]);
    setShowRandomPopup(true);
  };

  const handleAcceptRandom = async () => {
    if (randomTodo && !isLoading) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/panoramas', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: randomTodo.id,
            status: 'doing',
            completed: false,
          }),
        });

        if (res.ok) {
          await loadTodos();
          setShowRandomPopup(false);
          setRandomTodo(null);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRejectRandom = () => {
    setShowRandomPopup(false);
    setRandomTodo(null);
  };

  const handleDeleteTodo = async (id: string) => {
    setTodoToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!todoToDelete) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/panoramas?id=${todoToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        await loadTodos();
        setShowDeleteConfirm(false);
        setTodoToDelete(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTodoToDelete(null);
  };

  const filteredTodos = todos.filter(t => t.status === selectedFilter);

  const filters: { status: TodoStatus; label: string }[] = [
    { status: 'todo', label: 'To do' },
    { status: 'doing', label: 'Haciendo' },
    { status: 'done', label: 'Hecho' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20 pt-12">
      <div className="max-w-screen-xl mx-auto px-6">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panoramas
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleRandomTodo}
              className="w-12 h-12 bg-teal-500 hover:bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl transition-all shadow-lg"
              title="Panorama aleatorio"
            >
              <FaDice />
            </button>
            <button
              onClick={() => setShowAddPopup(true)}
              className="w-12 h-12 bg-teal-500 hover:bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-light transition-all shadow-lg"
            >
              +
            </button>
          </div>
        </div>

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


        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
              <p className="text-gray-400 text-sm">
                No hay panoramas en esta categoría
              </p>
            </div>
          ) : (
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                className="bg-white rounded-3xl shadow-sm p-6 flex gap-4 items-start"
              >
                <div className="w-1 bg-teal-500 rounded-full flex-shrink-0 self-stretch" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {todo.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {todo.description}
                  </p>
                  {todo.target_date && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaCalendar className="w-3 h-3" />
                      {(() => {
                        const [year, month, day] = todo.target_date.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        return date.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        });
                      })()}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 items-start">
                  {(todo.status === 'todo' || todo.status === 'doing') && (
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      disabled={isLoading}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isLoading 
                          ? 'cursor-not-allowed opacity-50 bg-gray-100'
                          : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                      }`}
                      title="Eliminar panorama"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleOpenStatusPopup(todo.id)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      todo.status === 'doing' 
                        ? 'bg-yellow-400 border-yellow-400'
                        : 'border-gray-300'
                    } ${
                      isLoading 
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:border-teal-500 hover:bg-teal-50'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showStatusPopup && selectedTodoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              ¿A qué sección mover?
            </h3>
            
            {isLoading && (
              <div className="mb-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <p className="text-sm text-gray-600 mt-2">Actualizando...</p>
              </div>
            )}
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleStatusChange(selectedTodoId, 'todo')}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl text-left font-medium transition-all flex items-center gap-3 ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-gray-400" />
                To do
              </button>
              
              <button
                onClick={() => handleStatusChange(selectedTodoId, 'doing')}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl text-left font-medium transition-all flex items-center gap-3 ${
                  isLoading
                    ? 'bg-[#FFF3C5] text-blue-300 cursor-not-allowed'
                    : 'bg-[#FFF3C5] hover:bg-[#FFF4B3] text-[#CCA30D]'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[#FDC700]" />
                Haciendo
              </button>
              
              <button
                onClick={() => handleStatusChange(selectedTodoId, 'done')}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl text-left font-medium transition-all flex items-center gap-3 ${
                  isLoading
                    ? 'bg-green-50 text-green-300 cursor-not-allowed'
                    : 'bg-green-50 hover:bg-green-100 text-green-700'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-green-500" />
                Hecho
              </button>
            </div>

            <button
              onClick={() => {
                setShowStatusPopup(false);
                setSelectedTodoId(null);
              }}
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
                  value={newTodo.name}
                  onChange={(e) => setNewTodo({ ...newTodo, name: e.target.value })}
                  placeholder="Nombre del panorama"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:opacity-40 text-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Descripción *
                </label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
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
                  value={newTodo.date}
                  onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddPopup(false);
                  setNewTodo({ name: '', description: '', date: '' });
                }}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTodo}
                disabled={!newTodo.name.trim() || !newTodo.description.trim() || isLoading}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  newTodo.name.trim() && newTodo.description.trim() && !isLoading
                    ? 'bg-teal-500 hover:bg-teal-600'
                    : 'bg-teal-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}


      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Eliminar panorama
              </h3>
              <p className="text-sm text-gray-600">
                ¿Estás seguro de que quieres eliminar este panorama? Esta acción no se puede deshacer.
              </p>
            </div>

            {isLoading && (
              <div className="mb-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <p className="text-sm text-gray-600 mt-2">Eliminando...</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  isLoading
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}


      {showEmptyAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No hay panoramas
              </h3>
              <p className="text-sm text-gray-600">
                No hay panoramas en la sección "To do" para seleccionar aleatoriamente.
              </p>
            </div>

            <button
              onClick={() => setShowEmptyAlert(false)}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 rounded-xl font-medium text-white transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {showRandomPopup && randomTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
              <FaDice /> Panorama Aleatorio
            </h3>
            
            {isLoading && (
              <div className="mb-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <p className="text-sm text-gray-600 mt-2">Moviendo a Haciendo...</p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {randomTodo.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {randomTodo.description}
              </p>
              {randomTodo.target_date && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FaCalendar className="w-3 h-3" />
                  {(() => {
                    const [year, month, day] = randomTodo.target_date.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                  })()}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 text-center mb-6">
              ¿Quieres realizar este panorama en pareja?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleRejectRandom}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Rechazar
              </button>
              <button
                onClick={handleAcceptRandom}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  isLoading
                    ? 'bg-teal-300 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600'
                }`}
              >
                {isLoading ? 'Aceptando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}