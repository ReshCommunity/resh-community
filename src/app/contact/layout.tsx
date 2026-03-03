import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Resh Community. We\'d love to hear from you!',
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
