import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Tag, Gift } from 'lucide-react';
import { CartItem } from '../hooks/useCart';
import { CampaignService } from '../services/campaignService';
import { useSettings } from '../hooks/useSettings';
import PaymentForm from './PaymentForm';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  onPaymentRequired: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  onPaymentRequired
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { settings } = useSettings();

  // Kampanya hesaplama
  const cartTotal = getCartTotal();
  const campaignData = settings?.campaignSettings 
    ? CampaignService.calculateCampaignDiscount(cartTotal, settings.campaignSettings)
    : null;
  
  const campaignMessage = settings?.campaignSettings 
    ? CampaignService.getCampaignMessage(cartTotal, settings.campaignSettings)
    : null;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Sepetiniz boş');
      return;
    }

    setShowPaymentForm(true);
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
              Sepetim
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
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
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200">
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
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Ödemeye Geç
              </button>

              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Sepeti Temizle
              </button>
            </div>


          </div>
        )}
      </div>

      {/* Payment Form */}
      <PaymentForm
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        cartItems={cartItems}
        getCartTotal={getCartTotal}
        clearCart={clearCart}
      />
    </div>
  );
};

export default CartModal;