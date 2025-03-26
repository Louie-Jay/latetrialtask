import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Terms() {
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
          <Shield className="h-8 w-8 text-purple-400 mr-4" />
          <h1 className="text-4xl font-bold text-gradient">Terms of Service</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Real L!VE, you agree to be bound by these Terms of Service.
          </p>

          <h2>2. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account.
          </p>

          <h2>3. Event Tickets</h2>
          <p>
            All ticket sales are final. Refunds may be issued at the discretion of event organizers
            in accordance with their refund policies.
          </p>

          <h2>4. Platform Rules</h2>
          <p>
            Users must comply with all applicable laws and regulations. Prohibited activities include:
          </p>
          <ul>
            <li>Fraudulent ticket sales or purchases</li>
            <li>Harassment of other users</li>
            <li>Unauthorized resale of tickets</li>
            <li>Creation of fake events</li>
          </ul>

          {/* Add more sections as needed */}
        </div>
      </div>
    </div>
  );
}