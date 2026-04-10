import React, { useState } from 'react';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

const EYE_COLOR = '#7c3aed';
const EYE_BG = '#f5f3ff';
const EYE_BORDER = '#c4b5fd';

// ── Snellen rows ──
const SNELLEN_ROWS = [
  { row: 1, snellen: '20/200', metric: '6/60', chars: ['8', '5'] },
  { row: 2, snellen: '20/100', metric: '6/30', chars: ['2', '9', '3'] },
  { row: 3, snellen: '20/70',  metric: '6/21', chars: ['8', '7', '5', '4'] },
  { row: 4, snellen: '20/50',  metric: '6/15', chars: ['6', '3', '9', '5', '2'] },
  { row: 5, snellen: '20/40',  metric: '6/12', chars: ['4', '2', '8', '3', '5', '6'], highlight: true },
  { row: 6, snellen: '20/30',  metric: '6/9',  chars: ['3', '7', '4', '6', '2', '8', '5'] },
  { row: 7, snellen: '20/20',  metric: '6/6',  chars: ['7', '2', '6', '4', '7', '9', '3'] },
];

const Section = ({ num, title, children }) => (
  <div style={{
    background: 'white', border: `1.5px solid ${EYE_COLOR}33`,
    borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: EYE_COLOR }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: EYE_BG, border: `1.5px solid ${EYE_COLOR}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: EYE_COLOR, flexShrink: 0 }}>{num}</div>
      <h2 style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', lineHeight: 1.3 }}>{title}</h2>
    </div>
    {children}
  </div>
);

const EyeToggle = ({ side, val, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontSize: 11, color: 'var(--mint-muted)', width: 30, textAlign: 'center', flexShrink: 0 }}>{side}</span>
    {[
      [0, 'ไม่ใช่', '#065f46', '#f0fdf9', '#6ee7d5'],
      [1, 'ใช่', '#dc2626', '#fff1f1', '#fca5a5'],
    ].map(([v, label, col, bg, border]) => (
      <button key={v} onClick={() => onChange(v)} style={{
        flex: 1, padding: '7px 8px', borderRadius: 9, fontSize: 12, fontWeight: 700,
        border: `1.5px solid ${val === v ? border : 'var(--mint-border)'}`,
        background: val === v ? bg : 'var(--mint-surface2)',
        color: val === v ? col : 'var(--mint-muted)',
        cursor: 'pointer', transition: 'all 0.18s',
      }}>{val === v ? (v === 1 ? '⚠️ ' : '✓ ') : ''}{label}</button>
    ))}
  </div>
);

// ── Main component ──
export default function EyeHealthQuiz({ onBack, onComplete, patient }) {
  const [phase, setPhase] = useState('screening'); // 'screening' | 'snellen' | 'done'

  // Screening answers: each item has left/right
  const [screen, setScreen] = useState({
    q1: { left: null, right: null },  // distant vision
    q2: { left: null, right: null },  // near vision
    q3: { left: null, right: null },  // cataract
    q4: { left: null, right: null },  // glaucoma
    q5: { left: null, right: null },  // AMD
  });

  // Snellen results
  const [snellen, setSnellen] = useState({
    rightRow: null,
    leftRow: null,
    rightWorse: null,
    leftWorse: null,
  });

  const [done, setDone] = useState(false);

  const setSide = (q, side, val) => setScreen(prev => ({ ...prev, [q]: { ...prev[q], [side]: val } }));

  const hasVisionProblem = Object.values(screen).some(v => v.left === 1 || v.right === 1);

  const q1Items = [
    { key: 'q1', label: '1. สายตาระยะไกล', bold: 'นับนิ้วในระยะ 3 เมตร ได้ถูกต้องน้อยกว่า 3 ใน 4 ครั้ง', note: '(ถ้าใช้แว่นสายตาอยู่แล้ว ให้สวมแว่นขณะทดสอบ)' },
    { key: 'q2', label: '2. สายตาระยะใกล้', bold: 'อ่านหนังสือพิมพ์หน้าหนึ่งในระยะ 1 ฟุตไม่ได้', note: '(ถ้าใช้แว่นสายตาอยู่แล้ว ให้สวมแว่นขณะทดสอบ)' },
    { key: 'q3', label: '3. ต้อกระจก', bold: 'ปิดตาดูทีละข้าง พบว่าตามัวคล้ายมีหมอกบัง' },
    { key: 'q4', label: '4. ต้อหิน', bold: 'ปิดตาดูทีละข้าง พบว่ามองเห็นชัดแต่ตรงกลาง ไม่เห็นรอบข้าง หรือมักเดินชนประตู สิ่งของบ่อยๆ' },
    { key: 'q5', label: '5. จอตาเสื่อมเนื่องจากอายุ', bold: 'ปิดตาดูทีละข้าง พบว่ามองเห็นจุดดำกลางภาพ หรือเห็นภาพบิดเบี้ยว' },
  ];

  const getSnellenResult = (row) => {
    if (row === null) return null;
    return row < 5 ? 'refer' : 'normal';
  };

  const rightResult = getSnellenResult(snellen.rightRow);
  const leftResult = getSnellenResult(snellen.leftRow);
  const snellenRefer = (snellen.rightWorse === true) || (snellen.leftWorse === true) ||
    rightResult === 'refer' || leftResult === 'refer';

  const overallRefer = hasVisionProblem || snellenRefer;

  const handleFinishScreening = () => {
    // เช็คว่าทำคัดกรองครบทั้ง 5 ข้อ (ซ้ายและขวา) หรือยัง
    const isScreenComplete = Object.values(screen).every(q => q.left !== null && q.right !== null);
    
    if (!isScreenComplete) {
      alert('⚠️ กรุณาประเมินการคัดกรองเบื้องต้นให้ครบทั้ง "ตาซ้าย" และ "ตาขวา" ในทุกข้อครับ');
      return;
    }

    if (hasVisionProblem) { setPhase('snellen'); }
    else { setPhase('done'); setDone(true); finishAll(); }
  };

  const handleFinishSnellen = () => {
    // เช็คว่าประเมินตาขวาและตาซ้ายเรียบร้อยแล้ว (เลือกระดับสายตา หรือ เลือกสายตาแย่ลง อย่างใดอย่างหนึ่ง)
    const rightDone = snellen.rightRow !== null || snellen.rightWorse !== null;
    const leftDone = snellen.leftRow !== null || snellen.leftWorse !== null;

    if (!rightDone || !leftDone) {
      alert('⚠️ กรุณาบันทึกผล Snellen Chart ให้ครบทั้ง "ตาซ้าย" และ "ตาขวา" ก่อนครับ');
      return;
    }

    setPhase('done');
    setDone(true);
    finishAll();
  };

  const finishAll = () => {
    if (onComplete) {
      // Helper สำหรับจัด Format ข้อมูลลง Sheet ให้สวยงาม
      const formatAns = (val) => val === 1 ? 'พบปัญหา' : val === 0 ? 'ปกติ' : 'ไม่ได้ตรวจ';

      onComplete({
        type: 'Eye Health',
        totalScore: overallRefer ? 0 : 1,
        maxScore: 1,
        impaired: overallRefer,
        duration: 0,
        // ส่งข้อความแปลผลไปที่ Sheet โดยตรง (ต้องแก้ Apps Script รองรับ resultText ตามที่แนะนำไปก่อนหน้า)
        resultText: overallRefer ? 'ควรส่งต่อจักษุแพทย์' : 'ปกติ',
        breakdown: {
          "1. สายตาระยะไกล (ซ้าย)": formatAns(screen.q1.left),
          "1. สายตาระยะไกล (ขวา)": formatAns(screen.q1.right),
          "2. สายตาระยะใกล้ (ซ้าย)": formatAns(screen.q2.left),
          "2. สายตาระยะใกล้ (ขวา)": formatAns(screen.q2.right),
          "3. ต้อกระจก (ซ้าย)": formatAns(screen.q3.left),
          "3. ต้อกระจก (ขวา)": formatAns(screen.q3.right),
          "4. ต้อหิน (ซ้าย)": formatAns(screen.q4.left),
          "4. ต้อหิน (ขวา)": formatAns(screen.q4.right),
          "5. จอตาเสื่อม (ซ้าย)": formatAns(screen.q5.left),
          "5. จอตาเสื่อม (ขวา)": formatAns(screen.q5.right),
          
          "Snellen ตาขวา (อ่านได้แถวที่)": snellen.rightRow !== null ? (snellen.rightRow === 0 ? 'อ่านไม่ได้เลย' : snellen.rightRow) : 'ไม่ได้ตรวจ',
          "Snellen ตาซ้าย (อ่านได้แถวที่)": snellen.leftRow !== null ? (snellen.leftRow === 0 ? 'อ่านไม่ได้เลย' : snellen.leftRow) : 'ไม่ได้ตรวจ',
          "ตาขวารู้สึกสายตาแย่ลง": snellen.rightWorse ? 'ใช่' : 'ไม่ใช่/ไม่ได้ตรวจ',
          "ตาซ้ายรู้สึกสายตาแย่ลง": snellen.leftWorse ? 'ใช่' : 'ไม่ใช่/ไม่ได้ตรวจ',
        },
      });
    }
  };

  /* ── Done Screen ── */
  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,250,248,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cross s={14} c={EYE_COLOR} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>สุขภาวะทางตา — ผลการประเมิน</span>
          {patient && (
            <span style={{ fontSize: 11, color: EYE_COLOR, fontWeight: 600, background: EYE_BG, padding: '2px 8px', borderRadius: 20, border: '1px solid var(--mint-border)', marginLeft: 4, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {patient.name} · {patient.age} ปี
            </span>
          )}
        </div>
        <div style={{ flex: 1, maxWidth: 520, margin: '0 auto', width: '100%', padding: '28px 16px' }}>
          {patient && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: EYE_BG, border: '1px solid var(--mint-border)', borderRadius: 14, marginBottom: 20 }}>
              <span style={{ fontSize: 18 }}>👤</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</p>
                <p style={{ fontSize: 12, color: 'var(--mint-muted)' }}>อายุ {patient.age} ปี</p>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: EYE_COLOR, fontWeight: 700, background: 'white', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--mint-border)', flexShrink: 0 }}>✅ บันทึกแล้ว</div>
            </div>
          )}

          <div style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 22, background: overallRefer ? '#fff7ed' : '#f0fdf9', border: `1.5px solid ${overallRefer ? '#fcd34d' : '#6ee7d5'}` }}>
            <p style={{ fontWeight: 800, fontSize: 16, color: overallRefer ? '#92400e' : '#065f46', marginBottom: 6 }}>
              {overallRefer ? '⚠️ พบปัญหาการมองเห็น — ควรส่งต่อแพทย์' : '✅ ไม่พบปัญหาการมองเห็น'}
            </p>
            <p style={{ fontSize: 13, color: overallRefer ? '#b45309' : '#047857', lineHeight: 1.6 }}>
              {overallRefer
                ? 'ส่งต่อให้แพทย์ตรวจวินิจฉัยเพื่อยืนยันผลและทำการรักษา'
                : 'ไม่พบสัญญาณผิดปกติทางการมองเห็น — ติดตามซ้ำตามแผน'}
            </p>
          </div>

          {/* Screening summary */}
          <div style={{ background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>การคัดกรองสุขภาวะทางตา</p>
            {q1Items.map(({ key, label }) => {
              const lv = screen[key].left;
              const rv = screen[key].right;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px 12px', background: (lv === 1 || rv === 1) ? '#fff7ed' : '#f0fdf9', border: `1px solid ${(lv === 1 || rv === 1) ? '#fcd34d88' : '#6ee7d588'}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 14 }}>{(lv === 1 || rv === 1) ? '⚠️' : '✓'}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--mint-text2)' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {[['ซ้าย', lv], ['ขวา', rv]].map(([side, v]) => (
                      <span key={side} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: v === 1 ? '#fef3c7' : v === 0 ? '#f0fdf9' : 'var(--mint-surface2)', color: v === 1 ? '#92400e' : v === 0 ? '#065f46' : 'var(--mint-muted)' }}>
                        {side}: {v === 1 ? '⚠️' : v === 0 ? '✓' : '—'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Snellen summary */}
          {(snellen.rightRow !== null || snellen.leftRow !== null || snellen.rightWorse || snellen.leftWorse) && (
            <div style={{ background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 18, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>ผล Snellen Chart</p>
              {[['ตาขวา', snellen.rightRow, snellen.rightWorse], ['ตาซ้าย', snellen.leftRow, snellen.leftWorse]].map(([side, row, worse]) => {
                if (row === null && !worse) return null;
                const rowData = row ? SNELLEN_ROWS.find(r => r.row === row) : null;
                const refer = worse || (row && row < 5);
                return (
                  <div key={side} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '10px 12px', background: refer ? '#fff7ed' : '#f0fdf9', border: `1px solid ${refer ? '#fcd34d88' : '#6ee7d588'}`, borderRadius: 12 }}>
                    <span style={{ fontSize: 16 }}>{refer ? '⚠️' : '✓'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)' }}>{side}</p>
                      {rowData && <p style={{ fontSize: 11, color: 'var(--mint-muted)' }}>แถวที่ {row}: {rowData.snellen} / {rowData.metric}</p>}
                      {worse && <p style={{ fontSize: 11, color: '#b45309' }}>รู้สึกว่าสายตาแย่ลง</p>}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: refer ? '#dc2626' : '#065f46', flexShrink: 0 }}>
                      {refer ? 'ส่งต่อ' : 'ปกติ'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={onBack} style={{ width: '100%', padding: 13, background: `linear-gradient(135deg,${EYE_COLOR},#6d28d9)`, color: 'white', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            ← กลับหน้าหลัก
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--mint-muted)', padding: 14, background: 'white', borderTop: '1px solid var(--mint-border2)' }}>
          ที่มา: คณะกรรมการพัฒนาเครื่องมือคัดกรองและประเมินสุขภาพผู้สูงอายุ กระทรวงสาธารณสุข พ.ศ.2564
        </div>
      </div>
    );
  }

  /* ── Snellen Chart Phase ── */
  if (phase === 'snellen') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,250,248,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setPhase('screening')} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cross s={14} c={EYE_COLOR} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>Snellen Chart</span>
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Instructions */}
          <div style={{ background: EYE_BG, border: `1.5px solid ${EYE_BORDER}`, borderRadius: 16, padding: '16px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: EYE_COLOR, marginBottom: 6 }}>📋 วิธีการทดสอบ Snellen Chart</p>
            <ul style={{ fontSize: 12, color: '#4c1d95', lineHeight: 1.9, paddingLeft: 16 }}>
              <li>ผู้สูงอายุยืน/นั่งห่างจากแผ่นทดสอบ <strong>20 ฟุต (6 เมตร)</strong></li>
              <li>ทดสอบทีละข้าง เริ่มจาก <strong>ตาขวา</strong> ก่อน</li>
              <li>บังตาซ้ายให้มิด ไม่กดทับลูกตา</li>
              <li>อ่านแถวจากบนลงล่าง — แถวสุดท้ายที่อ่านได้ถูกเท่ากับหรือมากกว่าครึ่ง</li>
              <li>บันทึกแถวสุดท้ายที่อ่านได้</li>
            </ul>
          </div>

          {/* Snellen Chart Display */}
          <div style={{ background: 'white', border: `1.5px solid ${EYE_BORDER}`, borderRadius: 20, padding: '20px 16px', boxShadow: 'var(--shadow-md)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: EYE_COLOR, textAlign: 'center', marginBottom: 14 }}>แผ่นทดสอบสายตา Snellen</p>
            <div style={{ background: '#fafafa', border: '1px solid var(--mint-border2)', borderRadius: 14, padding: '16px 12px' }}>
              {SNELLEN_ROWS.map((row) => (
                <div key={row.row} style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                  padding: row.highlight ? '4px 8px' : '2px 8px',
                  borderRadius: row.highlight ? 8 : 0,
                  background: row.highlight ? '#fef3c7' : 'transparent',
                  border: row.highlight ? '1.5px solid #fcd34d' : 'none',
                }}>
                  <span style={{ fontSize: 10, color: 'var(--mint-muted)', width: 42, flexShrink: 0 }}>
                    {row.snellen}
                  </span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: `${Math.max(4, 18 - row.row * 2)}px`, alignItems: 'center' }}>
                    {row.chars.map((c, i) => (
                      <span key={i} style={{
                        fontWeight: 900, color: '#0f2b28', lineHeight: 1,
                        fontSize: `${Math.max(10, 38 - row.row * 4)}px`,
                        fontFamily: 'monospace',
                      }}>{c}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--mint-muted)', width: 36, textAlign: 'right', flexShrink: 0 }}>
                    {row.metric}
                  </span>
                  {row.highlight && <span style={{ fontSize: 9, color: '#92400e', fontWeight: 700, flexShrink: 0 }}>เกณฑ์</span>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', textAlign: 'center', marginTop: 10 }}>
              แถวที่ 5 (20/40 · 6/12) = เกณฑ์ปกติขั้นต่ำ
            </p>
          </div>

          {/* Right eye result */}
          <div style={{ background: 'white', border: `1.5px solid ${EYE_COLOR}33`, borderRadius: 20, padding: '20px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: EYE_COLOR }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 14 }}>👁️ ตาขวา — บันทึกแถวที่อ่านได้</p>
            <p style={{ fontSize: 12, color: 'var(--mint-muted)', marginBottom: 10 }}>กดเลือกแถวสุดท้ายที่ผู้สูงอายุอ่านได้ถูกต้อง</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
              {SNELLEN_ROWS.map(row => (
                <button key={row.row} onClick={() => setSnellen(prev => ({ ...prev, rightRow: row.row }))} style={{
                  padding: '10px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  border: `1.5px solid ${snellen.rightRow === row.row ? (row.row < 5 ? '#fca5a5' : EYE_COLOR) : 'var(--mint-border)'}`,
                  background: snellen.rightRow === row.row ? (row.row < 5 ? '#fff1f1' : EYE_BG) : 'var(--mint-surface2)',
                  color: snellen.rightRow === row.row ? (row.row < 5 ? '#dc2626' : EYE_COLOR) : 'var(--mint-muted)',
                  cursor: 'pointer', transition: 'all 0.18s',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{row.row}</div>
                  <div>{row.snellen}</div>
                  {row.highlight && <div style={{ fontSize: 9, color: row.row < 5 ? 'inherit' : '#7c3aed' }}>เกณฑ์</div>}
                </button>
              ))}
              <button onClick={() => setSnellen(prev => ({ ...prev, rightRow: 0 }))} style={{
                padding: '10px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                border: `1.5px solid ${snellen.rightRow === 0 ? '#fca5a5' : 'var(--mint-border)'}`,
                background: snellen.rightRow === 0 ? '#fff1f1' : 'var(--mint-surface2)',
                color: snellen.rightRow === 0 ? '#dc2626' : 'var(--mint-muted)',
                cursor: 'pointer',
              }}>อ่านไม่ได้</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--mint-text2)', flex: 1 }}>หรือรู้สึกว่าสายตาแย่ลง</span>
              <button onClick={() => setSnellen(prev => ({ ...prev, rightWorse: !prev.rightWorse }))} style={{
                padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                border: `1.5px solid ${snellen.rightWorse ? '#fca5a5' : 'var(--mint-border)'}`,
                background: snellen.rightWorse ? '#fff1f1' : 'white',
                color: snellen.rightWorse ? '#dc2626' : 'var(--mint-muted)',
                cursor: 'pointer',
              }}>
                {snellen.rightWorse ? '⚠️ ใช่' : 'ไม่ใช่'}
              </button>
            </div>
          </div>

          {/* Left eye result */}
          <div style={{ background: 'white', border: `1.5px solid ${EYE_COLOR}33`, borderRadius: 20, padding: '20px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: EYE_COLOR }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 14 }}>👁️ ตาซ้าย — บันทึกแถวที่อ่านได้</p>
            <p style={{ fontSize: 12, color: 'var(--mint-muted)', marginBottom: 10 }}>กดเลือกแถวสุดท้ายที่ผู้สูงอายุอ่านได้ถูกต้อง</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
              {SNELLEN_ROWS.map(row => (
                <button key={row.row} onClick={() => setSnellen(prev => ({ ...prev, leftRow: row.row }))} style={{
                  padding: '10px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  border: `1.5px solid ${snellen.leftRow === row.row ? (row.row < 5 ? '#fca5a5' : EYE_COLOR) : 'var(--mint-border)'}`,
                  background: snellen.leftRow === row.row ? (row.row < 5 ? '#fff1f1' : EYE_BG) : 'var(--mint-surface2)',
                  color: snellen.leftRow === row.row ? (row.row < 5 ? '#dc2626' : EYE_COLOR) : 'var(--mint-muted)',
                  cursor: 'pointer', transition: 'all 0.18s',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{row.row}</div>
                  <div>{row.snellen}</div>
                  {row.highlight && <div style={{ fontSize: 9, color: row.row < 5 ? 'inherit' : '#7c3aed' }}>เกณฑ์</div>}
                </button>
              ))}
              <button onClick={() => setSnellen(prev => ({ ...prev, leftRow: 0 }))} style={{
                padding: '10px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                border: `1.5px solid ${snellen.leftRow === 0 ? '#fca5a5' : 'var(--mint-border)'}`,
                background: snellen.leftRow === 0 ? '#fff1f1' : 'var(--mint-surface2)',
                color: snellen.leftRow === 0 ? '#dc2626' : 'var(--mint-muted)',
                cursor: 'pointer',
              }}>อ่านไม่ได้</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--mint-text2)', flex: 1 }}>หรือรู้สึกว่าสายตาแย่ลง</span>
              <button onClick={() => setSnellen(prev => ({ ...prev, leftWorse: !prev.leftWorse }))} style={{
                padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                border: `1.5px solid ${snellen.leftWorse ? '#fca5a5' : 'var(--mint-border)'}`,
                background: snellen.leftWorse ? '#fff1f1' : 'white',
                color: snellen.leftWorse ? '#dc2626' : 'var(--mint-muted)',
                cursor: 'pointer',
              }}>
                {snellen.leftWorse ? '⚠️ ใช่' : 'ไม่ใช่'}
              </button>
            </div>
          </div>

          {/* Submit Snellen */}
          <div style={{ background: 'white', border: `1.5px solid ${EYE_COLOR}44`, borderRadius: 20, padding: '20px 16px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ padding: '10px 14px', background: snellenRefer ? '#fff7ed' : '#f0fdf9', border: `1px solid ${snellenRefer ? '#fcd34d' : '#6ee7d5'}`, borderRadius: 12, marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: snellenRefer ? '#92400e' : '#065f46' }}>
                {snellenRefer
                  ? '⚠️ อ่านได้น้อยกว่าแถวที่ 5 หรือสายตาแย่ลง — ส่งต่อให้บริการแว่นแก้ไขสายตา'
                  : '✅ อ่านได้แถวที่ 5 ขึ้นไป — สายตาปกติ'}
              </p>
            </div>
            <button onClick={handleFinishSnellen} style={{ width: '100%', padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${EYE_COLOR},#6d28d9)`, color: 'white', border: 'none', cursor: 'pointer' }}>
              ดูผลการประเมิน →
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--mint-muted)', paddingBottom: 20 }}>
            ที่มา: โรงพยาบาลเมตตาประชารักษ์ (วัดไร่ขิง) คู่มือการคัดกรองความผิดปกติทางสายตา 2558
          </p>
        </div>
      </div>
    );
  }

  /* ── Screening Phase ── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* topbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,250,248,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cross s={14} c={EYE_COLOR} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>การคัดกรองสุขภาวะทางตา</span>
          {patient && (
            <span style={{ fontSize: 11, color: EYE_COLOR, fontWeight: 600, background: EYE_BG, padding: '2px 8px', borderRadius: 20, border: '1px solid var(--mint-border)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {patient.name}
            </span>
          )}
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ padding: '12px 16px', background: EYE_BG, border: `1.5px solid ${EYE_BORDER}`, borderRadius: 14 }}>
          <p style={{ fontSize: 13, color: '#4c1d95', lineHeight: 1.7 }}>
            คัดกรองปัญหาการมองเห็น <strong>ระยะไกล-ใกล้</strong> และลักษณะการมองเห็นผิดปกติที่พบบ่อยในผู้สูงอายุ
            ได้แก่ <strong>ต้อกระจก ต้อหิน และจอตาเสื่อม</strong>
          </p>
        </div>

        <Section num="👁️" title="การคัดกรองสุขภาวะทางตา (5 รายการ)">
          <p style={{ fontSize: 12, color: 'var(--mint-muted)', marginBottom: 14 }}>
            ระบุว่าผู้สูงอายุ <strong>ตาซ้าย / ตาขวา</strong> มีอาการดังต่อไปนี้หรือไม่
          </p>
          {q1Items.map(({ key, label, bold, note }) => (
            <div key={key} style={{ background: 'var(--mint-surface2)', border: `1px solid ${(screen[key].left === 1 || screen[key].right === 1) ? '#fcd34d88' : 'var(--mint-border2)'}`, borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 12, color: 'var(--mint-text2)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: note ? 2 : 8 }}>{bold}</p>
              {note && <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 8 }}>{note}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <EyeToggle side="ซ้าย" val={screen[key].left} onChange={v => setSide(key, 'left', v)} />
                <EyeToggle side="ขวา" val={screen[key].right} onChange={v => setSide(key, 'right', v)} />
              </div>
            </div>
          ))}
        </Section>

        {/* Result preview + proceed */}
        <div style={{ background: 'white', border: `1.5px solid ${EYE_COLOR}44`, borderRadius: 20, padding: '20px 16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ padding: '10px 14px', background: hasVisionProblem ? '#fff7ed' : '#f0fdf9', border: `1px solid ${hasVisionProblem ? '#fcd34d' : '#6ee7d5'}`, borderRadius: 12, marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: hasVisionProblem ? '#92400e' : '#065f46' }}>
              {hasVisionProblem
                ? '⚠️ พบปัญหาการมองเห็น — ดำเนินการประเมิน Snellen Chart'
                : '✅ ไม่พบปัญหาการมองเห็น'}
            </p>
          </div>

          <button onClick={handleFinishScreening} style={{
            width: '100%', padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700,
            background: `linear-gradient(135deg,${EYE_COLOR},#6d28d9)`,
            color: 'white', border: 'none', cursor: 'pointer',
          }}>
            {hasVisionProblem ? 'ไปประเมิน Snellen Chart →' : 'ดูผลการประเมิน →'}
          </button>
          <div style={{ height: 8 }} />
          <button onClick={onBack} style={{ width: '100%', padding: 9, background: 'none', border: 'none', color: 'var(--mint-muted)', fontSize: 12, cursor: 'pointer' }}>
            ← กลับหน้าหลัก
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--mint-muted)', paddingBottom: 20 }}>
          ที่มา: คณะกรรมการพัฒนาเครื่องมือคัดกรองและประเมินสุขภาพผู้สูงอายุ กระทรวงสาธารณสุข พ.ศ.2564
        </p>
      </div>
    </div>
  );
}