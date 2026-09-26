import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#121214] text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Propositions Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-14 border-b border-neutral-800">
          <div className="flex items-start space-x-3.5">
            <Truck className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Cash on Delivery</h4>
              <p className="text-xs text-neutral-400 mt-1">Pay at your doorstep with cash or contactless UPI upon package inspection.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <ShieldCheck className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Quality Assured</h4>
              <p className="text-xs text-neutral-400 mt-1">Every item passes rigorous functional and aesthetic quality controls.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <RotateCcw className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">7-Day Easy Returns</h4>
              <p className="text-xs text-neutral-400 mt-1">Hassle-free reverse pickups if your product does not meet expectations.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <Headphones className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Dedicated Support</h4>
              <p className="text-xs text-neutral-400 mt-1">Direct support assistance for tracking, orders, and inquiries.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              Veyra
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Discover quality products at transparent prices and enjoy a simple, convenient shopping experience with guaranteed Cash on Delivery.
            </p>
            <div className="pt-2">
              <span className="text-xs text-neutral-500 font-mono">
                Order Support: care@veyra.store · Mon-Sat, 9AM-8PM
              </span>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Catalog
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  Electronics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  Audio & Acoustics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  Desk Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Customer
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-white transition-colors">
                  My Orders & Tracking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">
                  Account Details
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cart')} className="hover:text-white transition-colors">
                  Review Cart
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">
                  Customer Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Operations */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Management
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('admin-login')} className="hover:text-white transition-colors">
                  Administrator Portal
                </button>
              </li>
              <li>
                <span className="text-neutral-500">Terms of Commerce</span>
              </li>
              <li>
                <span className="text-neutral-500">Privacy & Data Notice</span>
              </li>
              <li>
                <span className="text-neutral-500">Shipping Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Veyra Store. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-xs text-neutral-400">
            <span>Cash on Delivery Verified</span>
            <span aria-hidden="true">·</span>
            <span>Fast Dispatch</span>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('admin-login')} className="hover:text-white transition-colors">
              Admin Gateway
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
