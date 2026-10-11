'use client';

import { useState } from 'react';
import { toast } from 'sonner';

const CONTACT_EMAIL = 'hello@kidpulse.lk';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject.trim() || 'Message from KidPulse website'
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    toast.success('Opening your email app to send this message…');
  }

  return (
    <form onSubmit={submit} className="rounded-[16px] border border-brand-line bg-white p-6">
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="contact-subject" className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Order question, careers, etc."
          className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="contact-message" className="mb-1 block text-[0.78rem] font-semibold text-brand-ink-soft">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="How can we help?"
          required
          className="w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
      </div>

      <button
        type="submit"
        className="rounded-[12px] bg-brand-indigo px-5 py-2.5 text-[0.9rem] font-bold text-white hover:opacity-90"
      >
        Send message
      </button>
    </form>
  );
}
