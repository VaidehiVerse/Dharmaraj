export const BRAND = {
  name: "Dharmaraj Ayurveda",
  tagline: "Ancient Ayurveda, Modern Wellness",
  motto: "Rise and Grow",
  phone: "+91 95129 51226",
  whatsapp: "919512951226",
  email: "dharmarajayurveda@gmail.com",
  city: "Surat, Gujarat, India",
  address: "Shop No. G-5, Rajhans Point, Varachha Road, Surat — 395006, Gujarat",
  instagram: "https://www.instagram.com/dharmarajayurveda",
  logo: "https://customer-assets.emergentagent.com/job_dfedb237-de5f-45c8-8144-ca6a1913adba/artifacts/z1q1t35r_image.png",
  productImage: "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/qj5h59j2_image.png",
  productLabel: "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/2chn5yjn_image.png",
  productChakras: "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/ytzrcecm_image.png",
  founder: {
    name: "Jignesh Mehta",
    title: "Founder · Dharmaraj Ayurveda",
    photo: "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/9z7ghljc_image.png",
    message:
      "Dharmaraj Ayurveda was born from a single conviction — that the timeless wisdom of our Vedic sages deserves a modern home. Every bottle of 1 Vajra carries the discipline of classical Ayurveda, the rigor of modern science, and the love of a family-owned house from Surat. We do not just make supplements. We craft daily rituals that help you rise — and grow.",
    qualifications: "Certified Ayurvedic Wellness Entrepreneur · Surat, Gujarat",
  },
  hours: "Mon – Sat · 10:00 AM – 7:00 PM IST",
};

export const whatsappLink = (msg = "Hello Dharmaraj Ayurveda, I'd like to know more about 1 Vajra.") =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(msg)}`;
