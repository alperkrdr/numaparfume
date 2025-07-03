import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, resetPassword, error, loading, clearError } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    acceptTerms: false
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form reset
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      acceptTerms: false
    });
    setValidationErrors({});
    setSuccessMessage('');
    clearError();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Modal açıldığında/kapandığında form'u sıfırla
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Error değiştiğinde validation error'ları temizle
  useEffect(() => {
    if (error) {
      setValidationErrors({});
    }
  }, [error]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'E-posta adresi gereklidir';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!isResetMode) {
      // Password validation
      if (!formData.password) {
        errors.password = 'Şifre gereklidir';
      } else if (formData.password.length < 6) {
        errors.password = 'Şifre en az 6 karakter olmalıdır';
      }
      
      if (isRegistering) {
        // Display name validation
        if (!formData.displayName.trim()) {
          errors.displayName = 'Ad soyad gereklidir';
        } else if (formData.displayName.trim().length < 2) {
          errors.displayName = 'Ad soyad en az 2 karakter olmalıdır';
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Şifre tekrarı gereklidir';
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Şifreler eşleşmiyor';
        }
        
        // Terms validation
        if (!formData.acceptTerms) {
          errors.acceptTerms = 'Kullanım koşullarını kabul etmelisiniz';
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSuccessMessage('');
      
      if (isResetMode) {
        await resetPassword(formData.email);
        setSuccessMessage('Şifre sıfırlama e-postası gönderildi. E-posta kutunuzu kontrol edin.');
        return;
      }
      
      if (isRegistering) {
        await register(formData.email, formData.password, formData.displayName.trim());
        setSuccessMessage('Hesabınız oluşturuldu! E-posta doğrulama linkini kontrol edin.');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        await login(formData.email, formData.password);
        onClose();
      }
    } catch (err) {
      // Error useAuth hook'undan gelecek
      console.error('Auth error:', err);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setIsResetMode(false);
    resetForm();
  };

  const toggleResetMode = () => {
    setIsResetMode(!isResetMode);
    setIsRegistering(false);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-auto shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isResetMode ? 'Şifre Sıfırla' : isRegistering ? 'Hesap Oluştur' : 'Giriş Yap'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Display Name (Register only) */}
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    validationErrors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Adınızı ve soyadınızı girin"
                  disabled={loading}
                />
              </div>
              {validationErrors.displayName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.displayName}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ornek@email.com"
                disabled={loading}
              />
            </div>
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password (Not in reset mode) */}
          {!isResetMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    validationErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="En az 6 karakter"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>
          )}

          {/* Confirm Password (Register only) */}
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre Tekrarı
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Şifrenizi tekrar girin"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Terms (Register only) */}
          {isRegistering && (
            <div>
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-600">
                  <a href="/kullanim-kosullari" className="text-purple-600 hover:underline" target="_blank">
                    Kullanım koşullarını
                  </a>{' '}
                  ve{' '}
                  <a href="/gizlilik-politikasi" className="text-purple-600 hover:underline" target="_blank">
                    gizlilik politikasını
                  </a>{' '}
                  kabul ediyorum.
                </span>
              </label>
              {validationErrors.acceptTerms && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.acceptTerms}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                {isResetMode ? 'Şifre Sıfırlama E-postası Gönder' : isRegistering ? 'Hesap Oluştur' : 'Giriş Yap'}
              </>
            )}
          </button>

          {/* Mode Toggle Links */}
          <div className="space-y-2 text-center">
            {!isResetMode && (
              <button
                type="button"
                onClick={toggleMode}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                disabled={loading}
              >
                {isRegistering ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kaydolun'}
              </button>
            )}
            
            {!isRegistering && (
              <div>
                <button
                  type="button"
                  onClick={toggleResetMode}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  disabled={loading}
                >
                  {isResetMode ? 'Giriş sayfasına dön' : 'Şifrenizi mi unuttunuz?'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}