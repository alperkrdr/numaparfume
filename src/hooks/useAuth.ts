import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Firebase kullanıcısını local User formatına çevir
        const localUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || undefined
        };
        setUser(localUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // LocalStorage'dan kullanıcı bilgilerini yükle (Firebase olmadığında fallback)
  useEffect(() => {
    if (!firebaseUser) {
      const savedUser = localStorage.getItem('numa-user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error loading user from localStorage:', error);
        }
      }
    }
  }, [firebaseUser]);

  // Kullanıcı bilgilerini localStorage'a kaydet (Firebase olmadığında)
  useEffect(() => {
    if (user && !firebaseUser) {
      localStorage.setItem('numa-user', JSON.stringify(user));
    } else if (!user) {
      localStorage.removeItem('numa-user');
    }
  }, [user, firebaseUser]);

  const login = async (userData: User) => {
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  const logout = async () => {
    try {
      if (firebaseUser) {
        await AuthService.signOut();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Hata durumunda da local state'i temizle
      setUser(null);
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return {
    user,
    firebaseUser,
    loading,
    isLoginModalOpen,
    login,
    logout,
    openLoginModal,
    closeLoginModal
  };
};