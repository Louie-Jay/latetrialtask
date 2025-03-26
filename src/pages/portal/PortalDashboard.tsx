import React, { useState, useEffect } from 'react';
import {
  Music,
  Users,
  Calendar,
  DollarSign,
  Ticket,
  TrendingUp,
  Settings,
  Plus,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Loader,
  QrCode,
  Shield,
  MapPin,
  Star,
  Crown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StripeConnectButton from '../../components/StripeConnectButton';

// Add RewardsPage to imports
import RewardsPage from '../admin/RewardsPage';
import UsersPage from '../admin/UsersPage';
import DJsPage from '../admin/DJsPage';
import PromotersPage from '../admin/PromotersPage';
import VenuesPage from '../admin/VenuesPage';
import EventsPage from '../admin/EventsPage';

export default function PortalDashboard() {
  const [activeSection, setActiveSection] = useState<'events' | 'users' | 'venues' | 'djs' | 'promoters' | 'rewards'>('users');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUser(profile);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stripe Connect Section */}
      {user && (
        <div className="mb-8">
          <StripeConnectButton
            accountId={user.stripe_account_id}
            accountStatus={user.stripe_account_status}
            onConnect={fetchUser}
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="glass-effect rounded-xl border border-gray-800/50">
        <nav className="flex -mb-px">
          {[
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'venues', label: 'Venues', icon: MapPin },
            { id: 'djs', label: 'DJs', icon: Music },
            { id: 'promoters', label: 'Promoters', icon: Star },
            { id: 'rewards', label: 'Rewards', icon: Crown }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`
                flex-1 px-4 py-4 text-center border-b-2 font-medium text-sm
                transition-all duration-300
                ${activeSection === tab.id
                  ? 'border-purple-500 text-purple-400 bg-purple-900/10'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'}
              `}
            >
              <tab.icon className="h-5 w-5 mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="p-6">
          {activeSection === 'users' && <UsersPage />}
          {activeSection === 'djs' && <DJsPage />}
          {activeSection === 'promoters' && <PromotersPage />}
          {activeSection === 'venues' && <VenuesPage />}
          {activeSection === 'events' && <EventsPage />}
          {activeSection === 'rewards' && <RewardsPage />}
        </div>
      </div>
    </div>
  );
}