'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebookF, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';

interface HeaderProps {
  transparent?: boolean;
  sticky?: boolean;
}

export function Header({ transparent = false, sticky = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNav = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { name: 'twitter', href: 'https://twitter.com/reshcommunity', icon: faTwitter },
    { name: 'facebook', href: 'https://facebook.com/reshcommunity', icon: faFacebookF },
    { name: 'linkedin', href: 'https://linkedin.com/company/reshcommunity', icon: faLinkedinIn },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <header
        className={`axil-header header-style-6 header-light ${sticky ? 'header-sticky header-slide-down' : ''} ${transparent ? 'header-transparent' : ''}`}
      >
        {/* Header Top */}
        <div className="header-top">
          <div className="container">
            <div className="row align-items-center">
              {/* Social Icons - col-xl-4 col-lg-4 col-md-6 col-sm-9 */}
              <div className="col-xl-4 col-lg-4 col-md-6 col-sm-9">
                <ul className="social-icon color-white md-size">
                  {socialLinks.map((social) => (
                    <li key={social.name}>
                      <a
                        href={social.href}
                        className={social.name}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={social.icon} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Logo - col-xl-4 col-lg-4 col-md-6 col-sm-3 */}
              <div className="col-xl-4 col-lg-4 col-md-6 col-sm-3">
                <div className="logo text-center">
                  <Link href="/" title="Resh Community" rel="home">
                    {/* Light mode logo - shown by default */}
                    <Image
                      src="/images/logo/logo.webp"
                      alt="Resh Community"
                      width={200}
                      height={200}
                      className="logo-light"
                      priority
                    />
                    {/* Dark mode logo - shown in dark mode */}
                    <Image
                      src="/images/logo/dark-logo.webp"
                      alt="Resh Community"
                      width={200}
                      height={200}
                      className="logo-dark"
                      priority
                    />
                  </Link>
                </div>
              </div>

              {/* Date & Top Menu - col-xl-4 col-lg-4 col-md-12 col-sm-12 */}
              <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                <div className="header-top-bar d-flex justify-content-center justify-content-lg-end flex-wrap align-items-center">
                  <ul className="header-top-date liststyle d-flex flex-wrap align-items-center">
                    <li>{currentDate}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Bottom */}
        <div className="header-bottom">
          <div className="container">
            <div className="row justify-content-between align-items-center">
              {/* Main Navigation & Hamburger - col-xl-9 col-md-6 col-sm-3 col-4 */}
              <div className="col-xl-9 col-md-6 col-sm-3 col-4">
                <div className="mainmenu-wrapper d-none d-xl-block">
                  <ul className="mainmenu-nav">
                    {mainNav.map((item) => (
                      <li key={item.name}>
                        <Link href={item.href}>{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hamburger Menu */}
                <div
                  className="hamburger-menu d-block d-xl-none"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <div className="hamburger-inner">
                    <div className="icon">{mobileMenuOpen ? '\u2715' : '\u2630'}</div>
                  </div>
                </div>
              </div>

              {/* Search - col-xl-3 col-md-6 col-sm-9 col-8 */}
              <div className="d-none d-sm-block col-xl-3 col-md-6 col-sm-9 col-8">
                <div className="header-search d-flex flex-wrap align-items-center justify-content-end justify-content-xl-end gap-3">
                  <DarkModeToggle />
                  <form action="/search" method="GET" className="blog-search">
                    <div className="axil-search form-group">
                      <button type="submit" className="search-button">
                        <FontAwesomeIcon icon={faSearch} />
                      </button>
                      <input
                        type="text"
                        name="q"
                        className="form-control"
                        placeholder="Search ..."
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* Mobile Search */}
              <div className="mobile-search-wrapper d-block d-sm-none col-xl-2 col-md-6 col-sm-9 col-8">
                <div className="header-search text-right d-flex align-items-center justify-content-end gap-2">
                  <DarkModeToggle />
                  <form action="/search" method="GET" className="blog-search large-mobile-blog-search">
                    <div className="axil-search-mobile form-group">
                      <button type="submit" className="search-button">
                        <FontAwesomeIcon icon={faSearch} />
                      </button>
                      <input
                        type="text"
                        name="q"
                        className="form-control"
                        placeholder="Search ..."
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-wrapper d-xl-none">
          <div className="mobile-menu">
            <nav>
              <ul className="mobile-menu-list">
                {mainNav.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
