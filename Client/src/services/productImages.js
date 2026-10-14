/**
 * Mapping and helper functions for product images in FarmerBandh
 */

const PRODUCT_IMAGE_MAP = {
  'tomato-fresh': '/images/products/tomato-fresh.jpg',
  'onion-red': '/images/products/onion-red.jpg',
  'potato-jyoti': '/images/products/potato-jyoti.jpg',
  'wheat-grade-a': '/images/products/wheat-grade-a.jpg',
  'basmati-rice': '/images/products/basmati-rice.jpg',
  'yellow-maize': '/images/products/yellow-maize.jpg',
  'banana-g9': '/images/products/banana-g9.jpg',
  'mango-kesar': '/images/products/mango-kesar.jpg',
  'chana-gram': '/images/products/chana-gram.jpg',
  'toor-dal': '/images/products/toor-dal.jpg',
  'moong-dal': '/images/products/moong-dal.jpg',
  'turmeric-finger': '/images/products/turmeric-finger.jpg',
  'red-chilli-reshampatti': '/images/products/red-chilli-reshampatti.jpg',
  'organic-jaggery': '/images/products/organic-jaggery.jpg'
};

const CATEGORY_FALLBACK_IMAGES = {
  vegetables: '/images/products/tomato-fresh.jpg',
  fruits: '/images/products/mango-kesar.jpg',
  grains: '/images/products/wheat-grade-a.jpg',
  pulses: '/images/products/toor-dal.jpg',
  spices: '/images/products/turmeric-finger.jpg',
  other: '/images/products/organic-jaggery.jpg'
};

export function getProductImageUrl(product) {
  if (!product) return '/images/products/tomato-fresh.jpg';

  // 1. If explicit ImageUrl is provided by backend API
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
    return product.imageUrl;
  }

  // 2. Direct slug matching
  const slug = (product.slug || product.productSlug || '').toLowerCase().trim();
  if (PRODUCT_IMAGE_MAP[slug]) {
    return PRODUCT_IMAGE_MAP[slug];
  }

  // 3. Name-based matching (Onion, Tomato, Potato, etc.)
  const name = (product.name || product.productName || '').toLowerCase();
  if (name.includes('onion')) return '/images/products/onion-red.jpg';
  if (name.includes('tomato')) return '/images/products/tomato-fresh.jpg';
  if (name.includes('potato')) return '/images/products/potato-jyoti.jpg';
  if (name.includes('banana')) return '/images/products/banana-g9.jpg';
  if (name.includes('mango')) return '/images/products/mango-kesar.jpg';
  if (name.includes('wheat')) return '/images/products/wheat-grade-a.jpg';
  if (name.includes('rice') || name.includes('basmati')) return '/images/products/basmati-rice.jpg';
  if (name.includes('maize') || name.includes('corn')) return '/images/products/yellow-maize.jpg';
  if (name.includes('chana') || name.includes('gram')) return '/images/products/chana-gram.jpg';
  if (name.includes('toor')) return '/images/products/toor-dal.jpg';
  if (name.includes('moong')) return '/images/products/moong-dal.jpg';
  if (name.includes('turmeric')) return '/images/products/turmeric-finger.jpg';
  if (name.includes('chilli') || name.includes('chili')) return '/images/products/red-chilli-reshampatti.jpg';
  if (name.includes('jaggery')) return '/images/products/organic-jaggery.jpg';

  // 4. Category-based fallback
  const category = (product.category || product.categoryName || '').toLowerCase();
  if (CATEGORY_FALLBACK_IMAGES[category]) {
    return CATEGORY_FALLBACK_IMAGES[category];
  }

  return '/images/products/tomato-fresh.jpg';
}
