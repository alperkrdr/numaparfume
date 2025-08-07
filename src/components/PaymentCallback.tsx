import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight, Shield } from 'lucide-react';
import { ShopierService } from '../services/shopierService';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Shopier'dan gelen parametreleri al
        const platform_order_id = searchParams.get('platform_order_id');
        const payment_status = searchParams.get('payment_status');
        const total_order_value = searchParams.get('total_order_value');
        const installment = searchParams.get('installment');
        const currency = searchParams.get('currency');
        const test_mode = searchParams.get('test_mode');
        const merchant_id = searchParams.get('merchant_id');
        const random_nr = searchParams.get('random_nr');
        const signature = searchParams.get('signature');

        console.log('🔄 Payment callback işleniyor:', {
          platform_order_id,
          payment_status,
          total_order_value,
          currency,
          signature
        });

        // Sipariş bilgilerini kaydet
        setOrderInfo({
          orderId: platform_order_id,
          amount: total_order_value,
          currency: currency,
          installment: installment,
          testMode: test_mode === '1'
        });

        // İmza doğrulaması - Güvenlik için kritik
        if (signature && random_nr && platform_order_id && total_order_value && currency) {
          const callbackData = {
            platform_order_id,
            payment_status,
            total_order_value,
            currency,
            random_nr,
            signature
          };

          const isValid = ShopierService.verifyCallback(callbackData);
          setVerificationStatus(isValid ? 'verified' : 'failed');

          if (!isValid) {
            console.error('❌ Callback imza doğrulaması başarısız!');
            setStatus('failed');
            return;
          }
        } else {
          console.warn('⚠️ Callback doğrulama için gerekli parametreler eksik');
          setVerificationStatus('failed');
        }

        // Payment status'e göre durumu belirle
        switch (payment_status) {
          case '1': // Ödeme başarılı
            setStatus('success');
            break;
          case '0': // Ödeme başarısız
            setStatus('failed');
            break;
          case '2': // Ödeme beklemede
            setStatus('pending');
            break;
          default:
            setStatus('failed');
        }

        // Başarılı ödemede sipariş bilgilerini kaydet
        if (payment_status === '1' && platform_order_id) {
          try {
            // Burada sipariş bilgilerini veritabanına kaydedebilirsiniz
            console.log('✅ Başarılı ödeme kaydedildi:', platform_order_id);
            
            // LocalStorage'dan sepeti temizle
            localStorage.removeItem('cart');
            
          } catch (error) {
            console.error('❌ Sipariş kaydetme hatası:', error);
          }
        }

      } catch (error) {
        console.error('❌ Payment callback processing error:', error);
        setStatus('failed');
      }
    };

    processCallback();
  }, [searchParams]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ödeme Durumu Kontrol Ediliyor</h2>
          <p className="text-gray-600">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Verification Status */}
          {verificationStatus !== 'pending' && (
            <div className="mb-4 p-3 rounded-lg flex items-center justify-center gap-2">
              {verificationStatus === 'verified' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Shield size={16} />
                  <span className="text-sm font-medium">Güvenli Ödeme</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <Shield size={16} />
                  <span className="text-sm font-medium">Doğrulama Başarısız</span>
                </div>
              )}
            </div>
          )}

          {/* Icon */}
          <div className="mb-6">
            {status === 'success' && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} className="text-green-600" />
              </div>
            )}
            {status === 'failed' && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle size={40} className="text-red-600" />
              </div>
            )}
            {status === 'pending' && (
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Clock size={40} className="text-yellow-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'success' && 'Ödeme Başarılı!'}
            {status === 'failed' && 'Ödeme Başarısız'}
            {status === 'pending' && 'Ödeme Beklemede'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {status === 'success' && 'Siparişiniz başarıyla tamamlandı. Teşekkür ederiz!'}
            {status === 'failed' && 'Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.'}
            {status === 'pending' && 'Ödemeniz işleme alındı. Sonuç için bekleyin.'}
          </p>

          {/* Order Info */}
          {orderInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Sipariş No:</span>
                  <span className="font-medium">{orderInfo.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tutar:</span>
                  <span className="font-medium">{orderInfo.amount} {orderInfo.currency}</span>
                </div>
                {orderInfo.installment && orderInfo.installment > 1 && (
                  <div className="flex justify-between">
                    <span>Taksit:</span>
                    <span className="font-medium">{orderInfo.installment} Ay</span>
                  </div>
                )}
                {orderInfo.testMode && (
                  <div className="text-orange-600 text-xs">
                    Test Modu
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleContinue}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              status === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : status === 'failed'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            Ana Sayfaya Dön
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback; 