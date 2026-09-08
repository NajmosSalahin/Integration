import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { fetchProduct } from '../api/products';
import ProductGallery from '../components/ProductGallery';
import SizeSelector from '../components/SizeSelector';
import useCart from '../stores/cartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const itemCount = useCart((s) => s.getItemCount());

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">Product not found</p>
        <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          Back to collection
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => `৳${(price / 100).toLocaleString()}`;

  return (
    <>
      <Helmet>
        <title>{product.title} — Integration</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
        <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="tracking-wider uppercase">Collection</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative">
                <ShoppingCart size={20} className="text-gray-400 hover:text-white transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link
                to="/"
                className="text-lg tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                INTEGRATION
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ProductGallery images={product.images} />
              </motion.div>

              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {product.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-gray-700 text-gray-400 rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h1
                    className="text-3xl sm:text-4xl tracking-[0.15em] uppercase"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {product.title}
                  </h1>
                </div>

                <p
                  className="text-xl text-blue-400"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {formatPrice(product.price)}
                </p>

                <p className="text-gray-400 leading-relaxed text-sm">
                  {product.description}
                </p>

                <div className="border-t border-gray-800 pt-6">
                  <SizeSelector
                    sizes={product.sizes}
                    stock={product.stock}
                    selectedSize={selectedSize}
                    onSelect={setSelectedSize}
                  />
                </div>

                {product.sizeGuideNote && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-sm p-4">
                    <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-1">
                      Size Guide
                    </p>
                    <p className="text-sm text-gray-400">
                      {product.sizeGuideNote}
                    </p>
                  </div>
                )}

                <button
                  disabled={!selectedSize}
                  onClick={() => {
                    addItem({ product, size: selectedSize });
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1500);
                  }}
                  className={`
                    w-full py-3 rounded-sm text-sm tracking-[0.2em] uppercase transition-all duration-200
                    ${selectedSize
                      ? added
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  {added ? 'Added!' : selectedSize ? 'Add to Cart' : 'Select a Size'}
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
