import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { user, authLoading, authError, login, logout, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const switchMode = (next) => {
    setMode(next);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok =
      mode === "login"
        ? await login({ email, password })
        : await register({ username, email, password });
    setSubmitting(false);
    if (ok) resetForm();
  };

  return (
    <nav>
      <div className="flex justify-between px-10 items-center w-full bg-teal-500 h-14 border-b-2 border-black gap-x-6 text-2xl text-white ">
        <ul className="flex items-center gap-x-6">
          <li>
            <Link to="/" className="hover:text-yellow-500">
              Home
            </Link>
          </li>
          <li>
            <Link to="/owner" className="hover:text-yellow-500">
              Owner
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-x-3">
          {authLoading ? (
            <span className="text-base">Checking session…</span>
          ) : user ? (
            <>
              <span className="text-base">
                Logged in as <span className="font-bold">{user.username}</span>
              </span>
              <button
                onClick={logout}
                className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-xl text-base"
              >
                Logout
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-x-2">
              {mode === "signup" && (
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="bg-white text-black px-2 rounded border text-base w-32"
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                />
              )}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="bg-white text-black px-2 rounded border text-base w-44"
                type="email"
                required
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                type="password"
                className="bg-white text-black px-2 rounded border text-base w-32"
                required
                minLength={8}
                maxLength={72}
              />
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white px-3 py-1 rounded-xl text-base"
              >
                {mode === "login" ? "Login" : "Sign up"}
              </button>
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "login" ? "signup" : "login")
                }
                className="cursor-pointer text-teal-100 hover:text-white underline text-sm"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </form>
          )}
        </div>
      </div>

      {authError ? (
        <div className="bg-rose-200 text-rose-900 px-10 py-2 text-sm border-b-2 border-black">
          {authError}
        </div>
      ) : null}
    </nav>
  );
}
