import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../hooks/store";
import { IUser, IUserState } from "../models/user";

const initialState: IUserState = {
    userMap: {}
}

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUserMap(state, action: PayloadAction<IUser[]>) {
            const newMap: any = {};
            action.payload.forEach(item => {
                newMap[item._id] = {
                    ...state.userMap[item._id],
                    ...item
                };
            });
            state.userMap = {
                ...state.userMap,
                ...newMap
            }
        },
        addUserMap(state, action: PayloadAction<IUser>) {
            state.userMap[action.payload._id] = {
                ...state.userMap[action.payload._id],
                ...action.payload
            }
        },
        changeUserStatus(state, action: PayloadAction<{ userId: string, profileStatus: string }>) {
            state.userMap[action.payload.userId] = {
                ...state.userMap[action.payload.userId],
                profileStatus: action.payload.profileStatus
            }
            console.log(state.userMap[action.payload.userId]);
        }
    }
});

export const { setUserMap, addUserMap, changeUserStatus } = userSlice.actions;
export default userSlice.reducer;
export const selectUserMap = (state: RootState) => state.users.userMap
