import React, { useState } from 'react';
import { Search, Menu, X, ShoppingBag, User, MessageSquare, LogOut } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Link, useLocation } from 'react-router-dom';
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
  const {
    cartItems,
    isCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    openCart,
    closeCart
  } = useCart();
  const location = useLocation();

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
    { name: 'Tümü', value: 'all' },
    { name: 'Kadın', value: 'kadın' },
    { name: 'Erkek', value: 'erkek' },
    { name: 'Unisex', value: 'unisex' }
  ];

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
            <Link to="/" className="flex items-center">
              <img 
                src={logoImage} 
                alt={settings.siteName} 
                className="h-12 w-12 rounded-full object-cover shadow-md"
                onError={(e) => {
                  e.currentTarget.src = '/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg';
                }}
              />
              <span className="ml-3 text-xl font-serif font-bold text-charcoal-900">{settings.siteName}</span>
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
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/forum"
                className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <MessageSquare size={20} />
                <span className="text-sm">Forum</span>
              </Link>
              
              <button 
                onClick={handleUserAction}
                className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                {user ? <LogOut size={20} /> : <User size={20} />}
                <span className="text-sm">
                  {user ? user.name.split(' ')[0] : 'Giriş'}
                </span>
              </button>
              
              <button 
                onClick={openCart}
                className="relative text-gray-700 hover:text-primary-600 transition-colors"
              >
                <ShoppingBag size={20} />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
          {location.pathname === '/' && (
            <nav className="hidden md:block border-t border-gray-100">
              <div className="flex items-center justify-center space-x-8 py-4">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => onCategorySelect(category.value)}
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
                  >
                    {category.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                  </button>
                ))}
              </div>
            </nav>
          )}

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
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Search size={20} />
                  </button>
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
                {location.pathname === '/' && categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      onCategorySelect(category.value);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 px-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {category.name}
                  </button>
                ))}
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