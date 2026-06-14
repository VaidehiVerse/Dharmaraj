// src/lib/productConfig.js

// This mapping provides consistent naming across the application.
// Key = Original API Name, Value = Custom Display Name
export const CUSTOM_NAME_MAP = {
  "Vajra": "Dharmaraj Chyawanprash",
  "Tejas Elixir": "Dharmaraj Triphala",
  "Prana Herbs": "Brahmi Mind",
  "Soma Oil": "Shilajit Gold",
  "Medha Ghrutam": "Ashwagandha Pure"
};

/**
 * Helper to get the custom name for a product.
 * Falls back to the original name if no mapping is found.
 */
export const getCustomName = (apiName) => {
  return CUSTOM_NAME_MAP[apiName] || apiName;
};