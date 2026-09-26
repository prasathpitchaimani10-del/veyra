import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, X, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface ProductListingPageProps {
  onViewProduct: (productId: string) => void;
  initialSearch?: string;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  onViewProduct,
  initialSearch = ''
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<string>('all');
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

  // Filter and sort products
  let filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPrice = true;
    if (priceRange === 'under-3000') matchesPrice = p.price < 3000;
    else if (priceRange === '3000-10000') matchesPrice = p.price >= 3000 && p.price <= 10000;
    else if (priceRange === 'above-10000') matchesPrice = p.price > 10000;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setPriceRange('all');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Breadcrumbs */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-neutral-500 uppercase tracking-wider mb-2">
          <span>Catalog</span>
          <span aria-hidden="true">/</span>
          <span className="text-neutral-900 font-semibold">{selectedCategory}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900">
          All Products
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Explore curated consumer hardware, electronics, and acoustics with guaranteed Cash on Delivery.
        </p>
      </div>

      {/* Control Bar: Search, Category, Price & Sort */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-neutral-200/90 space-y-4">
        
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product name, category..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#FBFBF9] border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-neutral-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#FBFBF9] border border-neutral-200 rounded-md text-xs font-medium text-neutral-800 focus:outline-none focus:border-neutral-900"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Segments */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-neutral-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Segment */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Price:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'under-3000', label: '< ₹3,000' },
              { id: '3000-10000', label: '₹3,000 - ₹10,000' },
              { id: 'above-10000', label: '> ₹10,000' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriceRange(p.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  priceRange === p.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {p.label}
              </button>
            ))}

            {(searchTerm || selectedCategory !== 'All' || priceRange !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline ml-2"
              >
                Reset
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <span>
          Showing <span className="font-semibold text-neutral-900 tabular-nums">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'products'}
        </span>
        <span>All orders dispatched within 24 hours</span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white border border-neutral-200 rounded-lg p-4 animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-neutral-100 rounded" />
              <div className="h-4 bg-neutral-100 rounded w-1/3" />
              <div className="h-5 bg-neutral-100 rounded w-3/4" />
              <div className="h-4 bg-neutral-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white border border-neutral-200 rounded-lg p-8 space-y-3">
          <ShoppingBag className="w-12 h-12 text-neutral-400 mx-auto stroke-1" />
          <h3 className="text-base font-semibold text-neutral-900">No matching products found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            We couldn't find any products matching your active filters. Try adjusting your query or resetting filters.
          </p>
          <div className="pt-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onViewDetails={onViewProduct}
            />
          ))}
        </div>
      )}

    </div>
  );
};
