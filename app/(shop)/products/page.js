// 'use client';

// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { FiFilter, FiGrid, FiList, FiHeart, FiShoppingCart, FiRefreshCw, FiX, FiStar } from 'react-icons/fi';
// import { useCartStore, useWishlistStore } from '@/lib/store';
// import { message } from 'antd';
// import { useSearchParams } from 'next/navigation';
// export default function ProductsPage() {
//   const { data: session } = useSession();
//   const isAuthed = !!(session && session.user);
//   const router = useRouter();
// const searchParams = useSearchParams();
// const searchQuery = searchParams.get('search') || '';
//   const { addItem: addToCart } = useCartStore();
//  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlistStore();


//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [viewMode, setViewMode] = useState('grid');
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [categories, setCategories] = useState(['All']);
//   const [isLoading, setIsLoading] = useState(true);
//   const [priceRange, setPriceRange] = useState([0, 1000]);
//   const [sortBy, setSortBy] = useState('featured');

//   const requireAuth = (onAuthed) => {
//     if (!isAuthed) {
//       message.info('Please sign in to continue');
//       router.push('/login');
//       return;
//     }
//     onAuthed();
//   };

//   const handleAddToCart = async (product) => {
//     requireAuth(() => {
//       const normalizedProduct = {
//         ...product,
//         id: product._id || product.id,
//         quantity: 1
//       };
//       addToCart(normalizedProduct);
//       message.success(`${product.name} added to cart!`);
//     });
//   };

//  const handleToggleWishlist = (product) => {
//   requireAuth(() => {
//     const productId = product._id || product.id;
//    const isInWishlist = wishlistItems.some(
//   (item) => (item._id || item.id) === (product._id || product.id)
// );


//     if (isInWishlist) {
//       removeFromWishlist(productId);
//       message.info(`${product.name} removed from wishlist`);

//       if (session?.user) {
//         fetch('/api/wishlist', {
//           method: 'DELETE',
//           headers: { 'Content-Type': 'application/json' },
//           credentials: 'include',
//           body: JSON.stringify({ productId })
//         }).catch(err => console.error('Failed to remove from wishlist:', err));
//       }
//     } else {
//       addToWishlist(product);
//       message.success(`${product.name} added to wishlist`);

//       if (session?.user) {
//         fetch('/api/wishlist', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           credentials: 'include',
//           body: JSON.stringify({ productId })
//         }).catch(err => console.error('Failed to add to wishlist:', err));
//       }
//     }
//   });
// };


//   const fetchProductsFromAPI = async () => {
//     setIsLoading(true);
//     try {
//       const timestamp = new Date().getTime();
//       const response = await fetch(`/api/products?t=${timestamp}`, {
//         method: 'GET',
//         headers: {
//           'Cache-Control': 'no-cache, no-store, must-revalidate',
//           'Pragma': 'no-cache',
//           'Expires': '0'
//         },
//         cache: 'no-store'
//       });
//       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//       const data = await response.json();

//       if (data.success && Array.isArray(data.data)) {
//         const normalized = data.data.map((p) => ({
//           ...p,
//           price: typeof p.price === 'number' ? p.price : Number(p.price ?? 0),
//           quantity: typeof p.quantity === 'number'
//             ? p.quantity
//             : (typeof p.stock === 'number' ? p.stock : 0),
//         }));
//         return normalized;
//       } else {
//         console.error('❌ API returned success:false or invalid data format:', data);
//         return [];
//       }
//     } catch (error) {
//       console.error('❌ Error fetching products:', error);
//       message.error('Failed to load products');
//       return [];
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     let isMounted = true;
//     const loadProducts = async () => {
//       const productsData = await fetchProductsFromAPI();
//       if (isMounted) {
//         setProducts(productsData);
//         setFilteredProducts(productsData);
//         if (productsData.length > 0) {
//           const uniqueCategories = ['All', ...new Set(productsData.map(p => p.category).filter(Boolean))];
//           setCategories(uniqueCategories);
//         }
//       }
//     };
//     loadProducts();
//     return () => { isMounted = false; };
//   }, []);

