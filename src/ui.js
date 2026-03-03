/**
 * ui.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Ausschließlich DOM-Operationen:
 *   • Dropdowns befüllen und aktualisieren (via Tom Select)
 *   • Formulardaten auslesen
 *   • Ergebnis-Objekte in das #results-Grid rendern
 *
 * Keinerlei Berechnungslogik — nur Darstellung und Event-Handling.
 */

import TomSelect from 'tom-select';
import {
  papiere,
  inhaltIds,
  umschlagIds,
  inhaltIdsBanner,
  umschlagIdsBanner,
} from './config/papers.js';
import { formats } from './config/formats.js';

// ─── DOM-Elemente (gecacht beim Modul-Load) ───────────────────────────────────

const divUmschlagConfig = document.getElementById('umschlag_config');
const resultsDiv        = document.getElementById('results');

// ─── Tom Select Instanzen ─────────────────────────────────────────────────────

/**
 * Erstellt eine Tom Select Instanz für einfache Auswahl-Dropdowns
 * (wenige Optionen, kein Suchfeld erforderlich).
 */
function makePlainSelect(id) {
  return new TomSelect(`#${id}`, {
    allowEmptyOption: false,
    create: false,
    openOnFocus: true,
    searchField: [],
    plugins: [],
    onInitialize() {
      // CSS-Klasse für "kein Suchfeld"-Styling
      this.wrapper.classList.add('ts-no-search');
    },
  });
}

/**
 * Erstellt eine Tom Select Instanz für Papier-Dropdowns
 * (viele Optionen, mit Live-Suche).
 */
function makePaperSelect(id) {
  return new TomSelect(`#${id}`, {
    allowEmptyOption: false,
    create: false,
    openOnFocus: true,
    searchField: ['text'],
    placeholder: 'Papier suchen …',
    plugins: [],
    onFocus() {
      // Suchtext beim Öffnen leeren für frisches Suchen
      this.setTextboxValue('');
      this.refreshOptions(true);
    },
  });
}

// Instanzen initialisieren (werden beim Modul-Load erzeugt)
const tsFormat         = makePlainSelect('format');
const tsPapierInhalt   = makePaperSelect('papier_inhalt');
const tsDruckInhalt    = makePlainSelect('druck_inhalt');
const tsPapierUmschlag = makePaperSelect('papier_umschlag');
const tsDruckUmschlag  = makePlainSelect('druck_umschlag');
const tsCelloUmschlag  = makePlainSelect('cello_umschlag');

// ─── Hilfsfunktion: Tom Select Optionen neu setzen ───────────────────────────

/**
 * Ersetzt alle Optionen einer Tom-Select-Instanz ohne Flicker.
 * Bewahrt den aktuellen Wert wenn er in den neuen Optionen vorhanden ist.
 *
 * @param {TomSelect} ts
 * @param {{ value: string, text: string }[]} options
 */
function repopulate(ts, options) {
  const prevValue = ts.getValue();
  ts.clear(true);           // silent clear
  ts.clearOptions();
  ts.addOptions(options);
  ts.refreshOptions(false);

  const stillValid = options.some(o => o.value === prevValue);
  if (stillValid) {
    ts.setValue(prevValue, true); // silent set
  } else {
    ts.setValue(options[0]?.value ?? '', true);
  }
}

// ─── Dropdown-Logik ───────────────────────────────────────────────────────────

/** Befüllt das Inhalt-Papier-Dropdown passend zum gewählten Format. */
export function updateDropdowns() {
  const formatKey = tsFormat.getValue();
  const isBanner  = formats[formatKey]?.isBanner ?? false;
  const ids       = isBanner ? inhaltIdsBanner : inhaltIds;

  const options = papiere
    .filter(p => ids.includes(p.id))
    .map(p => ({ value: p.id, text: p.name }));

  repopulate(tsPapierInhalt, options);
  updateUmschlagDropdown();
}

/**
 * Befüllt das Umschlag-Papier-Dropdown.
 * Filtert auf gleiche Kategorie wie gewähltes Inhaltpapier.
 */
export function updateUmschlagDropdown() {
  const inhaltId = tsPapierInhalt.getValue();
  if (!inhaltId) return;

  const inhaltKat = papiere.find(p => p.id === inhaltId)?.cat;
  const formatKey = tsFormat.getValue();
  const isBanner  = formats[formatKey]?.isBanner ?? false;
  const ids       = isBanner ? umschlagIdsBanner : umschlagIds;

  const options = papiere
    .filter(p => ids.includes(p.id) && p.cat === inhaltKat)
    .map(p => ({ value: p.id, text: p.name }));

  repopulate(tsPapierUmschlag, options);
  updateCelloOptions();
}

