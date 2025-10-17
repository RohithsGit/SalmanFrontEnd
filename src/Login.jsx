import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure, urlPrefix,urlPrefixLive } from "./store/store.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [userName, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const response = await fetch(`${urlPrefixLive}ValidUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          userName: userName,
          password: password
        }),
      });

      const obj = await response.json();
      const data = Array.isArray(obj) && obj.length > 0 ? obj[0] : {};
      if (response.ok && data.Status === "succes") {
        dispatch(loginSuccess({
          LoginID: data.LoginID,
          Role: data.Role,
          LinkedID: data.LinkedID,
          Name: data.Name,
          Gender: data.Gender,
          ContactNo: data.ContactNo,
        }));
        localStorage.setItem("authToken", data.token || "mock-token");
        setTimeout(() => {
          switch (data.Role.toLowerCase()) {
            case "admin": navigate("/admin"); break;
            case "rohith": navigate("/student"); break;
            case "teacher": navigate("/teacher"); break;
            case "parent": navigate("/parent"); break;
            default: navigate("/admin");
          }
        }, 1000);
      } else {
        dispatch(loginFailure(data.Message || "Invalid credentials"));
        setEmail('');
        setPassword('');
      }
    } catch {
      dispatch(loginFailure("Network error, please try again."));
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-purple-400 to-pink-300 overflow-hidden">
      {/* Left side image */}
      <div className="hidden lg:flex flex-col justify-center items-center w-2/5 h-full">
        <img
          src="/login-side.jpg" // <-- update this filename to your image in public
          alt="Login Visual"
          className="max-h-[80vh] w-auto object-contain rounded-3xl shadow-xl"
        />
      </div>
      {/* Right side login panel */}
      <div className="flex flex-col items-center justify-center w-full lg:w-3/5 h-full">
        <div className="login bg-[#a78bfa] bg-opacity-95 rounded-2xl px-12 py-12 shadow-2xl border border-purple-800 max-w-xl w-full mt-12 mb-12">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-4xl font-extrabold text-purple-900 mb-2 tracking-wide drop-shadow">Welcome</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-400 via-purple-600 to-pink-400 rounded-full shadow"></div>
          </div>
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-center">{error}</div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-center">{success}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              className="block w-full py-5 px-6 rounded-xl border-0 bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-lg placeholder-gray-500 transition-all duration-200"
              placeholder="Username"
              value={userName}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
              id="email"
            />
            <input
              type="password"
              className="block w-full py-5 px-6 rounded-xl border-0 bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-lg placeholder-gray-500 transition-all duration-200"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              id="password"
            />
            <button
              type="submit"
              className="w-full py-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  SIGNING IN...
                </span>
              ) : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
