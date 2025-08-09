import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { CampaignService } from '../services/campaignService';
import { ShopierService } from '../services/shopierService';
import { CreditCard, User, Phone, Mail, Home, ShoppingBag, Tag, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CheckoutPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '', phone: '', address: '' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const cartTotal = getCartTotal();
  const campaignData = settings?.campaignSettings
    ? CampaignService.calculateCampaignDiscount(cartTotal, settings.campaignSettings)
    : null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBuyerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Sepetiniz boş.');
      return;
    }
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone || !buyerInfo.address) {
      alert('Lütfen tüm teslimat bilgilerini doldurun.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const shopierCartItems = cartItems.map(item => ({
        product: {
          name: item.product.name,
          price: item.product.price,
          currency: 'TRY' as const,
          description: item.product.description,
          image_url: item.product.image,
          category: item.product.category
        },
        quantity: item.quantity
      }));

      const discountDetails = (campaignData?.campaignApplied && campaignData.discountAmount > 0)
        ? {
            discountAmount: campaignData.discountAmount,
            campaignTitle: campaignData.campaignTitle || 'Kampanya İndirimi'
          }
        : undefined;

      ShopierService.createCartPayment(
        shopierCartItems,
        {
          name: buyerInfo.name,
          email: buyerInfo.email,
          phone: buyerInfo.phone,
          address: buyerInfo.address,
        },
        discountDetails
      );

      // Clear cart after submitting to Shopier
      clearCart();
      // User will be redirected by the Shopier form submission

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      <SEO title="Ödeme Sayfası - Numa Parfume" description="Siparişinizi tamamlayın." />
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={() => {}} onCategorySelect={() => {}} />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              Alışverişe Devam Et
            </button>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-charcoal-900 mb-8">Ödeme</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side: Order Summary */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                  <ShoppingBag className="text-primary-600" />
                  Sipariş Özeti
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {cartItems.length > 0 ? (
                    cartItems.map(item => (
                      <div key={item.product.id} className="flex items-center gap-4">
                        <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-charcoal-900">{item.product.name}</h3>
                          <p className="text-gray-600 text-sm">₺{item.product.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"><Minus size={12} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"><Plus size={12} /></button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Sepetiniz boş.</p>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    {campaignData?.campaignApplied && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800 mb-2"><Tag size={16} /><span className="text-sm font-semibold">{campaignData.campaignTitle}</span></div>
                        <p className="text-xs text-green-700">{campaignData.campaignDescription}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Ara Toplam:</span><span>₺{cartTotal.toLocaleString()}</span></div>
                      {campaignData?.campaignApplied && (
                        <div className="flex justify-between text-green-600"><span>İndirim:</span><span>-₺{campaignData.discountAmount.toLocaleString()}</span></div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2"><span>Toplam:</span><span>₺{campaignData?.finalTotal.toLocaleString() || cartTotal.toLocaleString()}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Delivery Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-2xl font-semibold mb-6">Teslimat Bilgileri</h2>
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" name="name" value={buyerInfo.name} onChange={handleFormChange} placeholder="Ad Soyad" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" name="email" value={buyerInfo.email} onChange={handleFormChange} placeholder="E-posta Adresi" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" name="phone" value={buyerInfo.phone} onChange={handleFormChange} placeholder="Telefon Numarası" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea name="address" value={buyerInfo.address} onChange={handleFormChange} placeholder="Teslimat Adresi" required rows={4} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none" />
                  </div>
                  <div className="pt-4">
                    <button type="submit" disabled={isProcessingPayment || cartItems.length === 0} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                      {isProcessingPayment ? 'İşleniyor...' : <> <CreditCard size={18} /> Siparişi Tamamla ve Öde </>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;
