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