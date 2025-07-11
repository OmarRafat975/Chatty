import axios from "axios";
import { useSelector } from "react-redux";
import { storeType } from "./types/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { checkAuth } from "./store/authActions";
import UserAccess from "./pages/UserAccess";
import Chat from "./pages/Chat";

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    throw new Error(
      "VITE_BACKEND_URL is not defined in the environment variables"
    );
  }
  axios.defaults.baseURL = backendUrl;
  axios.defaults.withCredentials = true;
  const dispatch = useDispatch<AppDispatch>();
  const { name, user } = useSelector((state: storeType) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch, name, user]);

  if (user && name) {
    return <Chat />;
  }

  return <UserAccess />;
}

export default App;
