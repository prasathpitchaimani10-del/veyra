import React, { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { registerCustomer } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please enter your full name (minimum 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    const phoneRegex = /^[0-9+()\- ]{7,18}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      errors.phone = 'Please provide a valid contact phone number.';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setServerError(null);
      const res = await api.register(formData);
      setSuccessMessage('Registration successful! Redirecting to storefront...');
      setTimeout(() => {
        registerCustomer(res.token, res.user);
        onNavigate('home');
      }, 900);
    } catch (err: any) {
      setServerError(err.message || 'Unable to complete registration. Please verify your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-20">
      <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-900 font-sans">
            Veyra
          </span>
          <h1 className="text-xl font-bold text-neutral-900">
            Create Your Customer Account
          </h1>
          <p className="text-xs text-neutral-500">
            Enjoy streamlined Cash on Delivery checkouts and live delivery updates.
          </p>
        </div>

        {serverError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Arjun Mehta"
                className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                  formErrors.name ? 'border-rose-500' : 'border-neutral-300'
                }`}
              />
            </div>
            {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@domain.com"
                className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                  formErrors.email ? 'border-rose-500' : 'border-neutral-300'
                }`}
              />
            </div>
            {formErrors.email && <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                  formErrors.phone ? 'border-rose-500' : 'border-neutral-300'
                }`}
              />
            </div>
            {formErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Password (minimum 6 characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                  formErrors.password ? 'border-rose-500' : 'border-neutral-300'
                }`}
              />
            </div>
            {formErrors.password && <p className="text-[11px] text-rose-600 mt-1">{formErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                  formErrors.confirmPassword ? 'border-rose-500' : 'border-neutral-300'
                }`}
              />
            </div>
            {formErrors.confirmPassword && <p className="text-[11px] text-rose-600 mt-1">{formErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating Your Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-100 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-semibold text-neutral-900 hover:underline"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
