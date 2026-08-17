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

/** คอลัมน์หลักที่ทุกแบบทดสอบใช้ร่วมกัน — คอลัมน์อื่นในแถวถือเป็นคำตอบรายข้อ */
const FIXED_COLUMNS = new Set(Object.values(COL));

/** สร้าง id ที่ไม่ซ้ำ ใช้จับคู่รายการระหว่างเครื่องกับ Sheets */
export function newResultId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * record ของแอป → คอลัมน์หลัก (ชุดเดียวกันทุกแบบทดสอบ)
 * ชีทรวมเก็บแค่ชุดนี้ คำตอบรายข้ออยู่ในคอลัมน์ JSON ก้อนเดียว
 */
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

/**
 * คำตอบรายข้อ แยกเป็นคอลัมน์ละ 1 ข้อ — ใช้เฉพาะแท็บรายแบบทดสอบ
 * ไม่ลงชีทรวม เพราะรวมทุกแบบทดสอบแล้วจะกว้างเกือบ 200 คอลัมน์
 */
export function toDetailColumns(r) {
  const detail = {};
  for (const [key, value] of Object.entries(r.breakdown ?? {})) {
    const name = String(key).trim();
    if (!name || FIXED_COLUMNS.has(name)) continue;   // อย่าให้ทับคอลัมน์หลัก
    detail[name] = value ?? '';
  }
  return detail;
}

/**
 * ก้อนข้อมูลที่ส่งไป Apps Script
 *   row    → เขียนทุกแท็บ (ชีทรวม + แท็บรายแบบทดสอบ)
 *   detail → เขียนเฉพาะแท็บรายแบบทดสอบ
 * สคริปต์ฝั่ง Sheets รู้จักแค่โครงสร้าง 2 ชั้นนี้ ไม่รู้จักชื่อฟิลด์ใด ๆ
 */
export function toSheetPayload(r) {
  return { row: toSheetRow(r), detail: toDetailColumns(r) };
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

  // ต้องเช็ครูปแบบไทยก่อน new Date() เสมอ — ตัวแปลวันที่ของแต่ละเบราว์เซอร์ไม่เหมือนกัน
  // Safari เดา "15 สิงหาคม 2569 18:09" เป็นวันที่ที่ใช้ได้โดยตีปี 2569 เป็น ค.ศ.
  // (Chrome/Node คืน NaN) ปล่อยให้หลุดไปถึง new Date() เมื่อไหร่ ปีจะเพี้ยนทันที
  const m = s.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const month = THAI_MONTHS.indexOf(m[2]);
    if (month !== -1) {
      let year = Number(m[3]);
      if (year >= 2400) year -= 543;   // พ.ศ. → ค.ศ.
      return new Date(year, month, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0)).getTime();
    }
  }

  const iso = new Date(s);
  return isNaN(iso) ? undefined : iso.getTime();
}

/** Sheets อาจคืนค่าเป็น Date (ISO) หรือสตริงไทยที่แอปเขียนไปเอง — ทำให้เป็นรูปแบบเดียวกัน */
export function formatThaiDatetime(raw) {
  const s = String(raw ?? '');
  if (!s.trim()) return '';
  const ms = parseThaiDatetime(s);
  if (ms === undefined) return s;
  const d = new Date(ms);
  // ปี >= 2400 แปลว่าเป็น พ.ศ. อยู่แล้ว — บวกซ้ำจะได้ 3112 (กันพลาดจากตัวแปลวันที่ที่เพี้ยน)
  const yr = d.getFullYear();
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${yr >= 2400 ? yr : yr + 543} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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

/** ประกอบคำตอบรายข้อจากคอลัมน์ที่ไม่ใช่คอลัมน์หลัก (ใช้เมื่อไม่มีคอลัมน์ JSON) */
function breakdownFromColumns(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    const name = String(key).trim();
    if (!name || FIXED_COLUMNS.has(name)) continue;
    if (value === '' || value === null || value === undefined) continue;
    out[name] = value;
  }
  return out;
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
  const breakdown = safeParseBreakdown(row[COL.breakdown]);
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
    // คอลัมน์ JSON เป็นหลัก ถ้าว่าง/ถูกลบ ค่อยประกอบจากคอลัมน์รายข้อแทน
    breakdown:  Object.keys(breakdown).length ? breakdown : breakdownFromColumns(row),
  };
}
