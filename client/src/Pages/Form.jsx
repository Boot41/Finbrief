"use client";

import { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Form() {
  const navigate = useNavigate();

  const [modelType, setModelType] = useState("");
  const [temperature, setTemperature] = useState(0.5);
  const [profession, setProfession] = useState("");
  const [style, setStyle] = useState(""); // New state for style
  const [error, setError] = useState("");

  // Fetch user preferences on component mount
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/projects/form",
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        const { modelType, temperature, profession, style } = response.data;
        setModelType(modelType || "");
        setTemperature(temperature || 0.5);
        setProfession(profession || "");
        setStyle(style || "");
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch preferences");
      }
    }
    fetchPreferences();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "temperature") {
      setTemperature(Number.parseFloat(value));
    } else if (name === "profession") {
      setProfession(value);
    } else if (name === "modelType") {
      setModelType(value);
    } else if (name === "style") {
      setStyle(value);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/projects/form",
        {
          modelType,
          temperature: Number(temperature),
          profession,
          style,
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );

      // Either a 201 for create or 200 for update, navigate to dashboard
      if (response.status === 201 || response.status === 200) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit form");
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Side - Design and Headings */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-8 md:w-1/2">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100">
          <UserCircle className="h-16 w-16 text-indigo-600" />
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800 md:text-4xl">
          User Persona
        </h1>
        <p className="text-center text-lg text-gray-600">
          Personalize your AI assistant to match your needs
        </p>
        <div className="mt-8 max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-indigo-600"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Tailored Experience</h3>
                <p className="text-sm text-gray-500">
                  Customize how your AI responds
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-indigo-600"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Advanced Models</h3>
                <p className="text-sm text-gray-500">
                  Choose between leading AI models
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <form
        className="flex flex-col justify-center p-8 md:w-1/2"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Configure Your Assistant</h2>
            <p className="text-gray-500">
              Tell us about yourself and how you want the AI to work for you
            </p>
          </div>

          {/* Profession and LLM Code Modification */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="profession"
              className="block text-sm font-medium text-gray-700"
            >
              Your profession and how you want to modify our LLM code
            </label>
            <textarea
              id="profession"
              placeholder="I'm a software developer and I'd like the LLM to generate response according to my profession"
              className="w-full min-h-[120px] rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={profession}
              name="profession"
              onChange={handleChange}
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label
              htmlFor="modelType"
              className="block text-sm font-medium text-gray-700"
            >
              Select AI Model
            </label>
            <select
              id="modelType"
              value={modelType}
              name="modelType"
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a model
              </option>
              <option value="mixtral-8x7b-32768">Groq</option>
              <option value="gemini-2.0-flash">Gemini</option>
            </select>
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <label
              htmlFor="style"
              className="block text-sm font-medium text-gray-700"
            >
              Select Response Style
            </label>
            <select
              id="style"
              value={style}
              name="style"
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a style
              </option>
              <option value="Normal">Normal</option>
              <option value="Concise">Concise</option>
              <option value="Explanatory">Explanatory</option>
              <option value="Formal">Formal</option>
            </select>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-4">
            <label
              htmlFor="temperature"
              className="block text-sm font-medium text-gray-700"
            >
              Response Style
            </label>
            <div className="space-y-2">
              <input
                id="temperature"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={temperature}
                name="temperature"
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Verbose</span>
                <span>Temperature: {temperature.toFixed(2)}</span>
                <span>Critical</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
