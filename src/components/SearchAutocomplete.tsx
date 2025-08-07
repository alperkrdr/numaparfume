import React, { useState, useEffect, useRef } from 'react';
import { Search, Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  isMobile?: boolean;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  onSearch,
  placeholder = "Parfüm ara...",
  className = "",
  isMobile = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { searchProducts } = useProducts();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search and update suggestions
  useEffect(() => {
    if (query.length > 1) {
      const results = searchProducts(query).slice(0, 6); // Maksimum 6 öneri
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [query, searchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // Seçili ürüne git
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        // Arama yap
        onSearch(query.trim());
        setIsOpen(false);
      }
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    navigate(`/product/${product.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const baseInputClassName = `w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-sm ${
    isOpen ? 'rounded-b-none border-b-0' : ''
  }`;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 1 && suggestions.length > 0 && setIsOpen(true)}
            className={baseInputClassName}
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border-l border-r border-b border-gray-200 rounded-b-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((product, index) => (
            <div
              key={product.id}
              className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-purple-50 border-purple-200' : ''
              }`}
              onClick={() => handleSuggestionClick(product)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-perfume.jpg';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {highlightMatch(product.name, query)}
                  </h4>
                  {product.featured && (
                    <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-medium">
                      Öne Çıkan
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="capitalize">{product.brand}</span>
                  <span>•</span>
                  <span className="capitalize">{product.category}</span>
                  <Package size={12} className="ml-1" />
                  <span>{product.size}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="font-bold text-purple-600">₺{product.price}</div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-xs text-gray-500 line-through">₺{product.originalPrice}</div>
                )}
              </div>
            </div>
          ))}
          
          {/* Show all results option */}
          <div
            className={`flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors ${
              selectedIndex === suggestions.length ? 'bg-purple-50' : ''
            }`}
            onClick={() => {
              onSearch(query);
              setIsOpen(false);
            }}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Search size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                "{query}" için tüm sonuçları göster
              </div>
              <div className="text-sm text-gray-600">
                {suggestions.length}+ ürün bulundu
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;