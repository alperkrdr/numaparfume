import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, Star, Package, Plus, User, Mail, Phone, CreditCard } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { ShopierService } from '../services/shopierService';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerInfo>>({});
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Satın alma işlemini gerçekleştir
  // const processPurchase = async () => { ... } // KALDIR
  // const handleDirectPurchase = async () => { ... } // KALDIR
  // const validateForm = () => { ... } // KALDIR
  // const showCustomerForm ile ilgili state ve kodlar KALDIR
  // Sadece Sepete Ekle butonu kalsın

  const [isAddingToCart, setIsAddingToCart] = useState(false);

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
      await addToCart(product.id, 1);
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

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (showCustomerForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-charcoal-900">
                Bilgilerinizi Girin
              </h2>
              <button
                onClick={() => setShowCustomerForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <p className="text-gray-600 text-sm mb-6">
              Ödeme işlemini tamamlamak için lütfen bilgilerinizi girin.
            </p>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-1" />
                Ad Soyad *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Adınız ve soyadınız"
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-1" />
                E-posta *
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ornek@email.com"
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-1" />
                Telefon Numarası *
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0512 345 67 89"
              />
              {formErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
              )}
            </div>

            {/* Product Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Ürün Bilgisi</h3>
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.brand} • {product.size}</p>
                  <p className="text-lg font-bold text-purple-600">₺{product.price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <button
              onClick={processPurchase}
              disabled={isProcessingPayment}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                'İşleniyor...'
              ) : (
                <>
                  <CreditCard size={18} />
                  ₺{product.price} Öde
                </>
              )}
            </button>

            <button
              onClick={() => setShowCustomerForm(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          loading="eager"
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
            onClick={handleDirectPurchase}
            disabled={!product.inStock || (product.stockQuantity || 0) === 0}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {!product.inStock || (product.stockQuantity || 0) === 0 ? (
              'Tükendi'
            ) : (
              <>
                <ShoppingBag size={16} />
                Hemen Satın Al
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;