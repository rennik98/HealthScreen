import { loadGas, post, get } from './gas-harness.mjs';

let pass = 0; const fails = [];
const check = (n, ok) => ok ? pass++ : fails.push(n);

const { api, ss, logs } = loadGas({ SPREADSHEET_ID: 'x', SHEET_NAME: 'ชีทรวม' }, ['ชีทรวม']);

const rec = (id, type, name) => ({ 'ID': id, 'ชื่อ-นามสกุล': name, 'ประเภทแบบทดสอบ': type, 'คะแนนรวม': 5 });

// 1. แบบทดสอบใหม่ → สร้างแท็บให้
check('โพสต์แรกสำเร็จ', post(api, rec('a1', 'Mini-Cog', 'สมชาย')).success === true);
check('สร้างแท็บ "Mini-Cog" อัตโนมัติ', ss.getSheetByName('Mini-Cog') !== null);
check('แท็บย่อยมีหัวตาราง + 1 แถว', ss.getSheetByName('Mini-Cog').getLastRow() === 2);

// 2. แบบทดสอบเดิม → ต่อท้ายแท็บเดิม ไม่สร้างใหม่
const tabsBefore = ss.getSheets().length;
post(api, rec('a2', 'Mini-Cog', 'สมหญิง'));
check('โพสต์ซ้ำชนิดเดิมไม่สร้างแท็บใหม่', ss.getSheets().length === tabsBefore);
check('แท็บเดิมได้แถวที่ 2', ss.getSheetByName('Mini-Cog').getLastRow() === 3);

// 3. แบบทดสอบอื่น → แท็บใหม่อีกอัน
post(api, rec('b1', 'TAI (ภาวะพึ่งพิง)', 'อูมามิ'));
check('แบบทดสอบใหม่ได้แท็บของตัวเอง', ss.getSheetByName('TAI (ภาวะพึ่งพิง)') !== null);

// 4. ชื่อที่มี / ต้องถูกแปลงให้ Sheets ยอมรับ
post(api, rec('c1', 'Depression (2Q/9Q)', 'จืด'));
check('ชื่อที่มี "/" ถูกแทนด้วย "-"', ss.getSheetByName('Depression (2Q-9Q)') !== null);

// 5. ชีทรวมต้องมีครบทุกแถว และหน้าเว็บอ่านจากที่นี่ที่เดียว
const all = get(api);
check('ชีทรวมมีครบ 4 แถว', all.data.length === 4);
check('ไม่มีข้อมูลซ้ำจากการแยกแท็บ', all.data.filter(r => r['ID'] === 'a1').length === 1);
check('ชีทรวมไม่ถูกนับเป็นแท็บย่อย', ss.getSheetByName('ชีทรวม').getLastRow() === 5);

// 6. ปิดการแยกแท็บได้
const two = loadGas({ SPREADSHEET_ID: 'x', SHEET_NAME: 'รวม', SPLIT_BY_COLUMN: '-' }, ['รวม']);
post(two.api, rec('d1', 'TMSE', 'เค็ม'));
check('ตั้ง "-" แล้วไม่แยกแท็บ', two.ss.getSheets().length === 1);

// 7. ไม่ระบุประเภท → ลงแค่ชีทรวม ไม่พัง
const three = loadGas({ SPREADSHEET_ID: 'x', SHEET_NAME: 'รวม' }, ['รวม']);
check('ไม่มีประเภทก็ยังบันทึกได้', post(three.api, { 'ID': 'e1', 'ชื่อ-นามสกุล': 'ไม่ระบุ' }).success === true);
check('ไม่สร้างแท็บชื่อว่าง', three.ss.getSheets().length === 1);

// 8. เครื่องมือกระจายข้อมูลเก่า
api.rebuildPerTestSheets();
check('rebuild ไม่ทำข้อมูลซ้ำ (รันซ้ำได้)', ss.getSheetByName('Mini-Cog').getLastRow() === 3);
check('rebuild เขียน log ผลลัพธ์', logs.length > 0 && logs[0].indexOf('Mini-Cog') !== -1);

fails.forEach(f => console.log('  ✗ ' + f));
console.log(`\n${pass} passed, ${fails.length} failed`);
console.log('\nแท็บทั้งหมดหลังทดสอบ:', ss.getSheets().map(s => s.getName()).join(' | '));
process.exit(fails.length ? 1 : 0);
