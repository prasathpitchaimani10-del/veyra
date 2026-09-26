import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginPageProps {
  onNavigate: (view: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.adminLogin({ email, password });
      loginAdmin(res.token, res.admin);
      onNavigate('admin-dashboard');
    } catch (err: any) {
      setError(err.message || 'Administrative authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@veyra.store');
    setPassword('AdminPassword123');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 bg-[#0E1013] text-neutral-100">
      
      {/* Return to Storefront */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-[#16191E] border border-neutral-800 rounded-xl p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Terminal / Administrative Header */}
        <div className="space-y-3 pb-4 border-b border-neutral-800">
          <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200">
            <KeyRound className="w-6 h-6 text-neutral-200 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Administrative Operations Gateway
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">
              Veyra Systems Console
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Restricted portal for inventory, catalog updates, customer management, and order fulfillment.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-md text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-neutral-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@veyra.store"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#0F1115] border border-neutral-700 text-white rounded-md focus:outline-none focus:border-neutral-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-neutral-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#0F1115] border border-neutral-700 text-white rounded-md focus:outline-none focus:border-neutral-400 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-200 rounded-md transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating System...' : 'Access Admin Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="p-3 bg-[#0F1115] border border-neutral-800 rounded-md flex items-center justify-between text-xs text-neutral-400">
          <span>Configured Admin:</span>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="text-xs font-mono text-neutral-200 hover:text-white underline"
          >
            Fill Admin Credentials
          </button>
        </div>

        <div className="pt-2 text-center text-[11px] text-neutral-500">
          Authorized personnel only. All access is logged for audit security.
        </div>

      </div>

    </div>
  );
};
