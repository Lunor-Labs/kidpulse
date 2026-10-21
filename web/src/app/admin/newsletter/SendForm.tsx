'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { adminApi } from '@/lib/adminApi';

export function NewsletterSendForm() {
  const token = useAuthStore((s) => s.accessToken);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    const confirmed = window.confirm(
      `Send this newsletter to all active subscribers?\n\nSubject: ${subject}`
    );
    if (!confirmed) return;

    setStatus('sending');
    setResult(null);
    try {
      const res = await adminApi.sendNewsletter(token, { subject, body });
      setResult({ sent: res.sent, failed: res.failed });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-brand-line bg-white p-6 space-y-4">
      <h2 className="text-base font-semibold text-brand-ink">Send Newsletter</h2>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
          Subject
        </label>
        <input
          className="w-full rounded-[10px] border border-brand-line bg-brand-cream/40 px-3 py-2 text-sm text-brand-ink placeholder:text-brand-ink-soft focus:outline-none focus:ring-2 focus:ring-brand-indigo"
          placeholder="e.g. New arrivals this week 🎉"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={status === 'sending'}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
          Message
        </label>
        <textarea
          className="w-full rounded-[10px] border border-brand-line bg-brand-cream/40 px-3 py-2 text-sm text-brand-ink placeholder:text-brand-ink-soft focus:outline-none focus:ring-2 focus:ring-brand-indigo min-h-[180px] resize-y"
          placeholder="Write your message here…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={status === 'sending'}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!subject.trim() || !body.trim() || status === 'sending'}
        className="rounded-full bg-brand-indigo px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {status === 'sending' ? 'Sending…' : 'Send to all subscribers'}
      </button>

      {status === 'done' && result && (
        <p className="text-sm text-green-600">
          ✓ Sent to {result.sent} subscriber{result.sent !== 1 ? 's' : ''}
          {result.failed > 0 && ` (${result.failed} failed)`}
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-500">Failed to send. Please try again.</p>
      )}
    </div>
  );
}