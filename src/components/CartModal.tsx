import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Tag, Gift, MapPin, User, Mail, Phone } from 'lucide-react';
import { CartItem } from '../hooks/useCart';
import { User as UserType } from '../hooks/useAuth';
import { ShopierService } from '../services/shopierService';
import { CampaignService } from '../services/campaignService';
import { useSettings } from '../hooks/useSettings';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  user: UserType | null;
  onLoginRequired: () => void;
}

interface AddressForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  user,
  onLoginRequired
}) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    district: '',
    postalCode: ''
  });

  // Kullanıcı değiştiğinde adres formunu güncelle
  React.useEffect(() => {
    if (user) {
      setAddressForm(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);
  const { settings } = useSettings();

  // Kampanya hesaplama
  const cartTotal = getCartTotal();
  const campaignData = settings?.campaignSettings 
    ? CampaignService.calculateCampaignDiscount(cartTotal, settings.campaignSettings)
    : null;
  
  const campaignMessage = settings?.campaignSettings 
    ? CampaignService.getCampaignMessage(cartTotal, settings.campaignSettings)
    : null;

  const handleAddressFormChange = (field: keyof AddressForm, value: string) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckout = async () => {
    if (!user) {
      onLoginRequired();
      return;
    }

    if (cartItems.length === 0) {
      alert('Sepetiniz boş');
      return;
    }

    // Adres formunu göster
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Adres bilgilerini kontrol et
    if (!addressForm.fullName || !addressForm.email || !addressForm.phone || 
        !addressForm.address || !addressForm.city || !addressForm.district || !addressForm.postalCode) {
      alert('Lütfen tüm adres bilgilerini doldurun.');
      return;
    }

    setIsProcessingPayment(true);

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
          name: addressForm.fullName,
          email: addressForm.email,
          phone: addressForm.phone
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
      setIsProcessingPayment(false);
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
              <ShoppingBag size={24} />
              {showAddressForm ? 'Adres Bilgileri' : 'Sepetim'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showAddressForm ? (
            // Adres Formu
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <MapPin size={16} />
                  <span className="font-medium">Teslimat Adresi</span>
                </div>
                <p className="text-sm text-blue-700">
                  Siparişinizin teslimatı için adres bilgilerinizi girin.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User size={14} className="inline mr-1" />
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => handleAddressFormChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail size={14} className="inline mr-1" />
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={addressForm.email}
                    onChange={(e) => handleAddressFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone size={14} className="inline mr-1" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => handleAddressFormChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin size={14} className="inline mr-1" />
                    Adres
                  </label>
                  <textarea
                    value={addressForm.address}
                    onChange={(e) => handleAddressFormChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İl
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => handleAddressFormChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İlçe
                    </label>
                    <input
                      type="text"
                      value={addressForm.district}
                      onChange={(e) => handleAddressFormChange('district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => handleAddressFormChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </form>
          ) : (
            // Sepet İçeriği
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Sepetiniz boş</p>
                  <p className="text-gray-400 text-sm">Alışverişe başlamak için ürün ekleyin</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal-900 text-sm">
                          {item.product.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.product.size}</p>
                        <p className="text-primary-600 font-bold">₺{item.product.price}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            {!showAddressForm ? (
              <>
                {/* Campaign Message */}
                {campaignMessage && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Gift size={16} />
                      <span className="text-sm font-medium">{campaignMessage}</span>
                    </div>
                  </div>
                )}

                {/* Campaign Applied */}
                {campaignData?.campaignApplied && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <Tag size={16} />
                      <span className="text-sm font-semibold">{campaignData.campaignTitle}</span>
                    </div>
                    <p className="text-xs text-green-700">{campaignData.campaignDescription}</p>
                  </div>
                )}

                {/* Price Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ara Toplam:</span>
                    <span className="font-medium">₺{cartTotal.toLocaleString()}</span>
                  </div>
                  
                  {campaignData?.campaignApplied && campaignData.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        Kampanya İndirimi:
                      </span>
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
                        <span className="text-2xl font-bold text-primary-600">₺{cartTotal.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessingPayment}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Adres Bilgilerini Gir
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Sepeti Temizle
                  </button>
                </div>

                {!user && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Ödeme için giriş yapmanız gerekiyor
                  </p>
                )}
              </>
            ) : (
              // Adres Formu Footer
              <div className="space-y-3">
                <button
                  onClick={handleAddressSubmit}
                  disabled={isProcessingPayment}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      İşleniyor...
                    </>
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
                  onClick={() => setShowAddressForm(false)}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Geri Dön
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;