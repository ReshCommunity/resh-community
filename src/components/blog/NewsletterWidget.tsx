'use client';

import { useState, FormEvent } from 'react';

/**
 * NewsletterWidget - Newsletter subscription form using Web3Forms
 *
 * Setup instructions:
 * 1. Visit https://web3forms.com/ to get your free access key
 * 2. Replace 'YOUR_ACCESS_KEY_HERE' below with your actual access key
 * 3. The form will send email submissions to Web3Forms
 *
 * Free tier: 100 submissions/month
 */
export function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'YOUR_ACCESS_KEY_HERE', // Replace with your Web3Forms access key
          subject: 'New Newsletter Subscription',
          from_name: 'Resh Community Newsletter',
          email: email,
          message: `New subscriber: ${email}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="newsletter-widget bg-bg-light rounded-lg p-6">
      <h3 className="font-heading font-semibold text-h4 mb-3">Newsletter</h3>
      <p className="text-body-color text-sm mb-4">
        Subscribe to get the latest crypto news and insights delivered to your inbox.
      </p>

      {status === 'success' ? (
        <div className="text-success">
          <p className="text-sm font-medium">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={status === 'loading'}
            />
          </div>
          {status === 'error' && (
            <p className="text-error text-sm">{message}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full axil-button btn-fill-primary btn-small"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}

      <p className="text-xs text-gray-500 mt-3">
        No spam, unsubscribe anytime.
      </p>
    </div>
  );
}
