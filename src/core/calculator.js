/**
 * calculator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reine Berechnungslogik — KEIN DOM-Zugriff.
 *
 * Eingang:  calculateAllRoutes(inputs, settings)
 * Ausgang:  Array von RouteResult-Objekten (eines je Produktionsweg)
 *
 * @typedef {Object} Inputs
 * @property {string}  formatKey     - Key aus formats.js (z. B. "A4_Hoch")
 * @property {number}  auflage       - Gewünschte Auflage (Stk)
 * @property {number}  seiten        - Seitenanzahl Inhalt (Vielfaches von 4)
 * @property {string}  pInhaltId     - Papier-ID aus papers.js
 * @property {string}  dInhaltKey    - "1c" | "4c"
 * @property {boolean} hasUmschlag   - Ob ein Umschlag gedruckt wird
 * @property {string}  pUmschlagId   - Papier-ID Umschlag (nur wenn hasUmschlag)
 * @property {string}  dUmschlagKey  - "1c" | "4c" (nur wenn hasUmschlag)
 *
 * @typedef {Object} Settings
 * @property {number} baseKlick1c          - Klickpreis SRA3 SW  (€/Seite)
 * @property {number} baseKlick4c          - Klickpreis SRA3 4c  (€/Seite)
 * @property {number} zInhalt              - Zuschuss/Makulatur Inhalt (Bögen)
 * @property {number} zUmschlag            - Zuschuss/Makulatur Umschlag (Bögen)
 * @property {number} dynFaktorBanner      - Klick-Multiplikator für Banner (default 2.0)
 * @property {number} dynFaktorKlickSRA4   - Klick-Multiplikator für SRA4  (default 0.5)
 * @property {number} dynFaktorPapierSRA4  - Papierpreis-Multiplikator SRA4 (default 1.0)
 *
 * @typedef {Object} RouteResult
 * @property {string}      name
 * @property {string|null} error                - null = Erfolg
 * @property {number}      [gesamt]
 * @property {number}      [stueckPreis]
 * @property {string}      [formatName]         - "SRA3" | "SRA4" | "Banner"
 * @property {number}      [nutzen]
 * @property {number}      [bogenInhalt]
 * @property {number}      [bogenUmschlag]
 * @property {number}      [kostenPapierGesamt]
 * @property {number}      [kostenKlickGesamt]
 * @property {number}      [kostenPapierInhalt]
 * @property {number}      [kostenKlickInhalt]
 * @property {number}      [kostenPapierUmschlag]
 * @property {number}      [kostenKlickUmschlag]
 * @property {number}      [wvKosten]
 * @property {number}      [weightPerCopyG]     - Gewicht pro Stück in Gramm
 * @property {number}      [weightTotalKg]      - Gesamtgewicht der Auflage in Kilogramm
 */

import { papiere }                     from '../config/papers.js';
import { formats, allowedFormats, routes } from '../config/formats.js';
import { getLimitsForFormat }           from '../config/limits.js';
import {
  preise_intern,
  preise_kopp,
  preise_ilda_mit,
  preise_ilda_ohne,
} from '../config/prices.js';

// ─── Internes Hilfsprogramm ───────────────────────────────────────────────────

/**
 * Exakter Tabellenabgriff — gibt null zurück, wenn kein Eintrag vorhanden.
 * Keinerlei Interpolation (identisch zum Original).
 *
 * @param {object} table
 * @param {number} bogenteile
 * @param {number} auflage
 * @returns {number|null}
 */
function getPriceFromTable(table, bogenteile, auflage) {
  if (table[bogenteile] && table[bogenteile][auflage]) {
    return table[bogenteile][auflage];
  }
  return null;
}

// ─── Einzelrouten-Berechnung ─────────────────────────────────────────────────

/**
 * Berechnet einen einzelnen Produktionsweg.
 * !! Mathematik darf hier NICHT verändert werden !!
 *
 * @param {string}   name
 * @param {boolean}  isIntern
 * @param {Inputs}   inputs
 * @param {Settings} settings
 * @returns {RouteResult}
 */
