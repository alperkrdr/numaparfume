import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { isAdminEmail } from '../config/adminConfig';

export class AuthService {
  // Admin girişi
  static async signInAdmin(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // Firebase hata kodlarını Türkçe mesajlara çevir
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
        case 'auth/wrong-password':
          throw new Error('Yanlış şifre');
        case 'auth/invalid-email':
          throw new Error('Geçersiz e-posta adresi');
        case 'auth/user-disabled':
          throw new Error('Bu hesap devre dışı bırakılmış');
        case 'auth/too-many-requests':
          throw new Error('Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin');
        case 'auth/network-request-failed':
          throw new Error('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin');
        default:
          throw new Error('Giriş yapılırken hata oluştu: ' + error.message);
      }
    }
  }

  // Çıkış yap
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Çıkış yapılırken hata oluştu');
    }
  }

  // Auth durumu dinle
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Mevcut kullanıcıyı al
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Kullanıcının admin olup olmadığını kontrol et
  static async isAdmin(user: User): Promise<boolean> {
    try {
      if (!user.email) return false;
      return isAdminEmail(user.email);
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Admin kullanıcısının token'ının geçerliliğini kontrol et
  static async verifyAdminToken(): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user) return false;
      
      // Token'ı yenile ve doğrula
      await user.getIdToken(true);
      return await this.isAdmin(user);
    } catch (error) {
      console.error('Error verifying admin token:', error);
      return false;
    }
  }
}