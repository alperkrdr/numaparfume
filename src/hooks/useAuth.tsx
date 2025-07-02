import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoginModalOpen: boolean;
  loading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Component mount tracking (cleanup on unmount)
  useEffect(() => {
    return () => {
      // Cleanup localStorage error flag on unmount
      delete (window as any).__firebaseErrorLogged;
    };
  }, []);

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
    // Sadece Firebase user yokken ve loading durumunda localStorage'dan yükle
    if (!firebaseUser && loading) {
      const savedUser = localStorage.getItem('numa-user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('💾 Auth: localStorage\'dan kullanıcı yüklendi:', parsedUser.name);
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ Auth: localStorage parse hatası:', error);
        }
      }
      setLoading(false);
    }
  }, [firebaseUser, loading]);

  // Kullanıcı bilgilerini localStorage'a kaydet (Firebase olmadığında)
  useEffect(() => {
    // Loading sırasında localStorage'a dokunma
    if (loading) {
      return;
    }
    
    if (user && !firebaseUser) {
      localStorage.setItem('numa-user', JSON.stringify(user));
    } else if (!user && !firebaseUser) {
      const existingUser = localStorage.getItem('numa-user');
      if (existingUser) {
        console.log('🗑️ Auth: Oturum sonlandırıldı');
        localStorage.removeItem('numa-user');
      }
    }
  }, [user, firebaseUser, loading]);

  // User state değişimini debug et (sadece önemli değişiklikleri log'la)
  useEffect(() => {
    if (user) {
      console.log('✅ useAuth: Kullanıcı giriş yaptı:', user.name);
    } else {
      console.log('🚪 useAuth: Kullanıcı çıkış yaptı');
    }
  }, [user?.id]); // Sadece user ID değiştiğinde

  // Login modal state değişimini debug et (sadece açılırken)
  useEffect(() => {
    if (isLoginModalOpen) {
      console.log('🔓 useAuth: Login modal açıldı');
    }
  }, [isLoginModalOpen]);

  const login = async (userData: User) => {
    console.log('🔐 Login fonksiyonu çağrıldı:', userData);
    setUser(userData);
    setIsLoginModalOpen(false);
    console.log('✅ User state güncellendi ve modal kapatıldı');
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

  const openLoginModal = () => {
    console.log('🔓 openLoginModal çağrıldı');
    setIsLoginModalOpen(true);
    console.log('🔓 isLoginModalOpen state güncellendi: true');
  };
  
  const closeLoginModal = () => {
    console.log('🔒 closeLoginModal çağrıldı');
    setIsLoginModalOpen(false);
    console.log('🔒 isLoginModalOpen state güncellendi: false');
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isLoginModalOpen,
    login,
    logout,
    openLoginModal,
    closeLoginModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};