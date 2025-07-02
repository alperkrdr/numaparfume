import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock } from 'lucide-react';
import { User as UserType } from '../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // Modal açılma durumunu izle (sadece açılırken log)
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔓 LoginModal: Modal açıldı');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basit form validasyonu
      if (!formData.email || !formData.password) {
        alert('E-posta ve şifre gereklidir');
        return;
      }

      if (isRegister && !formData.name) {
        alert('Ad soyad gereklidir');
        return;
      }

      // Simüle edilmiş giriş/kayıt işlemi
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user: UserType = {
        id: Date.now().toString(),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        phone: formData.phone
      };

      onLogin(user);
      
      // Formu temizle
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: ''
      });
    } catch (error) {
      console.error('Login error:', error);
      alert('Giriş yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
      style={{zIndex: 9999}}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-charcoal-900">
              {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                Ad Soyad
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Adınız ve soyadınız"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-2" />
              E-posta
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="ornek@email.com"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Telefon (Opsiyonel)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+90 555 123 45 67"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-2" />
              Şifre
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'İşleniyor...' : (isRegister ? 'Hesap Oluştur' : 'Giriş Yap')}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            {isRegister ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-primary-600 hover:text-primary-700 font-medium ml-2"
            >
              {isRegister ? 'Giriş Yap' : 'Hesap Oluştur'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;