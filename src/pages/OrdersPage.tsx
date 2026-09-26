import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, ChevronDown, ChevronUp, ShoppingBag, Truck, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OrdersPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { isUserLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!isUserLoggedIn) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await api.getOrders();
        setOrders(res.orders || []);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve order history.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isUserLoggedIn]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Confirmed':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium">Confirmed</span>;
      case 'Processing':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">Processing</span>;
      case 'Shipped':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-medium">Shipped</span>;
      case 'Delivered':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">Delivered</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[11px] font-medium">{status}</span>;
    }
  };

  if (!isUserLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-neutral-400 mx-auto stroke-1" />
        <h2 className="text-xl font-bold text-neutral-900">Sign in to view orders</h2>
        <p className="text-xs text-neutral-500">Please sign in to access your order history and live dispatch status.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900">
          My Orders
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review your previous orders, doorstep delivery details, and current fulfillment status.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-neutral-200 rounded-lg p-6 animate-pulse space-y-3">
              <div className="h-4 bg-neutral-200 rounded w-1/4" />
              <div className="h-6 bg-neutral-200 rounded w-1/2" />
              <div className="h-4 bg-neutral-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center max-w-md mx-auto space-y-4">
          <Package className="w-12 h-12 text-neutral-400 mx-auto stroke-1" />
          <h2 className="text-base font-bold text-neutral-900">You haven't placed any orders yet</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            When you purchase products using Cash on Delivery, your orders and dispatch updates will appear here.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={order._id}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs transition-colors"
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-neutral-900">
                        {order.orderNumber || order._id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-neutral-500">
                      Placed on {dateStr} · {order.paymentMethod}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Total Amount</span>
                      <span className="text-base font-bold text-neutral-900 tabular-nums">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-neutral-100 bg-[#FBFBF9] space-y-6 animate-in fade-in duration-150">
                    
                    {/* Item list */}
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                        Products ({order.items.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg text-xs"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded object-cover border border-neutral-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                              <p className="text-neutral-500 tabular-nums">
                                {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <span className="font-semibold text-neutral-900 tabular-nums">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Payment Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Shipping Info */}
                      <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                          Delivery Destination
                        </span>
                        <p className="font-semibold text-neutral-900">{order.shippingAddress.fullName}</p>
                        <p className="text-neutral-600">{order.shippingAddress.deliveryAddress}</p>
                        <p className="text-neutral-600">
                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                        <p className="text-neutral-500 pt-1 font-mono text-[11px]">
                          Contact: {order.shippingAddress.phoneNumber}
                        </p>
                      </div>

                      {/* Payment & Status Info */}
                      <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-2">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                          Fulfillment & Payment
                        </span>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Method</span>
                          <span className="font-semibold text-neutral-900">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Delivery Charge</span>
                          <span className="font-semibold text-emerald-700">Free</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Status</span>
                          <span className="font-semibold text-neutral-900">{order.status}</span>
                        </div>
                        <div className="pt-2 border-t border-neutral-100 flex justify-between font-bold text-neutral-900">
                          <span>Total Amount</span>
                          <span className="tabular-nums">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
