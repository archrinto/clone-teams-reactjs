import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sidebarActive: false,
}

const uiSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        toggleSidebar(state) {
            state.sidebarActive = !state.sidebarActive
        }
    }
});

export const {
    toggleSidebar
} = uiSlice.actions

export default uiSlice.reducer;