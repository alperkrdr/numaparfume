import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import { useProducts } from './hooks/useProducts';
import { ForumService } from './services/forumService';
import SEO from './components/SEO';
import CampaignBar from './components/CampaignBar';

// Lazy load components for better performance
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const CollectionPage = lazy(() => import('./components/CollectionPage'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const FeaturedPage = lazy(() => import('./components/FeaturedPage'));
const Forum = lazy(() => import('./components/Forum'));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));
const PaymentCallback = lazy(() => import('./components/PaymentCallback'));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./components/PaymentFailed'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="text-gray-600">Yükleniyor...</p>
    </div>
  </div>
);

function App() {
  const { products, loading, searchProducts, getProductsByCategory, getFeaturedProducts } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentView, setCurrentView] = useState<'all' | 'featured' | 'collection'>('all');

  // Otomatik makale oluşturma scheduler'ını başlat
  React.useEffect(() => {
    ForumService.startAutoGenerationScheduler();
  }, []);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Filtreleme güncellendi:', { 
        currentView, 
        selectedCategory, 
        productsLength: products.length 
      });
    }
    
    if (currentView === 'featured' || currentView === 'collection') {
      const featured = getFeaturedProducts();
      setFilteredProducts(featured);
    } else if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      const categoryProducts = getProductsByCategory(selectedCategory);
      setFilteredProducts(categoryProducts);
    }
  }, [products, selectedCategory, currentView, getProductsByCategory, getFeaturedProducts]);

  const handleSearch = (query: string) => {
    if (query.trim() === '') {
      if (currentView === 'featured' || currentView === 'collection') {
        setFilteredProducts(getFeaturedProducts());
      } else if (selectedCategory === 'all') {
        setFilteredProducts(products);
      } else {
        setFilteredProducts(getProductsByCategory(selectedCategory));
      }
    } else {
      const searchResults = searchProducts(query);
      setFilteredProducts(searchResults);
      setCurrentView('all');
    }
  };

  const handleCategorySelect = (category: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Kategori seçildi:', category);
    }
    setSelectedCategory(category);
    setCurrentView('all');
  };



  const getViewTitle = () => {
    if (currentView === 'featured') return 'Öne Çıkan Parfümler';
    if (currentView === 'collection') return 'Koleksiyonumuz';
    return selectedCategory === 'all' ? 'Tüm Parfümler' : 
           selectedCategory === 'kadın' ? 'Kadın Parfümleri' :
           selectedCategory === 'erkek' ? 'Erkek Parfümleri' : 'Unisex Parfümler';
  };

  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <CartProvider>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/admin" element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminPanel />
              </Suspense>
            } />

            {/* Product Detail Page */}
            <Route path="/product/:id" element={
              <Suspense fallback={<LoadingSpinner />}>
                <CampaignBar />
                <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
                <ProductDetail />
                <Footer />
              </Suspense>
            } />

            {/* Collection Page */}
            <Route path="/collection" element={
              <Suspense fallback={<LoadingSpinner />}>
                <CampaignBar />
                <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
                <CollectionPage />
                <Footer />
              </Suspense>
            } />

            {/* Category Pages */}
            <Route path="/category/:category" element={
              <Suspense fallback={<LoadingSpinner />}>
                <CampaignBar />
                <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
                <CategoryPage />
                <Footer />
              </Suspense>
            } />

            {/* Featured Page */}
            <Route path="/featured" element={
              <Suspense fallback={<LoadingSpinner />}>
                <CampaignBar />
                <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
                <FeaturedPage />
                <Footer />
              </Suspense>
            } />

            {/* Forum */}
            <Route path="/forum" element={
              <Suspense fallback={<LoadingSpinner />}>
                <CampaignBar />
                <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
                <Forum />
                <Footer />
              </Suspense>
            } />

            {/* Payment Callback */}
            <Route path="/payment-callback" element={
              <Suspense fallback={<LoadingSpinner />}>
                <PaymentCallback />
              </Suspense>
            } />

            {/* Payment Pages */}
            <Route path="/payment-success" element={
              <Suspense fallback={<LoadingSpinner />}>
                <PaymentSuccess />
              </Suspense>
            } />
          <Route path="/checkout" element={
            <Suspense fallback={<LoadingSpinner />}>
              <CheckoutPage />
            </Suspense>
          } />
            <Route path="/payment-failed" element={
              <Suspense fallback={<LoadingSpinner />}>
                <PaymentFailed />
              </Suspense>
            } />

          {/* All Products Page */}
          <Route path="/products" element={
            <>
              <SEO />
              <CampaignBar />
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <main className="container mx-auto px-4 py-12">
                <ProductGrid 
                  products={products}
                  loading={loading}
                  viewTitle="Tüm Ürünler"
                />
              </main>
              <Footer />
            </>
          } />

            {/* Home Page */}
            <Route path="/" element={
              <>
                <SEO />
                <CampaignBar />
                <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
                <Hero />
                <main className="container mx-auto px-4 py-12">
                  <ProductGrid
                    products={filteredProducts}
                    loading={loading}
                    viewTitle={getViewTitle()}
                  />
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;