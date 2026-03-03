import { Clock } from 'lucide-react';

interface ReadingTimeProps {
  content?: string;
  minutes?: number;
  className?: string;
}

const WORDS_PER_MINUTE = 200;

export function ReadingTime({ content, minutes, className = '' }: ReadingTimeProps) {
  const calculatedMinutes = minutes ?? (content ? calculateReadingTime(content) : 0);

  if (calculatedMinutes === 0) return null;

  return (
    <div className={`reading-time flex items-center gap-1.5 text-b4 text-body-color ${className}`}>
      <Clock className="w-4 h-4" />
      <span>{calculatedMinutes} min read</span>
    </div>
  );
}

// Utility function for calculating reading time
export function calculateReadingTime(content: string): number {
  const textContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = textContent.split(' ').length;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}
