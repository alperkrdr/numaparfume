import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Home, RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Başarısız ödeme logla
    console.log('❌ Ödeme işlemi başarısız oldu');
  }, []);

  const handleRetryPayment = () => {
    // Sepet varsa sepete git, yoksa ana sayfaya git
    const cart = localStorage.getItem('numa_cart');
    if (cart && JSON.parse(cart).length > 0) {
      navigate('/', { state: { openCart: true } });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Hata İkonu */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ödeme Başarısız 😔
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            Ödeme işlemi tamamlanamadı
          </p>
          
          <p className="text-gray-500">
            Lütfen kart bilgilerinizi kontrol edip tekrar deneyin
          </p>
        </div>

        {/* Hata Detayları */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <HelpCircle className="w-6 h-6 mr-3 text-red-600" />
            Olası Sebepler
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-red-900">Yetersiz Bakiye</h3>
                <p className="text-red-700 text-sm">Kartınızda yeterli bakiye bulunmuyor olabilir</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-red-900">Hatalı Kart Bilgileri</h3>
                <p className="text-red-700 text-sm">Kart numarası, son kullanma tarihi veya CVV kodu hatalı olabilir</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-red-900">Kart Limiti</h3>
                <p className="text-red-700 text-sm">Günlük veya aylık harcama limitiniz aşılmış olabilir</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-red-900">Güvenlik Kısıtlaması</h3>
                <p className="text-red-700 text-sm">Bankanız güvenlik sebebiyle işlemi engellemş olabilir</p>
              </div>
            </div>
          </div>
        </div>

        {/* Çözüm Önerileri */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            💡 Çözüm Önerileri
          </h3>
          
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">1.</span>
              <span>Kart bilgilerinizi tekrar kontrol edin</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">2.</span>
              <span>Farklı bir ödeme kartı deneyin</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">3.</span>
              <span>Bankanızı arayarak işlem iznini kontrol edin</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">4.</span>
              <span>Birkaç dakika bekleyip tekrar deneyin</span>
            </li>
          </ul>
        </div>

        {/* Test Kartı Bilgisi (sadece development modunda) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              🧪 Test Modunda mısınız?
            </h3>
            <p className="text-yellow-800 mb-3">
              Gerçek kart kullanmayın! Test kartı bilgileri:
            </p>
            <div className="bg-white p-4 rounded-lg font-mono text-sm">
              <div className="text-gray-700">
                <strong>Kart No:</strong> 4508034508034509<br/>
                <strong>Son Kullanma:</strong> 12/26<br/>
                <strong>CVV:</strong> 000<br/>
                <strong>Kart Sahibi:</strong> TEST USER
              </div>
            </div>
          </div>
        )}

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleRetryPayment}
            className="flex-1 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Tekrar Dene
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white text-red-600 border-2 border-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Alışverişe Devam Et
          </button>
        </div>

        {/* Destek Bilgisi */}
        <div className="text-center mt-8 p-6 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">
            Hala sorun mu yaşıyorsunuz?
          </h4>
          <p className="text-gray-600 mb-3">
            Müşteri hizmetlerimizle iletişime geçin
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>📞 Telefon: 0850 xxx xx xx</p>
            <p>📧 Email: destek@numaparfume.com</p>
            <p>💬 WhatsApp: 0535 xxx xx xx</p>
          </div>
        </div>

        {/* Güvenlik Mesajı */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            🔒 Tüm ödeme işlemleri SSL ile güvenlik altındadır
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 