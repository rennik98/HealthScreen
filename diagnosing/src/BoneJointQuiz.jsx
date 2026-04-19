import React, { useState } from 'react';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

const BONE_COLOR = '#ea580c';
const BONE_BG    = '#fff7ed';
const BONE_BORDER = '#fed7aa';

const Section = ({ title, desc, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${BONE_COLOR}33`, borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: BONE_COLOR }} />
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-text)', lineHeight: 1.3, marginBottom: 4 }}>{title}</h2>
      {desc && <p style={{ fontSize: 12, color: 'var(--mint-muted)', lineHeight: 1.5 }}>{desc}</p>}
    </div>
    {children}
  </div>
);

const YN = ({ label, hint, val, onChange, yL = 'ใช่', nL = 'ไม่ใช่' }) => (
  <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', lineHeight: 1.5 }}>{label}</p>
    {hint && <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2 }}>{hint}</p>}
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      {[[1, yL, '#ef4444', '#fff1f1', '#fca5a5'], [0, nL, '#065f46', '#f0fdf9', '#6ee7d5']].map(([v, lbl, col, bg, border]) => (
        <button key={v} onClick={() => onChange(v)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1.5px solid ${val === v ? border : 'var(--mint-border)'}`, background: val === v ? bg : 'white', color: val === v ? col : 'var(--mint-muted)', cursor: 'pointer', transition: 'all 0.18s', minHeight: 42 }}>
          {val === v ? (v === 1 ? '⚠️ ' : '✓ ') : ''}{lbl}
        </button>
      ))}
    </div>
  </div>
);

