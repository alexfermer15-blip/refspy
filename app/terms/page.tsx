export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: October 14, 2025</p>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            By accessing and using RefSpy, you accept and agree to be bound by the terms and provisions 
            of this agreement.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Use License</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Permission is granted to temporarily access RefSpy for personal or commercial use. This is the 
            grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose without authorization</li>
            <li>Attempt to reverse engineer any software</li>
            <li>Remove any copyright or proprietary notations</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Disclaimer</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            The materials on RefSpy are provided on an 'as is' basis. RefSpy makes no warranties, 
            expressed or implied, and hereby disclaims and negates all other warranties.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Limitations</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            In no event shall RefSpy or its suppliers be liable for any damages arising out of the 
            use or inability to use the materials on RefSpy.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Revisions</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            RefSpy may revise these terms of service at any time without notice. By using this website, 
            you are agreeing to be bound by the current version of these terms of service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Contact Information</h2>
          <p className="text-gray-600 leading-relaxed">
            Questions about the Terms of Service should be sent to{' '}
            <a href="mailto:legal@refspy.com" className="text-blue-600 hover:underline">
              legal@refspy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
