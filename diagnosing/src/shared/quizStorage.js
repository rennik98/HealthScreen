/**
 * Helpers for persisting quiz draft state in localStorage.
 * Key format: `quiz_draft_{quizKey}_{patientName}`
 */

function makeKey(quizKey, patientName) {
  return `quiz_draft_${quizKey}_${(patientName || 'anon').replace(/\s+/g, '_')}`;
}

export function loadDraft(quizKey, patientName) {
  try {
    const raw = localStorage.getItem(makeKey(quizKey, patientName));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(quizKey, patientName, state) {
  try {
    localStorage.setItem(makeKey(quizKey, patientName), JSON.stringify(state));
  } catch {
    // storage quota exceeded — ignore
  }
}

export function clearDraft(quizKey, patientName) {
  try {
    localStorage.removeItem(makeKey(quizKey, patientName));
  } catch {}
}

/** Save a completed result locally so breakdown survives a page refresh. */
export function saveLocalResult(record) {
  try {
    const key = 'healthscreen_local_results';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(record);
    // Keep last 500 records to avoid unbounded growth
    if (existing.length > 500) existing.splice(0, existing.length - 500);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {}
}

/** Return all locally stored results (for breakdown recovery). */
export function loadLocalResults() {
  try {
    return JSON.parse(localStorage.getItem('healthscreen_local_results') || '[]');
  } catch {
    return [];
  }
}
