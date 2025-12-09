import { configureStore } from '@reduxjs/toolkit';
import wellnessReducer from './slices/wellnessSlice';
import panoramaReducer from './slices/panoramaSlice';
import bankReducer from './slices/bankSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    wellness: wellnessReducer,
    panorama: panoramaReducer,
    bank: bankReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
