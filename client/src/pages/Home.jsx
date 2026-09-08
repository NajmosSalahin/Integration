import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import useCart from '../stores/cartStore';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  const itemCount = useCart((s) => s.getItemCount());
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Integration — Different Styles, One Identity</title>
        <meta name="description" content="Curated t-shirt designs. Modern Japanese streetwear. Different styles, one identity." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
        <header className="px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1
                className="text-4xl sm:text-5xl tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                INTEGRATION
              </h1>
              <p className="mt-1 text-xs tracking-[0.3em] text-gray-500 uppercase">
                Different Styles, One Identity
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <div className="flex items-center gap-3">
                  <Link
                    to="/admin/orders"
                    className="text-xs tracking-wider uppercase text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/admin/products"
                    className="text-xs tracking-wider uppercase text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    Products
                  </Link>
                </div>
              )}
              <Link to="/cart" className="relative">
                <ShoppingCart size={22} className="text-gray-400 hover:text-white transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-2xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Collection
              </h2>
              {products && (
                <span className="text-xs text-gray-500 tracking-wider">
                  {products.length} designs
                </span>
              )}
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-900 rounded-sm" />
                    <div className="mt-3 h-4 bg-gray-900 rounded w-2/3" />
                    <div className="mt-2 h-3 bg-gray-900 rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-red-400">Failed to load products</p>
                <p className="text-sm text-gray-500 mt-2">{error.message}</p>
              </div>
            )}

            {products && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
