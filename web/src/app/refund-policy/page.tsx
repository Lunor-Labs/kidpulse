export const metadata = { title: 'Refund & Return Policy — KidPulse' };

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-brand-ink">
      <h1 className="mb-2 font-chewy text-[2.2rem] text-brand-indigo">Refund &amp; Return Policy</h1>
      <p className="mb-8 text-sm text-brand-ink-soft">Effective date: 2024</p>

      <p className="mb-6 text-[0.95rem]">Thank you for shopping at <strong>kidpulse.lk</strong>. We value your satisfaction and strive to provide you with the best online shopping experience possible. If, for any reason, you are not completely satisfied with your purchase, we are here to help.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Returns</h2>
      <p className="mb-4 text-[0.95rem]">We accept returns within <strong>7 days</strong> from the date of purchase. To be eligible for a return, your item must be unused and in the same condition that you received it, in the original packaging.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Refunds</h2>
      <p className="mb-4 text-[0.95rem]">Once we receive your return and inspect the item, we will notify you of the status of your refund. If your return is approved, we will initiate a refund to your original method of payment. Please note that the refund amount will exclude any shipping charges incurred during the initial purchase.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Exchanges</h2>
      <p className="mb-4 text-[0.95rem]">If you would like to exchange your item for a different size, color, or style, please contact our customer support team within <strong>3 days</strong> of receiving your order. We will provide you with further instructions on how to proceed.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Non-Returnable Items</h2>
      <p className="mb-2 text-[0.95rem]">The following items are non-returnable and non-refundable:</p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[0.95rem]">
        <li>Gift cards</li>
        <li>Downloadable software products</li>
        <li>Personalized or custom-made items</li>
        <li>Perishable goods</li>
      </ul>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Damaged or Defective Items</h2>
      <p className="mb-4 text-[0.95rem]">In the unfortunate event that your item arrives damaged or defective, please contact us immediately. We will arrange for a replacement or issue a refund, depending on your preference and product availability.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Return Shipping</h2>
      <p className="mb-4 text-[0.95rem]">You will be responsible for paying the shipping costs for returning your item unless the return is due to our error (e.g., wrong item shipped, defective product). In such cases, we will provide you with a prepaid shipping label.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Processing Time</h2>
      <p className="mb-4 text-[0.95rem]">Refunds and exchanges will be processed within <strong>7 business days</strong> after we receive your returned item. Please note that it may take additional time for the refund to appear in your account, depending on your payment provider.</p>

      <h2 className="mb-2 mt-8 font-bold text-[1.1rem]">Contact Us</h2>
      <p className="text-[0.95rem]">If you have any questions regarding our refund policy, please contact us at <a href="mailto:hello@kidpulse.lk" className="text-brand-berry underline">hello@kidpulse.lk</a>.</p>
    </main>
  );
}