//   useEffect(() => {
//     let result = [...products];
//     if (selectedCategory !== 'All') {
//       result = result.filter(product => product.category === selectedCategory);
//     }
//     result = result.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1]);

//     switch (sortBy) {
//       case 'price-low-high': result.sort((a, b) => a.price - b.price); break;
//       case 'price-high-low': result.sort((a, b) => b.price - a.price); break;
//       case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
//       default: break;
//     }

//     setFilteredProducts(result);
//   }, [products, selectedCategory, priceRange, sortBy]);
// useEffect(() => {
//   let result = [...products];

//   // Apply category filter
//   if (selectedCategory !== 'All') {
//     result = result.filter(product => product.category === selectedCategory);
//   }

//   // Apply price filter
//   result = result.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1]);

//   // Apply search filter
//   if (searchQuery) {
//     const lowerQuery = searchQuery.toLowerCase();
//     result = result.filter(product =>
//       product.name.toLowerCase().includes(lowerQuery) ||
//       (product.description && product.description.toLowerCase().includes(lowerQuery))
//     );
//   }

//   // Apply sorting
//   switch (sortBy) {
//     case 'price-low-high': result.sort((a, b) => a.price - b.price); break;
//     case 'price-high-low': result.sort((a, b) => b.price - a.price); break;
//     case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
//     default: break;
//   }

//   setFilteredProducts(result);
// }, [products, selectedCategory, priceRange, sortBy, searchQuery]);

//   const handleRefresh = async () => {
//     const refreshedProducts = await fetchProductsFromAPI();
//     setProducts(refreshedProducts);
//     setFilteredProducts(refreshedProducts);
//     if (refreshedProducts.length > 0) {
//       const uniqueCategories = ['All', ...new Set(refreshedProducts.map(p => p.category).filter(Boolean))];
//       setCategories(uniqueCategories);
//     }
//     message.success(`Loaded ${refreshedProducts.length} products`);
//   };

//   const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
//   const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

//   const safeWishlistItems = isAuthed ? wishlistItems : [];

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       {/* Hero Section - Organic Style */}
//       <div className="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 py-16 md:py-24 overflow-hidden">
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
//           <div className="absolute top-40 right-20 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-yellow-400 rounded-full blur-3xl"></div>
//         </div>

//         <div className="container mx-auto px-4 relative z-10">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }} 
//             animate={{ opacity: 1, y: 0 }} 
//             transition={{ duration: 0.6 }}
//             className="text-center max-w-3xl mx-auto">
//             <span className="text-orange-500 font-semibold text-lg mb-4 block">Fresh & Organic</span>
//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
//               Our Products
//             </h1>
//             <p className="text-lg md:text-xl text-gray-600 mb-8">
//               Discover our collection of premium home decor items
//             </p>
//             <button
//               onClick={handleRefresh}
//               disabled={isLoading}
//               className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
//               <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
//               {isLoading ? 'Loading...' : 'Refresh Products'}
//             </button>
//           </motion.div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-12">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Sidebar Filters */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5 }}
//             className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
//             <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
//               {/* Mobile Close Button */}
//               <div className="flex justify-between items-center mb-6 lg:hidden">
//                 <h3 className="text-xl font-bold text-gray-800">Filters</h3>
//                 <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
//                   <FiX className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Categories */}
//               <div className="mb-8">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">Categories</h3>
//                 <div className="space-y-2">
//                   {categories.map((category) => (
//                     <button
//                       key={category}
//                       onClick={() => setSelectedCategory(category)}
//                       className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
//                         selectedCategory === category
//                           ? 'bg-green-500 text-white shadow-md'
//                           : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
//                       }`}>
//                       {category}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Price Range */}
//               <div className="mb-8">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">Price Range</h3>
//                 <div className="space-y-4">
//                   <div className="flex justify-between text-sm font-semibold text-gray-700">
//                     <span>${priceRange[0]}</span>
//                     <span>${priceRange[1]}</span>
//                   </div>
//                   <input
//                     type="range"
//                     min="0"
//                     max="1000"
//                     step="50"
//                     value={priceRange[0]}
//                     onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
//                     className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
//                   />
//                   <input
//                     type="range"
//                     min="0"
//                     max="1000"
//                     step="50"
//                     value={priceRange[1]}
//                     onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
//                     className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
//                   />
//                 </div>
//               </div>

