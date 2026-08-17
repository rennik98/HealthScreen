/**
 * mock ของ Google Apps Script (SpreadsheetApp / PropertiesService / LockService / …)
 * ใช้รัน apps-script/Code.gs ใน Node เพื่อทดสอบตรรกะโดยไม่ต้อง deploy
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const CODE_GS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'apps-script', 'Code.gs');

// ── mock Google Apps Script ────────────────────────────────
class FakeSheet {
  constructor(name, ss) { this.name = name; this.rows = []; this.ss = ss; }
  getName() { return this.name; }
  getParent() { return this.ss; }
  getLastRow() { return this.rows.length; }
  getLastColumn() { return this.rows.reduce((m, r) => Math.max(m, r.length), 0); }
  _pad(w) { this.rows.forEach(r => { while (r.length < w) r.push(''); }); }
  appendRow(vals) { this.rows.push([...vals]); }
  clear() { this.rows = []; }
  getDataRange() { const w = this.getLastColumn(); this._pad(w); return this.getRange(1, 1, this.rows.length, w); }
  getRange(row, col, nRows = 1, nCols = 1) {
    const sh = this;
    return {
      getValues() {
        const out = [];
        for (let r = 0; r < nRows; r++) {
          const src = sh.rows[row - 1 + r] || [];
          out.push(Array.from({ length: nCols }, (_, c) => src[col - 1 + c] ?? ''));
        }
        return out;
      },
      getValue() { return (sh.rows[row - 1] || [])[col - 1] ?? ''; },
      setValues(vals) {
        vals.forEach((rowVals, r) => {
          const idx = row - 1 + r;
          while (sh.rows.length <= idx) sh.rows.push([]);
          rowVals.forEach((v, c) => { sh.rows[idx][col - 1 + c] = v; });
        });
        sh._pad(sh.getLastColumn());
        return this;
      },
      setFontWeight() { return this; },
    };
  }
}
class FakeSpreadsheet {
  constructor(names) { this.sheets = names.map(n => new FakeSheet(n, this)); }
  getSheets() { return this.sheets; }
  getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; }
  insertSheet(n) { const s = new FakeSheet(n, this); this.sheets.push(s); return s; }
  deleteSheet(s) { this.sheets = this.sheets.filter(x => x !== s); }
}

export function loadGas(props, sheetNames) {
  const ss = new FakeSpreadsheet(sheetNames);
  const logs = [];
  const globals = {
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (k) => (k in props ? props[k] : null),
      setProperty: (k, v) => { props[k] = v; },
      deleteProperty: (k) => { delete props[k]; },
    })},
    SpreadsheetApp: { openById: () => ss },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (t) => ({ setMimeType: () => ({ getContent: () => t }) }),
    },
    Logger: { log: (m) => logs.push(m) },
  };
  const src = readFileSync(CODE_GS, 'utf8');
  const keys = Object.keys(globals);
  const fn = new Function(...keys, src + '\nreturn { doPost, doGet, rebuildPerTestSheets };');
  return { api: fn(...keys.map(k => globals[k])), ss, logs };
}
export const post = (api, obj) => JSON.parse(api.doPost({ postData: { contents: JSON.stringify(obj) } }).getContent());
export const get  = (api) => JSON.parse(api.doGet().getContent());
