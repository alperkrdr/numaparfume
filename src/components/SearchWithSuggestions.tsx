import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface SearchWithSuggestionsProps {
  products: Product[];
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  products,
  onSearch,
  placeholder = "Parfüm ara..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.originalName.toLowerCase().includes(normalizedQuery) ||
      product.brand.toLowerCase().includes(normalizedQuery) ||
      product.originalBrand.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.seoKeywords?.some(keyword => 
        keyword.toLowerCase().includes(normalizedQuery)
      )
    ).slice(0, 8); // Limit to 8 suggestions

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [searchQuery, products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim() === '') {
      onSearch('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.name);
    onSearch(product.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (searchQuery.trim()) {
          onSearch(searchQuery.trim());
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-sm"
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="text-gray-400 hover:text-purple-600 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((product, index) => (
            <div
              key={product.id}
              onClick={() => handleSuggestionClick(product)}
              className={`flex items-center p-3 cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-purple-50 border-l-4 border-purple-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg mr-3 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {product.name}
                </h4>
                <p className="text-gray-500 text-xs truncate">
                  {product.brand} • {product.category}
                </p>
                <p className="text-purple-600 font-semibold text-sm">
                  ₺{product.price}
                </p>
              </div>
              <Link
                to={`/product/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                Detay
              </Link>
            </div>
          ))}
          
          {suggestions.length > 0 && (
            <div className="border-t border-gray-100 p-2 text-center">
              <span className="text-xs text-gray-500">
                {suggestions.length} sonuç bulundu • Enter ile arama yapın
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchWithSuggestions;