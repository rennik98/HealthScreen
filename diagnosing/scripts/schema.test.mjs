/**
 * ทดสอบการแปลงข้อมูลระหว่างแอปกับ Google Sheets — รันด้วย `npm run test:schema`
 *
 * ไม่ต้องต่อเน็ต ไม่ต้อง deploy อะไร: จำลอง doPost/doGet ของ apps-script/Code.gs
 * (รวมพฤติกรรมสร้างคอลัมน์ใหม่อัตโนมัติ) แล้ววิ่ง round-trip ผ่าน sheetSchema.js จริง
 *
 * ถ้าแก้ sheetSchema.js หรือ Code.gs แล้ว ให้รันไฟล์นี้ก่อนเสมอ
 */
import { toSheetRow, fromSheetRow, COL, newResultId, parseThaiDatetime } from '../src/shared/sheetSchema.js';

/** จำลอง Sheet + Apps Script: จับคู่ key กับหัวคอลัมน์ ไม่มีก็ต่อคอลัมน์ใหม่ */
function makeSheet(headers = []) {
  const state = { headers: [...headers], rows: [] };
  return {
    doPost(payload) {
      const missing = Object.keys(payload).filter(k => k && !state.headers.includes(k));
      state.headers.push(...missing);
      state.rows.push(state.headers.map(h => payload[h] ?? ''));
    },
    doGet() {
      return state.rows.map(r => {
        const o = {};
        state.headers.forEach((h, i) => { if (h) o[h] = r[i]; });
        return o;
      });
    },
    headers: () => state.headers,
  };
}

let pass = 0;
const failures = [];
const check = (name, cond) => cond ? pass++ : failures.push(name);

// ── 1. รายการใหม่: เขียนลง Sheet แล้วอ่านกลับต้องได้ค่าเดิมครบ ────────────
const sheet = makeSheet();
const record = {
  id: newResultId(), hn: 'HN-1', name: 'สมชาย ใจดี', age: 72, gender: 'ชาย',
  type: 'TAI (ภาวะพึ่งพิง)', totalScore: 14, maxScore: 20, impaired: true,
  resultText: 'C3 – มีปัญหาสุขภาพจิต การกิน และการขับถ่าย (สปสช. กลุ่ม 2)',
  datetime: '15 สิงหาคม 2569 17:02', duration: 0,
  breakdown: { 'TAI กลุ่ม': 'C3', 'TAI คะแนนรวม': '14 / 20' },
};
sheet.doPost(toSheetRow(record));
const back = fromSheetRow(sheet.doGet()[0]);
check('id คงเดิม (ใช้จับคู่รายการ)',            back.id === record.id);
check('impaired อ่านจากคอลัมน์จริง',             back.impaired === true);
check('breakdown กลับมาครบ (ดูข้ามเครื่องได้)',  back.breakdown['TAI กลุ่ม'] === 'C3');
check('resultText คงเดิม',                       back.resultText === record.resultText);
check('วันที่ไทยไม่เพี้ยน',                       back.datetime === record.datetime);
check('คะแนนเป็นตัวเลข ไม่ใช่สตริง',              back.totalScore === 14 && back.maxScore === 20);

// ── 2. ผลปกติต้องไม่ถูกคำในข้อความหลอกให้กลายเป็นผิดปกติ ─────────────────
const s2 = makeSheet();
s2.doPost(toSheetRow({ ...record, impaired: false, resultText: 'ไม่มีอาการซึมเศร้า' }));
check('impaired=false ไม่ถูก keyword หลอก', fromSheetRow(s2.doGet()[0]).impaired === false);

// ── 3. แถวเก่าก่อนเปลี่ยน schema ต้องยังอ่านได้ (migration) ───────────────
const legacyRow = {
  [COL.name]: 'สมหญิง', [COL.type]: 'Depression (2Q/9Q)',
  [COL.totalScore]: 15, [COL.maxScore]: 27,
  [COL.resultText]: 'ซึมเศร้าระดับปานกลาง',
  [COL.datetime]: '2026-08-01T09:30:00.000Z', [COL.duration]: 0,
};
const legacy = fromSheetRow(legacyRow);
check('แถวเก่า: เดา impaired จากข้อความได้',   legacy.impaired === true);
check('แถวเก่า: ไม่มี id ก็ไม่พัง',             legacy.id === '');
check('แถวเก่า: breakdown ว่างแทนที่จะ throw',  Object.keys(legacy.breakdown).length === 0);
check('แถวเก่า: วันที่ ISO → วันที่ไทย',        /^1 สิงหาคม 2569/.test(legacy.datetime));
check('แถวเก่า: ผลปกติไม่ถูกตีเป็นผิดปกติ',
  fromSheetRow({ ...legacyRow, [COL.resultText]: 'ไม่มีอาการซึมเศร้า' }).impaired === false);

