/**
 * HealthScreen — Google Apps Script backend (write-once)
 *
 * สคริปต์นี้ "ไม่รู้จัก" ฟิลด์ใด ๆ ของแอปเลย มันแค่จับคู่ key ของ JSON ที่ส่งมา
 * กับหัวคอลัมน์ในแถวที่ 1 — ถ้ายังไม่มีหัวคอลัมน์นั้นก็สร้างให้อัตโนมัติ
 *
 * แปลว่า: เพิ่มแบบทดสอบใหม่ / เพิ่มฟิลด์ใหม่ ทำได้จากฝั่ง React อย่างเดียว
 * ไม่ต้องกลับมาแก้และ Deploy สคริปต์นี้ซ้ำอีก
 *
 * schema ทั้งหมดอยู่ที่ diagnosing/src/shared/sheetSchema.js
 *
 * ── การเก็บข้อมูล ─────────────────────────────────────────────
 * แอปส่งมาเป็น { row, detail }
 *   row    = คอลัมน์หลัก ชุดเดียวกันทุกแบบทดสอบ (คำตอบรายข้ออยู่ในคอลัมน์ JSON)
 *   detail = คำตอบรายข้อ แยกคอลัมน์ละ 1 ข้อ
 *
 * ทุกรายการถูกบันทึก 2 ที่:
 *   1. ชีทรวม        — แท็บตาม SHEET_NAME (หรือแท็บแรก) · เขียนแค่ row
 *                       จึงแคบและเท่ากันทุกแบบทดสอบ หน้าเว็บอ่านจากแท็บนี้แท็บเดียว
 *   2. ชีทรายแบบทดสอบ — แท็บที่ชื่อตามค่าในคอลัมน์ SPLIT_BY_COLUMN · เขียน row + detail
 *                       ไม่มีแท็บนั้นก็สร้างให้ มีอยู่แล้วก็ต่อท้ายเลย
 *
 * ส่งมาเป็น object ชั้นเดียวแบบเดิมก็ยังใช้ได้ (ลงเหมือนกันทุกแท็บ)
 *
 * ── การติดตั้ง ────────────────────────────────────────────────
 * 1. Apps Script → Project Settings → Script Properties เพิ่ม
 *      SPREADSHEET_ID   = id ของ Google Sheet (ส่วนกลางของ URL)
 *      SHEET_NAME       = ชื่อแท็บชีทรวม  (ไม่ใส่ = ใช้แท็บแรกของไฟล์)
 *      SPLIT_BY_COLUMN  = หัวคอลัมน์ที่ใช้ตั้งชื่อแท็บย่อย
 *                         (ไม่ใส่ = "ประเภทแบบทดสอบ" · ใส่ "-" = ปิดการแยกแท็บ)
 * 2. Deploy → New deployment → type: Web app
 *      Execute as        : Me
 *      Who has access    : Anyone            ← ถ้าไม่ใช่ Anyone จะได้หน้า login แทน JSON
 * 3. คัดลอก URL /exec ไปใส่ VITE_SCRIPT_URL ใน diagnosing/.env แล้ว build ใหม่
 */

var PROPS = PropertiesService.getScriptProperties();

/**
 * หาแท็บที่จะอ่าน/เขียน
 * ไม่ตั้ง SHEET_NAME → ใช้แท็บแรกของไฟล์ (ปลอดภัยกว่าเดาชื่อ)
 * ตั้งไว้แต่หาไม่เจอ → โยน error พร้อมบอกชื่อแท็บที่มีจริง
 *
 * เวอร์ชันก่อนหน้าใช้ ss.insertSheet(name) เวลาหาไม่เจอ ซึ่งทำให้พิมพ์ชื่อผิดแล้ว
 * ได้แท็บเปล่าใหม่กับข้อมูลว่าง ๆ — ดูเหมือนข้อมูลหายทั้งที่ยังอยู่ครบในแท็บเดิม
 */
function getSheet_() {
  var id = PROPS.getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('ยังไม่ได้ตั้ง Script Property: SPREADSHEET_ID');
  var ss = SpreadsheetApp.openById(id);

  var name = PROPS.getProperty('SHEET_NAME');
  if (!name) return ss.getSheets()[0];

  var sh = ss.getSheetByName(name);
  if (!sh) {
    var available = ss.getSheets().map(function (s) { return s.getName(); }).join(', ');
    throw new Error('ไม่พบแท็บชื่อ "' + name + '" — แท็บที่มีในไฟล์นี้: ' + available);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getHeaders_(sh) {
  if (sh.getLastColumn() === 0) return [];
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) {
    return String(h).trim();
  });
}

