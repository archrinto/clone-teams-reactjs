import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit';
import { IUser } from './apiSlice'
import { RootState } from '../hooks/store';

export type AuthState = {
  user: IUser | null
  token: string | null
}

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null } as AuthState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: IUser | null; token: string }>
    ) => {
      state.user = user
      state.token = token
    },
    updateCurrentUserStatus(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.profileStatus = action.payload;
      }
    }
  },
})

export const { setCredentials, updateCurrentUserStatus } = slice.actions

export default slice.reducer

export const selectCurrentUser = (state: RootState) => state.auth.user
