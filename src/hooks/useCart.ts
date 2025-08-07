import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('numa-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Sepet verisi okunurken hata:', error);
        localStorage.removeItem('numa-cart');
      }
    }
  }, []);

  // Sepeti localStorage'a kaydet
  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem('numa-cart')) {
      localStorage.setItem('numa-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    console.log('🔧 addToCart başladı:', { productId: product.id, quantity });
    
    setCartItems(prevCartItems => {
      const existingItem = prevCartItems.find(item => item.product.id === product.id);
      
      let newCart;
      if (existingItem) {
        newCart = prevCartItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log('➕ Miktar artırıldı:', existingItem.quantity, '->', existingItem.quantity + quantity);
      } else {
        newCart = [...prevCartItems, { product, quantity }];
        console.log('🆕 Yeni ürün eklendi, toplam:', newCart.length);
      }
      
      // LocalStorage'a senkron kaydet
      localStorage.setItem('numa-cart', JSON.stringify(newCart));
      console.log('💾 LocalStorage\'a kaydedildi');
      
      return newCart;
    });

    // Başarı bildirimi
    const showNotification = () => {
      const existingNotification = document.querySelector('.cart-notification');
      if (existingNotification) {
        existingNotification.remove();
      }
      
      const notification = document.createElement('div');
      notification.className = 'cart-notification fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-[9999] transform transition-all duration-500 translate-x-full border border-green-400';
      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="bg-white bg-opacity-20 rounded-full p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="flex-1">
            <div class="font-semibold text-sm">Sepete Eklendi!</div>
            <div class="text-xs text-green-100 mt-0.5">${product.name} - ₺${product.price}</div>
          </div>
          <div class="bg-white bg-opacity-20 rounded-full p-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Animasyon: Slide in
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 10);
      
      // Animasyon: Slide out
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.transform = 'translateX(100%)';
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 500);
        }
      }, 3000);
    };
    
    // Notification göster
    setTimeout(showNotification, 50);
    
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      localStorage.setItem('numa-cart', JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev => {
      const newCart = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      localStorage.setItem('numa-cart', JSON.stringify(newCart));
      return newCart;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('numa-cart');
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  return {
    cartItems,
    isCartOpen,
    isUpdating,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    openCart,
    closeCart
  };
};