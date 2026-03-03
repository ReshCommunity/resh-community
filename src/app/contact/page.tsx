'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { useState, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    // In production, you would send this data to your backend or a service like Formspree
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);

      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Header />
      <main>
        <PageTitle
          title="Contact Us"
          subtitle="Get In Touch"
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Contact', href: '/contact' },
          ]}
        />

        <div className="axil-section-gap">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="content-wrapper">
                  {/* Contact Form */}
                  <div className="bg-bg-light rounded-lg p-8">
                    <h2 className="font-heading font-semibold text-h3 mb-6 text-heading-color">
                      Send Us a Message
                    </h2>

                    {submitStatus === 'success' && (
                      <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        Thank you for your message! We'll get back to you soon.
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        Oops! Something went wrong. Please try again.
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-heading-color mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-bg-dark"
                            placeholder="Your name"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-heading-color mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-bg-dark"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-heading-color mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-bg-dark"
                          placeholder="How can we help?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-heading-color mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-bg-dark resize-none"
                          placeholder="Tell us more..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-bg-light rounded-lg p-6">
                    <h3 className="font-heading font-semibold text-h4 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-heading-color">Email</p>
                          <a href="mailto:contact@resh.community" className="text-sm text-body-color hover:text-primary transition-colors">
                            contact@resh.community
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-heading-color">Location</p>
                          <p className="text-sm text-body-color">
                            Decentralized<br />Metaverse, Web3
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={faPhone} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-heading-color">Social Media</p>
                          <p className="text-sm text-body-color">
                            Follow us on social platforms
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="bg-bg-light rounded-lg p-6">
                    <h3 className="font-heading font-semibold text-h4 mb-4">
                      Quick Links
                    </h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="/about" className="text-sm text-body-color hover:text-primary transition-colors">
                          About Us
                        </a>
                      </li>
                      <li>
                        <a href="/blog" className="text-sm text-body-color hover:text-primary transition-colors">
                          Blog
                        </a>
                      </li>
                      <li>
                        <a href="/categories" className="text-sm text-body-color hover:text-primary transition-colors">
                          Categories
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
