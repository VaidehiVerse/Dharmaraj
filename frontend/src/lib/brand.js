export const BRAND = {
  name: "Dharmaraj Ayurveda",
  tagline: "Ancient Ayurveda, Modern Wellness",
  motto: "Rise and Grow",
  phone: "+91 97378 33244",
  whatsapp: "919737833244",
  email: "dharmarajayurveda@gmail.com",
  city: "Surat, Gujarat, India",
  address: "Shop No. G-5, Rajhans Point, Varachha Road, Surat — 395006, Gujarat",
  instagram: "https://www.instagram.com/dharmarajayurveda",
  logo: "https://customer-assets.emergentagent.com/job_dfedb237-de5f-45c8-8144-ca6a1913adba/artifacts/z1q1t35r_image.png",
  productLabel: "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/2chn5yjn_image.png",
  hours: "Mon – Sat · 10:00 AM – 7:00 PM IST",
};

export const whatsappLink = (msg = "Hello Dharmaraj Ayurveda, I'd like to know more about 1 Vajra.") =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(msg)}`;
