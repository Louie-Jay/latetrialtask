import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Music, 
  MapPin, 
  Users, 
  Filter, 
  Loader, 
  Upload,
  PlusCircle,
  Settings,
  BarChart3,
  Ticket,
  Mail,
  Lock,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event, User, Venue } from '../types/database';
import UsersPage from './admin/UsersPage';
import DJsPage from './admin/DJsPage';
import PromotersPage from './admin/PromotersPage';
import VenuesPage from './admin/VenuesPage';

type AdminStats = {
  totalUsers: number;
  totalEvents: number;
  totalVenues: number;
  totalTicketsSold: number;
  revenue: number;
};

type AdminSection = 'events' | 'users' | 'venues' | 'djs' | 'promoters';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowLogin(true);
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      if (userData?.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      fetchAdminData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      setError('Failed to verify admin access');
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch admin stats
      const dummyStats: AdminStats = {
        totalUsers: 1250,
        totalEvents: 45,
        totalVenues: 12,
        totalTicketsSold: 3750,
        revenue: 187500
      };

      setStats(dummyStats);
      setError(null);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (userError) throw userError;

        if (userData?.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }

        setIsAdmin(true);
        setShowLogin(false);
        fetchAdminData();
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Invalid credentials or insufficient privileges');
    } finally {
      setLoginLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premium-black">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse" />
              <Settings className="relative z-10 mx-auto h-16 w-16 text-purple-400" />
            </div>
            <h2 className="mt-6 text-4xl font-bold text-gradient">Admin Portal</h2>
            <p className="mt-3 text-gray-400">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="glass-effect rounded-xl p-8 border border-gray-800/50 shadow-2xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="premium-button w-full py-4"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Sign In
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-400 mb-4" />
          <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse" />
            <Settings className="relative z-10 mx-auto h-16 w-16 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/"
            className="premium-button inline-flex items-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your platform and monitor performance</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowStatsDetails(!showStatsDetails)}
              className="secondary-button flex items-center space-x-2"
            >
              <Activity className="h-5 w-5" />
              <span>Analytics</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showStatsDetails ? 'rotate-180' : ''}`} />
            </button>
            <Link
              to="/account"
              className="premium-button flex items-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: 'Total Users',
            value: stats?.totalUsers.toString() || '0',
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-900/20',
            trend: 12.5,
            trendLabel: 'vs last month'
          },
          {
            label: 'Active Events',
            value: stats?.totalEvents.toString() || '0',
            icon: Calendar,
            color: 'text-pink-400',
            bg: 'bg-pink-900/20',
            trend: 8.2,
            trendLabel: 'vs last month'
          },
          {
            label: 'Tickets Sold',
            value: stats?.totalTicketsSold.toString() || '0',
            icon: Ticket,
            color: 'text-indigo-400',
            bg: 'bg-indigo-900/20',
            trend: -2.4,
            trendLabel: 'vs last month'
          },
          {
            label: 'Revenue',
            value: formatCurrency(stats?.revenue || 0),
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-900/20',
            trend: 15.3,
            trendLabel: 'vs last month'
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden group hover:border-purple-500/20 transition-colors"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-colors">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              
              {showStatsDetails && (
                <div className="mt-4 pt-4 border-t border-gray-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{stat.trendLabel}</span>
                    <div className={`flex items-center ${
                      stat.trend > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.trend > 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(stat.trend)}%
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-gray-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.trend > 0 ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(Math.abs(stat.trend) * 5, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Management Tabs */}
      <div className="glass-effect rounded-xl border border-gray-800/50 mb-8">
        <div className="border-b border-gray-800/50">
          <nav className="flex -mb-px">
            {[
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'venues', label: 'Venues', icon: MapPin },
              { id: 'djs', label: 'DJs', icon: Music },
              { id: 'promoters', label: 'Promoters', icon: Star }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as AdminSection)}
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
        </div>

        <div className="p-6">
          {/* Render content based on active section */}
          {activeSection === 'users' && <UsersPage />}
          {activeSection === 'djs' && <DJsPage />}
          {activeSection === 'promoters' && <PromotersPage />}
          {activeSection === 'venues' && <VenuesPage />}
          {activeSection === 'events' && (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-white">Events Management Coming Soon</h3>
              <p className="mt-1 text-gray-400">This section is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;