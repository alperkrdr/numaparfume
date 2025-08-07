import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, Heart, Star, Package, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { ShopierService } from '../services/shopierService';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user, openLoginModal } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  // Pending purchase kontrol et (kullanıcı giriş yaptığında)
  React.useEffect(() => {
    // Eğer kullanıcı giriş yaptı ve bekleyen bir satın alma varsa
    if (user && pendingPurchase) {
      console.log('✅ Kullanıcı giriş yaptı, bekleyen satın alma başlatılıyor...');
      setPendingPurchase(false);
      processPurchase();
    }
  }, [user, pendingPurchase]);

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Satın alma işlemini gerçekleştir
  const processPurchase = async () => {
    if (!user) {
      console.error('❌ processPurchase: User null!');
      return;
    }

    setIsProcessingPayment(true);
    console.log('💳 Ödeme işlemi başlatılıyor...');

    try {
      // Eğer ürünün Shopier linki varsa, direkt kullan
      if (product.shopierLink) {
        console.log('🔗 Admin panelinden girilen Shopier linki kullanılıyor:', product.shopierLink);
        window.location.href = product.shopierLink;
        return;
      }

      // Yoksa normal Shopier API kullan
      const shopierProduct = {
        name: product.name,
        price: product.price,
        currency: 'TRY',
        description: product.description,
        image_url: product.image,
        category: product.category,
        shopierLink: product.shopierLink
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
      
      // Ödeme sayfasına yönlendir (aynı sayfada)
      console.log('🔄 Ödeme sayfasına yönlendiriliyor...');
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('❌ Direkt satın alma hatası:', error);
      alert('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDirectPurchase = async () => {
    console.log('🛒 Hemen Satın Al butonu tıklandı', { user, product });
    
    if (!user) {
      console.log('❌ Kullanıcı giriş yapmamış, login modal açılıyor');
      setPendingPurchase(true); // Bekleyen satın alma flag'i
      openLoginModal();
      console.log('🔄 Login modal açıldı, kullanıcı giriş yapması bekleniyor...');
      return;
    }

    // Kullanıcı varsa direkt satın almayı başlat
    await processPurchase();
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) {
      console.log('⏸️ Sepete ekleme işlemi devam ediyor, atlandı');
      return;
    }

    if (!user) {
      openLoginModal();
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

        {/* Favorite Button */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!user) {
              openLoginModal();
              return;
            }
            
            try {
              await toggleFavorite(product.id);
            } catch (error) {
              console.error('❌ Favori güncelleme hatası:', error);
              if (error instanceof Error) {
                alert(error.message);
              }
            }
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 group/heart"
          title={isFavorite(product.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart 
            size={18} 
            className={`transition-all duration-300 group-hover/heart:scale-110 ${
              isFavorite(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'
            }`}
          />
        </button>

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
              !product.inStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isProcessingPayment
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isProcessingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ödeme sayfasına yönlendiriliyor...
              </>
            ) : (
              <>
            <ShoppingBag size={18} />
                {product.inStock ? '💳 Hemen Satın Al' : 'Stokta Yok'}
              </>
            )}
          </button>

          {product.inStock && (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`w-full py-2 px-4 rounded-xl font-medium border-2 transition-all duration-500 flex items-center justify-center gap-2 ${
                isAddingToCart
                  ? 'border-green-500 text-green-600 bg-green-50 scale-105'
                  : 'border-primary-600 text-primary-600 hover:bg-primary-50 hover:scale-105'
              }`}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
              <Plus size={16} />
              Sepete Ekle
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;