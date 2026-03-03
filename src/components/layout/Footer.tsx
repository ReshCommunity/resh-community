import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebookF, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { ScrollToTop } from './ScrollToTop';

interface FooterProps {
  showWidgets?: boolean;
}

export function Footer({ showWidgets = true }: FooterProps) {
  const footerNav = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
  ];

  const socialLinks = [
    { name: 'twitter', href: 'https://twitter.com/reshcommunity', icon: faTwitter },
    { name: 'facebook', href: 'https://facebook.com/reshcommunity', icon: faFacebookF },
    { name: 'linkedin', href: 'https://linkedin.com/company/reshcommunity', icon: faLinkedinIn },
    { name: 'instagram', href: 'https://instagram.com/reshcommunity', icon: faInstagram },
  ];

  const footerWidgets = [
    {
      title: 'About Us',
      content: 'Resh Community Blog brings you the latest crypto news, insights, and analysis from the world of blockchain and cryptocurrency.',
    },
    {
      title: 'Quick Links',
      links: [
        { name: 'Home', href: '/' },
        { name: 'Blog', href: '/blog' },
        { name: 'Categories', href: '/categories' },
      ],
    },
    {
      title: 'Categories',
      links: [
        { name: 'Bitcoin', href: '/category/bitcoin' },
        { name: 'Ethereum', href: '/category/ethereum' },
        { name: 'DeFi', href: '/category/defi' },
      ],
    },
    {
      title: 'Newsletter',
      content: 'Subscribe to our newsletter for the latest updates.',
    },
  ];

  return (
    <>
      <div className="axil-footer-area axil-default-footer axil-footer-var-1 footer-menu-active">
        {showWidgets && (
          <div className="footer-mainmenu">
            <div className="container">
              <div className="row">
                {footerWidgets.map((widget, index) => (
                  <div
                    key={index}
                    className="col-lg-2 col-md-6 col-sm-6 col-12"
                  >
                    <div
                      className={`footer-widget-item ${index === 0 ? 'axil-border-right' : ''} ${index >= footerWidgets.length - 1 ? 'widget-last' : ''}`}
                    >
                      {widget.title && (
                        <h3 className="footer-widget-title">
                          {widget.title}
                        </h3>
                      )}
                      {widget.content && (
                        <p>{widget.content}</p>
                      )}
                      {widget.links && (
                        <ul className="liststyle">
                          {widget.links.map((link) => (
                            <li key={link.name}>
                              <Link href={link.href}>
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      {widget.title === 'Newsletter' && (
                        <form className="mt--20">
                          <div className="d-flex">
                            <input
                              type="email"
                              placeholder="Your email"
                              className="form-control"
                            />
                            <button
                              type="submit"
                              className="btn-fill-primary hover-flip-item-wrapper"
                            >
                              <span className="hover-flip-item">
                                <span data-text="Subscribe">Subscribe</span>
                              </span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="footer-top">
          <div className="container">
            <div className="row">
              <div className="col-lg-4 col-md-4">
                <div className="logo mb_sm--10">
                  <Link href="/" title="Resh Community" rel="home">
                    <Image
                      src="/images/logo/logo.webp"
                      alt="Resh Community"
                      width={200}
                      height={200}
                      className="logo-light"
                    />
                    <Image
                      src="/images/logo/dark-logo.webp"
                      alt="Resh Community"
                      width={200}
                      height={200}
                      className="logo-dark"
                    />
                  </Link>
                </div>
              </div>

              <div className="col-lg-8 col-md-8">
                <div className="d-flex justify-content-start mt_sm--15 justify-content-md-end align-items-center flex-wrap">
                  <h5 className="follow-title mb--0 mr--20">Follow us:</h5>
                  <ul className="social-icon color-tertiary md-size justify-content-start">
                    {socialLinks.map((social) => (
                      <li key={social.name}>
                        <a
                          className={`${social.name} social-icon`}
                          href={social.href}
                          title={social.name}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FontAwesomeIcon icon={social.icon} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="copyright-area">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="copyright-left">
                  <ul className="footer-nav liststyle d-flex flex-wrap">
                    {footerNav.map((item) => (
                      <li key={item.name}>
                        <Link href={item.href}>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-lg-4 mt_md--20 mt_sm--20">
                <div className="copyright-right text-left text-lg-right">
                  <p>
                    &copy; {new Date().getFullYear()} Resh Community. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </>
  );
}
