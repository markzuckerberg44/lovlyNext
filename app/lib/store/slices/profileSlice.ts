import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CoupleProfile {
  partner1Name: string;
  partner2Name: string;
}

interface ProfileState {
  couple: CoupleProfile;
}

const initialState: ProfileState = {
  couple: {
    partner1Name: 'Usuario 1',
    partner2Name: 'Usuario 2',
  },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setCoupleNames: (state, action: PayloadAction<CoupleProfile>) => {
      state.couple = action.payload;
    },
  },
});

export const { setCoupleNames } = profileSlice.actions;
export default profileSlice.reducer;
