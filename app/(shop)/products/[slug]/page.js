'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiArrowLeft, FiStar, FiTruck, FiShield, FiPackage } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useProductStore } from '@/lib/store';
import { useSession } from "next-auth/react";

// Default products if store is empty
const DEFAULT_PRODUCTS = [
  {
    id: '1',
    name: 'Modern Cascade Fountain',
    slug: 'modern-cascade-fountain',
    price: 249.99,
    stockStatus: 'in-stock',
    image: 'https://images.unsplash.com/photo-1585150841312-c833091e593d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Indoor',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Zen Garden Water Feature',
    slug: 'zen-garden-water-feature',
    price: 199.99,
    stockStatus: 'in-stock',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Outdoor',
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Solar Powered Garden Fountain',
    slug: 'solar-powered-garden-fountain',
    price: 349.99,
    stockStatus: 'in-stock',
    image: 'https://images.unsplash.com/photo-1534857960998-63c4ea13a0a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Outdoor',
    rating: 4.6,
  },
  {
    id: '4',
    name: 'LED Illuminated Wall Fountain',
    slug: 'led-illuminated-wall-fountain',
    price: 599.99,
    stockStatus: 'out-of-stock',
    image: 'https://images.unsplash.com/photo-1611223235982-891064f27716?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Indoor',
    rating: 4.9,
  }
];

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug;
  const { data: session } = useSession();
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlist } = useWishlistStore();
  const { products: storeProducts, getProductBySlug } = useProductStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    
    const foundProduct = getProductBySlug(slug) || DEFAULT_PRODUCTS.find(p => p.slug === slug);

    if (foundProduct) {
      setProduct(foundProduct);
      setIsInWishlist(wishlist?.some(item => item.id === foundProduct.id));
      
      const productsSource = storeProducts.length > 0 ? storeProducts : DEFAULT_PRODUCTS;
      const related = productsSource
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }

    setLoading(false);
  }, [slug, wishlist, getProductBySlug, storeProducts]);

  const handleAddToCart = async () => {
    if (product && product.stockStatus === 'in-stock') {
      addToCart(product, quantity);

      if (session?.user) {
        try {
          const productId = product._id || product.id;
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId, quantity }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to sync cart");
        } catch (err) {
          console.error("Failed to sync cart:", err);
        }
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    const productId = product._id || product.id;

    if (isInWishlist) {
      removeFromWishlist(productId);
      setIsInWishlist(false);
      if (session?.user) {
        try { await fetch("/api/wishlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ productId }) }); } catch {}
      }
      return;
    }

    addToWishlist(product);
    setIsInWishlist(true);
    if (session?.user) {
      try { await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ productId }) }); } catch {}
    }
  };

  if (loading) return <div className="bg-gray-50 min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <Link href="/products" className="text-green-600 hover:text-green-700 mt-4 inline-block">Back to Products</Link>
      </div>
    </div>
  );

  const productImages = product.images?.length > 0 ? product.images : [product.image || '/flower.png'];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <Link href="/products" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700">
            <FiArrowLeft /> Back to Products
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left: Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100 aspect-square">
              <Image src={productImages[selectedImage]} alt={product.name} fill className="object-cover" />
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  product.stockStatus === 'in-stock' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {product.stockStatus === 'in-stock' ? '✓ In Stock' : '✗ Out of Stock'}
                </span>
              </div>
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${selectedImage === i ? 'border-green-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">

            <span className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">{product.category}</span>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-gray-600 font-medium">({product.rating} rating)</span>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-6 border-2 border-green-200">
              <p className="text-4xl font-bold text-gray-800">PKR {Number(product.price).toFixed(2)}</p>
              <p className="text-gray-600 mt-2">Free shipping on orders over PKR 5000</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description || 'This premium quality product is carefully crafted.'}</p>
            </div>

            {/* Quantity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quantity</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stockStatus !== 'in-stock'} className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-green-500 font-bold text-lg">-</button>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} disabled={product.stockStatus !== 'in-stock'} className="w-20 h-12 border-2 border-gray-300 rounded-xl text-center font-bold text-lg focus:border-green-500 focus:outline-none" />
                <button onClick={() => setQuantity(quantity + 1)} disabled={product.stockStatus !== 'in-stock'} className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-green-500 font-bold text-lg">+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={handleAddToCart} disabled={product.stockStatus !== 'in-stock'} className={`py-4 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all shadow-md ${product.stockStatus === 'in-stock' ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200 hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                <FiShoppingCart className="w-5 h-5" /> {product.stockStatus === 'in-stock' ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button onClick={handleToggleWishlist} className={`py-4 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-lg border-2 ${isInWishlist ? 'bg-pink-50 text-pink-600 border-pink-300 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:text-pink-600'}`}>
                <FiHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} /> {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <FiTruck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">Free Shipping</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <FiShield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">Secure Payment</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <FiPackage className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <Link key={p.id} href={`/products/${p.slug}`} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-400 group">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <Image src={p.images?.[0] || p.image || '/flower.png'} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{p.name}</h3>
                    <p className="text-2xl font-bold text-gray-800">PKR {Number(p.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
