import { SiteSettings } from '../types';

export interface CampaignCalculation {
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  campaignApplied: boolean;
  campaignTitle?: string;
  campaignDescription?: string;
}

export class CampaignService {
  // Kampanya indirimi hesapla
  static calculateCampaignDiscount(
    cartTotal: number,
    campaignSettings: SiteSettings['campaignSettings']
  ): CampaignCalculation {
    const result: CampaignCalculation = {
      originalTotal: cartTotal,
      discountAmount: 0,
      finalTotal: cartTotal,
      campaignApplied: false
    };

    // Kampanya aktif değilse indirim yok
    if (!campaignSettings.isActive) {
      return result;
    }

    // Minimum tutar kontrolü
    if (cartTotal < campaignSettings.minAmount) {
      return result;
    }

    // Tarih kontrolü (eğer başlangıç ve bitiş tarihi varsa)
    const now = new Date();
    if (campaignSettings.startDate && campaignSettings.startDate > now) {
      return result;
    }
    if (campaignSettings.endDate && campaignSettings.endDate < now) {
      return result;
    }

    // İndirim hesaplama
    let discountAmount = 0;
    
    if (campaignSettings.discountType === 'percentage') {
      discountAmount = (cartTotal * campaignSettings.discountValue) / 100;
    } else if (campaignSettings.discountType === 'fixed') {
      discountAmount = campaignSettings.discountValue;
    }

    // İndirim tutarı sepet toplamından fazla olamaz
    discountAmount = Math.min(discountAmount, cartTotal);

    return {
      originalTotal: cartTotal,
      discountAmount: Math.round(discountAmount * 100) / 100, // 2 ondalık basamak
      finalTotal: Math.round((cartTotal - discountAmount) * 100) / 100,
      campaignApplied: true,
      campaignTitle: campaignSettings.title,
      campaignDescription: campaignSettings.description
    };
  }

  // Kampanya için kalan tutarı hesapla
  static getRemainingAmountForCampaign(
    cartTotal: number,
    campaignSettings: SiteSettings['campaignSettings']
  ): number {
    if (!campaignSettings.isActive || cartTotal >= campaignSettings.minAmount) {
      return 0;
    }
    
    return campaignSettings.minAmount - cartTotal;
  }

  // Kampanya mesajı oluştur
  static getCampaignMessage(
    cartTotal: number,
    campaignSettings: SiteSettings['campaignSettings']
  ): string | null {
    if (!campaignSettings.isActive) {
      return null;
    }

    const remainingAmount = this.getRemainingAmountForCampaign(cartTotal, campaignSettings);
    
    if (remainingAmount > 0) {
      const discountText = campaignSettings.discountType === 'percentage' 
        ? `%${campaignSettings.discountValue} indirim`
        : `₺${campaignSettings.discountValue} indirim`;
        
      return `₺${remainingAmount} daha alışveriş yapın, ${discountText} kazanın!`;
    }

    return null;
  }
} 