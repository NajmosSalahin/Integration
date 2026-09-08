import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Minus, Plus, X, ShoppingBag } from 'lucide-react';
import useCart from '../stores/cartStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const total = getTotal();

  return (
    <>
      <Helmet>
        <title>Your Cart — Integration</title>
        <meta name="description" content="Review your cart before checkout." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
        <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="tracking-wider uppercase">Continue Shopping</span>
            </Link>
            <Link
              to="/"
              className="text-lg tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              INTEGRATION
            </Link>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-8"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Your Cart
            </h1>

            {items.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400 mb-2">Your cart is empty</p>
                <Link
                  to="/"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Browse the collection
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-4 p-4 border border-gray-800 rounded-sm"
                    >
                      <Link
                        to={`/product/${item.productId}`}
                        className="shrink-0 w-20 h-24 bg-gray-900 rounded-sm overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/product/${item.productId}`}
                              className="text-sm tracking-[0.15em] uppercase hover:text-blue-400 transition-colors"
                              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Size: {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.size)}
                            className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.size, item.quantity - 1)
                              }
                              className="w-7 h-7 flex items-center justify-center border border-gray-700 rounded-sm text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.size, item.quantity + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center border border-gray-700 rounded-sm text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-300">
                            ৳{((item.price * item.quantity) / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-gray-800 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Subtotal</span>
                    <span
                      className="text-xl text-blue-400"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      ৳{(total / 100).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">
                    Payment is manual via bKash. You will be contacted after placing your order.
                  </p>

                  <button
                    disabled
                    className="w-full py-3 rounded-sm text-sm tracking-[0.2em] uppercase bg-gray-800 text-gray-600 cursor-not-allowed"
                  >
                    Checkout — Coming Soon
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-xs tracking-wider uppercase text-gray-600 hover:text-red-400 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
