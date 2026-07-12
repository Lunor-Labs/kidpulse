import { CartPageClient } from './CartPageClient';

export const metadata = {
  title: 'Your cart — KidPulse',
  description: 'Review the items in your cart before checkout.',
};

export default function CartPage() {
  return <CartPageClient />;
}
