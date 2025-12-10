'use client';

import { useEffect, useState } from 'react';
import BottomNavBar from '../molecules/BottomNavBar';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface IntimacyEvent {
  id: string;
  event_date: string;
  used_condom: boolean;
  notes: string | null;
}

interface CyclePhase {
  id: string;
  phase_type: 'period' | 'ovulation';
  start_date: string;
  end_date: string | null;
  user_id: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
}

interface Loan {
  id: string;
  amount: number;
  description: string | null;
  loan_date: string;
  settled: boolean;
}

interface ContraceptiveEvent {
  id: string;
  event_date: string;
  method: string | null;
  notes: string | null;
}

export default function HomePageTemplate() {
  const [intimacyEvents, setIntimacyEvents] = useState<IntimacyEvent[]>([]);
  const [cyclePhases, setCyclePhases] = useState<CyclePhase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [contraceptiveEvents, setContraceptiveEvents] = useState<ContraceptiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const intimacyRes = await fetch('/api/wellness/intimacy', {
        credentials: 'include',
      });
      if (intimacyRes.ok) {
        const intimacyData = await intimacyRes.json();
        setIntimacyEvents(intimacyData.data || []);
      }

      const cycleRes = await fetch('/api/wellness/cycle-phases', {
        credentials: 'include',
      });
      if (cycleRes.ok) {
        const cycleData = await cycleRes.json();
        setCyclePhases(cycleData.data || []);
      }

      const expensesRes = await fetch('/api/bank/expenses', {
        credentials: 'include',
      });
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData.data || []);
      }

      const loansRes = await fetch('/api/bank/loans', {
        credentials: 'include',
      });
      if (loansRes.ok) {
        const loansData = await loansRes.json();
        setLoans(loansData.data || []);
      }

      const contraceptiveRes = await fetch('/api/wellness/contraceptive', {
        credentials: 'include',
      });
      if (contraceptiveRes.ok) {
        const contraceptiveData = await contraceptiveRes.json();
        setContraceptiveEvents(contraceptiveData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const getPeriodFrequencyData = () => {
    const monthsLabels: string[] = [];
    const monthsCounts: number[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      monthsLabels.push(monthName);
      
      const count = cyclePhases.filter(phase => {
        if (phase.phase_type !== 'period') return false;
        const phaseDate = new Date(phase.start_date);
        return phaseDate.getMonth() === date.getMonth() && 
               phaseDate.getFullYear() === date.getFullYear();
      }).length;
      
      monthsCounts.push(count);
    }

    return {
      labels: monthsLabels,
      datasets: [
        {
          label: 'Frecuencia de Periodos',
          data: monthsCounts,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 40,
        },
      ],
    };
  };


  const getIntimacyFrequencyData = () => {
    // Obtener últimos 6 meses
    const monthsLabels: string[] = [];
    const monthsCounts: number[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      monthsLabels.push(monthName);
      
      // Contar eventos de ese mes
      const count = intimacyEvents.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      }).length;
      
      monthsCounts.push(count);
    }

    return {
      labels: monthsLabels,
      datasets: [
        {
          label: 'Frecuencia de Intimidad',
          data: monthsCounts,
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgb(236, 72, 153)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} ${context.parsed.y === 1 ? 'vez' : 'veces'}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} ${context.parsed.y === 1 ? 'periodo' : 'periodos'}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Procesar datos para el gráfico de torta de gastos y préstamos
  const getExpensesLoansData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar gastos del mes actual
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Filtrar préstamos del mes actual
    const monthlyLoans = loans.filter(loan => {
      const loanDate = new Date(loan.loan_date);
      return loanDate.getMonth() === currentMonth && loanDate.getFullYear() === currentYear;
    });

    const totalExpenses = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const totalLoans = monthlyLoans.reduce((sum, loan) => sum + Number(loan.amount), 0);

    return {
      labels: ['Gastos', 'Préstamos'],
      datasets: [
        {
          data: [totalExpenses, totalLoans],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', // Azul para gastos
            'rgba(251, 146, 60, 0.8)', // Naranja para préstamos
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(251, 146, 60)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Procesar datos para gráfico con Tick Configuration (Intimidad y Anticonceptivos)
  const getWellnessTickData = () => {
    const labels: (string | string[])[] = [];
    const intimacyCounts: number[] = [];
    const contraceptiveCounts: number[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
      const year = date.getFullYear().toString();
      
      // Para el primer mes, agregar como array [mes, año]
      if (i === 11) {
        labels.push([monthName.charAt(0).toUpperCase() + monthName.slice(1), year]);
      } else {
        labels.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
      }
      
      // Contar eventos de intimidad
      const intimacyCount = intimacyEvents.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      }).length;
      intimacyCounts.push(intimacyCount);
      
      // Contar eventos de anticonceptivos
      const contraceptiveCount = contraceptiveEvents.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      }).length;
      contraceptiveCounts.push(contraceptiveCount);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Intimidad',
          data: intimacyCounts,
          fill: false,
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Anticonceptivos',
          data: contraceptiveCounts,
          fill: false,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  const wellnessTickOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Frecuencia de Intimidad y Anticonceptivos',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1f2937',
        padding: {
          bottom: 20,
        },
      },
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} ${context.parsed.y === 1 ? 'vez' : 'veces'}`;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function(this: any, val: any, index: number, ticks: any[]): string {
            // Mostrar solo cada 2do label para evitar aglomeración
            const labels: any = this.chart.data.labels;
            return index % 2 === 0 ? (Array.isArray(labels[index]) ? labels[index].join(' ') : labels[index]) : '';
          },
          color: '#ef4444',
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 13,
          },
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: $${value.toLocaleString('es-ES')}`;
          }
        }
      },
    },
  };

  // Procesar datos para scatter plot de periodos
  const getPeriodScatterData = () => {
    const scatterData: { x: number; y: number }[] = [];
    
    // Filtrar solo periodos
    const periods = cyclePhases.filter(phase => phase.phase_type === 'period');
    
    periods.forEach((period) => {
      const startDate = new Date(period.start_date);
      const endDate = period.end_date ? new Date(period.end_date) : new Date();
      
      // Generar puntos para cada día del periodo
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Ambos ejes usan timestamp (tiempo)
        scatterData.push({
          x: currentDate.getTime(), // Timestamp para el eje X (tiempo)
          y: currentDate.getTime(), // Timestamp para el eje Y (tiempo)
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return {
      datasets: [
        {
          label: 'Periodos',
          data: scatterData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Rangos Completos de Periodos',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1f2937',
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const date = new Date(context.parsed.x);
            const dateStr = date.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            return dateStr;
          }
        }
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          displayFormats: {
            month: 'MMM yyyy',
          },
        },
        title: {
          display: true,
          text: 'Tiempo',
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          displayFormats: {
            month: 'MMM yyyy',
          },
        },
        title: {
          display: true,
          text: 'Tiempo',
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="space-y-4">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-red-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Frecuencia de Periodos</h2>
                <p className="text-sm text-gray-500">Últimos 6 meses</p>
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">Cargando...</div>
              </div>
            ) : cyclePhases.filter(p => p.phase_type === 'period').length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">No hay datos registrados</p>
                  <p className="text-gray-300 text-xs mt-1">Comienza a registrar eventos en la sección Wellness</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <Bar data={getPeriodFrequencyData()} options={barChartOptions} />
              </div>
            )}
          </div>

          {/* Gráfico de Frecuencia de Intimidad */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-pink-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Frecuencia de Intimidad</h2>
                <p className="text-sm text-gray-500">Últimos 6 meses</p>
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">Cargando...</div>
              </div>
            ) : intimacyEvents.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">No hay datos registrados</p>
                  <p className="text-gray-300 text-xs mt-1">Comienza a registrar eventos en la sección Wellness</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <Line data={getIntimacyFrequencyData()} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Gráfico de Torta - Gastos y Préstamos Mensuales */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-purple-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" 
                  />
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gastos y Préstamos</h2>
                <p className="text-sm text-gray-500">Mes actual</p>
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">Cargando...</div>
              </div>
            ) : expenses.length === 0 && loans.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">No hay datos registrados</p>
                  <p className="text-gray-300 text-xs mt-1">Comienza a registrar gastos en CoupleBank</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <Doughnut data={getExpensesLoansData()} options={doughnutOptions} />
              </div>
            )}
          </div>

          {/* Gráfico con Tick Configuration - Intimidad y Anticonceptivos */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-400">Cargando...</div>
              </div>
            ) : intimacyEvents.length === 0 && contraceptiveEvents.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">No hay datos registrados</p>
                  <p className="text-gray-300 text-xs mt-1">Registra eventos en Wellness</p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <Line data={getWellnessTickData()} options={wellnessTickOptions} />
              </div>
            )}
          </div>

          {/* Gráfico Scatter Plot - Rangos de Periodos */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-400">Cargando...</div>
              </div>
            ) : cyclePhases.filter(p => p.phase_type === 'period').length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">No hay periodos registrados</p>
                  <p className="text-gray-300 text-xs mt-1">Registra periodos en Wellness</p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <Scatter data={getPeriodScatterData()} options={scatterOptions} />
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}