const Topbar = ({ title, onBack }) => (
  <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,247,237,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${BONE_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>← กลับ</button>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={BONE_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>{title}</span></div>
    <div style={{ width: 40 }} />
  </div>
);

const SubmitBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${BONE_COLOR},#c2410c)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(234,88,12,0.3)', marginTop: 4 }}>
    บันทึกและดูผล →
  </button>
);

/* ══════════════════════════════════════════════════
   OSTA INDEX
══════════════════════════════════════════════════ */
function OSTAQuiz({ patient, onBack, onComplete }) {
  const [weight, setWeight] = useState('');
  const [age,    setAge]    = useState(patient?.age ? String(patient.age) : '');

  const score   = (weight && age) ? ((Number(weight) - Number(age)) * 0.2) : null;
  const risk    = score === null ? null : score < -4 ? 'high' : score <= -1 ? 'moderate' : 'low';
  const riskTh  = { high: 'ความเสี่ยงสูง', moderate: 'ความเสี่ยงปานกลาง', low: 'ความเสี่ยงต่ำ' };
  const riskCol = { high: '#dc2626', moderate: '#d97706', low: '#065f46' };

  const handleFinish = () => {
    if (!weight || !age) { alert('⚠️ กรุณากรอกน้ำหนักและอายุให้ครบ'); return; }
    if (onComplete) {
      onComplete({
        type: 'OSTA Index (กระดูกพรุน)',
        totalScore: parseFloat(score.toFixed(2)),
        maxScore: null,
        impaired: risk === 'high' || risk === 'moderate',
        duration: 0,
        resultText: riskTh[risk],
        breakdown: {
          "น้ำหนัก (กก.)": weight,
          "อายุ (ปี)": age,
          "คะแนน OSTA [0.2 × (น้ำหนัก − อายุ)]": score.toFixed(2),
          "การแปลผล": riskTh[risk],
        },
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar title="OSTA Index (กระดูกพรุน)" onBack={onBack} />
      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
        <Section title="OSTA Index" desc="เครื่องมือประเมินความเสี่ยงโรคกระดูกพรุนในคนเอเชีย สูตร: 0.2 × (น้ำหนัก − อายุ)">
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>น้ำหนัก (กิโลกรัม)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="เช่น 55" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--mint-border)', fontSize: 14, background: 'var(--mint-surface2)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>อายุ (ปี)</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="เช่น 65" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--mint-border)', fontSize: 14, background: 'var(--mint-surface2)', boxSizing: 'border-box' }} />
            </div>
          </div>
          {score !== null && (
            <div style={{ padding: '12px 14px', borderRadius: 12, background: risk === 'high' ? '#fff1f1' : risk === 'moderate' ? '#fffbeb' : '#f0fdf9', border: `1px solid ${risk === 'high' ? '#fca5a5' : risk === 'moderate' ? '#fde68a' : '#6ee7d5'}` }}>
              <p style={{ fontSize: 13, color: 'var(--mint-text2)' }}>คะแนน OSTA: <strong>{score.toFixed(2)}</strong></p>
              <p style={{ fontSize: 14, fontWeight: 700, color: riskCol[risk], marginTop: 4 }}>
                {risk === 'low' ? '✅' : '⚠️'} {riskTh[risk]}
              </p>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 6 }}>เกณฑ์: &lt; -4 = ความเสี่ยงสูง · -4 ถึง -1 = ปานกลาง · &gt; -1 = ต่ำ</p>
            </div>
          )}
        </Section>
        <SubmitBtn onClick={handleFinish} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   FRAX SCORE
══════════════════════════════════════════════════ */
function FRAXQuiz({ onBack, onComplete }) {
  const [major, setMajor] = useState('');
  const [hip,   setHip]   = useState('');

  const majorVal  = parseFloat(major);
  const hipVal    = parseFloat(hip);
  const majorOver = !isNaN(majorVal) && majorVal >= 20;
  const hipOver   = !isNaN(hipVal)   && hipVal   >= 3;
  const refer     = majorOver || hipOver;

  const handleFinish = () => {
    if (major === '' || hip === '') { alert('⚠️ กรุณาระบุคะแนน FRAX ทั้ง 2 ช่อง (หากไม่มีให้ใส่ 0)'); return; }
    if (onComplete) {
      onComplete({
        type: 'FRAX Score (กระดูกหัก)',
        totalScore: 0,
        maxScore: null,
        impaired: refer,
        duration: 0,
        resultText: refer ? 'เป็นข้อบ่งชี้เริ่มยารักษา' : 'ปกติ',
        breakdown: {
          "Major Osteoporotic Fracture (%)": major,
          "Hip Fracture (%)": hip,
          "การแปลผล": refer ? 'เป็นข้อบ่งชี้เริ่มยารักษา' : 'ปกติ',
        },
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar title="FRAX Score (กระดูกหัก)" onBack={onBack} />
      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
        <Section title="FRAX Score" desc="โอกาสเสี่ยงของการเกิดกระดูกหักในระยะ 10 ปี">
          <div style={{ padding: '12px 14px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 10, marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--mint-text2)', lineHeight: 1.6, marginBottom: 10 }}>กรอกข้อมูลในเว็บไซต์ FRAX ของมหาวิทยาลัย Sheffield แล้วนำค่าร้อยละ (%) มากรอกด้านล่าง</p>
            <a href="https://www.sheffield.ac.uk/FRAX/tool.aspx?lang=th" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', width: '100%', textAlign: 'center', padding: '10px', background: 'white', border: `1.5px solid ${BONE_COLOR}`, color: BONE_COLOR, borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              เปิดหน้าเว็บคำนวณ FRAX ↗
            </a>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '14px', marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>1. Major osteoporotic fracture (%)</label>
            <div style={{ position: 'relative' }}>
              <input type="number" step="0.1" value={major} onChange={e => setMajor(e.target.value)} placeholder="0.0"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--mint-border)', fontSize: 14, background: 'var(--mint-surface2)', boxSizing: 'border-box' }} />
              <span style={{ position: 'absolute', right: 14, top: 12, fontSize: 14, color: 'var(--mint-muted)', fontWeight: 600 }}>%</span>
            </div>
            {majorOver && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>⚠️ เกินเกณฑ์ (≥ 20%)</p>}
          </div>

          <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '14px' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>2. Hip fracture (%)</label>
            <div style={{ position: 'relative' }}>
              <input type="number" step="0.1" value={hip} onChange={e => setHip(e.target.value)} placeholder="0.0"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--mint-border)', fontSize: 14, background: 'var(--mint-surface2)', boxSizing: 'border-box' }} />
              <span style={{ position: 'absolute', right: 14, top: 12, fontSize: 14, color: 'var(--mint-muted)', fontWeight: 600 }}>%</span>
            </div>
            {hipOver && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>⚠️ เกินเกณฑ์ (≥ 3%)</p>}
          </div>
        </Section>
        <SubmitBtn onClick={handleFinish} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   KNEE OA SCREENING
══════════════════════════════════════════════════ */
function KneeQuiz({ onBack, onComplete }) {
  const [pain, setPain] = useState(null);
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);
  const [q4, setQ4] = useState(null);
  const [q5, setQ5] = useState(null);

  const yesCount = [q1, q2, q3, q4, q5].filter(v => v === 1).length;
  const refer    = pain === 1 && yesCount >= 2;

  const handleFinish = () => {
    if (pain === null) { alert('⚠️ กรุณาระบุว่ามีอาการปวดเข่าหรือไม่'); return; }
    if (pain === 1 && [q1, q2, q3, q4, q5].includes(null)) { alert('⚠️ กรุณาตอบคำถามให้ครบทั้ง 5 ข้อ'); return; }
    const fmt = v => v === 1 ? 'ใช่' : v === 0 ? 'ไม่ใช่' : '-';
    if (onComplete) {
      onComplete({
        type: 'การคัดกรองข้อเข่าเสื่อม',
        totalScore: pain === 1 ? yesCount : 0,
        maxScore: 5,
        impaired: refer,
        duration: 0,
        resultText: refer ? 'มีโอกาสเป็นโรคข้อเข่าเสื่อม' : 'ไม่พบอาการที่เข้าเกณฑ์',
        breakdown: {
          "มีอาการปวดเข่า": pain === 1 ? 'มี' : 'ไม่มี',
          "1. ข้อเข่าฝืดตึงตอนเช้า < 30 นาที": fmt(q1),
          "2. เสียงดังกรอบแกรบในข้อเข่า": fmt(q2),
          "3. กดเจ็บที่กระดูกข้อเข่า": fmt(q3),
          "4. ข้อใหญ่ผิดรูป": fmt(q4),
          "5. ไม่พบข้ออุ่น": fmt(q5),
          "การแปลผล": refer ? 'มีโอกาสเป็นโรคข้อเข่าเสื่อม' : 'ไม่พบอาการที่เข้าเกณฑ์',
        },
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar title="การคัดกรองข้อเข่าเสื่อม" onBack={onBack} />
      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
        <Section title="การคัดกรองโรคข้อเข่าเสื่อมทางคลินิก" desc="เกณฑ์: ปวดเข่า + อาการร่วมอย่างน้อย 2 ข้อ = สงสัยข้อเข่าเสื่อม">
          {/* ปวดเข่า */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 8 }}>ผู้สูงอายุมีอาการ "ปวดเข่า" หรือไม่?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPain(1)} style={{ flex: 1, padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 13, border: `1.5px solid ${pain === 1 ? '#fca5a5' : 'var(--mint-border)'}`, background: pain === 1 ? '#fff1f1' : 'white', color: pain === 1 ? '#ef4444' : 'var(--mint-muted)', cursor: 'pointer' }}>
                {pain === 1 ? '⚠️ ' : ''}มีอาการปวดเข่า
              </button>
              <button onClick={() => { setPain(0); setQ1(null); setQ2(null); setQ3(null); setQ4(null); setQ5(null); }} style={{ flex: 1, padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 13, border: `1.5px solid ${pain === 0 ? '#6ee7d5' : 'var(--mint-border)'}`, background: pain === 0 ? '#f0fdf9' : 'white', color: pain === 0 ? '#065f46' : 'var(--mint-muted)', cursor: 'pointer' }}>
                {pain === 0 ? '✓ ' : ''}ไม่มีอาการ
              </button>
            </div>
          </div>

          {/* อาการร่วม */}
          {pain === 1 && (
            <div style={{ borderTop: '1px dashed var(--mint-border2)', paddingTop: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--mint-muted)', marginBottom: 10 }}>ประเมินอาการร่วมดังต่อไปนี้:</p>
              <YN label="1. ข้อเข่าฝืดตึงหลังตื่นนอนตอนเช้านาน < 30 นาที (Stiffness)" val={q1} onChange={setQ1} />
              <YN label="2. เสียงดังกรอบแกรบในข้อเข่าขณะเคลื่อนไหว (Crepitus)" val={q2} onChange={setQ2} />
              <YN label="3. กดเจ็บที่กระดูกข้อเข่า (Bony tenderness)" val={q3} onChange={setQ3} />
              <YN label="4. ข้อใหญ่ผิดรูป (Bony enlargement)" val={q4} onChange={setQ4} />
              <YN label="5. ไม่พบข้ออุ่น (No palpable warmth)" hint="ข้อเข่าเสื่อมมักไม่พบข้ออุ่น ยกเว้นรุนแรง" val={q5} onChange={setQ5} />
            </div>
          )}
        </Section>
        <SubmitBtn onClick={handleFinish} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   EXPORT — route by tool prop
══════════════════════════════════════════════════ */
export default function BoneJointQuiz({ tool, onBack, onComplete, patient }) {
  const handleBack = () => {
    if (window.confirm('ออกจากการทดสอบ?\nคำตอบที่ตอบไปแล้วจะถูกบันทึกไว้ชั่วคราว')) onBack();
  };

  if (tool === 'OSTA') return <OSTAQuiz  patient={patient} onBack={handleBack} onComplete={onComplete} />;
  if (tool === 'FRAX') return <FRAXQuiz  onBack={handleBack} onComplete={onComplete} />;
  if (tool === 'KNEE') return <KneeQuiz  onBack={handleBack} onComplete={onComplete} />;
  return null;
}