//               {/* Sort By */}
//               <div>
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">Sort By</h3>
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50 font-medium text-gray-700">
//                   <option value="featured">Featured</option>
//                   <option value="price-low-high">Price: Low to High</option>
//                   <option value="price-high-low">Price: High to Low</option>
//                   <option value="rating">Highest Rated</option>
//                 </select>
//               </div>
//             </div>
//           </motion.div>

//           {/* Products Grid */}
//           <div className="flex-1">
//             {/* Toolbar */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={() => setShowFilters(true)}
//                   className="lg:hidden flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border-2 border-gray-200 hover:border-green-500 transition-colors font-medium">
//                   <FiFilter className="w-4 h-4" />
//                   Filters
//                 </button>
//                 <p className="text-gray-600 font-medium">
//                   Showing <span className="text-green-600 font-bold">{filteredProducts.length}</span> of{' '}
//                   <span className="text-gray-800 font-bold">{products.length}</span> products
//                 </p>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setViewMode('grid')}
//                   className={`p-2.5 rounded-xl transition-all ${
//                     viewMode === 'grid'
//                       ? 'bg-green-500 text-white shadow-md'
//                       : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
//                   }`}>
//                   <FiGrid className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => setViewMode('list')}
//                   className={`p-2.5 rounded-xl transition-all ${
//                     viewMode === 'list'
//                       ? 'bg-green-500 text-white shadow-md'
//                       : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
//                   }`}>
//                   <FiList className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             {/* Loading State */}
//             {isLoading && (
//               <div className="flex justify-center items-center h-96">
//                 <div className="text-center">
//                   <FiRefreshCw className="animate-spin h-16 w-16 text-green-500 mx-auto mb-4" />
//                   <p className="text-gray-600 font-medium text-lg">Loading fresh products...</p>
//                 </div>
//               </div>
//             )}

//             {/* Grid View */}
//             {!isLoading && viewMode === 'grid' && (
//               <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredProducts.map((product) => {
//                   const stockQty = typeof product.quantity === 'number' ? product.quantity : 0;
//                   const isInWishlist = safeWishlistItems.some(
//                     (item) => (item._id || item.id) === (product._id || product.id)
//                   );

//                   return (
//                     <motion.div
//                       key={product._id || product.id}
//                       variants={itemVariants}
//                       whileHover={{ y: -8 }}
//                       transition={{ duration: 0.3 }}
//                       className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-400">
//                       {/* Image */}
//                       <div className="relative h-64 overflow-hidden bg-gray-100 group">
//                         <Link href={`/products/${product.slug}`}>
//                           <img
//                             src={product.images?.[0] || '/images/placeholder.jpg'}
//                             alt={product.name}
//                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                             onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
//                           />
//                         </Link>

//                         {/* Stock Badge */}
//                         <div className="absolute top-4 left-4">
//                           <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
//                             stockQty > 5
//                               ? 'bg-green-500 text-white'
//                               : stockQty > 0
//                               ? 'bg-yellow-400 text-gray-800'
//                               : 'bg-red-500 text-white'
//                           }`}>
//                             {stockQty > 5 ? 'In Stock' : stockQty > 0 ? 'Low Stock' : 'Out of Stock'}
//                           </span>
//                         </div>

