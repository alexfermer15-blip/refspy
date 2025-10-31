export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: October 14, 2025</p>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We collect information that you provide directly to us, including when you create an account, 
            use our services, or communicate with us. This may include your name, email address, and usage data.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Security</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We take reasonable measures to protect your personal information from unauthorized access, 
            use, or disclosure. However, no internet transmission is ever fully secure or error-free.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            You have the right to access, update, or delete your personal information at any time through 
            your account settings or by contacting us.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@refspy.com" className="text-blue-600 hover:underline">
              privacy@refspy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
