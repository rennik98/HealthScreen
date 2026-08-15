/**
 * แหล่งความจริงแหล่งเดียวของ schema ระหว่างแอปกับ Google Sheets
 *
 * เพิ่ม/แก้ฟิลด์ = แก้ที่ไฟล์นี้ที่เดียว ไม่ต้องแก้ Apps Script
 * (apps-script/Code.gs จะสร้างคอลัมน์ใหม่ให้อัตโนมัติเมื่อเจอ key ที่ยังไม่มีหัวคอลัมน์)
 *
 * ห้ามพิมพ์ชื่อหัวคอลัมน์ตรง ๆ ที่อื่นในโค้ด — ให้เรียกผ่าน COL / toSheetRow / fromSheetRow
 * เพราะสคริปต์ฝั่ง Sheets สร้างคอลัมน์อัตโนมัติ พิมพ์ผิดจะได้คอลัมน์ใหม่เงียบ ๆ แทน error
 */

export const COL = {
  id:         'ID',
  hn:         'HN/รหัสผู้ป่วย',
  name:       'ชื่อ-นามสกุล',
  age:        'อายุ',
  gender:     'เพศ',
  type:       'ประเภทแบบทดสอบ',
  totalScore: 'คะแนนรวม',
  maxScore:   'คะแนนสูงสุด',
  resultText: 'การแปลผล',
  impaired:   'พบความเสี่ยง',
  datetime:   'วันที่/เวลา',
  duration:   'เวลาที่ใช้ (วินาที)',
  breakdown:  'รายละเอียด (JSON)',
};

/** สร้าง id ที่ไม่ซ้ำ ใช้จับคู่รายการระหว่างเครื่องกับ Sheets */
export function newResultId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** record ของแอป → object ที่ key เป็นชื่อหัวคอลัมน์ (ใช้ตอน POST) */
export function toSheetRow(r) {
  return {
    [COL.id]:         r.id ?? '',
    [COL.hn]:         r.hn ?? '',
    [COL.name]:       r.name ?? '',
    [COL.age]:        r.age ?? '',
    [COL.gender]:     r.gender ?? '',
    [COL.type]:       r.type ?? '',
    [COL.totalScore]: r.totalScore ?? '',
    [COL.maxScore]:   r.maxScore ?? '',
    // เก็บข้อความแปลผลไว้ให้คนอ่านรายงานใน Sheet เข้าใจ
    [COL.resultText]: r.resultText ?? (r.impaired ? 'พบปัญหา/บกพร่อง' : 'อยู่ในเกณฑ์ปกติ'),
    // ส่วนนี้ต่างหากที่แอปใช้ตัดสิน — ไม่ต้องเดาจากข้อความอีกต่อไป
    [COL.impaired]:   r.impaired ? 'ใช่' : 'ไม่ใช่',
    [COL.datetime]:   r.datetime ?? '',
    [COL.duration]:   r.duration ?? 0,
    [COL.breakdown]:  JSON.stringify(r.breakdown ?? {}),
  };
}

const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

/**
 * แปลงวันเวลาให้เป็น epoch ms เพื่อใช้เรียง/กรอง — คืน undefined ถ้าอ่านไม่ออก
 * รับได้ทั้ง ISO ที่ Sheets คืนมา และสตริงไทย พ.ศ. ที่แอปเขียนไปเอง
 * ("28 มิถุนายน 2569 16:47" ซึ่ง new Date() แปลไม่ได้)
 */
export function parseThaiDatetime(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return undefined;

  const iso = new Date(s);
  if (!isNaN(iso)) return iso.getTime();

  const m = s.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return undefined;
  const month = THAI_MONTHS.indexOf(m[2]);
  if (month === -1) return undefined;
  let year = Number(m[3]);
  if (year >= 2400) year -= 543;   // พ.ศ. → ค.ศ.
  return new Date(year, month, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0)).getTime();
}

/** Sheets อาจคืนค่าเป็น Date (ISO) หรือสตริงไทยที่แอปเขียนไปเอง — ทำให้เป็นรูปแบบเดียวกัน */
export function formatThaiDatetime(raw) {
  const s = String(raw ?? '');
  if (!s.trim()) return '';
  const ms = parseThaiDatetime(s);
  if (ms === undefined) return s;
  const d = new Date(ms);
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * แถวเก่าที่บันทึกก่อนมีคอลัมน์ "พบความเสี่ยง" ต้องเดาจากข้อความแปลผลเหมือนเดิม
 * ใช้เฉพาะกับข้อมูลเก่า — รายการใหม่อ่านค่าจริงจากคอลัมน์โดยตรง
 */
const LEGACY_IMPAIRED_KEYWORDS = ['บกพร่อง','Impairment','พบปัญหา','ควรส่งต่อ','พบความเสี่ยง','ซึมเศร้า','เสี่ยงฆ่าตัวตาย','เสี่ยงหกล้ม','เสี่ยงต่อภาวะมวลกล้ามเนื้อ','ขาดสารอาหาร','ติดเตียง','ติดบ้าน','เปราะบาง','แนวโน้มภาวะสมองเสื่อม','สปสช. กลุ่ม'];

function legacyImpaired(resultText) {
  // "ไม่มีอาการซึมเศร้า" เคยถูกนับเป็นผิดปกติเพราะมีคำว่า "ซึมเศร้า" อยู่ในนั้น
  if (/^\s*ไม่(มี|พบ)/.test(resultText)) return false;
  return LEGACY_IMPAIRED_KEYWORDS.some(k => resultText.includes(k));
}

function safeParseBreakdown(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(String(raw));
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch {
    return {};
  }
}

/** แถวจาก Sheets → record ของแอป (ใช้ตอน GET) */
export function fromSheetRow(row) {
  const resultText = String(row[COL.resultText] ?? '');
  const impairedCell = String(row[COL.impaired] ?? '').trim();
  return {
    id:         String(row[COL.id] ?? ''),
    hn:         String(row[COL.hn] ?? ''),
    name:       String(row[COL.name] ?? ''),
    age:        row[COL.age],
    gender:     String(row[COL.gender] ?? '-'),
    type:       String(row[COL.type] ?? ''),
    totalScore: Number(row[COL.totalScore]),
    maxScore:   Number(row[COL.maxScore]),
    // คอลัมน์ว่าง = แถวเก่าก่อนเปลี่ยน schema → ถอยไปใช้วิธีเดิม
    impaired:   impairedCell !== '' ? impairedCell === 'ใช่' : legacyImpaired(resultText),
    resultText,
    datetime:   formatThaiDatetime(row[COL.datetime]),
    // เก็บ epoch ไว้ด้วย ไม่งั้นเรียง/กรองตามวันที่ไม่ได้ (แถวจาก Sheets ไม่มี timestamp)
    timestamp:  parseThaiDatetime(row[COL.datetime]),
    duration:   Number(row[COL.duration]) || 0,
    breakdown:  safeParseBreakdown(row[COL.breakdown]),
  };
}
