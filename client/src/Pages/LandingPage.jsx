"use client";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  ArrowRight,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-blue-600">
              <BarChart3 size={32} />
              <span className="text-2xl font-bold">FinBrief</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-800 font-semibold px-4 py-2"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold
                     hover:bg-blue-700 transition duration-200"
              >
                Get started
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Transform Your Financial Data into{" "}
                <span className="text-blue-600">Actionable Insights</span>
              </h1>
              <p className="text-xl mb-8 text-gray-700">
                Upload your Excel files, ask questions, and get instant visual
                analytics and summaries. Make data-driven decisions faster than
                ever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-bold
                           hover:bg-blue-700 transform hover:scale-105 transition duration-200 flex items-center justify-center"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                {/* <button
                  onClick={() => navigate("/demo")}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-xl font-bold
                           hover:bg-blue-50 transition duration-200"
                >
                  Watch Demo
                </button> */}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://chartexpo.com/blog/wp-content/uploads/2024/03/financial-graphs-and-charts-in-excel.jpg"
                alt="Financial Dashboard"
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-blue-600">
            From trends to predictions, get instant, AI-driven financial clarity
            at your fingertips!
          </h2>
          <p className="text-lg text-gray-600 mt-3 mb-12">
            Everything you need to analyze and understand your financial data in
            one place
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Visual Analytics",
                description:
                  "Automatically generate charts and graphs from your financial data for better insights",
                icon: "📊",
              },
              {
                title: "Trend Analysis",
                description:
                  "Identify patterns and trends in your financial data to make informed decisions",
                icon: "📈",
              },
              {
                title: "Forecasting",
                description:
                  "Predict future financial outcomes based on historical data and market trends",
                icon: "📉",
              },
              {
                title: "Accurate Prediction",
                description:
                  "Leverage AI-driven models to make precise financial forecasts with high accuracy",
                icon: "🎯",
              },
              {
                title: "Secure Data",
                description:
                  "Your financial data is encrypted and protected with enterprise-grade security",
                icon: "🔒",
              },
              {
                title: "Instant Insights",
                description:
                  "Get immediate answers to your financial questions without complex analysis",
                icon: "⚡",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center border border-gray-200
                     transition-all duration-300 transform hover:shadow-xl hover:scale-105 hover:border-blue-400"
              >
                <div
                  className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-4 
                       transition-all duration-300 hover:bg-blue-500"
                >
                  <span className="text-white text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-blue-600">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 mt-3 mb-12">
            Three simple steps to transform your financial data
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-12 md:space-y-0 md:space-x-16">
            {[
              {
                title: "Upload",
                description:
                  "Simply upload your Excel files or connect to your financial data sources",
                icon: "📤",
              },
              {
                title: "Analyze",
                description:
                  "Our AI automatically processes and analyzes your financial data",
                icon: "🔍",
              },
              {
                title: "Visualize",
                description:
                  "Get instant visualizations, insights, and answers to your questions",
                icon: "📊",
              },
            ].map((step, index) => (
              <div key={index} className="flex items-center">
                {/* Step Card */}
                <div
                  className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center text-center border border-gray-200
                      transition-all duration-300 transform hover:shadow-xl hover:scale-105 hover:border-blue-400"
                >
                  <div
                    className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-4 
                        transition-all duration-300 hover:bg-blue-500"
                  >
                    <span className="text-white text-4xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{step.description}</p>
                </div>

                {/* Centered Greater Than Sign (Only for first two steps) */}
                {index < 2 && (
                  <div className="w-12 flex items-center justify-center text-6xl font-bold text-blue-500 ml-6 ">
                    ›
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to transform your financial data?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of financial professionals who are making better
            decisions with FinBrief
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-xl font-bold
                     hover:bg-blue-50 transform hover:scale-105 transition duration-200"
          >
            Get Started Free
          </button>
          <p className="mt-4 text-blue-100">
            No credit card required • Free 14-day trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 size={24} />
                <span className="text-xl font-bold">FinBrief</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Transforming financial data into actionable insights for better
                decision-making
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Enterprise
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-black">
                      API
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} FinBrief. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-black">
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-black">
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-black">
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
