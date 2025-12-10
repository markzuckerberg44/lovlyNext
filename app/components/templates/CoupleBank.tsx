'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import BottomNavBar from '../molecules/BottomNavBar';

type TransactionType = 'gasto' | 'prestamo';

interface Expense {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
  user_id: string;
  created_at: string;
}

interface Loan {
  id: string;
  amount: number;
  description: string | null;
  loan_date: string;
  lender_user_id: string;
  borrower_user_id: string;
  settled: boolean;
  settled_at: string | null;
  created_at: string;
  lender: { display_name: string } | null;
  borrower: { display_name: string } | null;
  total_paid?: number;
}

interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  payer: { display_name: string } | null;
}

interface CouplePartner {
  user_id: string;
  display_name: string | null;
}

export default function CoupleBankTemplate() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [couplePartners, setCouplePartners] = useState<CouplePartner[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('gasto');
  const [loanDirection, setLoanDirection] = useState<'right' | 'left'>('right');
  const [isLoading, setIsLoading] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadExpenses(), loadLoans(), loadCoupleInfo()]);
  };

  const loadExpenses = async () => {
    try {
      const res = await fetch('/api/bank/expenses', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.data || []);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadLoans = async () => {
    try {
      const res = await fetch('/api/bank/loans', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const loansWithPayments = await Promise.all(
          (data.data || []).map(async (loan: Loan) => {
            const paymentsRes = await fetch(`/api/bank/loan-payments?loan_id=${loan.id}`, { credentials: 'include' });
            if (paymentsRes.ok) {
              const paymentsData = await paymentsRes.json();
              const totalPaid = (paymentsData.data || []).reduce((sum: number, p: LoanPayment) => sum + Number(p.amount), 0);
              return { ...loan, total_paid: totalPaid };
            }
            return { ...loan, total_paid: 0 };
          })
        );
        setLoans(loansWithPayments);
      }
    } catch (error) {
      console.error('Error loading loans:', error);
    }
  };

  const loadCoupleInfo = async () => {
    try {
      const res = await fetch('/api/profile/couple', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCouplePartners(data.partners || []);
        setCurrentUserId(data.currentUserId || '');
      }
    } catch (error) {
      console.error('Error loading couple info:', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description.trim()) return;
    
    setIsLoading(true);
    try {
      if (transactionType === 'gasto') {
        const res = await fetch('/api/bank/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: parseFloat(newTransaction.amount),
            description: newTransaction.description.trim(),
            expense_date: new Date().toISOString().split('T')[0]
          })
        });
        if (res.ok) {
          await loadExpenses();
        }
      } else {
        // Determinar borrower según loanDirection
        const currentPartner = couplePartners.find(p => p.user_id === currentUserId);
        const otherPartner = couplePartners.find(p => p.user_id !== currentUserId);
        
        // Si direction es 'right', el usuario actual presta (borrower es el otro)
        // Si direction es 'left', el otro presta (pero la API siempre usa current como lender, así que invertimos)
        const borrower_user_id = loanDirection === 'right' ? otherPartner?.user_id : currentUserId;
        const lender_user_id = loanDirection === 'right' ? currentUserId : otherPartner?.user_id;
        
        const res = await fetch('/api/bank/loans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            borrower_user_id,
            lender_user_id,
            amount: parseFloat(newTransaction.amount),
            description: newTransaction.description.trim()
          })
        });
        if (res.ok) {
          await loadLoans();
        }
      }
      setNewTransaction({ amount: '', description: '' });
      setLoanDirection('right');
      setShowAddPopup(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayLoan = async () => {
    if (!selectedLoan || !paymentAmount) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/bank/loan-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          loan_id: selectedLoan.id,
          amount: parseFloat(paymentAmount)
        })
      });
      
      if (res.ok) {
        await loadLoans();
        setShowPaymentPopup(false);
        setSelectedLoan(null);
        setPaymentAmount('');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error paying loan:', error);
      alert('Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const monthlySpent = expenses
    .filter(e => {
      const expenseDate = new Date(e.expense_date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  type CombinedTransaction = {
    id: string;
    type: 'gasto' | 'prestamo';
    amount: number;
    description: string;
    date: string;
    lenderName?: string;
    borrowerName?: string;
    settled?: boolean;
    lenderUserId?: string;
    borrowerUserId?: string;
    remainingDebt?: number;
  };

  const combinedTransactions: CombinedTransaction[] = [
    ...expenses.map(e => ({
      id: e.id,
      type: 'gasto' as const,
      amount: Number(e.amount),
      description: e.description,
      date: e.expense_date
    })),
    ...loans.map(l => ({
      id: l.id,
      type: 'prestamo' as const,
      amount: Number(l.amount),
      description: l.description || '',
      date: l.loan_date,
      lenderName: l.lender?.display_name || 'Usuario',
      borrowerName: l.borrower?.display_name || 'Usuario',
      settled: l.settled,
      lenderUserId: l.lender_user_id,
      borrowerUserId: l.borrower_user_id,
      remainingDebt: Number(l.amount) - (l.total_paid || 0)
    }))
  ];

  const sortedTransactions = combinedTransactions.sort((a, b) => 
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
                        {transaction.type === 'gasto' ? 'gasto' : (transaction.settled ? 'préstamo pagado' : 'préstamo')}
                      </p>
                      {transaction.type === 'prestamo' && !transaction.settled && transaction.remainingDebt !== undefined && (
                        <p className="text-xs text-orange-600 font-semibold mt-1">
                          Deuda: ${transaction.remainingDebt.toLocaleString('es-CL')}
                        </p>
                      )}
                      {transaction.lenderName && transaction.borrowerName && (
                        <p className="text-xs text-gray-400 mt-1">
                          {transaction.lenderName} → {transaction.borrowerName}
                        </p>
                      )}
                    </div>
                  </div>
                  {transaction.type === 'prestamo' && !transaction.settled && transaction.borrowerUserId === currentUserId && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          const loan = loans.find(l => l.id === transaction.id);
                          if (loan) {
                            setSelectedLoan(loan);
                            setShowPaymentPopup(true);
                          }
                        }}
                        className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all"
                      >
                        Pagar préstamo
                      </button>
                    </div>
                  )}
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
                    {/* Partner 1 */}
                    <div className="flex-1 py-3 px-4 bg-pink-100 rounded-xl text-center font-medium text-pink-700">
                      {couplePartners.find(p => p.user_id === currentUserId)?.display_name || 'Tú'}
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
                    
                    {/* Partner 2 */}
                    <div className="flex-1 py-3 px-4 bg-pink-100 rounded-xl text-center font-medium text-pink-700">
                      {couplePartners.find(p => p.user_id !== currentUserId)?.display_name || 'Pareja'}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {loanDirection === 'right' 
                      ? `${couplePartners.find(p => p.user_id === currentUserId)?.display_name || 'Tú'} le presta a ${couplePartners.find(p => p.user_id !== currentUserId)?.display_name || 'tu pareja'}`
                      : `${couplePartners.find(p => p.user_id !== currentUserId)?.display_name || 'Tu pareja'} te presta a ti`
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
                disabled={!newTransaction.amount || !newTransaction.description.trim() || isLoading}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  newTransaction.amount && newTransaction.description.trim() && !isLoading
                    ? 'bg-pink-500 hover:bg-pink-600'
                    : 'bg-pink-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Popup */}
      {showPaymentPopup && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Pagar Préstamo
            </h3>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Monto total:</span>
                <span className="text-lg font-bold text-gray-900">
                  ${Number(selectedLoan.amount).toLocaleString('es-CL')}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Ya pagado:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${(selectedLoan.total_paid || 0).toLocaleString('es-CL')}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Deuda restante:</span>
                  <span className="text-xl font-bold text-orange-600">
                    ${(Number(selectedLoan.amount) - (selectedLoan.total_paid || 0)).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Monto a pagar *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full py-3 pl-8 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setPaymentAmount(((Number(selectedLoan.amount) - (selectedLoan.total_paid || 0)) / 2).toString())}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-all"
                  >
                    Pagar mitad
                  </button>
                  <button
                    onClick={() => setPaymentAmount((Number(selectedLoan.amount) - (selectedLoan.total_paid || 0)).toString())}
                    className="flex-1 py-2 bg-green-100 hover:bg-green-200 rounded-lg text-xs font-medium text-green-700 transition-all"
                  >
                    Pagar todo
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentPopup(false);
                  setSelectedLoan(null);
                  setPaymentAmount('');
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayLoan}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || isLoading}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                  paymentAmount && parseFloat(paymentAmount) > 0 && !isLoading
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-green-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Procesando...' : 'Confirmar pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}