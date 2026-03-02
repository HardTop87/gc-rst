/**
 * limits.js
 * Maschinenlimits (max. Seitenzahl) je Format-Gruppe,
 * aufgeteilt in Varianten ohne und mit Umschlag.
 *
 * Schlüssel ohne Umschlag:  papierInhaltId → maxSeiten
 * Schlüssel mit Umschlag:   papierUmschlagId → { papierInhaltId → maxSeiten }
 */

// ─── A4 Hochformat & A5 Querformat ───────────────────────────────────────────

export const limitNoCoverA4 = {
  CC_100: 92,  CC_120: 76,  CC_160: 60,
  N_80:   92,  N_90:   84,  N_100:  76,  N_120: 56,
  BD_115: 104, BD_135: 84,  BD_150: 72,
  R_80:   96,  R_100:  76,
};

export const limitWithCoverA4 = {
  CC_160: { CC_100: 88, CC_120: 72, CC_160: 56 },
  CC_200: { CC_100: 84, CC_120: 72, CC_160: 52 },
  CC_250: { CC_100: 84, CC_120: 68, CC_160: 52 },
  CC_300: { CC_100: 80, CC_120: 68, CC_160: 52 },
  CC_350: { CC_100: 80, CC_120: 68, CC_160: 48 },
  N_160:  { N_80:  84, N_90:  76, N_100: 68, N_120: 52 },
  N_200:  { N_80:  84, N_90:  72, N_100: 68, N_120: 48 },
  N_250:  { N_80:  80, N_90:  72, N_100: 64, N_120: 48 },
  N_300:  { N_80:  76, N_90:  68, N_100: 64, N_120: 48 },
  BD_170: { BD_115: 96, BD_135: 80, BD_150: 68 },
  BD_200: { BD_115: 96, BD_135: 76, BD_150: 68 },
  BD_250: { BD_115: 92, BD_135: 76, BD_150: 68 },
  BD_300: { BD_115: 92, BD_135: 72, BD_150: 64 },
  BD_350: { BD_115: 88, BD_135: 72, BD_150: 64 },
  R_300:  { R_80:  80, R_100: 64 },
};

// ─── A5 Hochformat ────────────────────────────────────────────────────────────

export const limitNoCoverA5 = {
  CC_100: 92,  CC_120: 76,  CC_160: 60,
  N_80:   92,  N_90:   84,  N_120:  56,
  BD_115: 104, BD_135: 84,  BD_150: 72,
  R_90:   84,
};

export const limitWithCoverA5 = {
  // Sortenreinheit: CC-Umschlag nur mit CC-Inhalt (kein kategorienübergreifender Einsatz)
  CC_160: { CC_100: 88, CC_120: 72, CC_160: 56 },
  CC_250: { CC_100: 84, CC_120: 68, CC_160: 52 },
  N_160:  { N_80:  84, N_90: 76, N_120: 52 },
  N_250:  { N_80:  80, N_90: 72, N_120: 48 },
  BD_170: { BD_115: 96, BD_135: 80, BD_150: 68 },
  BD_200: { BD_115: 96, BD_135: 76, BD_150: 68 },
  BD_250: { BD_115: 96, BD_135: 76, BD_150: 68 },
  BD_300: { BD_115: 92, BD_135: 72, BD_150: 64 },
  BD_350: { BD_115: 92, BD_135: 72, BD_150: 64 },
  R_300:  { R_90:  72 },
};

// ─── Banner-Formate (A4 Quer & 30x30) ────────────────────────────────────────

export const limitNoCoverBanner = {
  CC_120_BAN: 76,
  CC_160_BAN: 60,
  N_100_BAN:  76,
  BD_135_BAN: 84,
};

export const limitWithCoverBanner = {
  CC_160_BAN: { CC_120_BAN: 72, CC_160_BAN: 56 },
  CC_250_BAN: { CC_120_BAN: 68, CC_160_BAN: 52 },
  CC_300_BAN: { CC_120_BAN: 68, CC_160_BAN: 52 },
  N_250_BAN:  { N_100_BAN:  64 },
  N_300_BAN:  { N_100_BAN:  64 },
  BD_170_BAN: { BD_135_BAN: 80 },
  BD_200_BAN: { BD_135_BAN: 76 },
  BD_250_BAN: { BD_135_BAN: 76 },
  BD_300_BAN: { BD_135_BAN: 72 },
};

/**
 * Hilfsfunktion: Liefert das korrekte Limit-Paar {noCover, withCover}
 * für einen gegebenen Format-Key.
 *
 * @param {string} formatKey
 * @returns {{ noCover: object, withCover: object }}
 */
export function getLimitsForFormat(formatKey) {
  switch (formatKey) {
    case "A4_Hoch":
    case "A5_Quer":
      return { noCover: limitNoCoverA4, withCover: limitWithCoverA4 };
    case "A5_Hoch":
      return { noCover: limitNoCoverA5, withCover: limitWithCoverA5 };
    case "A4_Quer":
    case "30x30":
      return { noCover: limitNoCoverBanner, withCover: limitWithCoverBanner };
    default:
      return { noCover: {}, withCover: {} };
  }
}
