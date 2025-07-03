import React, { useState, useEffect } from 'react';
import { X, Tag, Clock, Gift } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { CampaignService } from '../services/campaignService';

const CampaignBar: React.FC = () => {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!settings?.campaignSettings) return;

    const { isActive, title, startDate, endDate } = settings.campaignSettings;
    
    if (!isActive || !title) {
      setIsVisible(false);
      return;
    }

    // Kampanya tarih kontrolü
    const now = new Date();
    let campaignActive = true;

    if (startDate) {
      const start = new Date(startDate);
      if (now < start) campaignActive = false;
    }

    if (endDate) {
      const end = new Date(endDate);
      if (now > end) campaignActive = false;
    }

    // LocalStorage'dan minimize durumunu kontrol et
    const minimizeKey = `campaign_minimized_${title.replace(/\s+/g, '_')}`;
    const isMinimizedStored = localStorage.getItem(minimizeKey) === 'true';

    if (campaignActive) {
      setIsVisible(true);
      setIsMinimized(isMinimizedStored);
    } else {
      setIsVisible(false);
      // Süresi geçmiş kampanyaları localStorage'dan temizle
      localStorage.removeItem(minimizeKey);
    }
  }, [settings]);

  const handleMinimize = () => {
    if (!settings?.campaignSettings?.title) return;
    
    const minimizeKey = `campaign_minimized_${settings.campaignSettings.title.replace(/\s+/g, '_')}`;
    setIsMinimized(true);
    localStorage.setItem(minimizeKey, 'true');
  };

  const handleExpand = () => {
    if (!settings?.campaignSettings?.title) return;
    
    const minimizeKey = `campaign_minimized_${settings.campaignSettings.title.replace(/\s+/g, '_')}`;
    setIsMinimized(false);
    localStorage.removeItem(minimizeKey);
  };

  const handleClose = () => {
    if (!settings?.campaignSettings?.title) return;
    
    const closeKey = `campaign_closed_${settings.campaignSettings.title.replace(/\s+/g, '_')}`;
    const minimizeKey = `campaign_minimized_${settings.campaignSettings.title.replace(/\s+/g, '_')}`;
    
    setIsVisible(false);
    localStorage.setItem(closeKey, 'true');
    localStorage.removeItem(minimizeKey);
  };

  // Kampanya bitiş tarihini formatla
  const getTimeRemaining = () => {
    if (!settings?.campaignSettings?.endDate) return null;
    
    const endDate = new Date(settings.campaignSettings.endDate);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };

  if (!isVisible || !settings?.campaignSettings) return null;

  const { title, description, discountType, discountValue, minAmount } = settings.campaignSettings;
  const timeRemaining = getTimeRemaining();

  if (isMinimized) {
    return (
      <div 
        className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white z-50 cursor-pointer shadow-lg"
        onClick={handleExpand}
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">
              🎉 {title} - {discountType === 'percentage' ? `%${discountValue}` : `${discountValue}₺`} İndirim!
            </span>
            {timeRemaining && (
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                ⏰ {timeRemaining} kaldı
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs hidden sm:inline">Detaylar için tıklayın</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-white hover:text-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white z-50 shadow-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <Gift className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🎉 {title}</h3>
                <p className="text-sm text-red-100">{description}</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span className="font-semibold">
                    {discountType === 'percentage' ? `%${discountValue}` : `${discountValue}₺`} İndirim
                  </span>
                </div>
              </div>
              
              {minAmount && minAmount > 0 && (
                <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <span className="text-sm">₺{minAmount}+ alışverişte geçerli</span>
                </div>
              )}
              
              {timeRemaining && (
                <div className="bg-yellow-400 bg-opacity-90 text-yellow-900 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold text-sm">{timeRemaining} kaldı!</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kontrol butonları */}
          <div className="flex items-center gap-2">
            {/* Mobil için compact bilgi */}
            <div className="md:hidden bg-white bg-opacity-20 rounded px-2 py-1">
              <span className="text-xs font-semibold">
                {discountType === 'percentage' ? `%${discountValue}` : `${discountValue}₺`}
              </span>
            </div>
            
            <button
              onClick={handleMinimize}
              className="text-white hover:text-red-200 transition-colors bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full p-1"
              title="Küçült"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <button
              onClick={handleClose}
              className="text-white hover:text-red-200 transition-colors bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full p-1"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignBar; 