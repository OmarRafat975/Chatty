import { createSlice } from "@reduxjs/toolkit";
import { authStateType } from "../types/store";

const initialState: authStateType = { user: "", name: "" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.name = action.payload.name;
    },
    logout(state) {
      state.user = "";
      state.name = "";
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice;
