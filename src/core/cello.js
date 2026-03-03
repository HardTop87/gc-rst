/**
 * cello.js
 * Berechnungslogik für Cellophanierung des Umschlags.
 */

const CELLO_ALLOWED_CATS = new Set(['CC', 'BD']);

const CELLO_UNIT_PRICES = {
  ohne: 0,
  glaenzend: 0.10,
  matt: 0.20,
  softtouch: 0.30,
};

const MENGEN_FAKTOREN = [
  { minBogen: 1, faktor: 1.0 },
  { minBogen: 11, faktor: 0.9 },
  { minBogen: 26, faktor: 0.8 },
  { minBogen: 51, faktor: 0.7 },
  { minBogen: 101, faktor: 0.65 },
  { minBogen: 251, faktor: 0.6 },
  { minBogen: 501, faktor: 0.5 },
  { minBogen: 1000, faktor: 0.45 },
];

export function isCelloAllowedForPaper(paper) {
  if (!paper) return false;
  return CELLO_ALLOWED_CATS.has(paper.cat);
}

export function getCelloMengenFaktor(bogenUmschlag) {
  const n = Math.max(bogenUmschlag, 0);
  let current = 0;

  for (const step of MENGEN_FAKTOREN) {
    if (n >= step.minBogen) {
      current = step.faktor;
    }
  }

  return current;
}

export function getCelloUnitPrice(celloType) {
  return CELLO_UNIT_PRICES[celloType] ?? 0;
}

export function normalizeCelloType(celloType) {
  if (celloType === 'glaenzend' || celloType === 'matt' || celloType === 'softtouch') {
    return celloType;
  }
  return 'ohne';
}

export function calcCelloCosts({ hasUmschlag, pUmschlag, celloType, bogenUmschlag, grundkosten = 20 }) {
  const allowed = hasUmschlag && isCelloAllowedForPaper(pUmschlag);
  const normalized = normalizeCelloType(celloType);

  if (!allowed || normalized === 'ohne') {
    return {
      celloTypeEffektiv: 'ohne',
      celloAllowed: allowed,
      celloGrundkosten: 0,
      celloGrundkostenFaktor: 0,
      celloBogenkosten: 0,
      celloStueckpreis: 0,
      celloKostenGesamt: 0,
    };
  }

  const faktor = getCelloMengenFaktor(bogenUmschlag);
  const stueckpreis = getCelloUnitPrice(normalized);
  const effektiverBogenpreis = stueckpreis * faktor;
  const fixGrundkosten = Math.max(grundkosten, 0);
  const bogenkosten = bogenUmschlag * effektiverBogenpreis;

  return {
    celloTypeEffektiv: normalized,
    celloAllowed: true,
    celloGrundkosten: fixGrundkosten,
    celloGrundkostenFaktor: faktor,
    celloBogenkosten: bogenkosten,
    celloStueckpreis: effektiverBogenpreis,
    celloKostenGesamt: fixGrundkosten + bogenkosten,
  };
}
