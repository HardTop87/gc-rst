/**
 * formats.js
 * Endformat-Definitionen und Produzenten-Freigaben.
 */

/**
 * Technische Eigenschaften je Endformat-Key.
 * - nutzenPartner: Anzahl der Nutzen auf einem Bogen beim Partner-Druck
 * - isBanner:      true = Banner-Format (braucht Banner-Papiere & -Klick-Faktor)
 */
export const formats = {
  //                          openMm: [width, height] = offenes (ungefaltetes) Blattmaß in mm
  //                          Basis für die Gewichtsberechnung (Fläche × g/m²)
  A4_Hoch: { nutzenPartner: 1, isBanner: false, openMm: [420, 297] },  // Fertigformat 210×297 mm
  A5_Hoch: { nutzenPartner: 2, isBanner: false, openMm: [296, 210] },  // Fertigformat 148×210 mm
  A5_Quer: { nutzenPartner: 2, isBanner: false, openMm: [420, 148] },  // Fertigformat 210×148 mm
  A4_Quer: { nutzenPartner: 1, isBanner: true,  openMm: [594, 210] },  // Fertigformat 297×210 mm
  "30x30": { nutzenPartner: 1, isBanner: true,  openMm: [600, 300] },  // Fertigformat 300×300 mm
};

/**
 * Welcher Produzent darf welche Formate herstellen.
 * Keys müssen exakt den Routen-Namen in calculator.js entsprechen.
 */
export const allowedFormats = {
  "Intern (Inline auf KM)": ["A5_Hoch", "A5_Quer", "A4_Hoch"],
  "Partner Kopp":           ["A5_Hoch", "A5_Quer", "A4_Hoch"],
  "Partner ILDA":           ["A5_Hoch", "A5_Quer", "A4_Hoch", "A4_Quer", "30x30"],
};

/** Alle konfigurierten Routen in der gewünschten Reihenfolge. */
export const routes = [
  { name: "Intern (Inline auf KM)", isIntern: true  },
  { name: "Partner Kopp",           isIntern: false },
  { name: "Partner ILDA",           isIntern: false },
];
