import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="p-6 bg-white shadow-md animate-fade-in-down">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800 hover:text-gray-900 transition duration-300 cursor-pointer">
            Finbrief
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-24 relative">
        <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
          Transform Your Excel Data into{' '}
          <span className="text-blue-600">Actionable Insights</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl animate-fade-in-up animate-delay-100">
          Finbrief simplifies your financial data by summarizing Excel files and providing key insights instantly.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 animate-fade-in-up animate-delay-200"
        >
          Start Now
        </button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16 animate-fade-in-down">
          Why Choose Finbrief?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            title: "Quick Summaries",
            desc: "Get concise summaries of your Excel data in seconds.",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          }, {
            title: "Data Insights",
            desc: "Uncover hidden trends and patterns in your data.",
            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z"
          }, {
            title: "User-Friendly",
            desc: "Easy-to-use interface for all skill levels.",
            icon: "M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          }].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 animate-fade-in-up animate-delay-300"
            >
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon}></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-24 text-center animate-fade-in-up">
        <h2 className="text-4xl font-bold mb-6">Ready to Simplify Your Data?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of users who trust Finbrief for their data analysis needs.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="bg-white text-blue-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
        >
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-white p-6 shadow-inner text-center text-gray-600 animate-fade-in-up">
        <div>&copy; 2025 Finbrief. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default LandingPage;