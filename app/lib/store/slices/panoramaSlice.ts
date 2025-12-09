import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PanoramaStatus = 'todo' | 'doing' | 'done';

export interface Panorama {
  id: string;
  name: string;
  description: string;
  date?: string; // ISO string format
  status: PanoramaStatus;
  createdAt: string;
}

interface PanoramaState {
  panoramas: Panorama[];
}

const initialState: PanoramaState = {
  panoramas: [],
};

const panoramaSlice = createSlice({
  name: 'panorama',
  initialState,
  reducers: {
    addPanorama: (state, action: PayloadAction<Panorama>) => {
      state.panoramas.push(action.payload);
    },
    updatePanoramaStatus: (state, action: PayloadAction<{ id: string; status: PanoramaStatus }>) => {
      const panorama = state.panoramas.find(p => p.id === action.payload.id);
      if (panorama) {
        panorama.status = action.payload.status;
      }
    },
    deletePanorama: (state, action: PayloadAction<string>) => {
      state.panoramas = state.panoramas.filter(p => p.id !== action.payload);
    },
  },
});

export const { addPanorama, updatePanoramaStatus, deletePanorama } = panoramaSlice.actions;
export default panoramaSlice.reducer;
