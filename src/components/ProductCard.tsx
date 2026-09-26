import React, { useState } from 'react';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.quantity <= 0) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(product._id);
  };

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = !isOutOfStock && product.quantity <= 5;

  return (
    <article
      onClick={() => onViewDetails(product._id)}
      className="group flex flex-col bg-white border border-neutral-200/90 rounded-xl overflow-hidden cursor-pointer hover:border-neutral-400 hover:shadow-md transition-all duration-300"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/3] w-full bg-[#F5F5F3] overflow-hidden flex items-center justify-center">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400">
            <ShoppingBag className="w-8 h-8 stroke-1 mb-2 text-neutral-400" />
            <span className="text-xs font-medium uppercase tracking-wider">{product.category}</span>
          </div>
        )}

        {/* Quiet availability badge over image corner */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md backdrop-blur-md shadow-xs ${
              isOutOfStock
                ? 'bg-rose-50/90 text-rose-800 border border-rose-200/80'
                : isLowStock
                ? 'bg-amber-50/90 text-amber-800 border border-amber-200/80'
                : 'bg-white/90 text-neutral-800 border border-neutral-200/80'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span>
              {isOutOfStock ? 'Sold Out' : isLowStock ? `Low Stock (${product.quantity})` : 'In Stock'}
            </span>
          </span>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div>
          {/* Category */}
          <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5">
            {product.category}
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-neutral-500 line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Dual Action Buttons */}
        <div className="pt-3 border-t border-neutral-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Price</span>
            <span className="text-lg font-bold text-neutral-900 tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Actions: View Product & Add to Cart */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleView}
              className="py-2.5 px-3 text-xs font-semibold text-neutral-800 bg-[#FBFBF9] hover:bg-neutral-100 border border-neutral-300 hover:border-neutral-400 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-neutral-600" />
              <span>View Product</span>
            </button>

            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isOutOfStock
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-800 text-white'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
