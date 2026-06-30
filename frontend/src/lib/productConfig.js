// src/lib/productConfig.js

export const CUSTOM_NAME_MAP = {
  "Dharmaraj Chyawanprash": "Tejas Elixir",
  "Dharmaraj Triphala": "Prana Herbs",
  "Brahmi Mind": "Soma Oil",
  "Shilajit Gold": "Medha Ghrutam"
};

export const TAGLINE_MAP = {
  "Dharmaraj Chyawanprash": "Radiance & Vitality",
  "Dharmaraj Triphala": "Nourish Your Energy",
  "Brahmi Mind": "Soothe & Rejuvenate",
  "Shilajit Gold": "Mental Clarity & Focus"
};

export const DESCRIPTION_MAP = {
  "Dharmaraj Chyawanprash": "A revitalizing blend designed to enhance your natural radiance and inner vitality.",
  "Dharmaraj Triphala": "Pure, potent botanical extracts formulated to nourish your energy and daily well-being.",
  "Brahmi Mind": "A deeply restorative infusion crafted to soothe the senses and support physical rejuvenation.",
  "Shilajit Gold": "An ancient, clarified butter formulation traditionally used to support mental clarity and focus."
};

export const getCustomName = (name) => {
  const cleanName = name ? name.trim() : "";
  return CUSTOM_NAME_MAP[cleanName] || name;
};

export const getCustomTagline = (name, original) => {
  const cleanName = name ? name.trim() : "";
  return TAGLINE_MAP[cleanName] || original;
};

export const getCustomDescription = (name, original) => {
  const cleanName = name ? name.trim() : "";
  return DESCRIPTION_MAP[cleanName] || original;
};

/** Shop grid only — ai-bottle catalog photography keyed by slug. */
export const SHOP_PRODUCT_IMAGES = {
  "1-vajra": "/images/ai-bottle-1.jpeg",
  "drj-chyawanprash": "/images/ai-bottle-2.jpeg",
  "drj-triphala": "/images/ai-bottle-3.jpeg",
  "drj-brahmi-mind": "/images/ai-bottle-4.jpeg",
  "drj-shilajit-gold": "/images/ai-bottle-5.jpeg",
  "drj-ashwagandha-pure": "/images/ai-bottle-6.jpeg",
  "prana-elixir": "/images/ai-bottle-2.jpeg",
  "ojas-gold": "/images/ai-bottle-3.jpeg",
  "agni-digest": "/images/ai-bottle-4.jpeg",
  "shanti-sleep": "/images/ai-bottle-5.jpeg",
  "brahmind-focus": "/images/ai-bottle-6.jpeg",
};

const SHOP_IMAGE_VERSION = "3";

function withShopCacheBust(path) {
  return `${path}?v=${SHOP_IMAGE_VERSION}`;
}

/** Use on the shop page only. */
export function getShopProductImage(product) {
  if (product?.slug && SHOP_PRODUCT_IMAGES[product.slug]) {
    return withShopCacheBust(SHOP_PRODUCT_IMAGES[product.slug]);
  }
  if (product?.id && SHOP_PRODUCT_IMAGES[product.id]) {
    return withShopCacheBust(SHOP_PRODUCT_IMAGES[product.id]);
  }
  return withShopCacheBust("/images/ai-bottle-1.jpeg");
}