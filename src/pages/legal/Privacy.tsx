import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </Link>

      <div className="glass-effect rounded-xl p-8 border border-gray-800/50">
        <div className="flex items-center mb-8">
          <Lock className="h-8 w-8 text-purple-400 mr-4" />
          <h1 className="text-4xl font-bold text-gradient">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you:
          </p>
          <ul>
            <li>Create an account</li>
            <li>Purchase tickets</li>
            <li>Contact support</li>
            <li>Use our services</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Process your transactions</li>
            <li>Send you tickets and confirmations</li>
            <li>Provide customer support</li>
            <li>Improve our services</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We share your information only with:
          </p>
          <ul>
            <li>Event organizers (for ticket purchases)</li>
            <li>Service providers (payment processing, email delivery)</li>
            <li>Law enforcement (when required by law)</li>
          </ul>

          {/* Add more sections as needed */}
        </div>
      </div>
    </div>
  );
}