import React, { useState, useEffect } from 'react';
import { Search, Menu, X, ShoppingBag, MessageSquare, Heart } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CartModal from './CartModal';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onCategorySelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { settings } = useSettings();
  
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();
  
  const { favorites } = useFavorites();
  const favoriteCount = favorites.length;
  const cartCount = getCartItemCount();
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile menu açık iken scroll'u engelle
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsMenuOpen(false);
    }
  };

  const categories = [
    { name: 'Tümü', value: 'all', path: '/' },
    { name: 'Kadın', value: 'kadın', path: '/category/kadın' },
    { name: 'Erkek', value: 'erkek', path: '/category/erkek' },
    { name: 'Unisex', value: 'unisex', path: '/category/unisex' }
  ];

  const handleCategoryClick = (category: typeof categories[0]) => {
    setIsMenuOpen(false);
    if (category.path) {
      navigate(category.path);
    } else {
      onCategorySelect(category.value);
    }
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleFavoritesClick = () => {
    // Favoriler için giriş gerekip gerekmediği kullanıcıya bağlı
    // Şimdilik doğrudan yönlendirme yapılıyor
    navigate('/favorites');
  };

  if (!settings) {
    return (
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse flex items-center justify-between">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-64 bg-gray-200 rounded"></div>
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  const logoImage = settings.logoImage || '/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg';

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center group" onClick={() => setIsMenuOpen(false)}>
              <div className="relative">
              <img 
                src={logoImage} 
                alt={settings.siteName} 
                  className="h-10 w-10 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
                onError={(e) => {
                  e.currentTarget.src = '/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg';
                }}
              />
              </div>
              <span className="ml-3 text-xl font-serif font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                {settings.siteName}
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Parfüm ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Forum Link - Desktop */}
              <Link 
                to="/forum"
                className="hidden md:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare size={18} />
                <span className="text-sm font-medium">Forum</span>
              </Link>
              
              {/* Favorites Button */}
              <button 
                onClick={handleFavoritesClick}
                className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Favorilerim"
              >
                <Heart size={20} />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {favoriteCount}
                </span>
                )}
              </button>
              
              {/* Cart Button */}
              <button 
                onClick={handleCartClick}
                className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-all duration-500"
                title="Sepetim"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Navigation - Desktop */}
            <nav className="hidden md:block border-t border-gray-100">
              <div className="flex items-center justify-center space-x-8 py-4">
                {categories.map((category) => (
                  <button
                    key={category.value}
                  onClick={() => handleCategoryClick(category)}
                  className={`text-gray-700 hover:text-purple-600 font-medium transition-colors relative group ${
                    location.pathname === category.path ? 'text-purple-600' : ''
                  }`}
                  >
                    {category.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                    location.pathname === category.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                  </button>
                ))}
              <Link
                to="/collection"
                className={`text-gray-700 hover:text-purple-600 font-medium transition-colors relative group ${
                  location.pathname === '/collection' ? 'text-purple-600' : ''
                }`}
              >
                Koleksiyon
                <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  location.pathname === '/collection' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
              <Link
                to="/featured"
                className={`text-gray-700 hover:text-purple-600 font-medium transition-colors relative group ${
                  location.pathname === '/featured' ? 'text-purple-600' : ''
                }`}
              >
                Öne Çıkanlar
                <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  location.pathname === '/featured' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute top-0 left-0 right-0 bg-white shadow-xl border-b border-gray-200 max-h-screen overflow-y-auto">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
              {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Parfüm ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-sm"
                  />
                  <button
                    type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                      <Search size={18} />
                  </button>
                </div>
              </form>

                {/* Mobile Navigation */}
                <nav className="space-y-1">
                  <Link
                    to="/forum"
                    className="flex items-center py-3 px-4 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Forum
                  </Link>
                  
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryClick(category)}
                      className="flex items-center w-full py-3 px-4 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      {category.name}
                    </button>
                  ))}
                  
                  <Link
                    to="/collection"
                    className="flex items-center py-3 px-4 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Koleksiyon
                  </Link>
                  
                  <Link
                    to="/featured"
                    className="flex items-center py-3 px-4 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Öne Çıkanlar
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        getCartTotal={getCartTotal}
      />
    </>
  );
};

export default Header;