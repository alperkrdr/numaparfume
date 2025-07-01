import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import CollectionPage from './components/CollectionPage';
import CategoryPage from './components/CategoryPage';
import FeaturedPage from './components/FeaturedPage';
import Footer from './components/Footer';
import Forum from './components/Forum';
import { AdminPanel } from './components/AdminPanel';
import { useProducts } from './hooks/useProducts';
import { ForumService } from './services/forumService';

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
    if (currentView === 'featured' || currentView === 'collection') {
      setFilteredProducts(getFeaturedProducts());
    } else if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(getProductsByCategory(selectedCategory));
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
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* Product Detail Page */}
          <Route path="/product/:id" element={
            <>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <ProductDetail />
              <Footer />
            </>
          } />
          
          {/* Collection Page */}
          <Route path="/collection" element={
            <>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <CollectionPage />
              <Footer />
            </>
          } />
          
          {/* Category Pages */}
          <Route path="/category/:category" element={
            <>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <CategoryPage />
              <Footer />
            </>
          } />
          
          {/* Featured Page */}
          <Route path="/featured" element={
            <>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <FeaturedPage />
              <Footer />
            </>
          } />
          
          {/* Forum */}
          <Route path="/forum" element={
            <>
              <Header onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
              <Forum />
              <Footer />
            </>
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