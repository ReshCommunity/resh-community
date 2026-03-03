import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { Metadata } from 'next';
import Image from 'next/image';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Resh Community - Your trusted source for crypto news, insights, and blockchain analysis.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <PageTitle
          title="About Us"
          subtitle="Who We Are"
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'About', href: '/about' },
          ]}
        />

        <div className="axil-section-gap">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="content-wrapper">
                  {/* About Section */}
                  <section className="mb-12">
                    <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                      Welcome to Resh Community
                    </h2>
                    <p className="text-body-color mb-4 leading-relaxed">
                      Resh Community is your premier destination for all things cryptocurrency and blockchain.
                      We are dedicated to bringing you the latest news, in-depth analysis, and valuable insights
                      from the rapidly evolving world of digital assets.
                    </p>
                    <p className="text-body-color mb-4 leading-relaxed">
                      Our mission is to democratize access to cryptocurrency knowledge and help both beginners
                      and experienced investors navigate the complex landscape of blockchain technology, DeFi,
                      NFTs, and digital currencies.
                    </p>
                  </section>

                  {/* Mission Section */}
                  <section className="mb-12">
                    <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                      Our Mission
                    </h2>
                    <p className="text-body-color mb-4 leading-relaxed">
                      At Resh Community, we believe that everyone should have access to accurate, unbiased
                      information about cryptocurrency and blockchain technology. Our team of experienced writers
                      and analysts work around the clock to bring you:
                    </p>
                    <ul className="list-disc pl-6 text-body-color space-y-2 mb-4">
                      <li>Breaking news from the crypto world</li>
                      <li>In-depth analysis of market trends</li>
                      <li>Educational content for all skill levels</li>
                      <li>Expert opinions and insights</li>
                      <li>Comprehensive coverage of major cryptocurrencies</li>
                    </ul>
                  </section>

                  {/* Values Section */}
                  <section className="mb-12">
                    <h2 className="font-heading font-semibold text-h3 mb-4 text-heading-color">
                      Our Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-bg-light p-6 rounded-lg">
                        <h3 className="font-heading font-semibold text-h5 mb-2 text-primary">
                          Accuracy
                        </h3>
                        <p className="text-body-color text-sm">
                          We verify all our sources and provide factual, well-researched content.
                        </p>
                      </div>
                      <div className="bg-bg-light p-6 rounded-lg">
                        <h3 className="font-heading font-semibold text-h5 mb-2 text-primary">
                          Transparency
                        </h3>
                        <p className="text-body-color text-sm">
                          We are open about our sources and methodology in all our analysis.
                        </p>
                      </div>
                      <div className="bg-bg-light p-6 rounded-lg">
                        <h3 className="font-heading font-semibold text-h5 mb-2 text-primary">
                          Community
                        </h3>
                        <p className="text-body-color text-sm">
                          We foster an inclusive community where knowledge is shared freely.
                        </p>
                      </div>
                      <div className="bg-bg-light p-6 rounded-lg">
                        <h3 className="font-heading font-semibold text-h5 mb-2 text-primary">
                          Innovation
                        </h3>
                        <p className="text-body-color text-sm">
                          We stay ahead of the curve by covering emerging trends and technologies.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Team Section */}
                  <section>
                    <h2 className="font-heading font-semibold text-h3 mb-6 text-heading-color">
                      Our Team
                    </h2>
                    <p className="text-body-color mb-6 leading-relaxed">
                      Our team consists of passionate crypto enthusiasts, experienced journalists,
                      blockchain developers, and financial analysts who share a common vision:
                      making cryptocurrency accessible to everyone.
                    </p>
                    <p className="text-body-color leading-relaxed">
                      Together, we have years of combined experience in the cryptocurrency space
                      and are committed to delivering the highest quality content to our readers.
                    </p>
                  </section>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="bg-bg-light rounded-lg p-6">
                  <h3 className="font-heading font-semibold text-h4 mb-4">
                    Get In Touch
                  </h3>
                  <p className="text-body-color text-sm mb-4">
                    Have questions or want to collaborate? We'd love to hear from you!
                  </p>
                  <a
                    href="/contact"
                    className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    Contact Us
                  </a>
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
