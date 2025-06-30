import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

// Eğer bir serviceAccountKey.json dosyan varsa onu kullan, yoksa applicationDefault ile devam et
// const serviceAccount = require('./serviceAccountKey.json');
// initializeApp({ credential: cert(serviceAccount) });
initializeApp();

const db = getFirestore();

async function seed() {
  // Site settings
  const siteSettings = JSON.parse(fs.readFileSync('site-settings.json', 'utf8'));
  siteSettings.updatedAt = new Date();
  await db.collection('settings').doc('site-settings').set(siteSettings, { merge: true });
  console.log('Site settings eklendi.');

  // Sample product
  const product = JSON.parse(fs.readFileSync('sample-product.json', 'utf8'));
  product.createdAt = new Date();
  product.updatedAt = new Date();
  await db.collection('products').add(product);
  console.log('Örnek ürün eklendi.');
}

seed().then(() => {
  console.log('Firestore seed işlemi tamamlandı.');
  process.exit(0);
}).catch((err) => {
  console.error('Hata:', err);
  process.exit(1);
}); 