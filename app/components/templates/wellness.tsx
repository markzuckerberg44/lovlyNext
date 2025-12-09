'use client';

import { useState, useEffect } from 'react';
import BottomNavBar from '../molecules/BottomNavBar';

type HealthType = 'ovulacion' | 'periodo' | 'anticonceptivo' | 'intimidad';

interface CyclePhase {
  id: string;
  phase_type: 'period' | 'ovulation';
  start_date: string;
  end_date: string | null;
  user_id: string;
}

interface IntimacyEvent {
  id: string;
  event_date: string;
  used_condom: boolean;
  notes: string | null;
}

interface ContraceptiveEvent {
  id: string;
  event_date: string;
  method: string | null;
}

export default function WellnessTemplate() {
  const [cyclePhases, setCyclePhases] = useState<CyclePhase[]>([]);
  const [intimacyEvents, setIntimacyEvents] = useState<IntimacyEvent[]>([]);
  const [contraceptiveEvents, setContraceptiveEvents] = useState<ContraceptiveEvent[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showIntimacyPopup, setShowIntimacyPopup] = useState(false);
  const [showContraceptivePopup, setShowContraceptivePopup] = useState(false);
  const [usedCondom, setUsedCondom] = useState<boolean | null>(null);
  const [intimacyNote, setIntimacyNote] = useState('');
  const [contraceptiveMethod, setContraceptiveMethod] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Por favor selecciona al menos una fecha en el calendario');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const healthOptions: { type: HealthType; label: string; color: string }[] = [
    { type: 'ovulacion', label: 'Ovulación', color: 'bg-blue-500' },
    { type: 'periodo', label: 'Periodo', color: 'bg-red-500' },
    { type: 'anticonceptivo', label: 'Anticonceptivo', color: 'bg-green-500' },
    { type: 'intimidad', label: 'Intimidad', color: 'bg-pink-500' },
  ];

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    const cycleRes = await fetch('/api/wellness/cycle-phases', {
      credentials: 'include',
    });
    if (cycleRes.ok) {
      const cycleData = await cycleRes.json();
      setCyclePhases(cycleData.data || []);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handleAddDate = () => {
    if (!selectedDate) {
      setErrorMessage('Por favor selecciona al menos una fecha en el calendario');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } else {
      setShowPopup(true);
    }
  };

  const handleSelectHealthType = async (type: HealthType) => {
    if (type === 'intimidad') {
      setShowPopup(false);
      setShowIntimacyPopup(true);
    } else if (type === 'anticonceptivo') {
      setShowPopup(false);
      setShowContraceptivePopup(true);
    } else {
      const activePhase = cyclePhases.find(phase => !phase.end_date);

      if (activePhase) {
        const activePhaseLabel = activePhase.phase_type === 'period' ? 'periodo' : 'periodo de ovulación';
        setErrorMessage(`Ya tienes un ${activePhaseLabel} activo. Finalízalo antes de agregar otro.`);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        setShowPopup(false);
        return;
      }

      if (selectedDate && !isLoading) {
        setIsLoading(true);
        try {
          await fetch('/api/wellness/cycle-phases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              phase_type: type === 'ovulacion' ? 'ovulation' : 'period',
              start_date: selectedDate.toISOString().split('T')[0],
            }),
          });
          await loadHealthData();
        } finally {
          setIsLoading(false);
        }
      }
      setSelectedDate(null);
      setShowPopup(false);
    }
  };

  const handleEndPhase = async (phaseId: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await fetch('/api/wellness/cycle-phases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: phaseId,
          end_date: today,
        }),
      });
      await loadHealthData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContraceptive = async () => {
    if (contraceptiveMethod.trim() && selectedDate && !isLoading) {
      setIsLoading(true);
      try {
        await fetch('/api/wellness/contraceptive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            event_date: selectedDate.toISOString().split('T')[0],
            method: contraceptiveMethod.trim(),
          }),
        });
        await loadHealthData();
        setSelectedDate(null);
        setShowContraceptivePopup(false);
        setContraceptiveMethod('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelContraceptive = () => {
    setShowContraceptivePopup(false);
    setContraceptiveMethod('');
    setShowPopup(true);
  };

  const handleSaveIntimacy = async () => {
    if (selectedDate && !isLoading) {
      setIsLoading(true);
      try {
        await fetch('/api/wellness/intimacy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            event_date: selectedDate.toISOString().split('T')[0],
            used_condom: usedCondom ?? false,
            notes: intimacyNote.trim() || null,
          }),
        });
        await loadHealthData();
        setSelectedDate(null);
        setShowIntimacyPopup(false);
        setUsedCondom(null);
        setIntimacyNote('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelIntimacy = () => {
    setShowIntimacyPopup(false);
    setUsedCondom(null);
    setIntimacyNote('');
    setShowPopup(true);
  };

  const toggleDateSelection = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    
    setSelectedDate(prev => {
      if (prev && prev.getTime() === date.getTime()) {
        return null;
      } else {
        return date;
      }
    });
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    return selectedDate.getTime() === date.getTime();
  };

  const getDatePhaseColor = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    for (const phase of cyclePhases) {
      const startDate = new Date(phase.start_date + 'T00:00:00');
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = phase.end_date ? new Date(phase.end_date + 'T00:00:00') : new Date();
      endDate.setHours(0, 0, 0, 0);
      
      if (date >= startDate && date <= endDate) {
        return phase.phase_type === 'period' ? 'bg-red-200 border-2 border-red-500 text-gray-900' : 'bg-blue-200 border-2 border-blue-500 text-gray-900';
      }
    }
    return '';
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const renderCalendar = () => {
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const phaseColor = getDatePhaseColor(day);
      days.push(
        <button
          key={day}
          onClick={() => toggleDateSelection(day)}
          className={`h-12 flex items-center justify-center rounded-lg text-base font-medium transition-all ${
            isSelected
              ? 'bg-gray-900 text-white'
              : phaseColor || 'text-gray-800 hover:bg-gray-200'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const getPhaseLabel = (phaseType: 'period' | 'ovulation') => {
    return phaseType === 'period' ? 'Periodo' : 'Ovulación';
  };

  const getPhaseColor = (phaseType: 'period' | 'ovulation') => {
    return phaseType === 'period' ? 'bg-red-500' : 'bg-blue-500';
  };

  const sortedPhases = [...cyclePhases].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <div className="max-w-screen-xl mx-auto p-6">
        
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Salud y bienestar
          </h1>
          <p className="text-sm text-gray-600">
            Click aquí para ingresar fechas de ovulación,<br />
            periodo, intimidad o anticonceptivos
          </p>
        </div>

        
        {showError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center animate-pulse">
            {errorMessage}
          </div>
        )}

        
        <button
          onClick={handleAddDate}
          className={`w-full py-4 rounded-2xl text-white text-lg font-semibold mb-6 transition-all ${
            selectedDate
              ? 'bg-pink-500 hover:bg-pink-600'
              : 'bg-pink-300'
          }`}
        >
          Agregar fecha
        </button>

        
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(parseInt(e.target.value));
                  setCurrentMonth(newDate);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-base font-medium bg-white"
              >
                {monthNames.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={currentMonth.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(currentMonth);
                  newDate.setFullYear(parseInt(e.target.value));
                  setCurrentMonth(newDate);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-base font-medium bg-white"
              >
                {[2023, 2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </div>

        
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gray-300" />
            <h2 className="text-base font-medium text-gray-600">
              Historial de salud
            </h2>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="space-y-3">
            {sortedPhases.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-gray-400 text-sm">
                  No hay registros agregados aún
                </p>
              </div>
            ) : (
              sortedPhases.map(phase => (
                <div
                  key={phase.id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4"
                >
                  <div className={`w-3 h-3 rounded-full ${getPhaseColor(phase.phase_type)}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {getPhaseLabel(phase.phase_type)}
                      {!phase.end_date && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">
                          En curso
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Inicio: {new Date(phase.start_date).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                    {phase.end_date && (
                      <p className="text-sm text-gray-500">
                        Fin: {new Date(phase.end_date).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                  {!phase.end_date && (
                    <button
                      onClick={() => handleEndPhase(phase.id)}
                      disabled={isLoading}
                      className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-all ${
                        isLoading 
                          ? 'bg-pink-300 cursor-not-allowed' 
                          : 'bg-pink-500 hover:bg-pink-600'
                      }`}
                    >
                      {isLoading ? 'Finalizando...' : 'Finalizar'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              ¿Qué deseas agregar?
            </h3>
            
            {isLoading && (
              <div className="mb-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <p className="text-sm text-gray-600 mt-2">Guardando...</p>
              </div>
            )}
            
            <div className="space-y-3 mb-6">
              {healthOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => handleSelectHealthType(option.type)}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-xl text-left font-medium transition-all flex items-center gap-3 ${
                    isLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${option.color}`} />
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPopup(false)}
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

      {showIntimacyPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Detalles de intimidad
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  ¿Se usó condón?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setUsedCondom(true)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      usedCondom === true
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setUsedCondom(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      usedCondom === false
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nota (opcional)
                </label>
                <textarea
                  value={intimacyNote}
                  onChange={(e) => setIntimacyNote(e.target.value)}
                  placeholder="Agrega una nota..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:opacity-40 text-gray-900"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelIntimacy}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Atrás
              </button>
              <button
                onClick={handleSaveIntimacy}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  isLoading
                    ? 'bg-pink-300 cursor-not-allowed'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContraceptivePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Método anticonceptivo
            </h3>
            
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ¿Qué método usaste?
              </label>
              <input
                type="text"
                value={contraceptiveMethod}
                onChange={(e) => setContraceptiveMethod(e.target.value)}
                placeholder="Ej: Píldora, DIU, Implante..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:opacity-40 text-gray-900"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelContraceptive}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Atrás
              </button>
              <button
                onClick={handleSaveContraceptive}
                disabled={!contraceptiveMethod.trim() || isLoading}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  !contraceptiveMethod.trim() || isLoading
                    ? 'bg-pink-300 cursor-not-allowed'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}