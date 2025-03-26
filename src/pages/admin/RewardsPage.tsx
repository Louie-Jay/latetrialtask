import React, { useState, useEffect } from 'react';
import { 
  Star,
  Crown,
  Search,
  Filter,
  Loader,
  Calendar,
  Users,
  DollarSign,
  Ticket,
  AlertCircle,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type RewardStats = {
  totalRewards: number;
  totalDiscounts: number;
  activeUsers: number;
  redemptionRate: number;
};

type RewardUsage = {
  id: string;
  event_name: string;
  user_name: string;
  professional_name: string;
  reward_name: string;
  tier_name: string;
  discount_amount: number;
  created_at: string;
};

export default function RewardsPage() {
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [rewardUsage, setRewardUsage] = useState<RewardUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRewardData();
  }, []);

  const fetchRewardData = async () => {
    try {
      // Fetch reward usage with related data
      const { data: usageData, error: usageError } = await supabase
        .from('reward_usages')
        .select(`
          id,
          discount_amount,
          created_at,
          events!inner (
            name,
            user_id
          ),
          users!reward_usages_user_id_fkey (
            full_name
          ),
          reward_benefits!inner (
            name,
            reward_tiers!inner (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (usageError) throw usageError;

      // Get professional names
      const professionalIds = [...new Set(usageData.map(u => u.events.user_id))];
      const { data: professionals, error: profError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', professionalIds);

      if (profError) throw profError;

      // Transform data
      const transformedUsage = usageData.map(usage => ({
        id: usage.id,
        event_name: usage.events.name,
        user_name: usage.users.full_name,
        professional_name: professionals.find(p => p.id === usage.events.user_id)?.full_name || 'Unknown',
        reward_name: usage.reward_benefits.name,
        tier_name: usage.reward_benefits.reward_tiers.name,
        discount_amount: usage.discount_amount,
        created_at: usage.created_at
      }));

      // Calculate stats
      const stats: RewardStats = {
        totalRewards: transformedUsage.length,
        totalDiscounts: transformedUsage.reduce((sum, usage) => sum + usage.discount_amount, 0),
        activeUsers: new Set(transformedUsage.map(u => u.user_name)).size,
        redemptionRate: (transformedUsage.length / (transformedUsage.length || 1)) * 100
      };

      setStats(stats);
      setRewardUsage(transformedUsage);
      setError(null);
    } catch (err) {
      console.error('Error fetching reward data:', err);
      setError('Failed to load reward data');
    } finally {
      setLoading(false);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsage = rewardUsage.filter(usage => {
    const matchesSearch = 
      usage.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.professional_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = !tierFilter || usage.tier_name === tierFilter;
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(usage.created_at).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(usage.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(usage.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesTier && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return sortOrder === 'asc'
      ? a.discount_amount - b.discount_amount
      : b.discount_amount - a.discount_amount;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-lg font-medium text-white">Error Loading Rewards</h3>
        <p className="mt-1 text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Reward Usage</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Rewards Used',
            value: stats?.totalRewards.toString() || '0',
            icon: Star,
            color: 'text-purple-400',
            bg: 'bg-purple-900/20',
            trend: 12.5,
            trendLabel: 'vs last month'
          },
          {
            label: 'Total Discounts',
            value: formatCurrency(stats?.totalDiscounts || 0),
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-900/20',
            trend: 8.2,
            trendLabel: 'vs last month'
          },
          {
            label: 'Active Users',
            value: stats?.activeUsers.toString() || '0',
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-900/20',
            trend: 15.3,
            trendLabel: 'vs last month'
          },
          {
            label: 'Redemption Rate',
            value: `${Math.round(stats?.redemptionRate || 0)}%`,
            icon: Percent,
            color: 'text-yellow-400',
            bg: 'bg-yellow-900/20',
            trend: -2.4,
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
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl p-4 border border-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Tier Filter */}
          <div className="relative">
            <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Tiers</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'date' | 'amount');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reward Usage Table */}
      <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Event</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Professional</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Reward</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Tier</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredUsage.map((usage) => (
                <tr key={usage.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{usage.event_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{usage.user_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{usage.professional_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{usage.reward_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{usage.tier_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{formatCurrency(usage.discount_amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{formatDate(usage.created_at)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsage.length === 0 && (
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No rewards found</h3>
            <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}