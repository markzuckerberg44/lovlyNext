'use client';

import { useState } from 'react';
import BottomNavBar from '../molecules/BottomNavBar';

type HealthEntry = {
  id: string;
  type: 'ovulacion' | 'periodo' | 'anticonceptivo' | 'intimidad';
  date: Date;
};

type HealthType = 'ovulacion' | 'periodo' | 'anticonceptivo' | 'intimidad';

export default function WellnessTemplate() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [healthHistory, setHealthHistory] = useState<HealthEntry[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showError, setShowError] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const healthOptions: { type: HealthType; label: string; color: string }[] = [
    { type: 'ovulacion', label: 'Ovulación', color: 'bg-blue-500' },
    { type: 'periodo', label: 'Periodo', color: 'bg-red-500' },
    { type: 'anticonceptivo', label: 'Anticonceptivo', color: 'bg-green-500' },
    { type: 'intimidad', label: 'Intimidad', color: 'bg-pink-500' },
  ];

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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
    if (selectedDates.length === 0) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } else {
      setShowPopup(true);
    }
  };

  const handleSelectHealthType = (type: HealthType) => {
    selectedDates.forEach(date => {
      const newEntry: HealthEntry = {
        id: Date.now().toString() + Math.random(),
        type,
        date,
      };
      setHealthHistory(prev => [...prev, newEntry]);
    });
    setSelectedDates([]);
    setShowPopup(false);
  };

  const toggleDateSelection = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    
    setSelectedDates(prev => {
      const exists = prev.some(d => d.getTime() === date.getTime());
      if (exists) {
        return prev.filter(d => d.getTime() !== date.getTime());
      } else {
        return [...prev, date];
      }
    });
  };

  const isDateSelected = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    return selectedDates.some(d => d.getTime() === date.getTime());
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
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      days.push(
        <button
          key={day}
          onClick={() => toggleDateSelection(day)}
          className={`h-12 flex items-center justify-center rounded-lg text-base font-medium transition-all ${
            isSelected
              ? 'bg-gray-900 text-white'
              : 'text-gray-800 hover:bg-gray-200'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const getTypeLabel = (type: HealthType) => {
    return healthOptions.find(opt => opt.type === type)?.label || type;
  };

  const getTypeColor = (type: HealthType) => {
    return healthOptions.find(opt => opt.type === type)?.color || 'bg-gray-500';
  };

  const sortedHistory = [...healthHistory].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <div className="max-w-screen-xl mx-auto p-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Salud y bienestar
          </h1>
          <p className="text-sm text-gray-600">
            Click aquí para ingresar fechas de ovulación,<br />
            periodo, intimidad o anticonceptivos
          </p>
        </div>

        {/* Error Message */}
        {showError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center animate-pulse">
            Por favor selecciona al menos una fecha en el calendario
          </div>
        )}

        {/* Add Date Button */}
        <button
          onClick={handleAddDate}
          className={`w-full py-4 rounded-2xl text-white text-lg font-semibold mb-6 transition-all ${
            selectedDates.length > 0
              ? 'bg-pink-500 hover:bg-pink-600'
              : 'bg-pink-300'
          }`}
        >
          Agregar fecha
        </button>

        {/* Calendar */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          {/* Month/Year Selector */}
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

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </div>

        {/* History Section */}
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gray-300" />
            <h2 className="text-base font-medium text-gray-600">
              Historial de salud
            </h2>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="space-y-3">
            {sortedHistory.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-gray-400 text-sm">
                  No hay registros agregados aún
                </p>
              </div>
            ) : (
              sortedHistory.map(entry => (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4"
                >
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(entry.type)}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{getTypeLabel(entry.type)}</p>
                    <p className="text-sm text-gray-500">
                      {entry.date.toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              ¿Qué deseas agregar?
            </h3>
            
            <div className="space-y-3 mb-6">
              {healthOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => handleSelectHealthType(option.type)}
                  className="w-full py-4 px-6 bg-gray-50 hover:bg-gray-100 rounded-xl text-left font-medium text-gray-900 transition-all flex items-center gap-3"
                >
                  <div className={`w-4 h-4 rounded-full ${option.color}`} />
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}