// ── 4. เพิ่มฟิลด์ใหม่ = คอลัมน์โผล่เอง โดยไม่ต้องแก้ Apps Script ──────────
const before = sheet.headers().length;
sheet.doPost({ ...toSheetRow(record), 'ผู้ประเมิน': 'พยาบาล ก' });
check('คอลัมน์ใหม่ถูกสร้างอัตโนมัติ',
  sheet.headers().includes('ผู้ประเมิน') && sheet.headers().length === before + 1);
check('แถวเดิมไม่พังหลังมีคอลัมน์เพิ่ม', fromSheetRow(sheet.doGet()[0]).name === 'สมชาย ใจดี');

// ── 5. ข้อมูลเสียหายต้องไม่ทำหน้าเว็บล่ม ────────────────────────────────
check('breakdown ที่ไม่ใช่ JSON → คืน {}',
  Object.keys(fromSheetRow({ ...legacyRow, [COL.breakdown]: '{ไม่ใช่ json' }).breakdown).length === 0);
check('แถวว่างเปล่าไม่ throw', fromSheetRow({}).name === '');

// ── 6. วันเวลา — ต้องเช็ค "ค่าที่ได้" ไม่ใช่แค่ "แปลงได้ไหม" ─────────────
// เทสต์เดิมเช็คแค่ !== undefined จึงไม่จับกรณีที่แปลงได้แต่ปีเพี้ยน (ขึ้น 3112 บน Safari)
check('วันที่ไทยได้ค่าตรงเป๊ะ (วัน/เดือน/ปี/เวลา)',
  parseThaiDatetime('15 สิงหาคม 2569 18:09') === new Date(2026, 7, 15, 18, 9).getTime());
check('อีกเดือนก็ต้องตรง ไม่ใช่ตกไปเดือนแรก',
  parseThaiDatetime('28 มิถุนายน 2569 16:47') === new Date(2026, 5, 28, 16, 47).getTime());
check('วันที่ไทยแบบไม่มีเวลา',
  parseThaiDatetime('1 มกราคม 2570') === new Date(2027, 0, 1, 0, 0).getTime());
check('อ่านวันที่ ISO ได้',          parseThaiDatetime('2026-06-28T16:47:00.000Z') !== undefined);
check('ค่าที่อ่านไม่ออกคืน undefined', parseThaiDatetime('ไม่ใช่วันที่') === undefined);
check('ค่าว่างคืน undefined',        parseThaiDatetime('') === undefined);
check('สิงหาคม > มิถุนายน ปีเดียวกัน',
  parseThaiDatetime('15 สิงหาคม 2569 18:09') > parseThaiDatetime('28 มิถุนายน 2569 19:43'));
check('เวลาในวันเดียวกันเรียงถูก',
  parseThaiDatetime('28 มิถุนายน 2569 19:43') > parseThaiDatetime('28 มิถุนายน 2569 13:51'));
check('แปลงไปกลับแล้วได้สตริงเดิม ไม่บวก พ.ศ. ซ้ำ',
  fromSheetRow({ [COL.datetime]: '28 มิถุนายน 2569 16:47' }).datetime === '28 มิถุนายน 2569 16:47');
check('ISO ที่ปีเป็น พ.ศ. อยู่แล้ว ต้องไม่กลายเป็น 3112',
  fromSheetRow({ [COL.datetime]: '2569-08-15T18:09:00' }).datetime === '15 สิงหาคม 2569 18:09');
check('ไม่มีทางแสดงปีเกิน 2600',
  ['15 สิงหาคม 2569 18:09', '2026-08-15T18:09:00', '2569-08-15T18:09:00']
    .every(v => Number(fromSheetRow({ [COL.datetime]: v }).datetime.split(' ')[2]) < 2600));
check('fromSheetRow แนบ timestamp มาให้เรียงได้',
  typeof fromSheetRow({ [COL.datetime]: '28 มิถุนายน 2569 16:47' }).timestamp === 'number');

failures.forEach(f => console.log('  ✗ ' + f));
console.log(`\n${pass} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
