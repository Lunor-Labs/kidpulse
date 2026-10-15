export const metadata = { title: 'Privacy Policy — KidPulse' };

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-brand-ink">
      <h1 className="mb-2 font-chewy text-[2.2rem] text-brand-indigo">Privacy Policy</h1>
      <p className="mb-8 text-sm text-brand-ink-soft">Effective date: 2024</p>

      <p className="mb-6 text-[0.95rem]">At <strong>kidpulse.lk</strong>, we are committed to protecting the privacy and security of our customers' personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit or make a purchase on our website. By using our website, you consent to the practices described in this policy.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Information We Collect</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>Personal identification information (such as your name, email address, and phone number) provided voluntarily during registration or checkout.</li>
        <li>Payment and billing information necessary to process your orders, including credit card details, which are securely handled by trusted third-party payment processors.</li>
        <li>Browsing information, such as your IP address, browser type, and device information, collected automatically using cookies and similar technologies.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Use of Information</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>To process and fulfill your orders, including shipping and delivery.</li>
        <li>To communicate with you regarding your purchases, provide customer support, and respond to inquiries.</li>
        <li>To personalize your shopping experience and present relevant product recommendations and promotions.</li>
        <li>To improve our website, products, and services based on your feedback and browsing patterns.</li>
        <li>To detect and prevent fraud, unauthorized activities, and abuse of our website.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Information Sharing</h2>
      <p className="mb-2 text-[0.95rem]">We respect your privacy and do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li><strong>Trusted service providers:</strong> We may share your information with third-party service providers who assist us in operating our website, processing payments, and delivering products. These providers are contractually obligated to handle your data securely and confidentially.</li>
        <li><strong>Legal requirements:</strong> We may disclose your information if required to do so by law or in response to valid legal requests or orders.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Data Security</h2>
      <p className="mb-4 text-[0.95rem]">We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Cookies and Tracking Technologies</h2>
      <p className="mb-4 text-[0.95rem]">We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and gather information about your preferences. You have the option to disable cookies through your browser settings, but this may limit certain features and functionality of our website.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Changes to This Policy</h2>
      <p className="mb-4 text-[0.95rem]">We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with a revised date. We encourage you to review this policy periodically.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Contact Us</h2>
      <p className="text-[0.95rem]">If you have any questions about our Privacy Policy, please contact us at <a href="mailto:hello@kidpulse.lk" className="text-brand-berry underline">hello@kidpulse.lk</a>.</p>
    </main>
  );
}