/**
 * papers.js
 * Alle Papiersorten (Standard & Banner) sowie die erlaubten IDs
 * für Inhalt- und Umschlag-Dropdowns.
 */

export const papiere = [
  // --- Standard-Papiere (SRA3 / SRA4) ---
  { id: "N_80",    name: "80g Natur",         cat: "N",  price: 0.024 },
  { id: "N_90",    name: "90g Natur",         cat: "N",  price: 0.027 },
  { id: "N_100",   name: "100g Natur",        cat: "N",  price: 0.036 },
  { id: "N_120",   name: "120g Natur",        cat: "N",  price: 0.044 },
  { id: "N_160",   name: "160g Natur",        cat: "N",  price: 0.070 },
  { id: "N_200",   name: "200g Natur",        cat: "N",  price: 0.082 },
  { id: "N_250",   name: "250g Natur",        cat: "N",  price: 0.102 },
  { id: "N_300",   name: "300g Natur",        cat: "N",  price: 0.122 },
  { id: "BD_115",  name: "115g Bilderdruck",  cat: "BD", price: 0.033 },
  { id: "BD_135",  name: "135g Bilderdruck",  cat: "BD", price: 0.040 },
  { id: "BD_150",  name: "150g Bilderdruck",  cat: "BD", price: 0.048 },
  { id: "BD_170",  name: "170g Bilderdruck",  cat: "BD", price: 0.056 },
  { id: "BD_200",  name: "200g Bilderdruck",  cat: "BD", price: 0.064 },
  { id: "BD_250",  name: "250g Bilderdruck",  cat: "BD", price: 0.084 },
  { id: "BD_300",  name: "300g Bilderdruck",  cat: "BD", price: 0.102 },
  { id: "BD_350",  name: "350g Bilderdruck",  cat: "BD", price: 0.128 },
  { id: "CC_100",  name: "100g ColorCopy",    cat: "CC", price: 0.035 },
  { id: "CC_120",  name: "120g ColorCopy",    cat: "CC", price: 0.042 },
  { id: "CC_160",  name: "160g ColorCopy",    cat: "CC", price: 0.059 },
  { id: "CC_200",  name: "200g ColorCopy",    cat: "CC", price: 0.072 },
  { id: "CC_250",  name: "250g ColorCopy",    cat: "CC", price: 0.090 },
  { id: "CC_300",  name: "300g ColorCopy",    cat: "CC", price: 0.120 },
  { id: "CC_350",  name: "350g ColorCopy",    cat: "CC", price: 0.150 },
  { id: "R_80",    name: "80g Recycling",     cat: "R",  price: 0.035 },
  { id: "R_90",    name: "90g Recycling",     cat: "R",  price: 0.040 },
  { id: "R_100",   name: "100g Recycling",    cat: "R",  price: 0.045 },
  { id: "R_300",   name: "300g Recycling",    cat: "R",  price: 0.135 },

  // --- Banner-Papiere ---
  { id: "CC_120_BAN", name: "120g ColorCopy BANNER",    cat: "CC", price: 0.075 },
  { id: "CC_160_BAN", name: "160g ColorCopy BANNER",    cat: "CC", price: 0.100 },
  { id: "CC_250_BAN", name: "250g ColorCopy BANNER",    cat: "CC", price: 0.155 },
  { id: "CC_300_BAN", name: "300g ColorCopy BANNER",    cat: "CC", price: 0.185 },
  { id: "BD_135_BAN", name: "135g Bilderdruck BANNER",  cat: "BD", price: 0.070 },
  { id: "BD_170_BAN", name: "170g Bilderdruck BANNER",  cat: "BD", price: 0.085 },
  { id: "BD_200_BAN", name: "200g Bilderdruck BANNER",  cat: "BD", price: 0.100 },
  { id: "BD_250_BAN", name: "250g Bilderdruck BANNER",  cat: "BD", price: 0.125 },
  { id: "BD_300_BAN", name: "300g Bilderdruck BANNER",  cat: "BD", price: 0.150 },
  { id: "N_100_BAN",  name: "100g Natur BANNER",        cat: "N",  price: 0.090 },
  { id: "N_250_BAN",  name: "250g Natur BANNER",        cat: "N",  price: 0.150 },
  { id: "N_300_BAN",  name: "300g Natur BANNER",        cat: "N",  price: 0.200 },
];

/** IDs der erlaubten Inhaltpapiere für Standard-Formate */
export const inhaltIds = [
  "N_80", "N_90", "N_100", "N_120",
  "BD_115", "BD_135", "BD_150",
  "CC_100", "CC_120", "CC_160",
  "R_80", "R_90", "R_100",
];

/** IDs der erlaubten Umschlagpapiere für Standard-Formate */
export const umschlagIds = [
  "N_160", "N_200", "N_250", "N_300",
  "BD_170", "BD_200", "BD_250", "BD_300", "BD_350",
  "CC_160", "CC_200", "CC_250", "CC_300", "CC_350",
  "R_300",
];

/** IDs der erlaubten Inhaltpapiere für Banner-Formate */
export const inhaltIdsBanner = [
  "CC_120_BAN", "CC_160_BAN", "N_100_BAN", "BD_135_BAN",
];

/** IDs der erlaubten Umschlagpapiere für Banner-Formate */
export const umschlagIdsBanner = [
  "CC_160_BAN", "CC_250_BAN", "CC_300_BAN",
  "N_250_BAN", "N_300_BAN",
  "BD_170_BAN", "BD_200_BAN", "BD_250_BAN", "BD_300_BAN",
];
