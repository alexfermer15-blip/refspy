'use client';

import { useState } from 'react';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does RefSpy track competitors?',
      answer: 'RefSpy uses advanced SERP scraping technology combined with Google Custom Search API to track competitor positions across multiple keywords and locations. We update data daily to ensure accuracy.'
    },
    {
      question: 'What is the Google CSE quota?',
      answer: 'Each account gets 100 free Google Custom Search API requests per day. If you need more, we automatically fallback to our Puppeteer-based scraper with unlimited requests.'
    },
    {
      question: 'Can I track multiple keywords?',
      answer: 'Yes! You can track unlimited keywords across different locations. Each keyword can be monitored for up to 50 competitors simultaneously.'
    },
    {
      question: 'How often is data updated?',
      answer: 'Position data is updated every 24 hours automatically. Premium plans can get hourly updates for critical keywords.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Absolutely! You can export all your data to CSV, Excel, or PDF formats. We also provide API access for custom integrations.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center">Help Center</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Find answers to common questions
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <a href="/docs" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-gray-600">Complete guides and tutorials</p>
          </a>
          <a href="/test-parser" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="text-4xl mb-3">🧪</div>
            <h3 className="font-semibold mb-2">Try Demo</h3>
            <p className="text-sm text-gray-600">Test our parser tool</p>
          </a>
          <a href="/contact" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Contact Us</h3>
            <p className="text-sm text-gray-600">Get in touch with support</p>
          </a>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left py-2"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <span className="text-2xl">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <p className="text-gray-600 mt-2 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
