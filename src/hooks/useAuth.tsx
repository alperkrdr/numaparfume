import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  clearError: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const isAdmin = user?.role === 'admin';

  // Kullanıcı verilerini Firestore'dan al
  const getUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          role: userData.role || 'user',
          displayName: userData.displayName || firebaseUser.displayName || 'Kullanıcı'
        };
      } else {
        // Eğer kullanıcı belgesi yoksa oluştur
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          role: 'user',
          displayName: firebaseUser.displayName || 'Kullanıcı'
        };
        
        // Clean data for Firestore (no undefined values)
        const cleanUserData: Record<string, any> = {
          email: newUser.email,
          role: newUser.role,
          displayName: newUser.displayName,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          emailVerified: firebaseUser.emailVerified
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), cleanUserData);
        
        return newUser;
      }
    } catch (error) {
      console.error('Kullanıcı verileri alınamadı:', error);
      return null;
    }
  };

  // Kullanıcı giriş durumu takibi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // Son giriş zamanını güncelle
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastLoginAt: new Date()
          }).catch(() => {}); // Hata olursa sessizce geç
          
          const userData = await getUserData(firebaseUser);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError('Oturum durumu kontrol edilirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    });

    // Session persistence ayarla
    if (typeof Storage !== 'undefined') {
      try {
        // Local storage'dan son kullanıcı bilgilerini kontrol et
        const savedUser = localStorage.getItem('numa_user_session');
        if (savedUser && !user) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser.expiry > Date.now()) {
            setUser(parsedUser.user);
          } else {
            localStorage.removeItem('numa_user_session');
          }
        }
      } catch (error) {
        console.error('Session restore error:', error);
      }
    }

    return unsubscribe;
  }, []);

  // Session'ı local storage'a kaydet
  useEffect(() => {
    if (user && typeof Storage !== 'undefined') {
      try {
        const sessionData = {
          user,
          expiry: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 gün
        };
        localStorage.setItem('numa_user_session', JSON.stringify(sessionData));
      } catch (error) {
        console.error('Session save error:', error);
      }
    } else if (!user && typeof Storage !== 'undefined') {
      localStorage.removeItem('numa_user_session');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Başarılı giriş analytics
      console.log('Kullanıcı girişi:', result.user.email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Profil güncelle
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      // Email doğrulama gönder
      await sendEmailVerification(result.user);
      
      console.log('Yeni kullanıcı kaydı:', result.user.email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      
      // Session temizle
      if (typeof Storage !== 'undefined') {
        localStorage.removeItem('numa_user_session');
        localStorage.removeItem('numa_cart_cache');
        localStorage.removeItem('numa_favorites_cache');
      }
      
      console.log('Kullanıcı çıkışı yapıldı');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!firebaseUser) throw new Error('Kullanıcı oturumu bulunamadı');
    
    try {
      setError(null);
      await updateProfile(firebaseUser, { displayName });
      
      // Firestore'da güncelle
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        displayName,
        updatedAt: new Date()
      });
      
      // Local state güncelle
      setUser(prev => prev ? { ...prev, displayName } : null);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser) throw new Error('Kullanıcı oturumu bulunamadı');
    
    try {
      setError(null);
      const credential = EmailAuthProvider.credential(firebaseUser.email!, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAccount = async (password: string) => {
    if (!firebaseUser) throw new Error('Kullanıcı oturumu bulunamadı');
    
    try {
      setError(null);
      const credential = EmailAuthProvider.credential(firebaseUser.email!, password);
      await reauthenticateWithCredential(firebaseUser, credential);
      
      // Firestore'dan kullanıcı verilerini sil
      await deleteDoc(doc(db, 'users', firebaseUser.uid));
      
      // Kullanıcı hesabını sil
      await deleteUser(firebaseUser);
      
      // Local verileri temizle
      if (typeof Storage !== 'undefined') {
        localStorage.clear();
      }
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resendEmailVerification = async () => {
    if (!firebaseUser) throw new Error('Kullanıcı oturumu bulunamadı');
    
    try {
      setError(null);
      await sendEmailVerification(firebaseUser);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    resetPassword,
    changePassword,
    deleteAccount,
    resendEmailVerification,
    clearError,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth hata mesajlarını Türkçe'ye çevir
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
    case 'auth/wrong-password':
      return 'Hatalı şifre girdiniz';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda';
    case 'auth/weak-password':
      return 'Şifre en az 6 karakter olmalıdır';
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin';
    case 'auth/network-request-failed':
      return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin';
    case 'auth/requires-recent-login':
      return 'Bu işlem için yeniden giriş yapmanız gerekiyor';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin';
  }
}