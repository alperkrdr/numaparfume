import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Package, ArrowRight } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Ödeme başarılı olduğunda sepeti temizle
    localStorage.removeItem('numa_cart');
    
    // Başarı mesajı göster
    console.log('✅ Ödeme başarıyla tamamlandı!');
    
    // 10 saniye sonra ana sayfaya yönlendir
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Başarı İkonu */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ödeme Başarılı! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            Siparişiniz başarıyla alınmıştır
          </p>
          
          <p className="text-gray-500">
            Kısa sürede kargo takip bilgileriniz email adresinize gönderilecektir
          </p>
        </div>

        {/* Sipariş Detayları */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Package className="w-6 h-6 mr-3 text-purple-600" />
            Sipariş Bilgileri
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Sipariş Durumu:</span>
              <span className="font-semibold text-green-600">Onaylandı</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Ödeme Durumu:</span>
              <span className="font-semibold text-green-600">Tamamlandı</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Tahmini Teslimat:</span>
              <span className="font-semibold text-gray-900">2-3 İş Günü</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Kargo Takibi:</span>
              <span className="text-sm text-purple-600">Email ile bilgilendirileceksiniz</span>
            </div>
          </div>
        </div>

        {/* Teşekkür Mesajı */}
        <div className="bg-purple-50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-purple-900 mb-3">
            Numa Parfume Ailesine Hoş Geldiniz! 💜
          </h3>
          <p className="text-purple-700 mb-3">
            Bizi tercih ettiğiniz için teşekkür ederiz. Benzersiz parfüm koleksiyonumuzun tadını çıkarmanız için sabırsızlanıyoruz.
          </p>
          <p className="text-sm text-purple-600">
            <strong>💡 İpucu:</strong> Parfümünüzü daha uzun süre dayanması için nabız atış noktalarınıza (bilek, boyun, kulak arkası) uygulayın.
          </p>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Ana Sayfaya Dön
          </button>
          
          <button
            onClick={() => navigate('/collection')}
            className="flex-1 bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center"
          >
            Diğer Ürünleri Keşfet
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Otomatik Yönlendirme Bilgisi */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            10 saniye sonra otomatik olarak ana sayfaya yönlendirileceksiniz...
          </p>
        </div>

        {/* Sosyal Medya Teşvik */}
        <div className="text-center mt-8 p-6 bg-gray-50 rounded-xl">
          <p className="text-gray-700 mb-2">
            🌟 Deneyiminizi sosyal medyada paylaşın!
          </p>
          <p className="text-sm text-gray-500">
            #NumaParfume #BenzersizBenzerlik #Parfüm
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 