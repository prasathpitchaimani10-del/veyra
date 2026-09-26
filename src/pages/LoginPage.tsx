import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (view: string, param?: string) => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess }) => {
  const { loginCustomer } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.login({ email, password });
      loginCustomer(res.token, res.user);
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate('home');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('customer@veyra.store');
    setPassword('Customer123!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-900 font-sans">
            Veyra
          </span>
          <h1 className="text-xl font-bold text-neutral-900">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-neutral-500">
            Access your orders, saved addresses, and faster Cash on Delivery checkout.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-neutral-700">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Pre-fill for reviewer convenience */}
        <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-md flex items-center justify-between text-xs text-neutral-600">
          <span>Demo Account:</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold text-neutral-900 hover:underline"
          >
            Fill Sample Credentials
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-neutral-100 text-center space-y-3 text-xs text-neutral-500">
          <p>
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-semibold text-neutral-900 hover:underline"
            >
              Create Account
            </button>
          </p>

          <div>
            <button
              onClick={() => onNavigate('admin-login')}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <Shield className="w-3 h-3" />
              Are you an administrator? Switch to Admin Gateway
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
