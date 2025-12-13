'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { FiShoppingCart, FiPackage, FiHeart, FiStar, FiZap, FiTrendingUp, FiAward } from 'react-icons/fi';
import { useCartStore, useWishlistStore } from '@/lib/store';

export default function CategoryPage({ params }) {
  const { data: session } = useSession();
  const isAuthed = !!(session && session.user);
  const router = useRouter();
  const sectionRef = useRef(null);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlistStore();

  // Fetch category and products by slug
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/category/${params.slug}`);
        if (!res.ok) throw new Error('Failed to fetch category');
        const data = await res.json();
        setCategory(data.category);
        setProducts(data.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryAndProducts();
  }, [params.slug]);

  // Add to Cart
  const handleAddToCart = async (product) => {
    if (!isAuthed) {
      router.push('/auth/signin');
      return;
    }

    addToCart({
      ...product,
      id: product._id || product.id,
      quantity: 1,
    });

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
      message.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Cart API error:', error);
      message.error('Failed to save cart');
    }
  };

  // Toggle Wishlist
  const handleToggleWishlist = (product) => {
    if (!isAuthed) {
      router.push('/auth/signin');
      return;
    }

    const productId = product._id || product.id;
    const isInWishlist = wishlistItems.some(
      (item) => (item._id || item.id) === (product._id || product.id)
    );

    if (isInWishlist) {
      removeFromWishlist(productId);
      message.info(`${product.name} removed from wishlist`);

      fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId })
      }).catch(err => console.error('Failed to remove from wishlist:', err));
    } else {
      addToWishlist(product);
      message.success(`${product.name} added to wishlist`);

      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId })
      }).catch(err => console.error('Failed to add to wishlist:', err));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const safeWishlistItems = isAuthed ? wishlistItems : [];

  // Skeleton Loading Component
  const ProductSkeleton = () => (
    <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden animate-pulse">
      <div className="h-72 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-12 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full bg-white rounded-3xl shadow-xl p-16 text-center border-2 border-gray-100">
      <div className="relative mb-8 inline-block">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-green-100 rounded-full animate-ping opacity-20"></div>
        </div>
        <div className="relative w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center border-4 border-green-100">
          <FiPackage className="w-16 h-16 text-green-500" />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-4">No Products Found</h3>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        There are no products under this category yet. Try checking other categories.
      </p>
      <Link href="/products">
        <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all hover:scale-105">
          Browse All Products
        </button>
      </Link>
    </motion.div>
  );

  return (
    <div ref={sectionRef} className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Diagonal Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)'
        }}></div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-4xl mx-auto">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/30">
              <FiZap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">Premium Collection</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              {isLoading ? (
                <span className="inline-block h-16 w-64 bg-white/20 rounded-2xl animate-pulse"></span>
              ) : (
                <>
                  {category?.name || 'Category'}
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mt-2">
                    Collection
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-green-50 mb-8 leading-relaxed max-w-2xl mx-auto">
              {isLoading ? (
                <span className="inline-block h-6 w-96 bg-white/20 rounded-xl animate-pulse"></span>
              ) : (
                category?.description || 'Discover our amazing selection of premium products'
              )}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <FiTrendingUp className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-2xl md:text-3xl font-bold">{products.length}+</div>
                  <div className="text-green-100 text-sm">Products</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <FiAward className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-2xl md:text-3xl font-bold">100%</div>
                  <div className="text-green-100 text-sm">Authentic</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="url(#paint0_linear)" fillOpacity="0.15"/>
            <path d="M0 120L60 105C120 90 240 60 360 50C480 40 600 50 720 60C840 70 960 80 1080 82.5C1200 85 1320 80 1380 77.5L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="url(#paint1_linear)" fillOpacity="0.15"/>
            <path d="M0 120L60 115C120 110 240 100 360 95C480 90 600 90 720 92.5C840 95 960 100 1080 100C1200 100 1320 95 1380 92.5L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#f8fafc"/>
            <defs>
              <linearGradient id="paint0_linear" x1="720" y1="50" x2="720" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f8fafc"/>
                <stop offset="1" stopColor="#f8fafc" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="720" y1="40" x2="720" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f8fafc"/>
                <stop offset="1" stopColor="#f8fafc" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {[...Array(8)].map((_, idx) => (
              <ProductSkeleton key={idx} />
            ))}
          </motion.div>
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Products Count Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 rounded-2xl border-2 border-green-100 inline-block">
                <p className="text-gray-700 font-semibold">
                  Showing <span className="text-green-600 font-bold text-xl">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
                </p>
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {products.map((product) => {
                const isOutOfStock = product.stockStatus === 'out-of-stock';
                const isInWishlist = safeWishlistItems.some(
                  (item) => (item._id || item.id) === (product._id || product.id)
                );

                return (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    whileHover={{ y: -12, transition: { duration: 0.3 } }}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-400 group">
                    {/* Image */}
                    <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={product.images?.[0] || '/images/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                        />
                      </Link>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Stock Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm ${
                          isOutOfStock
                            ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/50'
                            : 'bg-green-500/90 text-white shadow-lg shadow-green-500/50'
                        }`}>
                          {isOutOfStock ? '✗ Out of Stock' : '✓ In Stock'}
                        </span>
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className={`absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110 ${
                          isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}>
                        <FiHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-3">
                        <span className="text-xs text-green-600 font-bold uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full">
                          {product.category || category?.name}
                        </span>
                      </div>

                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem] cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {product.description || 'Premium quality product for your needs.'}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-5">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-2 font-semibold">({product.rating || 0})</span>
                      </div>

                      {/* Price & Button */}
                      <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-semibold">Price</p>
                          <p className="text-2xl font-black text-gray-800">
                            PKR{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`p-3.5 rounded-2xl transition-all shadow-lg ${
                            isOutOfStock
                              ? 'bg-gray-400 text-white cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105'
                          }`}>
                          <FiShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}