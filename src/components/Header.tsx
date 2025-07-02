import React, { useState, useEffect } from 'react';
import { Search, Menu, X, ShoppingBag, User, MessageSquare, LogOut } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import CartModal from './CartModal';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onCategorySelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { settings } = useSettings();
  const { 
    user, 
    isLoginModalOpen, 
    login, 
    logout, 
    openLoginModal, 
    closeLoginModal 
  } = useAuth();

  // Debug sadece modal açılırken
  React.useEffect(() => {
    if (isLoginModalOpen) {
      console.log('🔓 Header: Login modal açıldı');
    }
  }, [isLoginModalOpen]);
  
  const {
    cartItems,
    isCartOpen,
    isUpdating,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    openCart,
    closeCart
  } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleUserAction = () => {
    if (user) {
      logout();
    } else {
      openLoginModal();
    }
  };

  const categories = [
    { name: 'Tümü', value: 'all', path: '/' },
    { name: 'Kadın', value: 'kadın', path: '/category/kadın' },
    { name: 'Erkek', value: 'erkek', path: '/category/erkek' },
    { name: 'Unisex', value: 'unisex', path: '/category/unisex' }
  ];

  const handleCategoryClick = (category: typeof categories[0]) => {
    if (category.path) {
      navigate(category.path);
    } else {
      onCategorySelect(category.value);
    }
  };

  if (!settings) {
    return null; // Loading state
  }

  // Admin panelinden ayarlanabilir logo
  const logoImage = settings.logoImage || '/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg';

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
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
              <span className="ml-3 text-xl font-serif font-bold text-charcoal-900 group-hover:text-primary-600 transition-colors">{settings.siteName}</span>
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
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-sm"
                  />
                  <Search 
                    size={18} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/forum"
                className="hidden md:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare size={18} />
                <span className="text-sm font-medium">Forum</span>
              </Link>
              
              <button 
                onClick={handleUserAction}
                className="hidden md:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {user ? <LogOut size={18} /> : <User size={18} />}
                <span className="text-sm font-medium">
                  {user ? user.name.split(' ')[0] : 'Giriş'}
                </span>
              </button>
              
              <button 
                onClick={openCart}
                className={`relative p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-all duration-500 ${
                  isUpdating ? 'scale-110 text-green-600' : ''
                }`}
                title="Sepetimi Görüntüle"
              >
                <ShoppingBag size={20} className={`transition-all duration-500 ${isUpdating ? 'animate-bounce text-green-600' : ''}`} />
                {getCartItemCount() > 0 && (
                  <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-500 min-w-[20px] ${
                    isUpdating 
                      ? 'scale-125 bg-green-500 animate-pulse shadow-lg' 
                      : 'bg-primary-600 scale-100'
                  }`}>
                    {getCartItemCount()}
                  </span>
                )}
              </button>


              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-700 hover:text-primary-600 transition-colors"
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
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
                  >
                    {category.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                  </button>
                ))}
              <Link
                to="/collection"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
              >
                Koleksiyon
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/featured"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
              >
                Öne Çıkanlar
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              </div>
            </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 animate-fade-in">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Parfüm ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-sm"
                  />
                  <Search 
                    size={18} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  to="/forum"
                  className="block w-full text-left py-2 px-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Forum
                </Link>
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      handleCategoryClick(category);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 px-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {category.name}
                  </button>
                ))}
                <Link
                  to="/collection"
                  className="block w-full text-left py-2 px-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Koleksiyon
                </Link>
                <Link
                  to="/featured"
                  className="block w-full text-left py-2 px-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Öne Çıkanlar
                </Link>
                <button 
                  onClick={() => {
                    handleUserAction();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 px-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {user ? `Çıkış Yap (${user.name})` : 'Giriş Yap'}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLogin={login}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        getCartTotal={getCartTotal}
        user={user}
        onLoginRequired={openLoginModal}
      />
    </>
  );
};

export default Header;