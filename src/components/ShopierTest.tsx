import React, { useState } from 'react';
import { ShopierService } from '../services/shopierService';

const ShopierTest: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [testData, setTestData] = useState({
    name: 'Test Müşteri',
    email: 'test@example.com',
    phone: '05001234567'
  });

  const handleTestPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Test sepet verisi
      const testCartItems = [
        {
          product: {
            name: 'Test Parfüm',
            price: 299.99,
            currency: 'TRY',
            description: 'Test ürün açıklaması',
            image_url: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
            category: 'kadın'
          },
          quantity: 2
        }
      ];

      console.log('🧪 Shopier test ödeme başlatılıyor...');
      console.log('📦 Test sepet:', testCartItems);
      console.log('👤 Test müşteri:', testData);

      await ShopierService.createCartPayment(
        testCartItems,
        testData,
        {
          discountAmount: 50,
          campaignTitle: 'Test Kampanya'
        }
      );

      console.log('✅ Shopier test ödeme başarılı!');
      
    } catch (error) {
      console.error('❌ Shopier test hatası:', error);
      alert('Test ödeme hatası: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🧪 Shopier Test Sayfası</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Müşteri Adı
            </label>
            <input
              type="text"
              value={testData.name}
              onChange={(e) => setTestData({ ...testData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => setTestData({ ...testData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={testData.phone}
              onChange={(e) => setTestData({ ...testData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Test Bilgileri</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Ürün:</strong> Test Parfüm (2 adet)</p>
            <p><strong>Fiyat:</strong> ₺299.99 x 2 = ₺599.98</p>
            <p><strong>İndirim:</strong> ₺50 (Kampanya)</p>
            <p><strong>Toplam:</strong> ₺549.98</p>
          </div>
        </div>

        <button
          onClick={handleTestPayment}
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Test Ödeme İşleniyor...
            </>
          ) : (
            <>
              🧪 Shopier Test Ödemesi Başlat
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShopierTest;