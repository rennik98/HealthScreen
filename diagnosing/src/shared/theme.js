/**
 * ระบบดีไซน์ของ HealthScreen — แหล่งเดียวของ token ทั้งแอป
 *
 * ออกแบบสำหรับ "แท็บเล็ต/มือถือเป็นหลัก" ใช้งานข้างเตียงผู้ป่วย:
 *   - ตัวอักษรฐาน 16px ขึ้นไป อ่านได้ในที่แสงไม่ดี
 *   - ปุ่ม/การ์ดสูงอย่างน้อย 48px ตามเกณฑ์ touch target
 *   - สีของแต่ละหมวดใช้ชุดเดียวกันทั้งการ์ด ผลลัพธ์ และแท็บเกณฑ์
 */

/** ขนาดตัวอักษร — ไล่ระดับชัดเจน ไม่ให้หัวข้อกับคำอธิบายใกล้กันจนแยกไม่ออก */
export const text = {
  display: { fontSize: 'clamp(26px, 6vw, 38px)', lineHeight: 1.25, fontWeight: 800, letterSpacing: '-0.01em' },
  h1:      { fontSize: 'clamp(22px, 5vw, 28px)', lineHeight: 1.3,  fontWeight: 800 },
  h2:      { fontSize: 19, lineHeight: 1.35, fontWeight: 800 },
  h3:      { fontSize: 17, lineHeight: 1.4,  fontWeight: 700 },
  body:    { fontSize: 15, lineHeight: 1.65, fontWeight: 400 },
  bodyStrong: { fontSize: 15, lineHeight: 1.6, fontWeight: 600 },
  small:   { fontSize: 13, lineHeight: 1.55, fontWeight: 400 },
  label:   { fontSize: 12, lineHeight: 1.4, fontWeight: 700, letterSpacing: '0.06em' },
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 };

export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 48 };

/** ความสูงขั้นต่ำของสิ่งที่กดได้ — นิ้วมือ ไม่ใช่เมาส์ */
export const TAP = 48;

export const shadow = {
  sm: '0 1px 3px rgba(13, 90, 82, 0.06)',
  md: '0 4px 16px rgba(13, 90, 82, 0.08)',
  lg: '0 12px 32px rgba(13, 90, 82, 0.12)',
};

/**
 * สีประจำหมวด — ทุกหมวดมี 4 ค่าเท่ากัน ใช้แทนการกระจาย hex ทั่วโค้ด
 *   base   สีหลัก ใช้กับตัวอักษร/ไอคอน (ผ่านคอนทราสต์บนพื้นขาว)
 *   deep   ใช้กับ gradient และตัวหนังสือบนพื้นอ่อน
 *   tint   พื้นอ่อนของไอคอน/ชิป
 *   line   เส้นขอบ
 */
export const palette = {
  teal:   { base: '#0d9488', deep: '#0f766e', tint: '#e6faf7', line: '#a7ece3' },
  amber:  { base: '#c2740a', deep: '#92580a', tint: '#fef6e7', line: '#f4d9a4' },
  indigo: { base: '#4f46e5', deep: '#3730a3', tint: '#eef0fe', line: '#c3c6f7' },
  cyan:   { base: '#0e7490', deep: '#155e75', tint: '#e5f6fb', line: '#a5deef' },
  green:  { base: '#047857', deep: '#065f46', tint: '#e7f7f1', line: '#a3ddc8' },
  rose:   { base: '#be123c', deep: '#9f1239', tint: '#fdeef1', line: '#f6bccb' },
};

/** สีกลางของแอป */
export const ui = {
  bg:       '#f4f8f7',
  surface:  '#ffffff',
  surface2: '#f7fbfa',
  border:   '#dceae7',
  border2:  '#ecf4f2',
  text:     '#0c2723',
  text2:    '#3d5f5a',
  muted:    '#6f8b86',
  warn:     '#b45309',
  warnBg:   '#fff8ec',
  danger:   '#be123c',
  ok:       '#047857',
  okBg:     '#e7f7f1',
};

/** จำกัดจำนวนบรรทัด เพื่อให้การ์ดในกริดสูงเท่ากัน */
export const clamp = (lines) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});
