const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

async function seed() {
  try {
    // Site settings
    const siteSettings = JSON.parse(fs.readFileSync('site-settings.json', 'utf8'));
    siteSettings.updatedAt = new Date();
    await db.collection('settings').doc('site-settings').set(siteSettings, { merge: true });
    console.log('✅ Site settings eklendi.');

    // Sample product
    const product = JSON.parse(fs.readFileSync('sample-product.json', 'utf8'));
    product.createdAt = new Date();
    product.updatedAt = new Date();
    await db.collection('products').add(product);
    console.log('✅ Örnek ürün eklendi.');

    console.log('🎉 Firestore seed işlemi tamamlandı!');
    console.log('📝 Şimdi admin panelini yenileyin ve mock veriler kaybolacak.');
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

seed().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('❌ Beklenmeyen hata:', err);
  process.exit(1);
}); 