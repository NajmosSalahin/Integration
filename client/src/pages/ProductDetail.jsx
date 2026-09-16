import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ShoppingCart, Check } from 'lucide-react';
import { fetchProduct } from '../api/products';
import ProductGallery from '../components/ProductGallery';
import SizeSelector from '../components/SizeSelector';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import useCart from '../stores/cartStore';
import { useToast } from '../components/ui/Toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [sizeShake, setSizeShake] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const toast = useToast();
  const addTimer = useRef(null);

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  });

  useEffect(() => {
    setSelectedSize(null);
    setAdded(false);
  }, [id]);

  useEffect(() => () => clearTimeout(addTimer.current), []);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeShake(true);
      setTimeout(() => setSizeShake(false), 600);
      return;
    }
    addItem({ product, size: selectedSize });
    toast({ type: 'success', message: `${product.title} (${selectedSize}) added to cart` });
    setAdded(true);
    addTimer.current = setTimeout(() => setAdded(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8" aria-busy="true">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-2 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-14" count={1} />
                  ))}
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product && !error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <ErrorState message="Product not found" onRetry={() => refetch()} />
        <Footer />
      </div>
    );
  }

  if (error) {
    const isNotFound = error?.response?.status === 404 || error?.message?.includes('not found');
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <ErrorState
          message={isNotFound ? 'Product not found' : 'Something went wrong loading this product'}
          onRetry={() => refetch()}
        />
        <div className="text-center pb-12">
          <Link to="/shop" className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
            Browse all designs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price) => `৳${price.toLocaleString()}`;

  return (
    <>
      <Helmet>
        <title>{product.title} — Integration</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-4"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Back to shop
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ProductGallery images={product.images} />
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {product.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-[var(--border)] text-[var(--text-secondary)] rounded-sm"
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
                  className="text-xl text-[var(--accent)]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {formatPrice(product.price)}
                </p>

                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  {product.description}
                </p>

                <div className="border-t border-[var(--border)] pt-4">
                  <div className={sizeShake ? 'animate-pulse' : ''}>
                    <SizeSelector
                      sizes={product.sizes}
                      stock={product.stock}
                      selectedSize={selectedSize}
                      onSelect={setSelectedSize}
                    />
                  </div>
                  {sizeShake && (
                    <p className="mt-2 text-xs text-red-400" role="alert">
                      Please select a size first
                    </p>
                  )}
                </div>

                {product.sizeGuideNote && (
                  <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4">
                    <p className="text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-1">
                      Size Guide
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {product.sizeGuideNote}
                    </p>
                  </div>
                )}

                <button
                  disabled={!selectedSize && !sizeShake}
                  onClick={handleAddToCart}
                  aria-live="polite"
                  className={`
                    w-full py-3 rounded-lg text-sm tracking-[0.2em] uppercase transition-all duration-200 inline-flex items-center justify-center gap-2
                    ${selectedSize
                      ? added
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[var(--accent)] hover:bg-blue-500 text-white cursor-pointer'
                      : 'bg-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {added ? (
                    <>
                      <Check size={16} aria-hidden="true" />
                      Added!
                    </>
                  ) : selectedSize ? (
                    <>
                      <ShoppingCart size={16} aria-hidden="true" />
                      Add to Cart
                    </>
                  ) : (
                    'Select a Size'
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}