export function updateCelloOptions() {
  const umschlagId = tsPapierUmschlag.getValue();
  const umschlagPapier = papiere.find(p => p.id === umschlagId);
  const cat = umschlagPapier?.cat;

  if (cat === 'CC' || cat === 'BD') {
    repopulate(tsCelloUmschlag, [
      { value: 'ohne', text: 'Ohne Cellophanierung' },
      { value: 'glaenzend', text: 'Glänzend' },
      { value: 'matt', text: 'Matt / kratzfest' },
      { value: 'softtouch', text: 'Softtouch' },
    ]);
    return;
  }

  repopulate(tsCelloUmschlag, [
    { value: 'ohne', text: 'Ohne (nur bei CC/BD möglich)' },
  ]);
}

/** Formatiert Gramm: 1–999 g → "x,x g", ≥1000 → "x,xx kg" */
function fmtG(g) {
  if (g >= 1000) return (g / 1000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';
  return g.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' g';
}
/** Formatiert Gesamt-Kilogramm: z. B. "12,34 kg" */
function fmtKg(kg) {
  return kg.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';
}

// ─── Öffentliche Getter für Formular-Werte ────────────────────────────────────

/** Gibt den aktuell gewählten Wert eines Tom-Select-Felds zurück. */
export const getFormat         = () => tsFormat.getValue();
export const getPapierInhalt   = () => tsPapierInhalt.getValue();
export const getDruckInhalt    = () => tsDruckInhalt.getValue();
export const getPapierUmschlag = () => tsPapierUmschlag.getValue();
export const getDruckUmschlag  = () => tsDruckUmschlag.getValue();
export const getCelloUmschlag  = () => tsCelloUmschlag.getValue();

// ─── Change-Listener registrieren ────────────────────────────────────────────

/**
 * Registriert alle nötigen Change-Events auf den Tom-Select-Instanzen.
 * Wird von main.js aufgerufen damit die Verantwortlichkeiten klar bleiben.
 *
 * @param {{ onFormatChange: Function, onInhaltChange: Function, onUmschlagPaperChange: Function }} callbacks
 */
export function registerSelectListeners({ onFormatChange, onInhaltChange, onUmschlagPaperChange }) {
  tsFormat.on('change', onFormatChange);
  tsPapierInhalt.on('change', onInhaltChange);
  tsPapierUmschlag.on('change', onUmschlagPaperChange);
}

// ─── Umschlag-Toggle ─────────────────────────────────────────────────────────

/** Blendet den Umschlag-Konfigurationsblock ein oder aus. */
export function setUmschlagVisible(visible) {
  divUmschlagConfig.classList.toggle('hidden', !visible);
  if (visible) {
    updateCelloOptions();
  }
}

// ─── Formulardaten lesen ─────────────────────────────────────────────────────

/**
 * Liest alle Eingabefelder aus und gibt ein getipptes Objekt zurück,
 * das direkt als `inputs` an calculateAllRoutes() übergeben werden kann.
 *
 * @returns {{ inputs: import('./core/calculator').Inputs, settings: import('./core/calculator').Settings }}
 */
export function readForm() {
  const numberOrDefault = (value, fallback) => {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const inputs = {
    formatKey:    getFormat(),
    auflage:      parseInt(document.getElementById('auflage').value)  || 1,
    seiten:       parseInt(document.getElementById('seiten').value)   || 8,
    pInhaltId:    getPapierInhalt(),
    dInhaltKey:   getDruckInhalt(),
    hasUmschlag:  document.getElementById('has_umschlag').checked,
    pUmschlagId:  getPapierUmschlag(),
    dUmschlagKey: getDruckUmschlag(),
    celloUmschlag: getCelloUmschlag(),
  };

  const settings = {
    baseGrundpreis1c:    numberOrDefault(document.getElementById('klick_sra3_sw').value, 0.015),
    baseGrundpreis4c:    numberOrDefault(document.getElementById('klick_sra3_4c').value, 0.04),
    dynFaktorBanner:     numberOrDefault(document.getElementById('faktor_banner').value, 1.5),
    dynFaktorKlickSRA4:  numberOrDefault(document.getElementById('faktor_sra4_klick').value, 0.7),
    celloGrundkosten:    numberOrDefault(document.getElementById('cello_grundkosten').value, 20),
    setupKosten:         numberOrDefault(document.getElementById('setup_kosten').value, 15),
    preferInternDelta:   numberOrDefault(document.getElementById('pref_intern_delta').value, 20),
    preferKoppDelta:     numberOrDefault(document.getElementById('pref_kopp_delta').value, 30),
  };

  return { inputs, settings };
}

// ─── Ergebnis-Rendering ───────────────────────────────────────────────────────

/** Formatiert eine Zahl als deutschen Dezimalstring (Komma statt Punkt). */
const fmt = (n, digits = 2) => n.toFixed(digits).replace('.', ',');

/**
 * Rendert ein Array von RouteResult-Objekten in das #results-Grid.
 * Markiert die günstigste Route mit einem "Günstigste"-Badge.
 *
 * @param {import('./core/calculator').RouteResult[]} routeResults
 * @param {{ preferInternDelta?: number, preferKoppDelta?: number }} settings
 */
export function renderResults(routeResults, settings = {}) {
  // Günstigste Route ermitteln (nur aus erfolgreichen)
  const valid   = routeResults.filter(r => !r.error);
  const minCost = valid.length ? Math.min(...valid.map(r => r.gesamt)) : Infinity;
  const recommendedName = pickRecommendedRouteName(valid, settings);

  resultsDiv.innerHTML = routeResults
    .map(r => buildRouteCard(r, !r.error && r.gesamt === minCost, !r.error && r.name === recommendedName))
    .join('');
}

function pickRecommendedRouteName(validRoutes, settings) {
  if (!validRoutes.length) return null;

  const preferInternDelta = Number.isFinite(settings.preferInternDelta) ? settings.preferInternDelta : 20;
  const preferKoppDelta = Number.isFinite(settings.preferKoppDelta) ? settings.preferKoppDelta : 30;

  const intern = validRoutes.find(r => r.name.includes('Intern'));
  const kopp = validRoutes.find(r => r.name.includes('Kopp'));
  const ilda = validRoutes.find(r => r.name.includes('ILDA'));
  const extern = validRoutes.filter(r => !r.name.includes('Intern'));
  const cheapestExternal = extern.length
    ? extern.reduce((best, route) => (route.gesamt < best.gesamt ? route : best), extern[0])
    : null;

  if (intern && cheapestExternal) {
    if (intern.gesamt <= cheapestExternal.gesamt + preferInternDelta) {
      return intern.name;
    }
  } else if (intern) {
    return intern.name;
  }

  if (kopp && ilda) {
    if (kopp.gesamt <= ilda.gesamt + preferKoppDelta) {
      return kopp.name;
    }
    return ilda.name;
  }

  if (kopp) return kopp.name;
  if (ilda) return ilda.name;

  return validRoutes.reduce((best, route) => (route.gesamt < best.gesamt ? route : best), validRoutes[0]).name;
}

/**
 * Erzeugt das HTML für eine einzelne Ergebnis-Karte (DaisyUI).
 *
 * @param {import('./core/calculator').RouteResult} r
 * @param {boolean} isCheapest
 * @param {boolean} isRecommended
 * @returns {string} HTML-String
 */
function buildRouteCard(r, isCheapest = false, isRecommended = false) {

  // ── Fehler-Karte ──────────────────────────────────────────────────────────
  if (r.error) {
    return `
      <div class="card bg-base-100 border border-error/30 opacity-70">
        <div class="card-body p-5 gap-2.5">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-error shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h3 class="font-bold text-base">${r.name}</h3>
          </div>
          <p class="text-error text-sm leading-snug">${r.error}</p>
        </div>
      </div>`;
  }

  // ── Sub-Zeilen für Inhalt / Umschlag ──────────────────────────────────────
  const hasUm = r.bogenUmschlag > 0;

  const papierSubRow = hasUm ? `
    <tr class="text-base-content/40">
      <td class="text-xs italic pl-3 py-0.5" colspan="2">
        Inhalt ${fmt(r.kostenPapierInhalt)} € / Umschlag ${fmt(r.kostenPapierUmschlag)} €
      </td>
    </tr>` : '';

  const klickSubRow = hasUm ? `
    <tr class="text-base-content/40">
      <td class="text-xs italic pl-3 py-0.5" colspan="2">
        Inhalt ${fmt(r.kostenKlickInhalt)} € / Umschlag ${fmt(r.kostenKlickUmschlag)} €
      </td>
    </tr>` : '';

  const celloTypeLabel = {
    ohne: 'Ohne',
    glaenzend: 'Glänzend',
    matt: 'Matt / kratzfest',
    softtouch: 'Softtouch',
  }[r.celloType] || 'Ohne';

  const borderClass = isCheapest
    ? 'border-success border-2'
    : isRecommended
      ? 'border-warning border-2'
      : 'border border-base-300';

  // ── Erfolgs-Karte ─────────────────────────────────────────────────────────
  return `
    <div class="card bg-base-100 ${borderClass}">
      <div class="card-body p-5 gap-3.5">

        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold text-base leading-tight">${r.name}</h3>
          <div class="flex items-center gap-1.5 shrink-0">
            ${isRecommended
              ? `<span class="badge badge-warning badge-sm">Empfohlen</span>`
              : ''}
            ${isCheapest
              ? `<span class="badge badge-success badge-sm">Günstigste</span>`
              : ''}
          </div>
        </div>

        <!-- Preis -->
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-3xl font-extrabold tabular-nums ${isCheapest ? 'text-success' : 'text-base-content'}">
              ${fmt(r.gesamt)} €
            </p>
            <p class="text-sm text-base-content/55 tabular-nums mt-0.5 whitespace-nowrap">
              ${fmt(r.stueckPreis, 4)} € / Stück
            </p>
          </div>
          <div class="text-xs leading-tight text-right text-base-content/60 mt-0.5 space-y-0.5 whitespace-nowrap">
            <p>DB Druck: ${fmt(r.dbDruckInhalt, 3)}${hasUm ? ` (I) · ${fmt(r.dbDruckUmschlag, 3)} (U)` : ''}</p>
            <p>DB Papier: ${fmt(r.dbPapierInhalt, 3)}${hasUm ? ` (I) · ${fmt(r.dbPapierUmschlag, 3)} (U)` : ''}</p>
            <p>Gew.-Zuschlag: ${fmt(r.gewichtszuschlagInhalt, 3)} € (I)${hasUm ? ` · ${fmt(r.gewichtszuschlagUmschlag, 3)} € (U)` : ''}</p>
            <p>Makulatur: ${r.makulaturInhalt} (I)${hasUm ? ` · ${r.makulaturUmschlag} (U)` : ''}</p>
          </div>
        </div>

        <div class="divider my-0"></div>

        <!-- Details-Tabelle -->
        <table class="w-full text-sm">
          <tbody>
            <tr>
              <td class="text-base-content/50 pr-3 py-0.5 whitespace-nowrap">Druck-Format</td>
              <td class="text-right font-semibold py-0.5">${r.formatName} · ${r.nutzen} Nutzen</td>
            </tr>
            <tr>
              <td class="text-base-content/50 pr-3 py-0.5 whitespace-nowrap">Bögen gesamt</td>
              <td class="text-right font-semibold tabular-nums py-0.5">${r.bogenInhalt + r.bogenUmschlag} Stk</td>
            </tr>
            <tr>
              <td class="text-base-content/50 pr-3 py-0.5 whitespace-nowrap">Gewicht / Stück</td>
              <td class="text-right font-semibold tabular-nums py-0.5">${fmtG(r.weightPerCopyG)}</td>
            </tr>
            <tr>
              <td class="text-base-content/50 pr-3 pb-1 whitespace-nowrap">Gewicht Auflage</td>
              <td class="text-right font-semibold tabular-nums pb-1">${fmtKg(r.weightTotalKg)}</td>
            </tr>

            <!-- Papierkosten -->
            <tr class="border-t border-base-200">
              <td class="text-base-content/50 pr-3 pt-2 pb-0.5 whitespace-nowrap">Papierkosten</td>
              <td class="text-right font-semibold tabular-nums pt-2 pb-0.5">${fmt(r.kostenPapierGesamt)} €</td>
            </tr>
            ${papierSubRow}

            <!-- Druckkosten -->
            <tr class="${hasUm ? '' : 'border-t border-base-200'}">
              <td class="text-base-content/50 pr-3 pt-1 pb-0.5 whitespace-nowrap">Druckkosten</td>
              <td class="text-right font-semibold tabular-nums pt-1 pb-0.5">${fmt(r.kostenKlickGesamt)} €</td>
            </tr>
            ${klickSubRow}

            <!-- Verarbeitung + Summe -->
            <tr class="border-t border-base-200">
              <td class="text-base-content/50 pr-3 pt-2 pb-0.5">Verarbeitung</td>
              <td class="text-right font-semibold tabular-nums pt-2 pb-0.5">${fmt(r.wvKosten)} €</td>
            </tr>
            <tr class="border-t border-base-200">
              <td class="text-base-content/50 pr-3 pt-2 pb-0.5 whitespace-nowrap">Cellophanierung</td>
              <td class="text-right font-semibold tabular-nums pt-2 pb-0.5">${fmt(r.celloKosten)} €</td>
            </tr>
            <tr class="text-base-content/40">
              <td class="text-xs italic pl-3 py-0.5" colspan="2">
                ${celloTypeLabel} · Grund ${fmt(r.celloGrundkosten)} € · Bogen ${fmt(r.celloBogenkosten)} € (${fmt(r.celloGrundkostenFaktor * 100, 0)}%)
              </td>
            </tr>
            <tr class="border-t border-base-200">
              <td class="text-base-content/50 pr-3 pt-2 pb-0.5 whitespace-nowrap">Einrichtekosten</td>
              <td class="text-right font-semibold tabular-nums pt-2 pb-0.5">${fmt(r.setupKosten)} €</td>
            </tr>
            <tr class="border-t-2 border-base-300 font-bold">
              <td class="pt-1.5 pr-3">Gesamt</td>
              <td class="text-right tabular-nums pt-1.5 ${isCheapest ? 'text-success' : ''}">${fmt(r.gesamt)} €</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>`;
}
