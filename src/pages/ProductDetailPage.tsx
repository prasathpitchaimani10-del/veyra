import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Check, Plus, Minus, RotateCcw, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onBack, onNavigate }) => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getProductById(productId);
        setProduct(res.product);
        setQuantity(1);
      } catch (err: any) {
        setError(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    onNavigate('checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/3] bg-neutral-200 rounded-lg" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-1/4" />
            <div className="h-8 bg-neutral-200 rounded w-3/4" />
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-24 bg-neutral-200 rounded" />
            <div className="h-12 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Product Not Available</h2>
        <p className="text-xs text-neutral-500">{error || 'This item could not be retrieved from the catalog.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>
      </div>
    );
  }

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors p-1 -ml-1 rounded hover:bg-neutral-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </button>
        <span className="text-neutral-300">/</span>
        <span className="text-xs text-neutral-500">{product.category}</span>
        <span className="text-neutral-300">/</span>
        <span className="text-xs text-neutral-900 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* Left Column: Product Showcase Photo */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full bg-white border border-neutral-200/90 rounded-xl overflow-hidden shadow-xs flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Delivery & Warranty Guarantees */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-white border border-neutral-200/80 rounded-lg text-neutral-700">
            <div className="flex flex-col items-center text-center p-2">
              <Truck className="w-5 h-5 text-neutral-800 mb-1" />
              <span className="text-xs font-semibold text-neutral-900">Cash on Delivery</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">Pay at Doorstep</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 border-x border-neutral-100">
              <ShieldCheck className="w-5 h-5 text-neutral-800 mb-1" />
              <span className="text-xs font-semibold text-neutral-900">Genuine Hardware</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">1-Year Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <RotateCcw className="w-5 h-5 text-neutral-800 mb-1" />
              <span className="text-xs font-semibold text-neutral-900">Easy Returns</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">7-Day Window</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
          
          {/* Header Metadata */}
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-500 mb-2">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className={isOutOfStock ? 'text-rose-600 font-semibold' : 'text-emerald-700 font-semibold'}>
                {isOutOfStock ? 'Currently Sold Out' : `In Stock (${product.quantity} available)`}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing */}
          <div className="py-3 border-y border-neutral-100 flex items-baseline gap-3">
            <span className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900 tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-neutral-500">Inclusive of all local taxes</span>
          </div>

          {/* Product Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
              Overview
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Key Specifications (if present) */}
          {product.specs && product.specs.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2.5">
                Technical Highlights
              </h3>
              <ul className="space-y-1.5 text-xs text-neutral-600">
                {product.specs.map((spec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 mt-1.5 shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Stepper & Purchase Actions */}
          <div className="pt-4 border-t border-neutral-200 space-y-4">
            
            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Select Quantity:</span>
                <div className="flex items-center border border-neutral-300 rounded-md bg-[#FBFBF9]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold text-neutral-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                    disabled={quantity >= product.quantity}
                    className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-4 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    : addedNotice
                    ? 'bg-emerald-800 text-white'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart (₹{(product.price * quantity).toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 text-xs font-semibold text-neutral-900 bg-neutral-100 border border-neutral-300 rounded-md hover:bg-neutral-200 transition-colors"
                >
                  Buy Now with Cash on Delivery
                </button>
              )}
            </div>

            {/* COD reassurance */}
            <div className="p-3 bg-[#FBFBF9] border border-neutral-200 rounded-md text-[11px] text-neutral-600 leading-normal flex items-start gap-2">
              <Truck className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
              <span>
                <strong>Cash on Delivery available</strong> for this item. Inspect the parcel at your door before making payment.
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
