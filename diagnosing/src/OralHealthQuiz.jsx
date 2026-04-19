import React, { useState } from 'react';

/* ── shared atoms ── */
const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

const ORAL_COLOR = '#0891b2';
const ORAL_BG = '#ecfeff';
const ORAL_BORDER = '#a5f3fc';

const Section = ({ num, title, children }) => (
  <div style={{
    background: 'white', border: `1.5px solid ${ORAL_COLOR}33`,
    borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: ORAL_COLOR }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, background: ORAL_BG,
        border: `1.5px solid ${ORAL_COLOR}44`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 13, fontWeight: 800, color: ORAL_COLOR, flexShrink: 0,
      }}>{num}</div>
      <h2 style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', lineHeight: 1.3 }}>{title}</h2>
    </div>
    {children}
  </div>
);

const YN = ({ val, onChange, yL = 'มี', nL = 'ไม่มี' }) => (
  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
    {[[1, yL, '#ef4444', '#fff1f1', '#fca5a5'],
      [0, nL, ORAL_COLOR, ORAL_BG, ORAL_COLOR]].map(([v, label, col, bg, border]) => (
      <button key={v} onClick={() => onChange(v)} style={{
        flex: 1, padding: '10px 8px', borderRadius: 10, fontSize: 13, fontWeight: 700,
        border: `1.5px solid ${val === v ? border : 'var(--mint-border)'}`,
        background: val === v ? bg : 'var(--mint-surface2)',
        color: val === v ? col : 'var(--mint-muted)',
        cursor: 'pointer', transition: 'all 0.18s', minHeight: 42,
      }}>
        {val === v ? (v === 1 ? '⚠️ ' : '✓ ') : ''}{label}
      </button>
    ))}
  </div>
);

const SubQ = ({ label, val, onChange, yL = 'มี', nL = 'ไม่มี' }) => (
  <div style={{
    background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)',
    borderRadius: 12, padding: '12px 14px', marginBottom: 8,
  }}>
    <p style={{ fontSize: 13, color: 'var(--mint-text2)', fontWeight: 600, lineHeight: 1.5 }}>{label}</p>
    <YN val={val} onChange={onChange} yL={yL} nL={nL} />
  </div>
);

