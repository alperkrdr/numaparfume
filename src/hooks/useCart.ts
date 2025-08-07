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
  const addToCartExecutionRef = useRef(false);

  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('numa-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Sepet verisi okunurken hata:', error);
        localStorage.removeItem('numa-cart'); // Bozuk data'yı temizle
      }
    }
  }, []);

  // Sepeti localStorage'a kaydet
  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem('numa-cart')) {
      localStorage.setItem('numa-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product | string, quantity: number = 1) => {
    console.log('🔧 addToCart başladı:', { product, quantity, isUpdating });
    
    if (isUpdating || addToCartExecutionRef.current) {
      console.log('⏸️ İşlem zaten devam ediyor, atlandı');
      return;
    }
    
    try {
      addToCartExecutionRef.current = true;
      setIsUpdating(true);
      
      // Eğer product string ise (productId), Product objesi bul
      let productObj: Product;
      if (typeof product === 'string') {
        // Product objesini bulmak için products hook'u kullanılmalı
        // Şimdilik localStorage'dan mevcut ürünleri kontrol et
        const savedCart = localStorage.getItem('numa-cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const existingItem = parsedCart.find((item: CartItem) => item.product.id === product);
          if (existingItem) {
            productObj = existingItem.product;
          } else {
            throw new Error('Ürün bulunamadı');
          }
        } else {
          throw new Error('Ürün bulunamadı');
        }
      } else {
        productObj = product;
      }
      
      setCartItems(prevCartItems => {
        const existingItem = prevCartItems.find(item => item.product.id === productObj.id);
        
        let newCart;
        if (existingItem) {
          newCart = prevCartItems.map(item =>
            item.product.id === productObj.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          console.log('➕ Miktar artırıldı:', existingItem.quantity, '->', existingItem.quantity + quantity);
        } else {
          newCart = [...prevCartItems, { product: productObj, quantity }];
          console.log('🆕 Yeni ürün eklendi, toplam:', newCart.length);
        }
        
        // LocalStorage'a senkron kaydet
        try {
          localStorage.setItem('numa-cart', JSON.stringify(newCart));
          console.log('💾 LocalStorage\'a kaydedildi');
        } catch (error) {
          console.error('LocalStorage kayıt hatası:', error);
        }
        
        return newCart;
      });

      // Modern notification sistemi
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
              <div class="text-xs text-green-100 mt-0.5">${productObj.name} - ₺${productObj.price}</div>
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
      
      // Immediate notification and reset updating state
      setTimeout(showNotification, 50);
      setTimeout(() => {
        setIsUpdating(false);
        addToCartExecutionRef.current = false;
        console.log('🔄 setIsUpdating(false) ve executionRef=false çağrıldı');
      }, 300);
      
    } catch (error) {
      console.error('❌ addToCart hatası:', error);
      setIsUpdating(false);
      addToCartExecutionRef.current = false;
    }
    
  }, [isUpdating]);

  const removeFromCart = useCallback((productId: string) => {
    setIsUpdating(true);
    setCartItems(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      localStorage.setItem('numa-cart', JSON.stringify(newCart));
      setTimeout(() => setIsUpdating(false), 100);
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setIsUpdating(true);
    setCartItems(prev => {
      const newCart = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      localStorage.setItem('numa-cart', JSON.stringify(newCart));
      setTimeout(() => setIsUpdating(false), 100);
      return newCart;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setIsUpdating(true);
    setCartItems([]);
    localStorage.removeItem('numa-cart');
    setTimeout(() => setIsUpdating(false), 100);
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