//                        <button
//   onClick={() => handleToggleWishlist(product)}
//   className={`absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-lg transition-colors ${
//     isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
//   }`}
// >
//   <FiHeart className={isInWishlist ? 'fill-current' : ''} />
// </button>

//                       </div>

//                       {/* Content */}
//                       <div className="p-5">
//                         <div className="mb-3">
//                           <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
//                             {product.category}
//                           </span>
//                         </div>

//                         <Link href={`/products/${product.slug}`}>
//                           <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-green-600 transition-colors line-clamp-1">
//                             {product.name}
//                           </h3>
//                         </Link>

//                         {/* Rating */}
//                         <div className="flex items-center gap-1 mb-4">
//                           {[...Array(5)].map((_, i) => (
//                             <FiStar
//                               key={i}
//                               className={`w-4 h-4 ${
//                                 i < Math.floor(product.rating || 0)
//                                   ? 'text-yellow-400 fill-current'
//                                   : 'text-gray-300'
//                               }`}
//                             />
//                           ))}
//                           <span className="text-xs text-gray-500 ml-1">({product.rating || 0})</span>
//                         </div>

//                         {/* Price & Button */}
//                         <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
//                           <p className="text-2xl font-bold text-gray-800">
//                             ${Number(product.price).toFixed(2)}
//                           </p>
//                           <button
//                             onClick={() => handleAddToCart(product)}
//                             disabled={stockQty === 0}
//                             className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
//                             <FiShoppingCart className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </motion.div>
//             )}

//             {/* List View */}
//             {!isLoading && viewMode === 'list' && (
//               <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
//                 {filteredProducts.map((product) => {
//                   const stockQty = typeof product.quantity === 'number' ? product.quantity : 0;
//                   const isInWishlist = safeWishlistItems.some(
//                     (item) => (item._id || item.id) === (product._id || product.id)
//                   );

//                   return (
//                     <motion.div
//                       key={product._id || product.id}
//                       variants={itemVariants}
//                       className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-400 flex flex-col md:flex-row">
//                       {/* Image */}
//                       <div className="relative h-64 md:h-auto md:w-80 overflow-hidden bg-gray-100 group">
//                         <Link href={`/products/${product.slug}`}>
//                           <img
//                             src={product.images?.[0] || '/images/placeholder.jpg'}
//                             alt={product.name}
//                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                             onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
//                           />
//                         </Link>

//                         <button
//                           onClick={() => handleAddToWishlist(product)}
//                           className={`absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-lg transition-colors ${
//                             isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
//                           }`}>
//                           <FiHeart className={isInWishlist ? 'fill-current' : ''} />
//                         </button>
//                       </div>

//                       {/* Content */}
//                       <div className="p-6 flex-1 flex flex-col">
//                         <div className="flex justify-between items-start mb-4">
//                           <div>
//                             <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2 block">
//                               {product.category}
//                             </span>
//                             <Link href={`/products/${product.slug}`}>
//                               <h3 className="text-2xl font-bold text-gray-800 hover:text-green-600 transition-colors">
//                                 {product.name}
//                               </h3>
//                             </Link>
//                           </div>
//                           <p className="text-3xl font-bold text-gray-800">${Number(product.price).toFixed(2)}</p>
//                         </div>

//                         <p className="text-gray-600 mb-4 line-clamp-2">
//                           {product.description || 'Premium quality product for your home.'}
//                         </p>

//                         <div className="flex items-center gap-4 mb-4">
//                           <div className="flex items-center gap-1">
//                             {[...Array(5)].map((_, i) => (
//                               <FiStar
//                                 key={i}
//                                 className={`w-4 h-4 ${
//                                   i < Math.floor(product.rating || 0)
//                                     ? 'text-yellow-400 fill-current'
//                                     : 'text-gray-300'
//                                 }`}
//                               />
//                             ))}
//                             <span className="text-sm text-gray-500 ml-1">({product.rating || 0})</span>
//                           </div>

