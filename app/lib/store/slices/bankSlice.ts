import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TransactionType = 'gasto' | 'prestamo';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // ISO string
  createdAt: string;
  lenderName?: string; // Para préstamos: quien prestó
  borrowerName?: string; // Para préstamos: quien recibió
}

interface BankState {
  transactions: Transaction[];
  monthlySpent: number;
}

const initialState: BankState = {
  transactions: [],
  monthlySpent: 0,
};

const bankSlice = createSlice({
  name: 'bank',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
      if (action.payload.type === 'gasto') {
        state.monthlySpent += action.payload.amount;
      }
    },
    clearMonthlySpent: (state) => {
      state.monthlySpent = 0;
    },
  },
});

export const { addTransaction, clearMonthlySpent } = bankSlice.actions;
export default bankSlice.reducer;
