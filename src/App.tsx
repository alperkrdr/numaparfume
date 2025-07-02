import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import { useProducts } from './hooks/useProducts';
import { ForumService } from './services/forumService';

// Lazy load components for better performance
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const CollectionPage = lazy(() => import('./components/CollectionPage'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const FeaturedPage = lazy(() => import('./components/FeaturedPage'));
const Forum = lazy(() => import('./components/Forum'));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));

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
    console.log('🔄 Filtreleme useEffect çalıştı:', { 
      currentView, 
      selectedCategory, 
      productsLength: products.length 
    });
    
    if (currentView === 'featured' || currentView === 'collection') {
      const featured = getFeaturedProducts();
      console.log('⭐ Featured ürünler:', featured.length);
      setFilteredProducts(featured);
    } else if (selectedCategory === 'all') {
      console.log('🎯 Tüm ürünler gösteriliyor:', products.length);
      setFilteredProducts(products);
    } else {
      const categoryProducts = getProductsByCategory(selectedCategory);
      console.log('📂 Kategori ürünleri:', selectedCategory, categoryProducts.length);
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
    console.log('🎯 Kategori seçildi:', category);
    setSelectedCategory(category);
    setCurrentView('all');
    console.log('🔄 State güncellendi:', { selectedCategory: category, currentView: 'all' });
  };



  const getViewTitle = () => {
    if (currentView === 'featured') return 'Öne Çıkan Parfümler';
    if (currentView === 'collection') return 'Koleksiyonumuz';
    return selectedCategory === 'all' ? 'Tüm Parfümler' : 
           selectedCategory === 'kadın' ? 'Kadın Parfümleri' :
           selectedCategory === 'erkek' ? 'Erkek Parfümleri' : 'Unisex Parfümler';
  };

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
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
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <ProductDetail />
              <Footer />
            </Suspense>
          } />
          
          {/* Collection Page */}
          <Route path="/collection" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <CollectionPage />
              <Footer />
            </Suspense>
          } />
          
          {/* Category Pages */}
          <Route path="/category/:category" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <CategoryPage />
              <Footer />
            </Suspense>
          } />
          
          {/* Featured Page */}
          <Route path="/featured" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <FeaturedPage />
              <Footer />
            </Suspense>
          } />
          
          {/* Forum */}
          <Route path="/forum" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <Forum />
              <Footer />
            </Suspense>
          } />
          
          {/* Payment Pages */}
          <Route path="/payment-success" element={
            <div className="min-h-screen flex items-center justify-center bg-green-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-green-800 mb-2">Ödeme Başarılı!</h1>
                <p className="text-green-600 mb-4">Siparişiniz başarıyla alındı.</p>
                <a href="/" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          } />
          <Route path="/payment-failed" element={
            <div className="min-h-screen flex items-center justify-center bg-red-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-red-800 mb-2">Ödeme Başarısız</h1>
                <p className="text-red-600 mb-4">Ödeme işlemi tamamlanamadı.</p>
                <a href="/" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          } />
          
          {/* Home Page */}
          <Route path="/" element={
            <>
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
    </Router>
  );
}

export default App;