//                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                             stockQty > 5
//                               ? 'bg-green-100 text-green-700'
//                               : stockQty > 0
//                               ? 'bg-yellow-100 text-yellow-700'
//                               : 'bg-red-100 text-red-700'
//                           }`}>
//                             {stockQty > 5 ? 'In Stock' : stockQty > 0 ? 'Low Stock' : 'Out of Stock'}
//                           </span>
//                         </div>

//                         <div className="flex gap-3 mt-auto">
//                           <button
//                             onClick={() => handleAddToCart(product)}
//                             disabled={stockQty === 0}
//                             className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
//                             <FiShoppingCart />
//                             {stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
//                           </button>
//                           <Link
//                             href={`/products/${product.slug}`}
//                             className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:text-green-600 transition-colors font-semibold">
//                             View Details
//                           </Link>
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </motion.div>
//             )}

//             {/* Empty State */}
//             {!isLoading && filteredProducts.length === 0 && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="bg-white rounded-2xl shadow-sm p-12 text-center">
//                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <FiShoppingCart className="w-10 h-10 text-gray-400" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
//                 <p className="text-gray-600 mb-8">
//                   {products.length === 0
//                     ? 'No products available yet. Please check back later.'
//                     : 'Try adjusting your filters to find what you\'re looking for.'}
//                 </p>
//                 {products.length > 0 && (
//                   <button
//                     onClick={() => {
//                       setSelectedCategory('All');
//                       setPriceRange([0, 1000]);
//                       setSortBy('featured');
//                     }}
//                     className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
//                     Reset Filters
//                   </button>
//                 )}
//               </motion.div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiFilter, FiGrid, FiList, FiHeart, FiShoppingCart, FiX, FiStar, FiZap, FiTrendingUp, FiAward } from 'react-icons/fi';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { message } from 'antd';
import { useSearchParams } from 'next/navigation';

