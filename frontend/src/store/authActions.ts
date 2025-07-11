import axios from "axios";
import { user } from "../types/auth";
import { AppDispatch } from "./index";
import { authActions } from "./authSlice";
import { storeType } from "../types/store";

export function sign(request: "login" | "register", user: user) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`/users/${request}`, {
        ...user,
      });
      if (response.data.status === "success") {
        const { userId, name } = response.data.user;

        dispatch(authActions.login({ user: userId, name }));
      } else {
        console.log("Error", response);
      }
    } catch (error) {
      console.log(error);
    }
  };
}

export function checkAuth() {
  return async (dispatch: AppDispatch, getState: () => storeType) => {
    const { auth } = getState();
    if (auth.name && auth.user) return;
    const response = await axios.get("/users/profile");
    const { userId, name } = response.data.user;
    if (!userId || !name) return;
    dispatch(authActions.login({ user: userId, name }));
  };
}

export function logout() {
  return async (dispatch: AppDispatch) => {
    await axios.get("/users/logout");
    dispatch(authActions.logout());
  };
}
