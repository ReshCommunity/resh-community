'use client';

import { Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  showLabels?: boolean;
  className?: string;
}

export function SocialShare({
  url,
  title,
  description,
  showLabels = false,
  className = '',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  // Default to current page if no URL provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || 'Check out this article';
  const shareDescription = description || '';

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareTitle) + '&url=' + encodeURIComponent(shareUrl),
      color: 'hover:text-[#1DA1F2]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl),
      color: 'hover:text-[#1877F2]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl),
      color: 'hover:text-[#0A66C2]',
    },
    {
      name: 'Copy',
      icon: LinkIcon,
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      color: 'hover:text-primary',
      label: copied ? 'Copied!' : 'Copy link',
    },
  ];

  return (
    <div className={'social-share flex items-center gap-3 ' + className}>
      <span className='text-sm text-body-color font-medium mr-2'>Share:</span>
      {shareLinks.map((link) => {
        const Icon = link.icon;
        if (link.action) {
          return (
            <button
              key={link.name}
              onClick={link.action}
              className={'w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ' + link.color}
              title={link.label}
            >
              <Icon className='w-4 h-4' />
            </button>
          );
        }
        return (
          <a
            key={link.name}
            href={link.href}
            target='_blank'
            rel='noopener noreferrer'
            className={'w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ' + link.color}
            title={'Share on ' + link.name}
          >
            <Icon className='w-4 h-4' />
          </a>
        );
      })}
    </div>
  );
}
