import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name", response.data.trimmedemail);
        onLogin();
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-blue-600">
              <BarChart3 size={32} />
              <button onClick={() => navigate("/")}>
                <span className="text-2xl font-bold">FinBrief</span>
              </button>
            </div>
          </nav>
        </div>
      </header>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-3xl font-bold text-indigo-900 mb-6 text-center">
            Login
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-300"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-300"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition duration-300 transform hover:scale-105"
            >
              Login
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center">
            <div className="w-full border-t border-gray-300"></div>
            <span className="px-4 text-gray-500">OR</span>
            <div className="w-full border-t border-gray-300"></div>
          </div>

          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={async (response) => {
                const credential = response.credential;
                const decoded = jwtDecode(credential);
                console.log(decoded);
                try {
                  const res = await axios.post(
                    "http://localhost:5000/api/auth/google/callback",
                    {
                      token: credential,
                    }
                  );
                  if (res.data.token) {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("name", res.data.user.email);
                    navigate("/dashboard");
                  }
                } catch (err) {
                  console.error("Google login failed:", err);
                }
              }}
              onError={() => console.log("Login Failed")}
            />
          </div>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 font-semibold hover:text-indigo-500 transition duration-300"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
