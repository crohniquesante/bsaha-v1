export const videos = [
  "La medecine prophetique",
  "La maladie de Crohn - introduction",
  "Les causes - resume",
  "La genetique",
  "L'epigenetique",
  "L'inflammation - c'est quoi ?",
  "Les facteurs environnementaux",
  "L'alimentation moderne",
  "L'alimentation anti-inflammatoire",
  "Le systeme digestif",
  "La digestion des glucides",
  "La digestion des proteines",
  "La digestion des lipides",
  "Le systeme nerveux",
  "Le systeme hormonal",
  "Le cycle hormonal feminin",
  "La nutrition fonctionnelle du cycle feminin",
  "La contraception",
  "Le microbiote intestinal",
  "La detox",
  "L'automassage",
  "La phytotherapie",
  "L'eau",
  "Le sport",
  "En finir avec les carences",
  "L'automassage - pratique"
].map((title, index) => ({
  title,
  slug: `video-${index + 1}`,
  module: index < 20 ? "principal" : "bonus",
  description: "Video de formation Bsaha",
  bunnyVideoId: `bunny-${index + 1}`,
  durationSec: 300,
  orderIndex: index + 1,
  isBonus: index >= 20
}));

export const ebooks = [
  {
    title: "Stopper la crise de Crohn",
    description: "Lead magnet gratuit",
    storagePath: "ebooks/stopper-crise-crohn.pdf",
    isFree: true
  },
  {
    title: "Les adhkars du matin et du soir",
    description: "Dimension spirituelle",
    storagePath: "ebooks/adhkars-matin-soir.pdf",
    isFree: false
  },
  {
    title: "Livre de recettes anti-inflammatoires",
    description: "Recettes membres",
    storagePath: "ebooks/recettes-anti-inflammatoires.pdf",
    isFree: false
  },
  {
    title: "Recettes de jus a l'extracteur",
    description: "Jus et digestion",
    storagePath: "ebooks/recettes-jus-extracteur.pdf",
    isFree: false
  },
  {
    title: "Comprendre ses analyses medicales",
    description: "Guide analyses",
    storagePath: "ebooks/comprendre-analyses.pdf",
    isFree: false
  },
  {
    title: "Guide des complements alimentaires",
    description: "Micronutrition",
    storagePath: "ebooks/guide-complements.pdf",
    isFree: false
  }
];
