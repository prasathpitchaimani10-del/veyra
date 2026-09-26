import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, ShoppingBag, LogOut, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AccountPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, isUserLoggedIn, logoutCustomer, updateUserContext } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isUserLoggedIn || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Please Sign In</h2>
        <p className="text-xs text-neutral-500">Sign in to view and manage your account details.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await api.updateProfile({ name, phone });
      updateUserContext(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Verified Member';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Account Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your personal profile, contact information, and order tracking.
          </p>
        </div>

        <button
          onClick={() => {
            logoutCustomer();
            onNavigate('home');
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 border border-rose-200 rounded-md hover:bg-rose-50 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Quick Profile Card */}
        <div className="md:col-span-5 bg-white border border-neutral-200 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-neutral-900 truncate">{user.name}</h2>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>

          <div className="p-4 bg-[#FBFBF9] border border-neutral-200 rounded-lg space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span className="text-neutral-500">Account Type:</span>
              <span className="font-semibold text-neutral-900 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Registered:</span>
              <span className="font-medium text-neutral-900">{formattedDate}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigate('orders')}
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-700" />
                <span>My Orders</span>
              </div>
              <span className="text-neutral-400">→</span>
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-700" />
                <span>View Cart</span>
              </div>
              <span className="text-neutral-400">→</span>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Personal Information
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Update your primary contact information used for Cash on Delivery consignments.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile details updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Email Address (Primary Account Identifier)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-neutral-100 border border-neutral-200 text-neutral-500 rounded-md cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Email cannot be altered for security reasons.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
};
