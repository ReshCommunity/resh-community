'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems?: Array<{ name: string; href: string }>;
}

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const defaultNavItems = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const items = navItems || defaultNavItems;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 lg:hidden shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="font-heading font-bold text-xl">Menu</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-heading font-medium text-heading-color"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-4 justify-center">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors"
              >
                <span>𝕏</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors"
              >
                <span>f</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors"
              >
                <span>in</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