/** ต่อ 1 แถวลงแท็บที่ระบุ โดยจับคู่ key กับหัวคอลัมน์ และสร้างคอลัมน์ใหม่ถ้ายังไม่มี */
function appendRow_(sh, data) {
  var headers = getHeaders_(sh);

  var missing = Object.keys(data).filter(function (k) {
    return k && headers.indexOf(k) === -1;
  });
  if (missing.length) {
    sh.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    sh.getRange(1, 1, 1, headers.length + missing.length).setFontWeight('bold');
    headers = headers.concat(missing);
  }

  sh.appendRow(headers.map(function (h) {
    var v = data[h];
    return (v === undefined || v === null) ? '' : v;
  }));
}

/** แปลงค่าในคอลัมน์ให้เป็นชื่อแท็บที่ Google Sheets ยอมรับ — คืน null ถ้าใช้ไม่ได้ */
function sheetNameFor_(value) {
  var name = String(value === undefined || value === null ? '' : value).trim();
  if (!name) return null;
  name = name.replace(/[\[\]\*\/\\\?\:]/g, '-').replace(/\s+/g, ' ').trim();
  if (name.length > 90) name = name.substring(0, 90);   // ลิมิตจริงคือ 100 เผื่อไว้หน่อย
  return name || null;
}

/** หา (หรือสร้าง) แท็บของแบบทดสอบนั้น ๆ */
function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/** บันทึกผลการทดสอบ 1 รายการ — body เป็น JSON ที่ key คือชื่อหัวคอลัมน์ตรง ๆ */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // กันสองเครื่องบันทึกพร้อมกันแล้วคอลัมน์/แถวชนกัน
    lock.waitLock(20000);

    if (!e || !e.postData || !e.postData.contents) throw new Error('ไม่มีข้อมูลที่ส่งมา');
    var data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');

    // รูปแบบ { row, detail }: row ลงทุกแท็บ · detail ลงเฉพาะแท็บรายแบบทดสอบ
    // ถ้าส่งมาแบบ object ชั้นเดียว (เวอร์ชันเก่า) ก็ใช้ทั้งก้อนกับทุกแท็บเหมือนเดิม
    var isEnvelope = data.row && typeof data.row === 'object' && !Array.isArray(data.row);
    var base   = isEnvelope ? data.row : data;
    var detail = (isEnvelope && data.detail && typeof data.detail === 'object' && !Array.isArray(data.detail))
      ? data.detail : {};

    // 1. ชีทรวม — แหล่งข้อมูลหลักที่หน้าเว็บอ่าน ต้องสำเร็จก่อนเสมอ (คอลัมน์หลักเท่านั้น)
    var main = getSheet_();
    appendRow_(main, base);

    // 2. ชีทรายแบบทดสอบ — คอลัมน์หลัก + คำตอบรายข้อ ไม่มีแท็บก็สร้าง มีก็ต่อท้าย
    //    ถ้าพลาดตรงนี้ยังถือว่าบันทึกสำเร็จ เพราะข้อมูลลงชีทรวมไปแล้ว
    var warning = '';
    try {
      var splitCol = PROPS.getProperty('SPLIT_BY_COLUMN') || 'ประเภทแบบทดสอบ';
      if (splitCol !== '-') {
        var tabName = sheetNameFor_(base[splitCol]);
        if (tabName && tabName !== main.getName()) {
          var full = {};
          Object.keys(base).forEach(function (k) { full[k] = base[k]; });
          Object.keys(detail).forEach(function (k) { if (!(k in full)) full[k] = detail[k]; });
          appendRow_(getOrCreateSheet_(main.getParent(), tabName), full);
        }
      }
    } catch (splitErr) {
      warning = 'ลงชีทรวมสำเร็จ แต่แยกชีทรายแบบทดสอบไม่สำเร็จ: ' +
                String(splitErr && splitErr.message ? splitErr.message : splitErr);
    }

    return json_(warning ? { success: true, warning: warning } : { success: true });
  } catch (err) {
    return json_({ success: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/** คืนทุกแถวเป็น object ที่ key คือหัวคอลัมน์ */
function doGet() {
  try {
    var sh = getSheet_();
    if (sh.getLastRow() < 2) return json_({ success: true, data: [] });

    var values = sh.getDataRange().getValues();
    var headers = values.shift().map(function (h) { return String(h).trim(); });

    var data = values
      .filter(function (row) {
        return row.some(function (c) { return c !== '' && c !== null; });   // ข้ามแถวว่าง
      })
      .map(function (row) {
        var o = {};
        headers.forEach(function (h, i) { if (h) o[h] = row[i]; });
        return o;
      });

    return json_({ success: true, data: data });
  } catch (err) {
    return json_({ success: false, error: String(err && err.message ? err.message : err) });
  }
}

/**
 * ── เครื่องมือใช้ครั้งเดียว (ไม่เกี่ยวกับ web app) ─────────────────
 * กระจายข้อมูลเดิมในชีทรวมออกเป็นแท็บรายแบบทดสอบ
 * ใช้ตอนเพิ่งเปิดใช้ฟีเจอร์แยกแท็บ เพื่อให้ข้อมูลเก่าตามมาด้วย
 *
 * วิธีใช้: เลือกฟังก์ชันนี้ใน editor แล้วกด Run → ดูผลที่ View → Logs
 *
 * ⚠️ แท็บรายแบบทดสอบจะถูกล้างแล้วเขียนใหม่ทั้งหมดจากชีทรวม
 *    (ชีทรวมไม่ถูกแตะต้อง) ถ้าเคยแก้อะไรในแท็บย่อยด้วยมือจะหายไป
 *    รันซ้ำได้เรื่อย ๆ ผลลัพธ์เหมือนเดิม ไม่เกิดข้อมูลซ้ำ
 */
function rebuildPerTestSheets() {
  var main = getSheet_();
  var ss = main.getParent();

  var splitCol = PROPS.getProperty('SPLIT_BY_COLUMN') || 'ประเภทแบบทดสอบ';
  if (splitCol === '-') throw new Error('SPLIT_BY_COLUMN ตั้งเป็น "-" อยู่ (ปิดการแยกแท็บ)');

  var values = main.getDataRange().getValues();
  if (values.length < 2) throw new Error('ชีทรวม "' + main.getName() + '" ยังไม่มีข้อมูล');

  var headers = values.shift().map(function (h) { return String(h).trim(); });
  var idx = headers.indexOf(splitCol);
  if (idx === -1) throw new Error('ไม่พบคอลัมน์ "' + splitCol + '" ในชีทรวม');

  // ชีทรวมเก็บคำตอบรายข้อไว้เป็น JSON ก้อนเดียว — แตกกลับเป็นคอลัมน์ตอนกระจายลงแท็บย่อย
  var jsonCol = PROPS.getProperty('DETAIL_JSON_COLUMN') || 'รายละเอียด (JSON)';
  var jsonIdx = headers.indexOf(jsonCol);

  var groups = {};      // ชื่อแท็บ → { cols: [หัวคอลัมน์], rows: [object] }
  values.forEach(function (row) {
    var hasData = row.some(function (c) { return c !== '' && c !== null; });
    if (!hasData) return;
    var name = sheetNameFor_(row[idx]);
    if (!name || name === main.getName()) return;

    var obj = {};
    headers.forEach(function (h, i) { if (h) obj[h] = row[i]; });

    if (jsonIdx !== -1 && row[jsonIdx]) {
      try {
        var detail = JSON.parse(String(row[jsonIdx]));
        if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
          Object.keys(detail).forEach(function (k) {
            var key = String(k).trim();
            if (key && !(key in obj)) obj[key] = detail[k];
          });
        }
      } catch (ignore) {}   // JSON เสีย ก็ข้ามไป เอาเฉพาะคอลัมน์หลัก
    }

    if (!groups[name]) groups[name] = { cols: headers.slice(), rows: [] };
    var g = groups[name];
    Object.keys(obj).forEach(function (k) { if (g.cols.indexOf(k) === -1) g.cols.push(k); });
    g.rows.push(obj);
  });

  var names = Object.keys(groups);
  if (!names.length) {
    Logger.log('ไม่มีแถวไหนระบุ "' + splitCol + '" — ไม่ได้สร้างแท็บใด');
    return;
  }

  var report = names.map(function (name) {
    var g = groups[name];
    var sh = getOrCreateSheet_(ss, name);
    sh.clear();
    sh.getRange(1, 1, 1, g.cols.length).setValues([g.cols]).setFontWeight('bold');
    sh.getRange(2, 1, g.rows.length, g.cols.length).setValues(g.rows.map(function (obj) {
      return g.cols.map(function (c) {
        var v = obj[c];
        return (v === undefined || v === null) ? '' : v;
      });
    }));
    return '  ' + name + ' — ' + g.rows.length + ' แถว · ' + g.cols.length + ' คอลัมน์';
  });

  Logger.log('กระจายข้อมูลจากชีทรวม "' + main.getName() + '" เสร็จแล้ว\n' + report.join('\n'));
}
