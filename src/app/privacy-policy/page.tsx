import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Resh Community Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Header />
      <main>
        <PageTitle
          title="Privacy Policy"
          subtitle="Your Privacy Matters"
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Privacy Policy', href: '/privacy-policy' },
          ]}
        />

        <div className="axil-section-gap">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="content-wrapper">
                <p className="text-sm text-body-color mb-8">
                  Last Updated: {lastUpdated}
                </p>

                {/* Introduction */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Introduction
                  </h2>
                  <p className="text-body-color mb-4 leading-relaxed">
                    At Resh Community (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we respect your privacy
                    and are committed to protecting it through our compliance with this policy. This Privacy Policy
                    explains how we collect, use, disclose, and safeguard your information when you visit our website
                    resh.community.
                  </p>
                  <p className="text-body-color leading-relaxed">
                    By using our website, you consent to the collection and use of your information as described in
                    this policy. If you do not agree with the terms of this privacy policy, please do not access the
                    website.
                  </p>
                </section>

                {/* Information We Collect */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Information We Collect
                  </h2>

                  <h3 className="font-heading font-semibold text-h5 mb-3 text-heading-color mt-6">
                    Personal Data
                  </h3>
                  <p className="text-body-color mb-4 leading-relaxed">
                    We may collect personal identification information (Name, email address, etc.) only when you
                    voluntarily submit it to us through our contact forms, newsletter subscription, or other direct
                    communications.
                  </p>

                  <h3 className="font-heading font-semibold text-h5 mb-3 text-heading-color mt-6">
                    Automatically Collected Information
                  </h3>
                  <p className="text-body-color mb-4 leading-relaxed">
                    When you visit our website, we automatically collect certain information about your device,
                    including information about your web browser, IP address, time zone, and some of the cookies
                    that are installed on your device.
                  </p>

                  <h3 className="font-heading font-semibold text-h5 mb-3 text-heading-color mt-6">
                    Analytics Data
                  </h3>
                  <p className="text-body-color leading-relaxed">
                    We may use third-party analytics services (such as Google Analytics) to help understand how
                    visitors use our website. These services collect information sent by your browser or mobile
                    device, including your IP address, browser type, and operating system.
                  </p>
                </section>

                {/* How We Use Your Information */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    How We Use Your Information
                  </h2>
                  <p className="text-body-color mb-4 leading-relaxed">
                    We use the information we collect in the following ways:
                  </p>
                  <ul className="list-disc pl-6 text-body-color space-y-2">
                    <li>To provide, maintain, and improve our services</li>
                    <li>To send you newsletters, updates, and promotional materials (with your consent)</li>
                    <li>To respond to your inquiries, questions, and requests</li>
                    <li>To analyze and understand how you use our website</li>
                    <li>To detect, prevent, and address technical issues and security threats</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </section>

                {/* Cookies and Tracking */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Cookies and Tracking
                  </h2>
                  <p className="text-body-color mb-4 leading-relaxed">
                    We use &quot;cookies&quot; and similar tracking technologies to track the activity on our website
                    and hold certain information. Cookies are files with a small amount of data which may include an
                    anonymous unique identifier.
                  </p>
                  <p className="text-body-color mb-4 leading-relaxed">
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                    However, if you do not accept cookies, you may not be able to use some portions of our website.
                  </p>
                  <p className="text-body-color leading-relaxed">
                    Types of cookies we use:
                  </p>
                  <ul className="list-disc pl-6 text-body-color space-y-2 mt-3">
                    <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                </section>

                {/* Third-Party Links */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Third-Party Links
                  </h2>
                  <p className="text-body-color leading-relaxed">
                    Our website may contain links to third-party websites. We have no control over the content,
                    privacy policies, or practices of any third-party sites or services. We encourage you to review
                    the privacy policies of any third-party sites you visit.
                  </p>
                </section>

                {/* Data Security */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Data Security
                  </h2>
                  <p className="text-body-color leading-relaxed">
                    We implement a variety of security measures to maintain the safety of your personal information.
                    However, no method of transmission over the Internet or electronic storage is 100% secure. While
                    we strive to use commercially acceptable means to protect your personal information, we cannot
                    guarantee its absolute security.
                  </p>
                </section>

                {/* Your Rights */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Your Privacy Rights
                  </h2>
                  <p className="text-body-color mb-4 leading-relaxed">
                    Depending on your location, you may have certain rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-6 text-body-color space-y-2">
                    <li>The right to access and receive a copy of your personal data</li>
                    <li>The right to rectification of inaccurate data</li>
                    <li>The right to erasure of your personal data</li>
                    <li>The right to restrict processing of your data</li>
                    <li>The right to data portability</li>
                    <li>The right to object to processing of your data</li>
                  </ul>
                  <p className="text-body-color mt-4 leading-relaxed">
                    To exercise these rights, please contact us using the information provided below.
                  </p>
                </section>

                {/* Children's Privacy */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Children&apos;s Privacy
                  </h2>
                  <p className="text-body-color leading-relaxed">
                    Our website is not intended for children under the age of 16. We do not knowingly collect
                    personal information from children under 16. If you are a parent or guardian and you believe
                    your child has provided us with personal information, please contact us.
                  </p>
                </section>

                {/* Changes to This Policy */}
                <section className="mb-10">
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Changes to This Privacy Policy
                  </h2>
                  <p className="text-body-color leading-relaxed">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                    the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised
                    to review this Privacy Policy periodically for any changes.
                  </p>
                </section>

                {/* Contact Us */}
                <section>
                  <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                    Contact Us
                  </h2>
                  <p className="text-body-color leading-relaxed">
                    If you have any questions about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-bg-light rounded-lg">
                    <p className="text-body-color">
                      <strong>Email:</strong>{' '}
                      <a href="mailto:contact@resh.community" className="text-primary hover:underline">
                        contact@resh.community
                      </a>
                    </p>
                    <p className="text-body-color mt-2">
                      <strong>Website:</strong>{' '}
                      <a href="https://resh.community" className="text-primary hover:underline">
                        resh.community
                      </a>
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
