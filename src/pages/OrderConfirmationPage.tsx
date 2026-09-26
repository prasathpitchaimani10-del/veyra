import React from 'react';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, onNavigate }) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Confirmation Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Header Icon & Message */}
        <div className="text-center space-y-3 pb-6 border-b border-neutral-100">
          <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900">
            Order Placed Successfully
          </h1>
          <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Thank you for shopping with us. Your order has been successfully placed.
          </p>
        </div>

        {/* Core Order Metadata Table */}
        <div className="bg-[#FBFBF9] border border-neutral-200 rounded-lg p-5 divide-y divide-neutral-200/80 text-xs">
          
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-neutral-500 uppercase tracking-wider">Order ID</span>
            <span className="font-mono font-semibold text-neutral-900">{order.orderNumber || order._id}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-neutral-500 uppercase tracking-wider">Order Date</span>
            <span className="font-medium text-neutral-900">{formattedDate}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-neutral-500 uppercase tracking-wider">Payment Method</span>
            <span className="font-semibold text-neutral-900">{order.paymentMethod}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-neutral-500 uppercase tracking-wider">Order Status</span>
            <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
              {order.status}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center text-sm font-bold text-neutral-900">
            <span>Order Total</span>
            <span className="tabular-nums">₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>

        </div>

        {/* Shipping Summary */}
        <div className="space-y-2 text-xs">
          <h3 className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
            Delivery Destination
          </h3>
          <div className="p-4 bg-white border border-neutral-200 rounded-md text-neutral-600 space-y-1">
            <p className="font-semibold text-neutral-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.deliveryAddress}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-neutral-500 pt-1 font-mono">Contact: {order.shippingAddress.phoneNumber}</p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
            Ordered Items ({order.items.length})
          </h3>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#FBFBF9] border border-neutral-200 rounded-md text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded object-cover border border-neutral-200"
                  />
                  <div>
                    <p className="font-medium text-neutral-900">{item.name}</p>
                    <p className="text-neutral-500 tabular-nums">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-neutral-100">
          <button
            onClick={() => onNavigate('orders')}
            className="w-full sm:w-1/2 py-3 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>View My Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className="w-full sm:w-1/2 py-3 px-4 text-xs font-semibold text-neutral-800 bg-[#FBFBF9] border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
        </div>

      </div>

    </div>
  );
};
