/**
 * ทดสอบ Code.gs โดย "ไม่ต้อง Deploy" และ "ไม่แตะชีทจริง"
 *
 * วิธีใช้
 *   1. เพิ่มไฟล์นี้ในโปรเจกต์ Apps Script (File → + → Script → ตั้งชื่อ Test)
 *   2. เลือกฟังก์ชัน runSelfTest แล้วกด Run
 *   3. ดูผลที่ View → Logs (Ctrl/Cmd + Enter)
 *
 * มันจะสร้างชีทชั่วคราวชื่อ SELFTEST_<เวลา> ทดสอบ แล้วลบทิ้งพร้อมคืนค่า
 * SHEET_NAME เดิมให้อัตโนมัติ (อยู่ใน finally จึงคืนค่าแม้เทสต์จะพัง)
 *
 * ผ่านหมดแล้วจะลบไฟล์นี้ทิ้งก็ได้ ไม่มีผลต่อการทำงานจริง
 */

function runSelfTest() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  if (!ssId) throw new Error('ยังไม่ได้ตั้ง Script Property: SPREADSHEET_ID');

  var originalName = props.getProperty('SHEET_NAME');
  var stamp = Date.now();
  var tmpName = 'SELFTEST_' + stamp;
  var testType = 'SELFTEST_TYPE_' + stamp;   // ชื่อแท็บย่อยที่ doPost จะสร้าง — ลบทิ้งใน finally
  var ss = SpreadsheetApp.openById(ssId);
  var results = [];
  var check = function (name, ok) { results.push((ok ? '✅ ' : '❌ ') + name); };

  try {
    ss.insertSheet(tmpName);                    // getSheet_() ไม่สร้างแท็บให้แล้ว ต้องสร้างเอง
    props.setProperty('SHEET_NAME', tmpName);

    // 1. ชีทว่าง ต้องได้ data: []
    var empty = JSON.parse(doGet().getContent());
    check('ชีทว่างคืน data ว่าง', empty.success === true && empty.data.length === 0);

    // 2. บันทึก 1 รายการ แล้วอ่านกลับต้องตรง
    var rec = {
      'ID': 'test-0001',
      'ชื่อ-นามสกุล': 'ทดสอบ ระบบ',
      'ประเภทแบบทดสอบ': testType,
      'คะแนนรวม': 14,
      'พบความเสี่ยง': 'ใช่',
      'รายละเอียด (JSON)': '{"TAI กลุ่ม":"C3"}'
    };
    var posted = JSON.parse(post_(rec).getContent());
    check('doPost สำเร็จ', posted.success === true);

    var after = JSON.parse(doGet().getContent());
    check('อ่านกลับได้ 1 แถว', after.data.length === 1);
    check('ค่าตรงกับที่ส่งไป',
      after.data[0]['ID'] === 'test-0001' &&
      after.data[0]['ชื่อ-นามสกุล'] === 'ทดสอบ ระบบ' &&
      after.data[0]['คะแนนรวม'] === 14 &&
      after.data[0]['พบความเสี่ยง'] === 'ใช่');
    check('JSON breakdown ไม่ถูกดัดแปลง',
      after.data[0]['รายละเอียด (JSON)'] === '{"TAI กลุ่ม":"C3"}');

    // 3. ส่งฟิลด์ที่ยังไม่มีคอลัมน์ → ต้องสร้างคอลัมน์ให้เอง (หัวใจของ write-once)
    var sh = ss.getSheetByName(tmpName);
    var colsBefore = sh.getLastColumn();
    var rec2 = {};
    for (var k in rec) rec2[k] = rec[k];
    rec2['ID'] = 'test-0002';
    rec2['ผู้ประเมิน'] = 'พยาบาล ก';                 // ฟิลด์ใหม่ที่ไม่เคยมี
    post_(rec2);

    var after2 = JSON.parse(doGet().getContent());
    check('คอลัมน์ใหม่ถูกสร้างอัตโนมัติ', sh.getLastColumn() === colsBefore + 1);
    check('แถวใหม่มีค่าฟิลด์ใหม่', after2.data[1]['ผู้ประเมิน'] === 'พยาบาล ก');
    check('แถวเก่าไม่พังหลังเพิ่มคอลัมน์',
      after2.data[0]['ชื่อ-นามสกุล'] === 'ทดสอบ ระบบ' && after2.data[0]['ผู้ประเมิน'] === '');

    // 4. ข้อมูลเสียต้องคืน error ไม่ใช่ throw ออกไป
    var bad = JSON.parse(doPost({ postData: { contents: 'ไม่ใช่ json' } }).getContent());
    check('ข้อมูลพังคืน success:false', bad.success === false);

    // 5. ชื่อแท็บผิดต้องฟ้อง ไม่ใช่สร้างแท็บเปล่าแล้วคืนข้อมูลว่าง
    props.setProperty('SHEET_NAME', 'แท็บที่ไม่มีอยู่จริง_' + Date.now());
    var missing = JSON.parse(doGet().getContent());
    check('ชื่อแท็บผิดแล้วฟ้อง error',
      missing.success === false && missing.error.indexOf('ไม่พบแท็บ') !== -1);
    props.setProperty('SHEET_NAME', tmpName);

    // 6. แยกชีทรายแบบทดสอบ — ไม่มีแท็บก็สร้าง มีแล้วก็ต่อท้าย ไม่สร้างซ้ำ
    var sub = ss.getSheetByName(testType);
    check('สร้างแท็บรายแบบทดสอบให้อัตโนมัติ', sub !== null);
    if (sub) {
      check('แท็บย่อยได้ครบทั้ง 2 แถวที่โพสต์ไป', sub.getLastRow() === 3);   // หัวตาราง + 2 แถว
      check('ข้อมูลในแท็บย่อยตรงกับที่ส่ง',
        sub.getRange(2, sub.getRange(1, 1, 1, sub.getLastColumn()).getValues()[0].indexOf('ID') + 1)
          .getValue() === 'test-0001');
    }
    check('ชีทรวมยังมีข้อมูลครบเหมือนเดิม',
      JSON.parse(doGet().getContent()).data.length === 2);

  } finally {
    if (originalName === null) props.deleteProperty('SHEET_NAME');
    else props.setProperty('SHEET_NAME', originalName);
    [tmpName, testType].forEach(function (n) {
      var s = ss.getSheetByName(n);
      if (s) ss.deleteSheet(s);
    });
  }

  var failed = results.filter(function (r) { return r.indexOf('❌') === 0; }).length;
  Logger.log(results.join('\n') + '\n\n' + (results.length - failed) + ' passed, ' + failed + ' failed');
}

function post_(obj) {
  return doPost({ postData: { contents: JSON.stringify(obj) } });
}
