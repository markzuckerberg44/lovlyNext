import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type HealthEntryType = 'ovulacion' | 'periodo' | 'anticonceptivo' | 'intimidad';

export interface HealthEntry {
  id: string;
  type: HealthEntryType;
  date: string; // ISO string format for serialization
  usedCondom?: boolean;
  note?: string;
  contraceptiveMethod?: string;
}

interface WellnessState {
  healthHistory: HealthEntry[];
}

const initialState: WellnessState = {
  healthHistory: [],
};

const wellnessSlice = createSlice({
  name: 'wellness',
  initialState,
  reducers: {
    addHealthEntry: (state, action: PayloadAction<HealthEntry>) => {
      state.healthHistory.push(action.payload);
    },
    removeHealthEntry: (state, action: PayloadAction<string>) => {
      state.healthHistory = state.healthHistory.filter(
        entry => entry.id !== action.payload
      );
    },
    clearHealthHistory: (state) => {
      state.healthHistory = [];
    },
  },
});

export const { addHealthEntry, removeHealthEntry, clearHealthHistory } = wellnessSlice.actions;
export default wellnessSlice.reducer;
