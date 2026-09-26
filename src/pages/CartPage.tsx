import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, totalAmount, totalItemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Your cart is empty</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            You haven't added any products to your shopping cart yet. Browse our collection to discover everyday tech essentials.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('shop')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </button>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900">
            Shopping Cart
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review your selected items and quantities before continuing to delivery details.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-neutral-500 hover:text-rose-600 transition-colors self-start sm:self-auto"
        >
          Clear entire cart
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items Table/List */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs divide-y divide-neutral-100">
          
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3.5 bg-[#FBFBF9] text-xs font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
            <span className="sm:col-span-6">Product</span>
            <span className="sm:col-span-2 text-center">Price</span>
            <span className="sm:col-span-2 text-center">Quantity</span>
            <span className="sm:col-span-2 text-right">Subtotal</span>
          </div>

          {items.map(({ product, quantity }) => (
            <div
              key={product._id}
              className="p-4 sm:p-6 sm:grid sm:grid-cols-12 gap-4 items-center flex flex-col sm:flex-none space-y-3 sm:space-y-0"
            >
              {/* Product Info */}
              <div className="sm:col-span-6 flex items-center space-x-4 w-full">
                <div
                  onClick={() => onNavigate('product-detail', product._id)}
                  className="w-20 h-20 bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden shrink-0 cursor-pointer flex items-center justify-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">{product.category}</span>
                  <h3
                    onClick={() => onNavigate('product-detail', product._id)}
                    className="text-sm font-semibold text-neutral-900 truncate hover:text-neutral-700 cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="text-xs text-neutral-400 hover:text-rose-600 transition-colors flex items-center gap-1 mt-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Unit Price */}
              <div className="sm:col-span-2 text-left sm:text-center w-full sm:w-auto">
                <span className="sm:hidden text-xs text-neutral-400 mr-2">Unit Price:</span>
                <span className="text-xs font-medium text-neutral-700 tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="sm:col-span-2 flex justify-start sm:justify-center w-full sm:w-auto">
                <div className="flex items-center border border-neutral-300 rounded bg-[#FBFBF9]">
                  <button
                    onClick={() => updateQuantity(product._id, quantity - 1)}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 text-xs font-semibold text-neutral-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product._id, quantity + 1)}
                    disabled={quantity >= product.quantity}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Line Subtotal */}
              <div className="sm:col-span-2 text-left sm:text-right w-full sm:w-auto">
                <span className="sm:hidden text-xs text-neutral-400 mr-2">Line Total:</span>
                <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}

        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-xl p-6 space-y-6 shadow-xs sticky top-24">
          <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
              <span className="font-semibold text-neutral-900 tabular-nums">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-emerald-700">Free</span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>Payment Method</span>
              <span className="font-semibold text-neutral-900">Cash on Delivery</span>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-between text-base font-bold text-neutral-900">
              <span>Total</span>
              <span className="tabular-nums">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-3.5 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>Proceed to Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Delivery & Security Note */}
          <div className="pt-4 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-500">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-neutral-700" />
              <span>Doorstep payment by cash or UPI available</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
              <span>No advance transaction needed</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
