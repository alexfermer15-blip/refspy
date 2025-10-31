export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-6 text-center">About RefSpy</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Your competitive intelligence platform for SEO success
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            RefSpy was created to democratize competitive intelligence in the SEO industry. 
            We believe that every business, regardless of size, should have access to powerful 
            tools that help them understand and outperform their competition.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Our platform combines cutting-edge technology with intuitive design to deliver 
            actionable insights that drive real results.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">What We Do</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Competitor Tracking</h3>
                <p className="text-gray-600">
                  Monitor your competitors' rankings, content strategies, and backlink profiles
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Data Analysis</h3>
                <p className="text-gray-600">
                  Transform raw data into actionable insights with our advanced analytics
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Strategy Optimization</h3>
                <p className="text-gray-600">
                  Get AI-powered recommendations to improve your SEO strategy
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join Us Today</h2>
          <p className="text-lg mb-6 opacity-90">
            Start tracking your competitors and gain the competitive edge
          </p>
          <a
            href="/sign-up"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Get Started Free
          </a>
        </div>
      </div>
    </div>
  );
}