export default function OralHealthQuiz({ onBack, onComplete }) {
  const [q1a, setQ1a] = useState(null); // 1.1 ฟัน/รากฟันผุ
  const [q1b, setQ1b] = useState(null); // 1.2 เหงือกบวม/ฝีหนอง/ฟันโยก
  const [q1c, setQ1c] = useState(null); // 1.3 จำนวนฟันแท้น้อยกว่าเกณฑ์
  const [q2,  setQ2]  = useState(null); // ปัญหาเนื้อเยื่อช่องปาก
  const [q3,  setQ3]  = useState(null); // ปากแห้ง น้ำลายแห้ง
  const [q4,  setQ4]  = useState(null); // สภาพช่องปาก hygiene

  const [done, setDone] = useState(false);

  const needsReferral = q1a === 1 || q1b === 1 || q1c === 1 || q2 === 1 || q3 === 1;
  const poorHygiene   = q4 === 1;

  const handleFinish = () => {
    if ([q1a, q1b, q1c, q2, q3, q4].includes(null)) {
      alert('⚠️ กรุณาประเมินสุขภาพช่องปากให้ครบทุกข้อก่อนกดดูผล');
      return;
    }
    setDone(true);
    if (onComplete) {
      onComplete({
        type: 'Oral Health',
        totalScore: [q1a, q1b, q1c, q2, q3].filter(v => v === 0).length,
        maxScore: 5,
        impaired: needsReferral,
        duration: 0,
        resultText: needsReferral ? 'ควรส่งต่อทันตแพทย์' : 'ปกติ',
        breakdown: {
          "1.1 ฟัน/รากฟันผุที่ไม่สามารถป้องกันหรือให้บริการได้": q1a === 1 ? 'มี' : 'ไม่มี',
          "1.2 เหงือกบวม ฝีหนอง ฟันโยก": q1b === 1 ? 'มี' : 'ไม่มี',
          "1.3 จำนวนฟันแท้น้อยกว่าเกณฑ์": q1c === 1 ? 'ใช่' : 'ไม่ใช่',
          "2. ก้อน รอยแดง รอยขาว แผลเรื้อรัง > 2 สัปดาห์": q2 === 1 ? 'มี' : 'ไม่มี',
          "3. ปากแห้ง/น้ำลายแห้ง": q3 === 1 ? 'มี' : 'ไม่มี',
          "4. สภาพช่องปาก (Oral Hygiene)": q4 === 1 ? 'ไม่สะอาด' : 'สะอาด',
        },
      });
    }
  };

  /* ── Result Screen ── */
  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,250,248,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cross s={14} c={ORAL_COLOR} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>สุขภาพช่องปาก — ผลการประเมิน</span>
        </div>
        <div style={{ flex: 1, maxWidth: 520, margin: '0 auto', width: '100%', padding: '28px 16px' }}>
          <div style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 22, background: needsReferral ? '#fff7ed' : '#f0fdf9', border: `1.5px solid ${needsReferral ? '#fcd34d' : '#6ee7d5'}` }}>
            <p style={{ fontWeight: 800, fontSize: 16, color: needsReferral ? '#92400e' : '#065f46', marginBottom: 6 }}>
              {needsReferral ? '⚠️ ควรส่งต่อทันตแพทย์' : '✅ สุขภาพช่องปากอยู่ในเกณฑ์ดี'}
            </p>
            <p style={{ fontSize: 13, color: needsReferral ? '#b45309' : '#047857', lineHeight: 1.6 }}>
              {needsReferral
                ? 'พบปัญหาสุขภาพช่องปาก — ควรส่งต่อเพื่อรับบริการทางทันตกรรมกับทันตบุคลากร'
                : 'ไม่พบปัญหาสำคัญ — แนะนำการส่งเสริมและป้องกัน'}
            </p>
            {poorHygiene && (
              <p style={{ fontSize: 12, color: '#92400e', marginTop: 8, padding: '6px 10px', background: '#fef3c7', borderRadius: 8 }}>
                🪥 สภาพช่องปากไม่สะอาด — ควรฝึกการแปรงฟันและใช้อุปกรณ์เสริมเพื่อควบคุมคราบจุลินทรีย์
              </p>
            )}
          </div>

          <div style={{ background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 18, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>สรุปผลการตรวจ</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['1.1 ฟัน/รากฟันผุที่ไม่สามารถป้องกันหรือให้บริการได้', q1a],
                ['1.2 เหงือกบวม ฝีหนอง ฟันโยก', q1b],
                ['1.3 จำนวนฟันแท้น้อยกว่าเกณฑ์ (< 20 ซี่ หรือ < 4 คู่สบ)', q1c],
                ['2. ก้อน รอยแดง รอยขาว แผลเรื้อรัง > 2 สัปดาห์', q2],
                ['3. ปากแห้ง / น้ำลายแห้ง', q3],
                ['4. สภาพช่องปาก (Oral Hygiene)', q4],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: val === 1 ? '#fff7ed' : '#f0fdf9', border: `1px solid ${val === 1 ? '#fcd34d88' : '#6ee7d588'}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 14 }}>{val === 1 ? '⚠️' : '✓'}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: val === 1 ? '#92400e' : '#065f46' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onBack} style={{ width: '100%', padding: 13, background: `linear-gradient(135deg,${ORAL_COLOR},#0e7490)`, color: 'white', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            ← กลับหน้าหลัก
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--mint-muted)', padding: 14, background: 'white', borderTop: '1px solid var(--mint-border2)' }}>
          ที่มา: สถาบันทันตกรรม กรมการแพทย์ และสำนักทันตสาธารณสุข กรมอนามัย กระทรวงสาธารณสุข
        </div>
      </div>
    );
  }

  /* ── Quiz Form ── */
  const handleBack = () => {
    if (window.confirm('ออกจากการทดสอบ?\nคำตอบที่ตอบไปแล้วจะถูกบันทึกไว้ชั่วคราว')) {
      onBack();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,250,248,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cross s={14} c={ORAL_COLOR} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>การประเมินสุขภาพช่องปาก</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ═══ 1. ปัญหาการเคี้ยวอาหาร ═══ */}
        <Section num="1" title="ปัญหาการเคี้ยวอาหาร">
          <SubQ
            label="1.1 มีฟัน / รากฟันผุที่ไม่สามารถป้องกันหรือให้บริการได้ หรือไม่"
            val={q1a} onChange={setQ1a} yL="มี" nL="ไม่มี"
          />
          <SubQ
            label="1.2 มีเหงือกบวม ฝีหนอง ฟันโยก หรือไม่"
            val={q1b} onChange={setQ1b} yL="มี" nL="ไม่มี"
          />
          <SubQ
            label="1.3 จำนวนฟันแท้น้อยกว่าเกณฑ์ (อย่างน้อย 20 ซี่ หรือ 4 คู่สบ) หรือไม่"
            val={q1c} onChange={setQ1c} yL="ใช่" nL="ไม่ใช่"
          />
        </Section>

        {/* ═══ 2. ปัญหาเนื้อเยื่อช่องปาก ═══ */}
        <Section num="2" title="ปัญหาเนื้อเยื่อช่องปาก">
          <SubQ
            label="มีก้อน รอยแดง รอยขาว แผลเรื้อรัง นานกว่า 2 สัปดาห์ หรือไม่"
            val={q2} onChange={setQ2} yL="มี" nL="ไม่มี"
          />
        </Section>

        {/* ═══ 3. ปัญหาปากแห้ง น้ำลายแห้ง ═══ */}
        <Section num="3" title="ปัญหาปากแห้ง น้ำลายแห้ง">
          <SubQ
            label="ต้องดื่มน้ำตามเพื่อช่วยกลืนบ่อยครั้ง / มีอาการลิ้นแห้งติดเพดานบ่อย หรือไม่"
            val={q3} onChange={setQ3} yL="มี" nL="ไม่มี"
          />
        </Section>

        {/* ═══ 4. สภาพช่องปาก ═══ */}
        <Section num="4" title="สภาพช่องปาก (Oral Hygiene)">
          <SubQ
            label="สภาพช่องปากสะอาดหรือไม่"
            val={q4} onChange={setQ4} yL="ไม่สะอาด" nL="สะอาด"
          />
        </Section>

        {/* ═══ เกณฑ์การประเมิน ═══ */}
        <div style={{ background: ORAL_BG, border: `1px solid ${ORAL_BORDER}`, borderRadius: 16, padding: '16px 18px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: ORAL_COLOR, marginBottom: 10 }}>เกณฑ์การประเมินและการจัดการ</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', marginBottom: 4 }}>ข้อ 1 – 3:</p>
          <p style={{ fontSize: 12, color: 'var(--mint-text2)', lineHeight: 1.6, marginBottom: 4 }}>• ถ้าประเมินว่า "มี" หรือ "ใช่" ตั้งแต่ 1 ข้อขึ้นไป: ควรส่งต่อเพื่อเข้ารับบริการทางทันตกรรมกับทันตบุคลากร</p>
          <p style={{ fontSize: 12, color: 'var(--mint-text2)', lineHeight: 1.6, marginBottom: 10 }}>• ถ้าประเมินว่า "ไม่มี" หรือ "ไม่ใช่": ควรแนะนำและบริการส่งเสริม ป้องกัน</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', marginBottom: 4 }}>ข้อ 4:</p>
          <p style={{ fontSize: 12, color: 'var(--mint-text2)', lineHeight: 1.6 }}>• ถ้าประเมินว่า "ไม่สะอาด": ควรฝึกการแปรงฟันและใช้อุปกรณ์เสริมเพื่อควบคุมคราบจุลินทรีย์</p>
        </div>

        {/* ═══ Submit ═══ */}
        <div style={{ background: 'white', border: `1.5px solid ${ORAL_COLOR}44`, borderRadius: 20, padding: '20px 16px', boxShadow: 'var(--shadow-md)' }}>
          <button onClick={handleFinish} style={{ width: '100%', padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${ORAL_COLOR},#0e7490)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px rgba(8,145,178,0.3)' }}>
            ดูผลการประเมิน →
          </button>
          <div style={{ height: 8 }} />
          <button onClick={onBack} style={{ width: '100%', padding: 9, background: 'none', border: 'none', color: 'var(--mint-muted)', fontSize: 12, cursor: 'pointer' }}>
            ← กลับหน้าหลัก
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--mint-muted)', paddingBottom: 20 }}>
          ที่มา: สถาบันทันตกรรม กรมการแพทย์ และสำนักทันตสาธารณสุข กรมอนามัย กระทรวงสาธารณสุข พ.ศ.2564
        </p>
      </div>
    </div>
  );
}