// Separate component that uses useSearchParams
function ProductsContent() {
  const { data: session } = useSession();
  const isAuthed = !!(session && session.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlistStore();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');

  const requireAuth = (onAuthed) => {
    if (!isAuthed) {
      message.info('Please sign in to continue');
      router.push('/login');
      return;
    }
    onAuthed();
  };

  const handleAddToCart = async (product) => {
    requireAuth(() => {
      const normalizedProduct = {
        ...product,
        id: product._id || product.id,
        quantity: 1
      };
      addToCart(normalizedProduct);
      message.success(`${product.name} added to cart!`);
    });
  };

  const handleToggleWishlist = (product) => {
    requireAuth(() => {
      const productId = product._id || product.id;
      const isInWishlist = wishlistItems.some(
        (item) => (item._id || item.id) === (product._id || product.id)
      );

      if (isInWishlist) {
        removeFromWishlist(productId);
        message.info(`${product.name} removed from wishlist`);

        if (session?.user) {
          fetch('/api/wishlist', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId })
          }).catch(err => console.error('Failed to remove from wishlist:', err));
        }
      } else {
        addToWishlist(product);
        message.success(`${product.name} added to wishlist`);

        if (session?.user) {
          fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId })
          }).catch(err => console.error('Failed to add to wishlist:', err));
        }
      }
    });
  };

  const fetchProductsFromAPI = async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/products?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const normalized = data.data.map((p) => ({
          ...p,
          price: typeof p.price === 'number' ? p.price : Number(p.price ?? 0),
          quantity: typeof p.quantity === 'number'
            ? p.quantity
            : (typeof p.stock === 'number' ? p.stock : 0),
        }));
        return normalized;
      } else {
        console.error('❌ API returned success:false or invalid data format:', data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      message.error('Failed to load products');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      const productsData = await fetchProductsFromAPI();
      if (isMounted) {
        setProducts(productsData);
        setFilteredProducts(productsData);
        if (productsData.length > 0) {
          const uniqueCategories = ['All', ...new Set(productsData.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
        }
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    result = result.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1]);

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery))
      );
    }

    switch (sortBy) {
      case 'price-low-high': result.sort((a, b) => a.price - b.price); break;
      case 'price-high-low': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, priceRange, sortBy, searchQuery]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  const safeWishlistItems = isAuthed ? wishlistItems : [];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Enhanced Hero Section with Cover Image */}
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

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/30">
                <FiZap className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold">Premium Tech Collection</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                Discover Amazing
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Mobile Deals
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-green-50 mb-8 leading-relaxed max-w-xl">
                Explore our curated selection of premium smartphones and accessories at unbeatable prices
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <FiTrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{products.length}+</div>
                    <div className="text-green-100 text-sm">Products</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <FiAward className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">100%</div>
                    <div className="text-green-100 text-sm">Authentic</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative hidden lg:block">
              <div className="relative z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-3xl blur-3xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80" 
                  alt="Premium Smartphones"
                  className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover border-4 border-white/20"
                />
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -left-10 bg-white rounded-2xl shadow-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <FiZap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Fast Delivery</div>
                    <div className="font-bold text-gray-800">2-3 Days</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 -right-10 bg-white rounded-2xl shadow-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <FiAward className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Warranty</div>
                    <div className="font-bold text-gray-800">1 Year</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="url(#paint0_linear)" fillOpacity="0.15"/>
            <path d="M0 120L60 105C120 90 240 60 360 50C480 40 600 50 720 60C840 70 960 80 1080 82.5C1200 85 1320 80 1380 77.5L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="url(#paint1_linear)" fillOpacity="0.15"/>
            <path d="M0 120L60 115C120 110 240 100 360 95C480 90 600 90 720 92.5C840 95 960 100 1080 100C1200 100 1320 95 1380 92.5L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
            <defs>
              <linearGradient id="paint0_linear" x1="720" y1="50" x2="720" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="white" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="720" y1="40" x2="720" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="white" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24 border border-gray-100">
              {/* Mobile Close Button */}
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-102'
                      }`}>
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl">
                    <span className="text-sm font-bold text-gray-700">${priceRange[0]}</span>
                    <div className="w-px h-6 bg-green-300"></div>
                    <span className="text-sm font-bold text-gray-700">${priceRange[1]}</span>
                  </div>
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full h-2 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full appearance-none cursor-pointer accent-green-600"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full appearance-none cursor-pointer accent-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-gray-50 font-semibold text-sm text-gray-700 cursor-pointer transition-all hover:border-green-400">
                  <option value="featured">✨ Featured</option>
                  <option value="price-low-high">💰 Price: Low to High</option>
                  <option value="price-high-low">💎 Price: High to Low</option>
                  <option value="rating">⭐ Highest Rated</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Enhanced Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-green-500 hover:shadow-xl transition-all font-semibold">
                  <FiFilter className="w-4 h-4" />
                  Filters
                </button>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-2xl border-2 border-green-100">
                  <p className="text-gray-700 font-semibold text-sm">
                    <span className="text-green-600 font-bold text-lg">{filteredProducts.length}</span>
                    <span className="text-gray-500 mx-2">of</span>
                    <span className="text-gray-800 font-bold text-lg">{products.length}</span>
                    <span className="text-gray-500 ml-2">products</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-2xl transition-all shadow-md ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100 hover:border-green-400'
                  }`}>
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-2xl transition-all shadow-md ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100 hover:border-green-400'
                  }`}>
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center h-96">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-green-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">Loading amazing products...</p>
                </div>
              </div>
            )}

            {/* Enhanced Grid View */}
            {!isLoading && viewMode === 'grid' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredProducts.map((product) => {
                  const stockQty = typeof product.quantity === 'number' ? product.quantity : 0;
                  const isInWishlist = safeWishlistItems.some(
                    (item) => (item._id || item.id) === (product._id || product.id)
                  );

                  return (
                    <motion.div
                      key={product._id || product.id}
                      variants={itemVariants}
                      whileHover={{ y: -12, transition: { duration: 0.3 } }}
                      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-400 group">
                      {/* Image */}
                      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        <Link href={`/products/${product.slug}`}>
                          <img
                            src={product.images?.[0] || '/images/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                          />
                        </Link>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Stock Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm ${
                            stockQty > 5
                              ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/50'
                              : stockQty > 0
                              ? 'bg-yellow-400/90 text-gray-800 shadow-lg shadow-yellow-400/50'
                              : 'bg-red-500/90 text-white shadow-lg shadow-red-500/50'
                          }`}>
                            {stockQty > 5 ? '✓ In Stock' : stockQty > 0 ? '⚠ Low Stock' : '✗ Out of Stock'}
                          </span>
                        </div>

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
                            {product.category}
                          </span>
                        </div>

                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-lg font-bold text-gray-800 mb-3 hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                            {product.name}
                          </h3>
                        </Link>

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
                              ${Number(product.price).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={stockQty === 0}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105">
                            <FiShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Enhanced List View */}
            {!isLoading && viewMode === 'list' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-7">
                {filteredProducts.map((product) => {
                  const stockQty = typeof product.quantity === 'number' ? product.quantity : 0;
                  const isInWishlist = safeWishlistItems.some(
                    (item) => (item._id || item.id) === (product._id || product.id)
                  );

                  return (
                    <motion.div
                      key={product._id || product.id}
                      variants={itemVariants}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-400 flex flex-col md:flex-row group">
                      {/* Image */}
                      <div className="relative h-64 md:h-auto md:w-96 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
                        <Link href={`/products/${product.slug}`}>
                          <img
                            src={product.images?.[0] || '/images/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                          />
                        </Link>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Stock Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm ${
                            stockQty > 5
                              ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/50'
                              : stockQty > 0
                              ? 'bg-yellow-400/90 text-gray-800 shadow-lg shadow-yellow-400/50'
                              : 'bg-red-500/90 text-white shadow-lg shadow-red-500/50'
                          }`}>
                            {stockQty > 5 ? '✓ In Stock' : stockQty > 0 ? '⚠ Low Stock' : '✗ Out of Stock'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleWishlist(product)}
                          className={`absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110 ${
                            isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                          }`}>
                          <FiHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-7 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex-1">
                            <span className="text-xs text-green-600 font-bold uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full inline-block mb-3">
                              {product.category}
                            </span>
                            <Link href={`/products/${product.slug}`}>
                              <h3 className="text-2xl font-bold text-gray-800 hover:text-green-600 transition-colors mb-2">
                                {product.name}
                              </h3>
                            </Link>
                          </div>
                          <div className="ml-6 text-right">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">Price</p>
                            <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              ${Number(product.price).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                          {product.description || 'Premium quality mobile phone and accessories for your daily needs.'}
                        </p>

                        <div className="flex items-center gap-6 mb-6">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(product.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-2 font-semibold">({product.rating || 0})</span>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-auto">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={stockQty === 0}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.02]">
                            <FiShoppingCart className="w-5 h-5" />
                            {stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                          <Link
                            href={`/products/${product.slug}`}
                            className="px-8 py-4 border-2 border-gray-300 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all font-bold text-gray-700 hover:text-green-600 flex items-center justify-center hover:scale-[1.02]">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Enhanced Empty State */}
            {!isLoading && filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-16 text-center border-2 border-gray-100">
                <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-100">
                  <FiShoppingCart className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">No products found</h3>
                <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
                  {products.length === 0
                    ? 'No products available yet. Please check back later for amazing deals!'
                    : 'We couldn\'t find any products matching your filters. Try adjusting your search criteria.'}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setPriceRange([0, 1000]);
                      setSortBy('featured');
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-full font-bold transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105">
                    Reset All Filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-green-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-semibold text-xl">Loading amazing products...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}