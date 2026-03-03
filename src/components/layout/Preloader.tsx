'use client';

import { useEffect, useState } from 'react';

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // Hide preloader after animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!isLoading || !mounted) return null;

  return (
    <div className={`resh-preloader ${isLoading ? 'loading' : ''}`}>
      <div className="resh-preloader-inner">
        {/* Animated Background Elements */}
        <div className="resh-bg-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
        </div>

        {/* Resh Logo with Macron */}
        <div className="resh-logo-container">
          <div className="resh-logo">
            <span className="resh-char-r">r</span>
            <span className="resh-char-e">
              <span className="resh-macron"></span>
              e
            </span>
            <span className="resh-char-s">s</span>
            <span className="resh-char-h">h</span>
          </div>
          <div className="resh-tagline">Community</div>
        </div>

        {/* Progress Bar */}
        <div className="resh-progress-container">
          <div className="resh-progress-bar">
            <div
              className="resh-progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="resh-progress-glow"></div>
            </div>
          </div>
          <div className="resh-progress-text">
            <span>{Math.min(Math.round(progress), 100)}%</span>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="resh-floating-elements">
          <div className="float-element float-btc">₿</div>
          <div className="float-element float-eth">Ξ</div>
          <div className="float-element float-diamond">◆</div>
        </div>
      </div>
    </div>
  );
}
