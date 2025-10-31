export default function FeaturesPage() {
  const features = [
    {
      icon: '🔍',
      title: 'Competitor Analysis',
      description: 'Track and analyze your competitors across different keywords and markets in real-time.',
      highlights: ['Position tracking', 'Trend analysis', 'Historical data']
    },
    {
      icon: '📊',
      title: 'SERP Monitoring',
      description: 'Monitor search engine results pages for your target keywords with automated updates.',
      highlights: ['Real-time updates', 'Multi-location', 'Rank tracking']
    },
    {
      icon: '🔗',
      title: 'Backlink Analysis',
      description: 'Discover and analyze backlinks pointing to your competitors\' websites.',
      highlights: ['Link discovery', 'Domain authority', 'Anchor text analysis']
    },
    {
      icon: '📈',
      title: 'Position Tracking',
      description: 'Track your rankings and get instant alerts when positions change.',
      highlights: ['Daily updates', 'Email alerts', 'Custom reports']
    },
    {
      icon: '🤖',
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations powered by advanced AI algorithms.',
      highlights: ['SEO suggestions', 'Content ideas', 'Strategy tips']
    },
    {
      icon: '📥',
      title: 'Export & Reports',
      description: 'Export data to CSV, PDF and schedule automated reports to your team.',
      highlights: ['Multiple formats', 'Scheduled reports', 'API access']
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero */}
      <div className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Everything you need to spy on competitors
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Powerful tools to analyze, track, and outrank your competition with data-driven insights
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/sign-up"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg font-medium"
          >
            Start Free Trial
          </a>
          <a
            href="/pricing"
            className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-lg font-medium"
          >
            View Pricing
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to outrank your competitors?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of SEO professionals using RefSpy
          </p>
          <a
            href="/sign-up"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition shadow-lg font-medium"
          >
            Get Started for Free
          </a>
        </div>
      </div>
    </div>
  );
}
