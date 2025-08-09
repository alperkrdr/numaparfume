import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, Star, Package, Plus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) {
      console.log('⏸️ Sepete ekleme işlemi devam ediyor, atlandı');
      return;
    }
    
    console.log('🛍️ Sepete Ekle butonu tıklandı', { 
      productId: product.id, 
      productName: product.name,
      productPrice: product.price
    });
    
    if (!product || !product.id) {
      console.error('❌ Geçersiz ürün verisi:', product);
      alert('Ürün bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.');
      return;
    }
    
    try {
      setIsAddingToCart(true);
      await addToCart(product, 1);
      console.log('✅ addToCart fonksiyonu çağrıldı');
      
      // Başarı bildirimi
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '✅ Ürün sepete eklendi!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Sepete ekleme hatası:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Ürün sepete eklenirken bir hata oluştu.');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleImageError = () => {
    console.error('❌ Görsel yüklenemedi:', product.image);
    setImageError(true);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50 cursor-pointer" onClick={handleProductClick}>
        {!imageError ? (
          <OptimizedImage
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-64 object-cover rounded-xl bg-gray-100"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 mx-auto mb-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm">Görsel yüklenemedi</p>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              Öne Çıkan
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              %{discountPercentage} İndirim
            </span>
          )}
          {!product.inStock || (product.stockQuantity || 0) === 0 ? (
            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Tükendi
            </span>
          ) : product.stockQuantity && product.stockQuantity <= (product.minStockLevel || 5) ? (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Son {product.stockQuantity} Adet
            </span>
          ) : null}
        </div>

        {/* Quick Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || (product.stockQuantity || 0) === 0 || isAddingToCart}
          className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${
            isAddingToCart 
              ? 'bg-green-500 text-white scale-110 animate-pulse' 
              : 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105'
          }`}
          title={
            !product.inStock 
              ? 'Tükendi' 
              : isAddingToCart 
                ? 'Sepete Ekleniyor...' 
                : 'Sepete Ekle'
          }
        >
          {isAddingToCart ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
          <Plus size={18} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-primary-600 text-sm font-medium uppercase tracking-wide">
            {product.brand}
          </span>
          <span className="text-gray-500 text-sm capitalize">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 
          className="font-serif font-semibold text-lg text-charcoal-900 mb-2 line-clamp-1 cursor-pointer hover:text-primary-600 transition-colors"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-charcoal-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Size */}
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">{product.size}</span>
        </div>

        {/* Notes Preview */}
        {product.notes && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {product.notes.top?.slice(0, 2).map((note, index) => (
                <span key={index} className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs">
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-charcoal-900">
            ₺{product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-lg text-gray-500 line-through">
              ₺{product.originalPrice}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || (product.stockQuantity || 0) === 0 || isAddingToCart}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {!product.inStock || (product.stockQuantity || 0) === 0 ? (
              'Tükendi'
            ) : isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ekleniyor...
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                Sepete Ekle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;