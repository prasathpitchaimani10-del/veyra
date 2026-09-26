import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2, ChevronRight, Truck, Clock } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import  heroimage from '../assets/images/hero_storefront_1790416939807.jpg';
interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  onViewProduct: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onViewProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        setProducts(prodRes.products);
        if (catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#F5F5F2] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-500">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                Collection 2026 · Curated Consumer Hardware
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-neutral-900 leading-[1.08] text-balance">
                Your Everyday Shopping, Made Simple
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl font-normal">
                Discover quality products at great prices and enjoy a simple, convenient shopping experience.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-7 py-3.5 text-xs uppercase tracking-widest font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-2"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-7 py-3.5 text-xs uppercase tracking-widest font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                >
                  Explore Products
                </button>
              </div>

              {/* Direct Purchase Confidence Strip */}
              <div className="pt-6 border-t border-neutral-300/80 flex flex-wrap items-center gap-6 text-xs text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-neutral-800" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-neutral-800" />
                  <span>Inspected Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-800" />
                  <span>Fast Doorstep Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Frame */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200/90 shadow-md bg-white">
                <img
                  src={herostorefront}
                  alt="Veyra Curated Product Collection"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Spring 2026 Release</p>
                  <p className="text-sm font-medium">Minimalist tech & acoustic audio hardware for modern workflows</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED PRODUCTS CATALOG */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900">
              Featured Products
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Select an item to view complete technical details or add directly to your cart.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-neutral-200 rounded-lg p-4 animate-pulse space-y-3">
                <div className="aspect-[4/3] bg-neutral-100 rounded" />
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-5 bg-neutral-100 rounded w-3/4" />
                <div className="h-4 bg-neutral-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white border border-neutral-200 rounded-lg">
            <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto mb-2 stroke-1" />
            <h3 className="text-sm font-semibold text-neutral-900">No products found</h3>
            <p className="text-xs text-neutral-500 mt-1">Try switching categories or view the complete catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-neutral-900 border border-neutral-300 rounded-md hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
          >
            <span>View Full Product Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3. WHY SHOP WITH US SECTION (Requirement Content) */}
      <section className="bg-white border-y border-neutral-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500 mb-2">
              Our Principles
            </h2>
            <h3 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900">
              Why Shop With Us
            </h3>
            <p className="text-sm text-neutral-600 mt-2 font-normal">
              Built around four core pillars designed to make online shopping effortless and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pillar 1 */}
            <div className="p-7 bg-[#FBFBF9] border border-neutral-200/90 rounded-lg">
              <span className="font-serif text-2xl font-light text-neutral-400 block">01</span>
              <h4 className="font-serif text-xl font-medium text-neutral-900 mt-2.5 mb-2">
                Easy Shopping
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                Browse products and find what you need quickly.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 bg-[#FBFBF9] border border-neutral-200/90 rounded-lg">
              <span className="font-serif text-2xl font-light text-neutral-400 block">02</span>
              <h4 className="font-serif text-xl font-medium text-neutral-900 mt-2.5 mb-2">
                Simple Cart
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                Add your favourite products and review your order before checkout.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 bg-[#FBFBF9] border border-neutral-200/90 rounded-lg">
              <span className="font-serif text-2xl font-light text-neutral-400 block">03</span>
              <h4 className="font-serif text-xl font-medium text-neutral-900 mt-2.5 mb-2">
                Cash on Delivery
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                Choose Cash on Delivery when placing your order.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-7 bg-[#FBFBF9] border border-neutral-200/90 rounded-lg">
              <span className="font-serif text-2xl font-light text-neutral-400 block">04</span>
              <h4 className="font-serif text-xl font-medium text-neutral-900 mt-2.5 mb-2">
                Order History
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                View your previous orders and check their details from your account.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. CASH ON DELIVERY ASSURANCE CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#16181D] text-white rounded-xl p-8 md:p-12 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-medium uppercase tracking-widest text-neutral-400">
              Zero Risk Ordering
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white leading-snug">
              Direct Doorstep Payment With Cash on Delivery
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Place your order today without entering credit cards or net banking details. Pay by cash or UPI scan only after your package arrives safely at your address.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('shop')}
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-neutral-900 bg-white rounded-md hover:bg-neutral-100 transition-colors"
            >
              Start Shopping
            </button>
            <button
              onClick={() => onNavigate('orders')}
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 transition-colors"
            >
              Track Existing Order
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
