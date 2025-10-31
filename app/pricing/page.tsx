export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Simple, Transparent <span className="text-[#ff6b00]">Pricing</span>
        </h1>
        <p className="text-xl text-gray-400 mb-4">
          No hidden fees. Cancel anytime. 14-day money-back guarantee.
        </p>
        <p className="text-gray-500">
          All plans include AI-powered analysis and unlimited projects
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Starter Plan */}
          <div className="border border-gray-800 rounded-lg p-8 hover:border-[#ff6b00] transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-400">Perfect for individuals</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">$29</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Up to 5 competitor domains</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>1,000 backlinks analyzed/month</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>AI assistant (100 queries/month)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Basic reports</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Email support</span>
              </li>
            </ul>

            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition font-semibold">
              Start Free Trial
            </button>
          </div>

          {/* Professional Plan - Featured */}
          <div className="border-2 border-[#ff6b00] rounded-lg p-8 relative transform md:scale-105 shadow-lg shadow-[#ff6b00]/20">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#ff6b00] text-white px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-gray-400">For growing businesses</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">$79</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Up to 25 competitor domains</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>10,000 backlinks analyzed/month</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>AI assistant (500 queries/month)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Advanced reports & exports</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>API access</span>
              </li>
            </ul>

            <button className="w-full bg-[#ff6b00] hover:bg-[#cc5500] text-white py-3 rounded-lg transition font-semibold">
              Start Free Trial
            </button>
          </div>

          {/* Agency Plan */}
          <div className="border border-gray-800 rounded-lg p-8 hover:border-[#ff6b00] transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Agency</h3>
              <p className="text-gray-400">For teams & agencies</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">$199</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Unlimited competitor domains</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>50,000 backlinks analyzed/month</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>AI assistant (unlimited queries)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>White-label reports</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Team collaboration tools</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ff6b00] mr-2">✓</span>
                <span>Custom integrations</span>
              </li>
            </ul>

            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition font-semibold">
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-gray-800 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="border border-gray-800 rounded-lg p-6 hover:border-[#ff6b00] transition">
              <h3 className="text-xl font-bold mb-2">Can I switch plans later?</h3>
              <p className="text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="border border-gray-800 rounded-lg p-6 hover:border-[#ff6b00] transition">
              <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit cards (Visa, Mastercard, Amex) and PayPal.
              </p>
            </div>

            <div className="border border-gray-800 rounded-lg p-6 hover:border-[#ff6b00] transition">
              <h3 className="text-xl font-bold mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">
                Yes! All plans come with a 14-day free trial. No credit card required.
              </p>
            </div>

            <div className="border border-gray-800 rounded-lg p-6 hover:border-[#ff6b00] transition">
              <h3 className="text-xl font-bold mb-2">What if I need more backlinks?</h3>
              <p className="text-gray-400">
                You can purchase additional backlink credits or upgrade to a higher plan. Contact support for custom enterprise plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to dominate your competitors?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial today. No credit card required.
          </p>
          <button className="bg-[#ff6b00] hover:bg-[#cc5500] text-white px-10 py-5 rounded-lg text-xl font-semibold transition transform hover:scale-105">
            Start Free Trial Now
          </button>
        </div>
      </section>
    </main>
  )
}
