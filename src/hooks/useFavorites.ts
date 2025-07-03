import { useState, useEffect } from 'react';
import { FavoritesService } from '../services/favoritesService';
import { useAuth } from './useAuth';
import { CartItem } from '../types';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Favorileri yükle
  const loadFavorites = async () => {
    if (!user?.id || !user?.email) return;
    
    try {
      setLoading(true);
      const userFavorites = await FavoritesService.getUserFavorites(user.id, user.email);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('❌ Favoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sepeti yükle
  const loadCart = async () => {
    if (!user?.id || !user?.email) return;
    
    try {
      setLoading(true);
      const userCart = await FavoritesService.getUserCart(user.id, user.email);
      setCartItems(userCart);
      
      // Sepet sayısını hesapla
      const count = userCart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error('❌ Sepet yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Favorileri ve sepeti kullanıcı değiştiğinde yükle
  useEffect(() => {
    if (user?.id && user?.email) {
      loadFavorites();
      loadCart();
    } else {
      setFavorites([]);
      setCartItems([]);
      setCartCount(0);
    }
  }, [user?.id, user?.email]);

  // Favori toggle
  const toggleFavorite = async (productId: string): Promise<boolean> => {
    if (!user?.id || !user?.email) {
      throw new Error('Favorilere eklemek için giriş yapmalısınız');
    }

    try {
      const isNowFavorite = await FavoritesService.toggleFavorite(user.id, user.email, productId);
      
      // Local state'i güncelle
      if (isNowFavorite) {
        setFavorites(prev => [...prev, productId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== productId));
      }
      
      return isNowFavorite;
    } catch (error) {
      console.error('❌ Favori güncelleme hatası:', error);
      throw error;
    }
  };

  // Sepete ekle
  const addToCart = async (productId: string, quantity: number = 1): Promise<void> => {
    if (!user?.id || !user?.email) {
      throw new Error('Sepete eklemek için giriş yapmalısınız');
    }

    try {
      await FavoritesService.addToCart(user.id, user.email, productId, quantity);
      
      // Sepeti yeniden yükle
      await loadCart();
    } catch (error) {
      console.error('❌ Sepete ekleme hatası:', error);
      throw error;
    }
  };

  // Sepetten çıkar
  const removeFromCart = async (productId: string): Promise<void> => {
    if (!user?.id || !user?.email) return;

    try {
      await FavoritesService.removeFromCart(user.id, user.email, productId);
      
      // Local state'i güncelle
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      
      // Sepet sayısını yeniden hesapla
      const newCount = cartItems
        .filter(item => item.productId !== productId)
        .reduce((total, item) => total + item.quantity, 0);
      setCartCount(newCount);
    } catch (error) {
      console.error('❌ Sepetten çıkarma hatası:', error);
      throw error;
    }
  };

  // Sepet miktarını güncelle
  const updateCartQuantity = async (productId: string, quantity: number): Promise<void> => {
    if (!user?.id || !user?.email) return;

    try {
      await FavoritesService.updateCartQuantity(user.id, user.email, productId, quantity);
      
      // Sepeti yeniden yükle
      await loadCart();
    } catch (error) {
      console.error('❌ Sepet miktarı güncelleme hatası:', error);
      throw error;
    }
  };

  // Sepeti temizle
  const clearCart = async (): Promise<void> => {
    if (!user?.id || !user?.email) return;

    try {
      await FavoritesService.clearCart(user.id, user.email);
      
      // Local state'i temizle
      setCartItems([]);
      setCartCount(0);
    } catch (error) {
      console.error('❌ Sepet temizleme hatası:', error);
      throw error;
    }
  };

  // Ürünün favori olup olmadığını kontrol et
  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  // Ürünün sepette olup olmadığını kontrol et
  const getCartQuantity = (productId: string): number => {
    const item = cartItems.find(item => item.productId === productId);
    return item?.quantity || 0;
  };

  return {
    favorites,
    cartItems,
    cartCount,
    loading,
    toggleFavorite,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    isFavorite,
    getCartQuantity,
    loadFavorites,
    loadCart
  };
}; 