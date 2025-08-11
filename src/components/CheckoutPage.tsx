import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { CampaignService } from '../services/campaignService';
import { User, Mail, Phone, Home, CreditCard, ShoppingBag, Tag, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerInfo>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const cartTotal = getCartTotal();
  const campaignData = settings?.campaignSettings
    ? CampaignService.calculateCampaignDiscount(cartTotal, settings.campaignSettings)
    : null;

  const validateForm = (): boolean => {
    const errors: Partial<CustomerInfo> = {};
    if (!customerInfo.name.trim()) errors.name = 'Ad soyad gerekli';
    if (!customerInfo.email.trim()) {
      errors.email = 'E-posta gerekli';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin';
    }
    if (!customerInfo.phone.trim()) {
      errors.phone = 'Telefon numarası gerekli';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      errors.phone = 'Geçerli bir telefon numarası girin';
    }
    if (!customerInfo.address.trim()) {
      errors.address = 'Adres gerekli';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (cartItems.length === 0) {
      alert('Sepetiniz boş. Ödeme yapılamıyor.');
      navigate('/');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const finalTotal = campaignData?.campaignApplied ? campaignData.finalTotal : cartTotal;

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          buyerInfo: customerInfo,
          discountInfo: campaignData,
          totalAmount: finalTotal,
        }),
      });

      if (!response.ok) {
        throw new Error('Ödeme formu oluşturulamadı.');
      }

      const data = await response.json();

      if (data.html) {
        // Create a temporary div to inject and submit the form
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.html;
        document.body.appendChild(tempDiv);
        const shopierForm = document.getElementById('shopier_form') as HTMLFormElement;
        if (shopierForm) {
          shopierForm.submit();
          clearCart();
        } else {
          throw new Error('Shopier formu bulunamadı.');
        }
      } else {
        throw new Error('Geçersiz yanıt alındı.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-6 flex items-center gap-3">
              <User /> Bilgilerinizi Girin
            </h1>
            <form onSubmit={processPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Adınız ve soyadınız"
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-posta *</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.email ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="ornek@email.com"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Numarası *</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.phone ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="0512 345 67 89"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adres *</label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.address ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Teslimat adresi"
                />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment || cartItems.length === 0}
                className="w-full bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessingPayment ? (
                  'İşleniyor...'
                ) : (
                  <>
                    <CreditCard size={20} />
                    Güvenli Ödeme Yap
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-serif font-bold text-charcoal-900 mb-6 flex items-center gap-3">
              <ShoppingBag /> Sipariş Özeti
            </h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-500">Sepetinizde ürün bulunmuyor.</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.product.id} className="flex items-center gap-4">
                    <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.quantity} x ₺{item.product.price.toLocaleString()}</p>
                    </div>
                    <p className="font-semibold">₺{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
                <hr className="my-6 border-gray-200" />
                <div className="space-y-3">
                   <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span>₺{cartTotal.toLocaleString()}</span>
                  </div>
                  {campaignData?.campaignApplied && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span><Gift size={16} className="inline-block mr-1" /> {campaignData.campaignTitle}</span>
                      <span>-₺{campaignData.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-charcoal-900 pt-4 border-t border-gray-200 mt-4">
                    <span>Toplam</span>
                    <span>₺{(campaignData?.campaignApplied ? campaignData.finalTotal : cartTotal).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
