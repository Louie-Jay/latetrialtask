import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Music, Star, ArrowRight } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

export default function Splash() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Trigger mount animation after loading
      setTimeout(() => setMounted(true), 100);
    }
  }, [loading]);

  const handleLoadComplete = () => {
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <LoadingScreen onLoadComplete={handleLoadComplete} />
      ) : (
        <div className="fixed inset-0 bg-premium-black">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] animate-pulse-slow" />
              <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-[128px] animate-pulse-slow delay-700" />
              <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500 rounded-full filter blur-[128px] animate-pulse-slow delay-1000" />
            </div>
            
            {/* Noise texture overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noiseFilter%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url%28%23noiseFilter%29%27/%3E%3C/svg%3E')] opacity-20" />
          </div>

          {/* Content */}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className={`text-center transform transition-all duration-1000 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              {/* Logo */}
              <div className="mb-8 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse-slow">
                    <Ticket className="h-20 w-20 text-purple-500 transform rotate-12" />
                  </div>
                  <Ticket className="h-20 w-20 text-white transform -rotate-12" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-7xl sm:text-8xl font-bold mb-6">
                <span className="text-gradient">Real L!VE</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-12">
                Your gateway to unforgettable events, exclusive experiences, and premium entertainment
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
                {[
                  {
                    icon: Music,
                    title: 'World-Class Events',
                    description: 'Experience the best in electronic music'
                  },
                  {
                    icon: Star,
                    title: 'VIP Benefits',
                    description: 'Unlock exclusive perks and rewards'
                  },
                  {
                    icon: Ticket,
                    title: 'Instant Access',
                    description: 'Secure your tickets in seconds'
                  }
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="glass-effect rounded-xl p-6 border border-gray-800/50 transform transition-all duration-500 hover:scale-105 hover:border-purple-500/50"
                  >
                    <feature.icon className="h-8 w-8 text-purple-400 mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>

              {/* Enter Button */}
              <button
                onClick={() => navigate('/home')}
                className="group relative premium-button text-lg px-12 py-4"
              >
                <span className="flex items-center">
                  Enter Experience
                  <ArrowRight className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 rounded-full premium-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}