import React, { useState, useEffect } from 'react';
import { Search, Menu, X, ShoppingBag, User, MessageSquare, LogOut, Heart, Settings } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import CartModal from './CartModal';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onCategorySelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { settings } = useSettings();
  const { user, logout, isAdmin } = useAuth();
  
  const {
    cartItems,
    isUpdating,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount
  } = useCart();
  
  const { cartCount, favorites } = useFavorites();
  const favoriteCount = favorites.length;
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserDropdownOpen(false);
    };
    
    if (isUserDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserDropdownOpen]);

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

  const handleUserAction = () => {
    if (user) {
      setIsUserDropdownOpen(!isUserDropdownOpen);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
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
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsCartOpen(true);
  };

  const handleFavoritesClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
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
                className={`relative p-2 text-gray-700 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-all duration-500 ${
                  isUpdating ? 'scale-110 text-green-600' : ''
                }`}
                title="Sepetim"
              >
                <ShoppingBag size={20} className={`transition-all duration-500 ${isUpdating ? 'animate-bounce text-green-600' : ''}`} />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-500 min-w-[20px] ${
                    isUpdating 
                      ? 'scale-125 bg-green-500 animate-pulse shadow-lg' 
                      : 'bg-purple-600 scale-100'
                  }`}>
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* User Menu */}
              <div className="relative hidden md:block">
                <button 
                  onClick={handleUserAction}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span className="text-sm font-medium">
                    {user ? (user.displayName || user.email.split('@')[0]) : 'Giriş'}
                  </span>
                </button>

                {/* User Dropdown */}
                {user && isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.displayName || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/favorites"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <Heart className="w-4 h-4 mr-3" />
                      Favorilerim
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
              
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

                {/* User Section - Mobile */}
                {user ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.displayName || user.email.split('@')[0]}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link
                        to="/favorites"
                        className="flex items-center py-2 px-3 text-gray-700 hover:bg-white rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4 mr-3" />
                        Favorilerim ({favoriteCount})
                      </Link>
                      
                      {isAdmin && (
                <Link
                          to="/admin"
                          className="flex items-center py-2 px-3 text-gray-700 hover:bg-white rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                          <Settings className="w-4 h-4 mr-3" />
                          Admin Panel
                </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Giriş Yap / Kaydol
                  </button>
                )}

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

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        getCartTotal={getCartTotal}
        user={user}
        onLoginRequired={() => setIsLoginModalOpen(true)}
      />
    </>
  );
};

export default Header;