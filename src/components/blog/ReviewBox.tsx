import { Check, X, Star } from 'lucide-react';

export interface ReviewBoxProps {
  score: number;
  name?: string;
  pros?: string[];
  cons?: string[];
  summary?: string;
  maxScore?: number;
}

export function ReviewBox({
  score,
  name = 'Review',
  pros = [],
  cons = [],
  summary,
  maxScore = 10,
}: ReviewBoxProps) {
  const percentage = (score / maxScore) * 100;

  // Determine color based on score
  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = () => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="review-box rounded-lg border border-gray-200 p-6 my-6 bg-gray-50">
      {/* Header with Score */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="font-heading font-semibold text-h4 text-heading-color">
            {name}
          </h3>
          {summary && (
            <p className="text-body-color text-b2 mt-1">{summary}</p>
          )}
        </div>
        <div
          className={`flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor()} ${getScoreColor()}`}
        >
          <div className="text-center">
            <span className="block text-3xl font-bold">{score}</span>
            <span className="block text-xs">/ {maxScore}</span>
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-6">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = (i + 1) * (maxScore / 5);
          return (
            <Star
              key={i}
              className={`w-5 h-5 ${
                score >= starValue
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          );
        })}
      </div>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        {pros.length > 0 && (
          <div>
            <h4 className="font-heading font-semibold text-sm text-green-600 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Pros
            </h4>
            <ul className="space-y-2">
              {pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-body-color">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {cons.length > 0 && (
          <div>
            <h4 className="font-heading font-semibold text-sm text-red-600 mb-3 flex items-center gap-2">
              <X className="w-4 h-4" />
              Cons
            </h4>
            <ul className="space-y-2">
              {cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-body-color">
                  <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
