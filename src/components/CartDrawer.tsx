import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onNavigate: (view: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    totalAmount,
    totalItemCount
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-[#FBFBF9]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-neutral-800" />
              <h2 className="text-base font-semibold text-neutral-900">Your Shopping Cart</h2>
              <span className="text-xs text-neutral-500 tabular-nums">({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Your cart is empty</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                    Explore our curated catalog to find everyday tech and audio essentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigate('shop');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product._id}
                  className="flex space-x-4 p-3 bg-[#FBFBF9] border border-neutral-200/80 rounded-lg"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-18 bg-white border border-neutral-200 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-neutral-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-500 uppercase mt-0.5">{product.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-200/60">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded bg-white">
                        <button
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-neutral-900 tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          disabled={quantity >= product.quantity}
                          className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-neutral-900 tabular-nums">
                        ₹{(product.price * quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Calculations */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-[#FBFBF9] space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900 tabular-nums">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-medium text-emerald-700">Free</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-semibold text-neutral-900">
                  <span>Total Amount</span>
                  <span className="tabular-nums">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    closeCart();
                    onNavigate('checkout');
                  }}
                  className="w-full py-3 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigate('cart');
                  }}
                  className="w-full py-2 px-4 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors text-center"
                >
                  View Full Cart
                </button>
              </div>

              <p className="text-[11px] text-center text-neutral-500">
                Cash on Delivery applicable at checkout
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
