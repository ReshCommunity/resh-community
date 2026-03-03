import { Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PostMetaProps {
  date?: string;
  author?: string;
  readingTime?: number;
  showDate?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
  className?: string;
}

export function PostMeta({
  date,
  author = 'Resh Community',
  readingTime,
  showDate = true,
  showAuthor = true,
  showReadingTime = true,
  className = '',
}: PostMetaProps) {
  return (
    <div className={`post-meta flex flex-wrap items-center gap-4 ${className}`}>
      {showDate && date && (
        <div className="post-date flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <time dateTime={date}>
            {format(new Date(date), 'MMM d, yyyy')}
          </time>
        </div>
      )}

      {showAuthor && (
        <div className="post-author flex items-center gap-1.5">
          <User className="w-4 h-4" />
          <span className="author-name">{author}</span>
        </div>
      )}

      {showReadingTime && readingTime && (
        <div className="post-reading-time flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{readingTime} min read</span>
        </div>
      )}
    </div>
  );
}
