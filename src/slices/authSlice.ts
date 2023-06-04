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
            action: PayloadAction<{ user: IUser | null; token: string }>
        ) => {
            state.user = action.payload.user
            state.token = action.payload.token
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
