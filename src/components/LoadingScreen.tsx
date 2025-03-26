import React, { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';

type LoadingScreenProps = {
  onLoadComplete: () => void;
};

export default function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const [stage, setStage] = useState<'initial' | 'zoom' | 'complete'>('initial');

  useEffect(() => {
    let mounted = true;
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;

    const startAnimation = () => {
      timer1 = setTimeout(() => {
        if (mounted) setStage('zoom');
      }, 500);

      timer2 = setTimeout(() => {
        if (mounted) setStage('complete');
      }, 1000);

      timer3 = setTimeout(() => {
        if (mounted) onLoadComplete();
      }, 1500);
    };

    // Start animation on next frame
    requestAnimationFrame(startAnimation);

    return () => {
      mounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 bg-premium-black flex items-center justify-center z-50">
      <div className="relative">
        <div className={`
          transform transition-all duration-500 ease-in-out
          ${stage === 'zoom' ? 'scale-[8] opacity-0' : 'scale-100 opacity-100'}
        `}>
          <div className="relative">
            <div className="absolute inset-0 animate-pulse">
              <Ticket className="h-20 w-20 text-purple-500 transform rotate-12" />
            </div>
            <Ticket className="h-20 w-20 text-white transform -rotate-12" />
          </div>
        </div>

        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap
          transition-all duration-500
          ${stage === 'initial' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}
        `}>
          <h1 className="text-4xl font-bold">
            <span className="text-gradient">Real L!VE</span>
          </h1>
        </div>
      </div>
    </div>
  );
}