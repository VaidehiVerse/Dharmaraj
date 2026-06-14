// src/lib/productConfig.js

// This mapping ensures names and photos match everywhere
export const PRODUCT_MAP = {
  "Dharmaraj Chyawanprash": { name: "Vajra", image: "/images/ai-bottle-1.jpeg" },
  "Dharmaraj Triphala":     { name: "Tejas Elixir", image: "/images/ai-bottle-2.jpeg" },
  "Brahmi Mind":            { name: "Prana Herbs", image: "/images/ai-bottle-3.jpeg" },
  "Shilajit Gold":          { name: "Soma Oil", image: "/images/ai-bottle-4.jpeg" },
  "Ashwagandha Pure":       { name: "Medha Ghrutam", image: "/images/ai-bottle-5.jpeg" }
};

export const getProductConfig = (apiName) => {
  return PRODUCT_MAP[apiName] || { name: apiName, image: null };
};