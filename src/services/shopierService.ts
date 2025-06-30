interface ShopierProduct {
  name: string;
  price: number;
  currency: string;
  description?: string;
  image_url?: string;
  category?: string;
}

interface ShopierOrder {
  products: ShopierProduct[];
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  success_url?: string;
  fail_url?: string;
  callback_url?: string;
}

interface ShopierResponse {
  success: boolean;
  data?: {
    payment_url: string;
    order_id: string;
  };
  error?: string;
}

export class ShopierService {
  private static readonly API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI3NmNkNDQ3NTZiYmI5MTFhOTMzOTY0ZWUyYWMyYmUyZiIsImp0aSI6IjlhZjY0ZjhjOWY5NGYzMTRmNjliM2FiOTZjMTFkMDFkNDI0ZGE2ZTY3NTQxMzQ5M2VjYmY4YjAwMjkxMTYzNjI2OGVkNjEzNjM0YzEzODk5MGRmZDY3ZWJiNWNhMTRiZDUzZmQ1NWE1MjJmNjg1MWY0YzU1NzhiZWZhMDIxODIwMzhjZTE1Y2U4M2IzZmZhYmZkNmU2YWRlMGViYmE5MDIiLCJpYXQiOjE3NTEyNDA0MDMsIm5iZiI6MTc1MTI0MDQwMywiZXhwIjoxOTA5MDI1MTYzLCJzdWIiOiIyMDEwNjg2Iiwic2NvcGVzIjpbIm9yZGVyczpyZWFkIiwib3JkZXJzOndyaXRlIiwicHJvZHVjdHM6cmVhZCIsInByb2R1Y3RzOndyaXRlIiwic2hpcHBpbmdzOnJlYWQiLCJzaGlwcGluZ3M6d3JpdGUiLCJkaXNjb3VudHM6cmVhZCIsImRpc2NvdW50czp3cml0ZSIsInBheW91dHM6cmVhZCIsInJlZnVuZHM6cmVhZCIsInJlZnVuZHM6d3JpdGUiLCJzaG9wOnJlYWQiLCJzaG9wOndyaXRlIl19.m6odt8Ov9DJzgcx1wZp5lqoGqAB6Lf-ydOk5DvVR6gkZ8HutyyLZQnhuvmvL-q1B1ZulWqEWBCIwTNf3tnqprX5r-ovP_jFnd3eavah96FmLhLZ9q854iNRGsCsnxFi6Jiv_u7cpkwtpbndrtXIdhlyNGk8iubtn5AWYtX0_SqmjVVKUR1W9wSujUzX0C8IEUjv9EPCfE31gUGmrnBJtzAQIKzcl0_O-6MI3zRH0yup6JtOxz0GUFvAEcsfSZaYqN0F0l9ppQLfiQsnUuKW2FZ9MKHOcTOJ4BCqcOSgpX_U7a4RJMvrb3tRfumDxsrlmiGuRHBioqAftfKllN6VOBg';
  private static readonly API_BASE_URL = 'https://api.shopier.com/v1';

  // Tek ürün için ödeme linki oluştur
  static async createSingleProductPayment(
    product: ShopierProduct,
    buyerInfo: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<string> {
    try {
      const orderData: ShopierOrder = {
        products: [product],
        buyer_name: buyerInfo.name,
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone,
        success_url: `${window.location.origin}/payment-success`,
        fail_url: `${window.location.origin}/payment-failed`,
        callback_url: `${window.location.origin}/api/shopier-callback`
      };

      const response = await fetch(`${this.API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`Shopier API Error: ${response.status}`);
      }

      const result: ShopierResponse = await response.json();
      
      if (!result.success || !result.data?.payment_url) {
        throw new Error(result.error || 'Ödeme linki oluşturulamadı');
      }

      return result.data.payment_url;
    } catch (error) {
      console.error('Error creating Shopier payment:', error);
      throw new Error('Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
    }
  }

  // Sepet için ödeme linki oluştur
  static async createCartPayment(
    cartItems: Array<{
      product: ShopierProduct;
      quantity: number;
    }>,
    buyerInfo: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<string> {
    try {
      const products: ShopierProduct[] = cartItems.map(item => ({
        ...item.product,
        name: `${item.product.name} (${item.quantity} adet)`,
        price: item.product.price * item.quantity
      }));

      const orderData: ShopierOrder = {
        products,
        buyer_name: buyerInfo.name,
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone,
        success_url: `${window.location.origin}/payment-success`,
        fail_url: `${window.location.origin}/payment-failed`,
        callback_url: `${window.location.origin}/api/shopier-callback`
      };

      const response = await fetch(`${this.API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`Shopier API Error: ${response.status}`);
      }

      const result: ShopierResponse = await response.json();
      
      if (!result.success || !result.data?.payment_url) {
        throw new Error(result.error || 'Ödeme linki oluşturulamadı');
      }

      return result.data.payment_url;
    } catch (error) {
      console.error('Error creating cart payment:', error);
      throw new Error('Sepet ödemesi başlatılamadı. Lütfen tekrar deneyin.');
    }
  }

  // Sipariş durumunu kontrol et
  static async checkOrderStatus(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Shopier API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking order status:', error);
      throw new Error('Sipariş durumu kontrol edilemedi');
    }
  }
}