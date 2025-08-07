import React, { useState } from 'react';
import { X, CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';
import { CartItem } from '../hooks/useCart';
import { ShopierService } from '../services/shopierService';
import { CampaignService } from '../services/campaignService';
import { useSettings } from '../hooks/useSettings';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  getCartTotal: () => number;
  clearCart: () => void;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  cartItems,
  getCartTotal,
  clearCart
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<UserInfo>>({});
  const { settings } = useSettings();

  // Kampanya hesaplama
  const cartTotal = getCartTotal();
  const campaignData = settings?.campaignSettings 
    ? CampaignService.calculateCampaignDiscount(cartTotal, settings.campaignSettings)
    : null;

  const validateForm = (): boolean => {
    const newErrors: Partial<UserInfo> = {};

    if (!userInfo.name.trim()) {
      newErrors.name = 'Ad soyad gereklidir';
    }

    if (!userInfo.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
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

    if (!userInfo.city.trim()) {
      newErrors.city = 'Şehir gereklidir';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert('Sepetiniz boş');
      return;
    }

    setIsProcessing(true);

    try {
      // Kampanyalı fiyat ile ödeme
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

      // Eğer kampanya varsa, son ürün olarak indirim kalemi ekle
      if (campaignData?.campaignApplied && campaignData.discountAmount > 0) {
        shopierCartItems.push({
          product: {
            name: `${campaignData.campaignTitle} - İndirim`,
            price: -campaignData.discountAmount, // Negatif fiyat
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
        // Kampanya indirimi bilgisi
        campaignData?.campaignApplied && campaignData.campaignTitle ? {
          discountAmount: campaignData.discountAmount,
          campaignTitle: campaignData.campaignTitle
        } : undefined
      );

      console.log('🚀 Ödeme sayfasına yönlendiriliyor:', paymentUrl);
      
      // Ödeme sayfasına yönlendir (aynı sekmede)
      window.location.href = paymentUrl;
      
      // Sepeti temizle
      clearCart();
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
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

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                Ad Soyad
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                E-posta
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Telefon
              </label>
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0555 123 45 67"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Adres
              </label>
              <textarea
                value={userInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Teslimat adresi"
                rows={3}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir
              </label>
              <input
                type="text"
                value={userInfo.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="İstanbul"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Sipariş Özeti</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₺{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <hr className="border-gray-200" />
                <div className="flex justify-between font-semibold">
                  <span>Toplam:</span>
                  <span>₺{cartTotal.toLocaleString()}</span>
                </div>
                {campaignData?.campaignApplied && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Kampanya İndirimi:</span>
                    <span>-₺{campaignData.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {campaignData?.campaignApplied && (
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Ödenecek Tutar:</span>
                    <span>₺{campaignData.finalTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              'İşleniyor...'
            ) : (
              <>
                <CreditCard size={18} />
                {campaignData?.campaignApplied ? 
                  `₺${campaignData.finalTotal.toLocaleString()} Öde` : 
                  `₺${cartTotal.toLocaleString()} Öde`
                }
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-3">
            Güvenli ödeme için Shopier'e yönlendirileceksiniz
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;