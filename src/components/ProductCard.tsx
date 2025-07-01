import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, Heart, Star, Package, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { ShopierService } from '../services/shopierService';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { user, openLoginModal } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleDirectPurchase = async () => {
    console.log('🛒 Hemen Satın Al butonu tıklandı', { user, product });
    
    if (!user) {
      console.log('❌ Kullanıcı giriş yapmamış, login modal açılıyor');
      openLoginModal();
      return;
    }

    setIsProcessingPayment(true);
    console.log('💳 Ödeme işlemi başlatılıyor...');

    try {
      const shopierProduct = {
        name: product.name,
        price: product.price,
        currency: 'TRY',
        description: product.description,
        image_url: product.image,
        category: product.category
      };

      console.log('📦 Shopier ürün verisi:', shopierProduct);
      console.log('👤 Kullanıcı verisi:', {
        name: user.name,
        email: user.email,
        phone: user.phone
      });

      const paymentUrl = await ShopierService.createSingleProductPayment(
        shopierProduct,
        {
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      );

      console.log('🔗 Ödeme URL\'si oluşturuldu:', paymentUrl);
      
      // Ödeme sayfasına yönlendir
      window.open(paymentUrl, '_blank');
    } catch (error) {
      console.error('❌ Direkt satın alma hatası:', error);
      alert('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAddToCart = () => {
    console.log('🛍️ Sepete Ekle butonu tıklandı', { product });
    
    try {
      addToCart(product, 1);
      console.log('✅ Ürün sepete eklendi');
      
      // Başarı bildirimi göster
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Ürün sepete eklendi!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } catch (error) {
      console.error('❌ Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50 cursor-pointer" onClick={handleProductClick}>
        <OptimizedImage
          src={product.image}
          alt={product.name}
          width={300}
          height={256}
          className="w-full h-64 group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        
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
          {!product.inStock && (
            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Tükendi
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 group/heart"
        >
          <Heart 
            size={18} 
            className={`transition-all duration-300 group-hover/heart:scale-110 ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Quick Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="absolute bottom-4 right-4 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
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
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              ₺{product.originalPrice}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleDirectPurchase}
            disabled={!product.inStock || isProcessingPayment}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              product.inStock
                ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={18} />
            {isProcessingPayment ? 'İşleniyor...' : (product.inStock ? 'Hemen Satın Al' : 'Stokta Yok')}
          </button>

          {product.inStock && (
            <button
              onClick={handleAddToCart}
              className="w-full py-2 px-4 rounded-xl font-medium border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Sepete Ekle
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;