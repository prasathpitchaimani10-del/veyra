import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Truck, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';

interface CheckoutPageProps {
  onNavigate: (view: string, param?: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { items, subtotal, deliveryFee, totalAmount, clearCart } = useCart();
  const { user, isUserLoggedIn } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phoneNumber: user?.phone || '',
    emailAddress: user?.email || '',
    deliveryAddress: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Your cart is currently empty</h2>
        <p className="text-xs text-neutral-500">Please add products before checking out.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    } else if (!/^[0-9+()\- ]{7,18}$/.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Please enter a valid phone number.';
    }

    if (!formData.emailAddress.trim()) {
      errors.emailAddress = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress.trim())) {
      errors.emailAddress = 'Please enter a valid email address.';
    }

    if (!formData.deliveryAddress.trim() || formData.deliveryAddress.trim().length < 5) {
      errors.deliveryAddress = 'Complete street/house address is required.';
    }

    if (!formData.city.trim()) errors.city = 'City is required.';
    if (!formData.state.trim()) errors.state = 'State is required.';
    if (!formData.pincode.trim() || !/^[0-9]{4,10}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Please enter a valid 6-digit pincode.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!isUserLoggedIn) {
      setApiError('Please sign in or register to place your order so it is linked to your account history.');
      return;
    }

    try {
      setSubmitting(true);
      setApiError(null);

      const payload = {
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          emailAddress: formData.emailAddress.trim(),
          deliveryAddress: formData.deliveryAddress.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        },
        paymentMethod: 'Cash on Delivery' as const
      };

      const res = await api.placeOrder(payload);
      clearCart();
      onOrderSuccess(res.order);
    } catch (err: any) {
      console.error('Order submission failed:', err);
      setApiError(err.message || 'Failed to place order. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Breadcrumb & Heading */}
      <div>
        <button
          onClick={() => onNavigate('cart')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cart
        </button>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900">
          Delivery & Checkout
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Complete your recipient and delivery address details below.
        </p>
      </div>

      {/* Auth Prompt if guest */}
      {!isUserLoggedIn && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>You are currently not logged in. Sign in or register to link this order to your account.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-900 text-white rounded hover:bg-amber-800 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Checkout Columns */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Delivery Details Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Address Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-100">
              1. Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Arjun Mehta"
                  className={`w-full px-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                    formErrors.fullName ? 'border-rose-500' : 'border-neutral-300'
                  }`}
                />
                {formErrors.fullName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                    formErrors.phoneNumber ? 'border-rose-500' : 'border-neutral-300'
                  }`}
                />
                {formErrors.phoneNumber && <p className="text-[11px] text-rose-600 mt-1">{formErrors.phoneNumber}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  placeholder="name@domain.com"
                  className={`w-full px-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                    formErrors.emailAddress ? 'border-rose-500' : 'border-neutral-300'
                  }`}
                />
                {formErrors.emailAddress && <p className="text-[11px] text-rose-600 mt-1">{formErrors.emailAddress}</p>}
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Delivery Address (Flat / House No., Street, Landmark) *
                </label>
                <textarea
                  rows={2}
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Apartment 402, Royal Palms, 2nd Cross, Koramangala"
                  className={`w-full px-3.5 py-2 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                    formErrors.deliveryAddress ? 'border-rose-500' : 'border-neutral-300'
                  }`}
                />
                {formErrors.deliveryAddress && <p className="text-[11px] text-rose-600 mt-1">{formErrors.deliveryAddress}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bengaluru"
                  className={`w-full px-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                    formErrors.city ? 'border-rose-500' : 'border-neutral-300'
                  }`}
                />
                {formErrors.city && <p className="text-[11px] text-rose-600 mt-1">{formErrors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Karnataka"
                  className={`w-full px-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                    formErrors.state ? 'border-rose-500' : 'border-neutral-300'
                  }`}
                />
                {formErrors.state && <p className="text-[11px] text-rose-600 mt-1">{formErrors.state}</p>}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="560034"
                  maxLength={10}
                  className={`w-full px-3.5 py-2.5 text-xs bg-[#FBFBF9] border rounded-md focus:outline-none focus:border-neutral-900 ${
                    formErrors.pincode ? 'border-rose-500' : 'border-neutral-300'
                  }`}
                />
                {formErrors.pincode && <p className="text-[11px] text-rose-600 mt-1">{formErrors.pincode}</p>}
              </div>

            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-100">
              2. Payment Method
            </h2>

            {/* Selected COD box */}
            <div className="p-4 border-2 border-neutral-900 bg-neutral-50/60 rounded-lg flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full border-2 border-neutral-900 flex items-center justify-center mt-0.5 shrink-0 bg-neutral-900 text-white">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-900">Cash on Delivery (COD)</span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Zero Advance Required
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Pay directly to the courier executive upon parcel delivery at your doorstep using cash or any contactless UPI scanner.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Place Button */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-6 shadow-xs sticky top-24">
          <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
            Order Review
          </h2>

          {/* Item Mini List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="flex items-center space-x-3 text-xs">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded object-cover border border-neutral-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{product.name}</p>
                  <p className="text-neutral-500 tabular-nums">
                    Qty: {quantity} × ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="font-semibold text-neutral-900 tabular-nums shrink-0">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Cost breakdown */}
          <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-medium text-neutral-900 tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-medium text-emerald-700">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="font-medium text-neutral-900">Cash on Delivery</span>
            </div>
            <div className="pt-3 border-t border-neutral-200 flex justify-between text-base font-bold text-neutral-900">
              <span>Total Payable</span>
              <span className="tabular-nums">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Placing Your Order...</span>
              </>
            ) : (
              <span>Place Order (Cash on Delivery)</span>
            )}
          </button>

          {/* Guarantee */}
          <div className="pt-2 text-center text-[11px] text-neutral-500 space-y-1">
            <p>By confirming, you agree to inspect and accept delivery at your address.</p>
            <p className="font-medium text-neutral-700">Direct courier verification on handover</p>
          </div>

        </div>

      </form>

    </div>
  );
};
