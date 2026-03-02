/**
 * main.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Entry Point der Anwendung.
 *
 * Aufgaben:
 *   1. CSS importieren (Vite bundelt es korrekt)
 *   2. Event-Listener registrieren
 *   3. Bei "Berechnen": Formular lesen → Calculator → UI rendern
 */

import './style.css';

import { calculateAllRoutes } from './core/calculator.js';
import {
  updateDropdowns,
  updateUmschlagDropdown,
  setUmschlagVisible,
  registerSelectListeners,
  readForm,
  renderResults,
} from './ui.js';

// ─── Event-Listener ───────────────────────────────────────────────────────────

// Tom Select Change-Events (Format & Papier Inhalt)
registerSelectListeners({
  onFormatChange: updateDropdowns,
  onInhaltChange: updateUmschlagDropdown,
});

// Nativer Checkbox-Listener (kein Tom Select)
document
  .getElementById('has_umschlag')
  .addEventListener('change', function () {
    setUmschlagVisible(this.checked);
  });

document
  .getElementById('btn-calculate')
  .addEventListener('click', handleCalculate);

// ─── Berechnung anstoßen ─────────────────────────────────────────────────────

function handleCalculate() {
  const { inputs, settings } = readForm();
  const results              = calculateAllRoutes(inputs, settings);
  renderResults(results);
}

// ─── Initialisierung ─────────────────────────────────────────────────────────

updateDropdowns(); // Dropdowns beim Start befüllen
