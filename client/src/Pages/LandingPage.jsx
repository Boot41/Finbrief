"use client"
import { useNavigate } from "react-router-dom"
import { BarChart3, PieChart, LineChart, TrendingUp, Users, Shield, Zap, ArrowRight, ChevronRight } from "lucide-react"

const LandingPage = () => {
  const navigate = useNavigate()

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
          Signup
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
                Transform Your Financial Data into <span className="text-blue-600">Actionable Insights</span>
              </h1>
              <p className="text-xl mb-8 text-gray-700">
                Upload your Excel files, ask questions, and get instant visual analytics and summaries. Make data-driven
                decisions faster than ever.
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
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Powerful Features</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Everything you need to analyze and understand your financial data in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <PieChart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Visual Analytics</h3>
              <p className="text-gray-700">
                Automatically generate charts and graphs from your financial data for better insights
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <LineChart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Trend Analysis</h3>
              <p className="text-gray-700">
                Identify patterns and trends in your financial data to make informed decisions
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Forecasting</h3>
              <p className="text-gray-700">
                Predict future financial outcomes based on historical data and market trends
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Collaboration</h3>
              <p className="text-gray-700">
                Share insights with your team and collaborate on financial analysis in real-time
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Secure Data</h3>
              <p className="text-gray-700">
                Your financial data is encrypted and protected with enterprise-grade security
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-blue-50 p-6 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Instant Insights</h3>
              <p className="text-gray-700">
                Get immediate answers to your financial questions without complex analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Three simple steps to transform your financial data
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Upload</h3>
              <p className="text-gray-700">Simply upload your Excel files or connect to your financial data sources</p>
            </div>

            <div className="hidden md:block text-blue-300">
              <ChevronRight size={48} />
            </div>

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Analyze</h3>
              <p className="text-gray-700">Our AI automatically processes and analyzes your financial data</p>
            </div>

            <div className="hidden md:block text-blue-300">
              <ChevronRight size={48} />
            </div>

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Visualize</h3>
              <p className="text-gray-700">Get instant visualizations, insights, and answers to your questions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your financial data?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of financial professionals who are making better decisions with FinBrief
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-xl font-bold
                     hover:bg-blue-50 transform hover:scale-105 transition duration-200"
          >
            Get Started Free
          </button>
          <p className="mt-4 text-blue-100">No credit card required • Free 14-day trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 size={24} />
                <span className="text-xl font-bold">FinBrief</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Transforming financial data into actionable insights for better decision-making
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Enterprise
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      API
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} FinBrief. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
  )
}

export default LandingPage