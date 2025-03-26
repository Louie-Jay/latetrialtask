import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function Error500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-premium-black">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse" />
          <AlertTriangle className="relative z-10 mx-auto h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-4xl font-bold text-gradient mb-4">Server Error</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Something went wrong on our end. Please try again later.
        </p>
        <Link
          to="/"
          className="premium-button inline-flex items-center space-x-2"
        >
          <Home className="h-5 w-5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}