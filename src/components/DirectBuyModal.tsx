import React, { useState, useEffect } from 'react';
import { X, CreditCard, User, Phone, Mail, ShoppingBag, Home } from 'lucide-react';
import { Product } from '../types';
import { ShopierService } from '../services/shopierService';

interface DirectBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const DirectBuyModal: React.FC<DirectBuyModalProps> = ({ isOpen, onClose, product }) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setBuyerInfo({ name: '', email: '', phone: '', address: '' });
      setIsProcessingPayment(false);
    }
  }, [isOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBuyerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) {
      alert('Ürün bilgisi bulunamadı.');
      return;
    }
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone || !buyerInfo.address) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const shopierCartItems = [{
        product: {
          name: product.name,
          price: product.price,
          currency: 'TRY' as const,
          description: product.description,
          image_url: product.image,
          category: product.category
        },
        quantity: 1
      }];

      ShopierService.createCartPayment(
        shopierCartItems,
        {
          name: buyerInfo.name,
          email: buyerInfo.email,
          phone: buyerInfo.phone,
          address: buyerInfo.address,
        }
      );

      onClose();

    } catch (error) {
      console.error('Direct buy error:', error);
      alert('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-charcoal-900 flex items-center gap-2">
              <ShoppingBag size={24} />
              Hemen Satın Al
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
          </div>
        </div>

        <div className="p-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold text-charcoal-900">{product.name}</h3>
              <p className="text-primary-600 font-bold">₺{product.price}</p>
            </div>
          </div>

          {/* Address Form */}
          <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-4">Teslimat Bilgileri</h3>
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
          <textarea name="address" value={buyerInfo.address} onChange={handleFormChange} placeholder="Teslimat Adresi" required rows={3} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none" />
        </div>
            <div className="space-y-3 pt-2">
              <button type="submit" disabled={isProcessingPayment} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessingPayment ? 'İşleniyor...' : <> <CreditCard size={18} /> Ödemeye Geç </>}
              </button>
              <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DirectBuyModal;
