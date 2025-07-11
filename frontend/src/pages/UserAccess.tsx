import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { sign } from "../store/authActions";
import Header from "../components/Header";

const UserAccess = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [panel, setPanel] = useState<"login" | "register">("login");

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(sign(panel, { username, password, email }));
  }

  function handleClick() {
    if (panel === "login") {
      return setPanel("register");
    }
    if (panel === "register") {
      return setPanel("login");
    }
  }

  return (
    <div className="bg-emerald-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleFormSubmit}>
        <div className="flex items-center justify-center text-2xl">
          <Header />
        </div>
        {panel === "register" && (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="username"
            className="block w-full rounded-sm p-2 mb-2 border"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button
          className="bg-emerald-500 text-white block w-full hover:bg-emerald-600 duration-300 rounded-sm p-2 mb-2"
          type="submit"
        >
          {panel === "register" ? "Register" : "Login"}
        </button>

        <div className="text-center flex gap-2 items-center justify-center">
          {panel === "login" ? "Don't Have an Account?" : "Already a member?"}{" "}
          <button
            type="button"
            className="text-emerald-700"
            onClick={() => handleClick()}
          >
            {panel === "login" ? "Register" : "Login Here"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserAccess;
