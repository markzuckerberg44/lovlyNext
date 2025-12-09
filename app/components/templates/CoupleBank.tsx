'use client';

import { useState } from 'react';
import Image from 'next/image';
import BottomNavBar from '../molecules/BottomNavBar';
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks';
import { addTransaction, type Transaction, type TransactionType } from '@/app/lib/store/slices/bankSlice';

export default function CoupleBankTemplate() {
  const dispatch = useAppDispatch();
  const { transactions, monthlySpent } = useAppSelector((state) => state.bank);
  const { couple } = useAppSelector((state) => state.profile);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('gasto');
  const [loanDirection, setLoanDirection] = useState<'right' | 'left'>('right'); // right: partner1 -> partner2, left: partner2 -> partner1
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
  });

  const handleAddTransaction = () => {
    if (newTransaction.amount && newTransaction.description.trim()) {
      const transaction: Transaction = {
        id: Date.now().toString() + Math.random(),
        type: transactionType,
        amount: parseFloat(newTransaction.amount),
        description: newTransaction.description.trim(),
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        ...(transactionType === 'prestamo' && {
          lenderName: loanDirection === 'right' ? couple.partner1Name : couple.partner2Name,
          borrowerName: loanDirection === 'right' ? couple.partner2Name : couple.partner1Name,
        }),
      };
      dispatch(addTransaction(transaction));
      setNewTransaction({ amount: '', description: '' });
      setLoanDirection('right');
      setShowAddPopup(false);
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20 pt-12">
      <div className="max-w-screen-xl mx-auto px-6">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Piggy Bank
        </h1>

        {/* Monthly Spent Display */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Este mes han gastado:
          </p>
          <p className="text-5xl font-bold text-gray-900">
            ${monthlySpent.toLocaleString('es-CL')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setTransactionType('gasto');
              setShowAddPopup(true);
            }}
            className="flex-1 py-3 bg-white hover:bg-gray-50 rounded-4xl text-gray-700 text-sm font-medium transition-all shadow-sm"
          >
            Añadir gasto
          </button>
          <button
            onClick={() => {
              setTransactionType('prestamo');
              setShowAddPopup(true);
            }}
            className="flex-1 py-3 bg-white hover:bg-gray-50 rounded-4xl text-gray-700 text-sm font-medium transition-all shadow-sm"
          >
            Añadir préstamo
          </button>
        </div>

        {/* Quote Card */}
        <div className="bg-gray-800 rounded-3xl p-6 mb-6 flex items-center justify-between">
          <p className="text-white text-base flex-1 pr-4">
            El amor no tiene precio, pero el resto de las cosas sí. Organícense aquí.
          </p>
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src="/money-sack.png"
              alt="Money Sack"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>

        {/* History Section */}
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gray-300" />
            <h2 className="text-base font-medium text-gray-600">
              Historial de movimientos
            </h2>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="space-y-3">
            {sortedTransactions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-gray-400 text-sm">
                  No hay movimientos registrados aún
                </p>
              </div>
            ) : (
              sortedTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-2xl shadow-sm p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'gasto' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {transaction.type === 'gasto' ? '-' : '+'}${transaction.amount.toLocaleString('es-CL')}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {transaction.type}
                      </p>
                      {transaction.lenderName && transaction.borrowerName && (
                        <p className="text-xs text-gray-400 mt-1">
                          {transaction.lenderName} → {transaction.borrowerName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              {transactionType === 'gasto' ? 'Añadir Gasto' : 'Añadir Préstamo'}
            </h3>
            
            <div className="space-y-4 mb-6">
              {transactionType === 'prestamo' && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                    ¿Quién le prestó a quién?
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {/* Partner 1 Button */}
                    <div className="flex-1 py-3 px-4 bg-pink-100 rounded-xl text-center font-medium text-pink-700">
                      {couple.partner1Name}
                    </div>
                    
                    {/* Arrow Button */}
                    <button
                      onClick={() => setLoanDirection(prev => prev === 'right' ? 'left' : 'right')}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
                    >
                      <svg 
                        className={`w-6 h-6 text-gray-700 transition-transform ${
                          loanDirection === 'left' ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                    
                    {/* Partner 2 Button */}
                    <div className="flex-1 py-3 px-4 bg-pink-100 rounded-xl text-center font-medium text-pink-700">
                      {couple.partner2Name}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {loanDirection === 'right' 
                      ? `${couple.partner1Name} le presta a ${couple.partner2Name}`
                      : `${couple.partner2Name} le presta a ${couple.partner1Name}`
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Monto *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:opacity-40 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder={transactionType === 'gasto' ? "¿En qué se gastó?" : "Motivo del préstamo"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:opacity-40 text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddPopup(false);
                  setNewTransaction({ amount: '', description: '' });
                  setLoanDirection('right');
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTransaction}
                disabled={!newTransaction.amount || !newTransaction.description.trim()}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  newTransaction.amount && newTransaction.description.trim()
                    ? 'bg-pink-500 hover:bg-pink-600'
                    : 'bg-pink-300 cursor-not-allowed'
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