function calcSingleRoute(name, isIntern, inputs, settings) {
  const {
    formatKey, auflage, seiten,
    pInhaltId, dInhaltKey,
    hasUmschlag, pUmschlagId, dUmschlagKey,
  } = inputs;

  const {
    baseKlick1c, baseKlick4c,
    zInhalt, zUmschlag,
    dynFaktorBanner, dynFaktorKlickSRA4, dynFaktorPapierSRA4,
  } = settings;

  // ── Format-Freigabe prüfen ────────────────────────────────────────────────
  if (!allowedFormats[name].includes(formatKey)) {
    return { name, error: 'Format wird von diesem Produzenten nicht unterstützt.' };
  }

  // ── Stammdaten nachschlagen ───────────────────────────────────────────────
  const formatSettings  = formats[formatKey];
  const bogenteile      = seiten / 4;
  const bogenteileGesamt = hasUmschlag ? bogenteile + 1 : bogenteile;

  const pInhalt   = papiere.find(p => p.id === pInhaltId);
  const pUmschlag = hasUmschlag ? papiere.find(p => p.id === pUmschlagId) : null;

  // ── Klickpreise SRA3 (dynamisch aus Settings) ─────────────────────────────
  const klickSRA3 = { '1c': baseKlick1c, '4c': baseKlick4c };
  // SRA4: halber Klickpreis per Faktor
  const klickSRA4 = {
    '1c': baseKlick1c * dynFaktorKlickSRA4,
    '4c': baseKlick4c * dynFaktorKlickSRA4,
  };

  // ── Format-abhängige Variablen bestimmen ──────────────────────────────────
  let nutzen            = formatSettings.nutzenPartner;
  let formatName        = 'SRA3';
  let bogenPreisInhalt  = pInhalt.price;
  let bogenPreisUmschlag = hasUmschlag ? pUmschlag.price : 0;
  let currentKlickInhalt  = klickSRA3[dInhaltKey];
  let currentKlickUmschlag = hasUmschlag ? klickSRA3[dUmschlagKey] : 0;

  if (formatSettings.isBanner) {
    // Banner: gleicher Bogenpreis, aber Klick * Faktor (default 2.0)
    formatName           = 'Banner';
    currentKlickInhalt   = currentKlickInhalt  * dynFaktorBanner;
    currentKlickUmschlag = hasUmschlag ? currentKlickUmschlag * dynFaktorBanner : 0;

  } else if (isIntern) {
    // Intern: immer 1 Nutzen auf der Eigenmaschine.
    nutzen = 1;

    if (formatKey === 'A5_Hoch') {
      // ── A5 Hochformat: offenes Maß 210×297 mm → passt als 1 Nutzen auf SRA4 (225×320 mm).
      //    Daher halbe Papier- und halbe Klickkosten via dynFaktorKlickSRA4 / dynFaktorPapierSRA4.
      formatName           = 'SRA4';
      bogenPreisInhalt     = (pInhalt.price  / 2) * dynFaktorPapierSRA4;
      bogenPreisUmschlag   = hasUmschlag ? (pUmschlag.price / 2) * dynFaktorPapierSRA4 : 0;
      currentKlickInhalt   = klickSRA4[dInhaltKey];
      currentKlickUmschlag = hasUmschlag ? klickSRA4[dUmschlagKey] : 0;

    }
    // ── A5 Querformat: offenes Maß ~420×148 mm → passt NICHT auf SRA4!
    //    Zwingend auf SRA3 drucken → voller SRA3-Klickpreis, voller SRA3-Papierpreis.
    //    SRA4-Faktor (dynFaktorKlickSRA4) darf hier NICHT greifen → kein else-Zweig für A5_Quer.
    // ── A4 Hochformat (210×297 mm intern): ebenfalls SRA3, voller Preis.
  }

  // ── Bogenmengen (inkl. Zuschuss/Makulatur) ────────────────────────────────
  const bogenInhalt   = Math.ceil((auflage * bogenteile) / nutzen) + zInhalt;
  let   bogenUmschlag = 0;
  if (hasUmschlag) {
    bogenUmschlag = Math.ceil(auflage / nutzen) + zUmschlag;
  }

  // ── Kosten: Papier & Klick ────────────────────────────────────────────────
  const kostenPapierInhalt  = bogenInhalt  * bogenPreisInhalt;
  const kostenKlickInhalt   = bogenInhalt  * 2 * currentKlickInhalt;   // 2 Seiten/Bogen

  let kostenPapierUmschlag = 0;
  let kostenKlickUmschlag  = 0;
  if (hasUmschlag) {
    kostenPapierUmschlag = bogenUmschlag * bogenPreisUmschlag;
    kostenKlickUmschlag  = bogenUmschlag * 2 * currentKlickUmschlag;
  }

  const kostenPapierGesamt  = kostenPapierInhalt  + kostenPapierUmschlag;
  const kostenKlickGesamt   = kostenKlickInhalt   + kostenKlickUmschlag;
  const kostenDruckUndPapier = kostenPapierGesamt + kostenKlickGesamt;

  // ── Gewicht ───────────────────────────────────────────────────────────────
  // g/m² direkt aus der Papier-ID lesen (z. B. "N_80" → 80, "BD_115" → 115)
  const gsmInhalt   = parseInt(pInhaltId.split('_')[1]);
  const gsmUmschlag = hasUmschlag ? parseInt(pUmschlagId.split('_')[1]) : 0;
  const [openW, openH] = formatSettings.openMm;          // offenes Blattmaß in mm
  const sheetAreaM2   = (openW * openH) / 1_000_000;      // m²
  const weightPerCopyG = (bogenteile * gsmInhalt + (hasUmschlag ? 1 : 0) * gsmUmschlag) * sheetAreaM2;
  const weightTotalKg  = (weightPerCopyG * auflage) / 1000;

  // ── Maschinenlimit prüfen ─────────────────────────────────────────────────
  const { noCover: limitNo, withCover: limitWith } = getLimitsForFormat(formatKey);

  let maxSeiten = 0;
  if (!hasUmschlag) {
    maxSeiten = limitNo[pInhalt.id] || 0;
  } else {
    if (limitWith[pUmschlag.id] && limitWith[pUmschlag.id][pInhalt.id]) {
      maxSeiten = limitWith[pUmschlag.id][pInhalt.id];
    }
  }

  // ── Verarbeitungskosten aus Preistabelle ──────────────────────────────────
  let wvKosten = null;
  let errorMsg  = '';

  if (isIntern) {
    if (maxSeiten === 0) {
      errorMsg = 'Technisches Limit für diese Papierkombi bei diesem Format nicht definiert.';
    } else if (seiten > maxSeiten) {
      errorMsg = `Technisch nicht möglich (Maschinenlimit: ${maxSeiten} Seiten).`;
    } else {
      wvKosten = getPriceFromTable(preise_intern, bogenteileGesamt, auflage);
      if (wvKosten === null) {
        errorMsg = 'Auflage/Umfang für Eigenproduktion nicht in Preistabelle hinterlegt.';
      }
    }

  } else {
    // Partner-Routen: bei Banner-Formaten immer Limit prüfen
    if (formatSettings.isBanner) {
      if (maxSeiten === 0) {
        errorMsg = 'Papierkombination für dieses Banner-Format nicht zulässig.';
      } else if (seiten > maxSeiten) {
        errorMsg = `Technisch nicht möglich (Limit für schweres Banner-Format: ${maxSeiten} Seiten).`;
      }
    }

    if (errorMsg === '') {
      if (name === 'Partner Kopp') {
        wvKosten = getPriceFromTable(preise_kopp, bogenteileGesamt, auflage);
        if (wvKosten === null) {
          errorMsg = 'Von Kopp für diese Auflage/Umfang nicht in Tabelle hinterlegt.';
        }
      } else if (name === 'Partner ILDA') {
        const table = hasUmschlag ? preise_ilda_mit : preise_ilda_ohne;
        wvKosten = getPriceFromTable(table, bogenteileGesamt, auflage);
        if (wvKosten === null) {
          errorMsg = 'Von ILDA für diese Auflage/Umfang nicht in Tabelle hinterlegt.';
        }
      }
    }
  }

  // ── Ergebnis zurückgeben ──────────────────────────────────────────────────
  if (errorMsg) {
    return { name, error: errorMsg };
  }

  const gesamt     = kostenDruckUndPapier + wvKosten;
  const stueckPreis = gesamt / auflage;

  return {
    name,
    error: null,
    gesamt,
    stueckPreis,
    formatName,
    nutzen,
    bogenInhalt,
    bogenUmschlag,
    kostenPapierGesamt,
    kostenKlickGesamt,
    kostenPapierInhalt,
    kostenKlickInhalt,
    kostenPapierUmschlag,
    kostenKlickUmschlag,
    wvKosten,
    weightPerCopyG,
    weightTotalKg,
  };
}

// ─── Öffentliche API ─────────────────────────────────────────────────────────

/**
 * Berechnet alle konfigurierten Produktionswege und gibt ein Array
 * von RouteResult-Objekten zurück.
 *
 * @param {Inputs}   inputs
 * @param {Settings} settings
 * @returns {RouteResult[]}
 */
export function calculateAllRoutes(inputs, settings) {
  return routes.map(({ name, isIntern }) =>
    calcSingleRoute(name, isIntern, inputs, settings)
  );
}
