import React, { useState } from 'react';
import { X, CreditCard, User, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { CartItem } from '../hooks/useCart';
import { ShopierService } from '../services/shopierService';
import { CampaignService } from '../services/campaignService';
import { useSettings } from '../hooks/useSettings';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postcode: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartTotal
}) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'İstanbul',
    country: 'Turkey',
    postcode: '34000'
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});
  const { settings } = useSettings();

  // Campaign calculation
  const cartTotal = getCartTotal();
  const campaignData = settings?.campaignSettings 
    ? CampaignService.calculateCampaignDiscount(cartTotal, settings.campaignSettings)
    : null;
  
  const campaignMessage = settings?.campaignSettings 
    ? CampaignService.getCampaignMessage(cartTotal, settings.campaignSettings)
    : null;

  const validateForm = (): boolean => {
    const newErrors: Partial<UserInfo> = {};

    if (!userInfo.name.trim()) {
      newErrors.name = 'Ad soyad gereklidir';
    }

    if (!userInfo.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!userInfo.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!/^[0-9]{10,11}$/.test(userInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    if (!userInfo.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert('Sepetiniz boş');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Campaign price for payment
      const finalTotal = campaignData?.campaignApplied ? campaignData.finalTotal : cartTotal;
      
      const shopierCartItems = cartItems.map(item => ({
        product: {
          name: item.product.name,
          price: item.product.price,
          currency: 'TRY',
          description: item.product.description,
          image_url: item.product.image,
          category: item.product.category
        },
        quantity: item.quantity
      }));

      // Add discount item if campaign exists
      if (campaignData?.campaignApplied && campaignData.discountAmount > 0) {
        shopierCartItems.push({
          product: {
            name: `${campaignData.campaignTitle} - İndirim`,
            price: -campaignData.discountAmount,
            currency: 'TRY',
            description: campaignData.campaignDescription || 'Kampanya indirimi',
            image_url: '',
            category: 'unisex'
          },
          quantity: 1
        });
      }

      const paymentUrl = await ShopierService.createCartPayment(
        shopierCartItems,
        {
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone
        },
        campaignData?.campaignApplied && campaignData.campaignTitle ? {
          discountAmount: campaignData.discountAmount,
          campaignTitle: campaignData.campaignTitle
        } : undefined
      );

      console.log('🚀 Ödeme sayfasına yönlendiriliyor:', paymentUrl);
      
      // Redirect to payment page
      window.location.href = paymentUrl;
      
      // Clear cart
      clearCart();
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-charcoal-900 flex items-center gap-2">
              <CreditCard size={24} />
              Ödeme Bilgileri
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* User Information Form */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Kişisel Bilgiler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Adınız ve soyadınız"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ornek@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5XX XXX XX XX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres *
                </label>
                <input
                  type="text"
                  value={userInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tam adresiniz"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} />
                Sepet Özeti
              </h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-gray-600 text-xs">{item.product.size}</p>
                      <p className="text-purple-600 font-bold">₺{item.product.price}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <span className="text-xs">-</span>
                      </button>
                      
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <span className="text-xs">+</span>
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Campaign Message */}
              {campaignMessage && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <span className="text-sm font-medium">{campaignMessage}</span>
                  </div>
                </div>
              )}

              {/* Campaign Applied */}
              {campaignData?.campaignApplied && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <span className="text-sm font-semibold">{campaignData.campaignTitle}</span>
                  </div>
                  <p className="text-xs text-green-700">{campaignData.campaignDescription}</p>
                </div>
              )}

              {/* Price Summary */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-medium">₺{cartTotal.toLocaleString()}</span>
                </div>
                
                {campaignData?.campaignApplied && campaignData.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Kampanya İndirimi:</span>
                    <span className="font-medium">-₺{campaignData.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-charcoal-900">Toplam:</span>
                  <div className="text-right">
                    {campaignData?.campaignApplied && campaignData.discountAmount > 0 ? (
                      <>
                        <div className="text-sm text-gray-500 line-through">₺{cartTotal.toLocaleString()}</div>
                        <div className="text-2xl font-bold text-green-600">₺{campaignData.finalTotal.toLocaleString()}</div>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-purple-600">₺{cartTotal.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              disabled={isProcessingPayment}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                'İşleniyor...'
              ) : (
                <>
                  <CreditCard size={18} />
                  {campaignData?.campaignApplied ? 
                    `₺${campaignData.finalTotal.toLocaleString()} Öde` : 
                    'Ödemeye Geç'
                  }
                </>
              )}
            </button>

            <button
              onClick={clearCart}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Sepeti Temizle
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-3">
            Ödeme işlemi Shopier güvenli ödeme sistemi üzerinden gerçekleştirilecektir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;