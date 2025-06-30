import React from 'react';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const Footer: React.FC = () => {
  const { settings } = useSettings();

  if (!settings) {
    return null; // Loading state
  }

  return (
    <footer className="bg-charcoal-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src="/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg" 
                alt={settings.siteName} 
                className="h-16 w-16 rounded-full object-cover shadow-lg mr-4"
              />
              <span className="text-2xl font-serif font-bold">{settings.siteName}</span>
            </div>
            <div className="mb-4">
              <span className="text-primary-400 font-medium text-lg">{settings.siteSlogan}</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              {settings.siteDescription}
            </p>
            <div className="flex space-x-4">
              {settings.socialMedia.instagram && (
                <a 
                  href={settings.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.socialMedia.facebook && (
                <a 
                  href={settings.socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Facebook size={18} />
                </a>
              )}
              {settings.socialMedia.twitter && (
                <a 
                  href={settings.socialMedia.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Twitter size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Hızlı Linkler</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Ana Sayfa</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Kadın Parfümleri</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Erkek Parfümleri</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Unisex Parfümler</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Hakkımızda</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">İletişim</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">İletişim</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail size={18} className="text-primary-400 mr-3" />
                <span className="text-gray-300">{settings.contactInfo.email}</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-primary-400 mr-3" />
                <span className="text-gray-300">{settings.contactInfo.phone}</span>
              </div>
              <div className="flex items-start">
                <MapPin size={18} className="text-primary-400 mr-3 mt-1" />
                <span className="text-gray-300 whitespace-pre-line">
                  {settings.contactInfo.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-4">Yeniliklerden Haberdar Olun</h3>
            <p className="text-gray-300 mb-6">Yeni parfümler ve özel indirimler için e-bültenimize abone olun</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Abone Ol
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            © 2024 {settings.siteName}. Tüm hakları saklıdır. 
            <Heart size={16} className="text-red-500 fill-red-500" />
            ile yapıldı.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;