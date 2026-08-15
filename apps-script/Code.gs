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
 * ── การติดตั้ง ────────────────────────────────────────────────
 * 1. Apps Script → Project Settings → Script Properties เพิ่ม
 *      SPREADSHEET_ID = id ของ Google Sheet (ส่วนกลางของ URL)
 *      SHEET_NAME     = ชื่อแท็บ เช่น Result   (ไม่ใส่ = ใช้ "Result")
 * 2. Deploy → New deployment → type: Web app
 *      Execute as        : Me
 *      Who has access    : Anyone            ← ถ้าไม่ใช่ Anyone จะได้หน้า login แทน JSON
 * 3. คัดลอก URL /exec ไปใส่ VITE_SCRIPT_URL ใน diagnosing/.env แล้ว build ใหม่
 */

var PROPS = PropertiesService.getScriptProperties();

function getSheet_() {
  var id = PROPS.getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('ยังไม่ได้ตั้ง Script Property: SPREADSHEET_ID');
  var name = PROPS.getProperty('SHEET_NAME') || 'Result';
  var ss = SpreadsheetApp.openById(id);
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
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

/** บันทึกผลการทดสอบ 1 รายการ — body เป็น JSON ที่ key คือชื่อหัวคอลัมน์ตรง ๆ */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // กันสองเครื่องบันทึกพร้อมกันแล้วคอลัมน์/แถวชนกัน
    lock.waitLock(20000);

    if (!e || !e.postData || !e.postData.contents) throw new Error('ไม่มีข้อมูลที่ส่งมา');
    var data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');

    var sh = getSheet_();
    var headers = getHeaders_(sh);

    // key ที่ยังไม่มีหัวคอลัมน์ → ต่อคอลัมน์ใหม่ท้ายตาราง (นี่คือส่วนที่ทำให้ไม่ต้องแก้สคริปต์อีก)
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

    return json_({ success: true });
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
