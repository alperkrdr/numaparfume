import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // The actual verification is now handled by the backend endpoint: `/api/shopier-callback.ts`
    // This frontend component is just a user-friendly redirect page.

    const status = searchParams.get('status'); // Shopier sends 'success' or 'failure' in the 'status' param on return
    const paymentStatus = searchParams.get('payment_status'); // The callback uses 'payment_status'
    const platformOrderId = searchParams.get('platform_order_id');

    // Determine final status. The `status` param from the return URL is the most reliable for the user's view.
    if (status === 'success' || paymentStatus === '1') {
      // Redirect to a success page, optionally passing order info
      navigate(`/payment-success?orderId=${platformOrderId || ''}`);
    } else {
      // Redirect to a failure page
      navigate(`/payment-failed?orderId=${platformOrderId || ''}`);
    }
  }, [navigate, searchParams]);

  // Render a loading state while the redirect is happening
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-800">Ödeme durumu işleniyor...</h1>
        <p className="text-gray-600 mt-2">Lütfen bekleyin, yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
};

export default PaymentCallback; 