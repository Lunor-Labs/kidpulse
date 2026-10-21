import { NewsletterSubscribersClient } from './ListClient';
import { NewsletterSendForm } from './SendForm';

export const metadata = { title: 'Newsletter' };

export default function AdminNewsletterPage() {
  return (
    <div className="space-y-8">
      <NewsletterSendForm />
      <NewsletterSubscribersClient />
    </div>
  );
}