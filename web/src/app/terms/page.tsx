export const metadata = { title: 'Terms & Conditions — KidPulse' };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-brand-ink">
      <h1 className="mb-2 font-chewy text-[2.2rem] text-brand-indigo">Terms &amp; Conditions</h1>
      <p className="mb-8 text-sm text-brand-ink-soft">Effective date: 2024</p>

      <p className="mb-6">Welcome to <strong>kidpulse.lk</strong>. These Terms and Conditions govern your use of our website and the purchase and sale of products from our platform. By accessing and using our website, you agree to comply with these terms.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Use of the Website</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>You must be at least 16 years old to use our website or make purchases.</li>
        <li>You are responsible for maintaining the confidentiality of your account information, including your username and password.</li>
        <li>You agree to provide accurate and current information during the registration and checkout process.</li>
        <li>You may not use our website for any unlawful or unauthorized purposes.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Product Information and Pricing</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>We strive to provide accurate product descriptions, images, and pricing information. However, we do not guarantee the accuracy or completeness of such information.</li>
        <li>Prices are subject to change without notice. Any promotions or discounts are valid for a limited time and may be subject to additional terms and conditions.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Orders and Payments</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>By placing an order on our website, you are making an offer to purchase the selected products.</li>
        <li>We reserve the right to refuse or cancel any order for any reason, including product availability, errors in pricing, or suspected fraudulent activity.</li>
        <li>You agree to provide valid and up-to-date payment information and authorize us to charge the total order amount, including applicable taxes and shipping fees.</li>
        <li>We use trusted third-party payment processors to handle your payment information securely. We do not store or have access to your full payment details.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Shipping and Delivery</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>We will make reasonable efforts to ensure timely shipping and delivery of your orders.</li>
        <li>Shipping and delivery times provided are estimates and may vary based on your location and other factors.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Returns and Refunds</h2>
      <p className="mb-4 text-[0.95rem]">Our Returns and Refund Policy governs the process and conditions for returning products and seeking refunds. Please refer to our <a href="/refund-policy" className="text-brand-berry underline">Refund Policy</a> for more information.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Intellectual Property</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>All content and materials on our website, including text, images, logos, and graphics, are protected by intellectual property rights and are the property of kidpulse.lk or its licensors.</li>
        <li>You may not use, reproduce, distribute, or modify any content from our website without our prior written consent.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Limitation of Liability</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>In no event shall kidpulse.lk, its directors, employees, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or the purchase and use of our products.</li>
        <li>We make no warranties or representations, express or implied, regarding the quality, accuracy, or suitability of the products offered on our website.</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Amendments and Termination</h2>
      <p className="mb-4 text-[0.95rem]">We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Contact Us</h2>
      <p className="text-[0.95rem]">For questions about these terms, please contact us at <a href="mailto:hello@kidpulse.lk" className="text-brand-berry underline">hello@kidpulse.lk</a>.</p>
    </main>
  );
}