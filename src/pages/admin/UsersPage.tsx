import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User,
  Mail, 
  Star,
  Crown,
  Calendar,
  Search,
  Filter,
  Loader,
  Shield,
  Ban,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Settings
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User as UserType } from '../../types/database';

type ExtendedUser = UserType & {
  full_name?: string;
  status: 'active' | 'suspended' | 'pending';
  last_login?: string;
};

function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'points'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simulated user data
      const dummyUsers: ExtendedUser[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          full_name: 'John Doe',
          role: 'user',
          points: 1500,
          status: 'active',
          last_login: '2024-01-26T15:30:00Z',
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          email: 'dj.nova@example.com',
          full_name: 'DJ Nova',
          role: 'dj',
          points: 3000,
          status: 'active',
          last_login: '2024-01-27T09:15:00Z',
          created_at: '2024-01-05T14:30:00Z'
        },
        {
          id: '3',
          email: 'promoter@example.com',
          full_name: 'Event Master',
          role: 'promoter',
          points: 2500,
          status: 'active',
          last_login: '2024-01-27T11:45:00Z',
          created_at: '2024-01-10T09:00:00Z'
        },
        {
          id: '4',
          email: 'pending@example.com',
          role: 'user',
          points: 0,
          status: 'pending',
          created_at: '2024-01-26T16:00:00Z'
        },
        {
          id: '5',
          email: 'suspended@example.com',
          full_name: 'Suspended User',
          role: 'user',
          points: 100,
          status: 'suspended',
          last_login: '2024-01-20T08:30:00Z',
          created_at: '2024-01-15T13:45:00Z'
        }
      ];

      setUsers(dummyUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      // In a real app, this would update the user's status in the database
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      // Show error message to user
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'dj':
        return <Star className="h-4 w-4 text-purple-400" />;
      case 'promoter':
        return <Calendar className="h-4 w-4 text-blue-400" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'suspended':
        return <Ban className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    }
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
        <h3 className="mt-2 text-lg font-medium text-white">Error Loading Users</h3>
        <p className="mt-1 text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">User Management</h2>
        <Link
          to="/admin/users/new"
          className="premium-button flex items-center space-x-2"
        >
          <Shield className="h-5 w-5" />
          <span>Add Admin</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl p-4 border border-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="dj">DJ</option>
              <option value="promoter">Promoter</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'created_at' | 'points');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="points-desc">Highest Points</option>
              <option value="points-asc">Lowest Points</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Points</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {user.full_name || 'Unnamed User'}
                        </div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm text-gray-300 capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{user.points.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status)}
                      <span className={`text-sm capitalize ${
                        user.status === 'active' ? 'text-green-400' :
                        user.status === 'suspended' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {user.last_login ? formatDate(user.last_login) : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative inline-block text-left">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No users found</h3>
            <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;