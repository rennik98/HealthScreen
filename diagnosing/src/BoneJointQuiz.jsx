import React, { useState } from 'react';

/* ── shared atoms ── */
const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

// Theme สีส้ม สำหรับกระดูกและข้อ
const BONE_COLOR = '#ea580c';
const BONE_BG = '#fff7ed';
const BONE_BORDER = '#fed7aa';

const Section = ({ num, title, children }) => (
  <div style={{
    background: 'white', border: `1.5px solid ${BONE_COLOR}33`,
    borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)',
    position: 'relative', overflow: 'hidden', marginBottom: 16
  }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: BONE_COLOR }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, background: BONE_BG,
        border: `1.5px solid ${BONE_COLOR}44`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 13, fontWeight: 800, color: BONE_COLOR, flexShrink: 0,
      }}>{num}</div>
      <h2 style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', lineHeight: 1.3 }}>{title}</h2>
    </div>
    {children}
  </div>
);

// Yes/No Toggle
const YN = ({ val, onChange, yL = 'ใช่', nL = 'ไม่ใช่' }) => (
  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
    {[[1, yL, '#ef4444', '#fff1f1', '#fca5a5'],
      [0, nL, '#065f46', '#f0fdf9', '#6ee7d5']].map(([v, label, col, bg, border]) => (
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

export default function BoneJointQuiz({ onBack, onComplete, patient }) {
  const [done, setDone] = useState(false);

  // 1. OSTA State
  const [osta, setOsta] = useState({
    weight: '',
    age: patient?.age || ''
  });

  // 2. FRAX State
  const [frax, setFrax] = useState({
    major: '',
    hip: ''
  });

  // 3. Knee OA State
  const [knee, setKnee] = useState({
    pain: null,
    q1: null, q2: null, q3: null, q4: null, q5: null
  });

  // ─── Calculations ───
  // OSTA Calc: 0.2 x (Weight - Age)
  const ostaScore = (osta.weight && osta.age) ? ((Number(osta.weight) - Number(osta.age)) * 0.2) : null;
  const getOstaRisk = (score) => {
    if (score === null) return null;
    if (score < -4) return 'high';
    if (score <= -1) return 'moderate';
    return 'low';
  };
  const ostaRisk = getOstaRisk(ostaScore);

  // FRAX Calc
  const fraxMajorVal = parseFloat(frax.major);
  const fraxHipVal = parseFloat(frax.hip);
  const fraxRefer = (!isNaN(fraxMajorVal) && fraxMajorVal >= 20) || (!isNaN(fraxHipVal) && fraxHipVal >= 3);

  // Knee Calc
  const kneeYesCount = (knee.q1 === 1 ? 1 : 0) + (knee.q2 === 1 ? 1 : 0) + 
                       (knee.q3 === 1 ? 1 : 0) + (knee.q4 === 1 ? 1 : 0) + (knee.q5 === 1 ? 1 : 0);
  const kneeRefer = knee.pain === 1 && kneeYesCount >= 2;

  const hasAnyRisk = ostaRisk === 'high' || ostaRisk === 'moderate' || fraxRefer || kneeRefer;

  // ─── Handlers ───
  const setK = (key, val) => setKnee(prev => ({ ...prev, [key]: val }));

  const handleFinish = () => {
    // 1. Validate OSTA
    if (!osta.weight || !osta.age) {
      alert('⚠️ กรุณากรอก น้ำหนัก และ อายุ ในส่วนของ OSTA index ให้ครบถ้วน');
      return;
    }
    // 2. Validate FRAX
    if (frax.major === '' || frax.hip === '') {
      alert('⚠️ กรุณาระบุคะแนน FRAX score ทั้ง 2 ช่อง (หากไม่มีให้ใส่ 0)');
      return;
    }
    // 3. Validate Knee
    if (knee.pain === null) {
      alert('⚠️ กรุณาระบุว่าผู้สูงอายุมีอาการ "ปวดเข่า" หรือไม่');
      return;
    }
    if (knee.pain === 1) {
      if (knee.q1 === null || knee.q2 === null || knee.q3 === null || knee.q4 === null || knee.q5 === null) {
        alert('⚠️ กรุณาตอบคำถามคัดกรองข้อเข่าเสื่อมให้ครบทั้ง 5 ข้อ');
        return;
      }
    }

    setDone(true);
    
    if (onComplete) {
      const formatAns = (val) => val === 1 ? 'ใช่' : val === 0 ? 'ไม่ใช่' : 'ไม่ได้ตรวจ';
      
      onComplete({
        type: 'Bone and Joint',
        totalScore: 0, // ไม่มีคะแนนรวมตรงๆ ให้ใช้ 0 หรือปรับแต่งตามต้องการ
        maxScore: 0,
        impaired: hasAnyRisk,
        duration: 0,
        resultText: hasAnyRisk ? 'พบความเสี่ยงกระดูกและข้อ' : 'ปกติ',
        breakdown: {
          "OSTA: น้ำหนัก (กก.)": osta.weight,
          "OSTA: อายุ (ปี)": osta.age,
          "OSTA: Score": ostaScore.toFixed(2),
          "OSTA: การแปลผล": ostaRisk === 'high' ? 'ความเสี่ยงสูง' : ostaRisk === 'moderate' ? 'ความเสี่ยงปานกลาง' : 'ความเสี่ยงต่ำ',
          
          "FRAX: Major Osteoporotic (%)": frax.major,
          "FRAX: Hip Fracture (%)": frax.hip,
          "FRAX: การแปลผล": fraxRefer ? 'ข้อบ่งชี้เริ่มยารักษา' : 'ปกติ',

          "เข่า: มีอาการปวดเข่าหรือไม่": knee.pain === 1 ? 'มี' : 'ไม่มี',
          "1. ข้อเข่าฝืดตึงตอนเช้า <30 นาที": knee.pain === 1 ? formatAns(knee.q1) : '-',
          "2. เสียงดังกรอบแกรบในข้อเข่า": knee.pain === 1 ? formatAns(knee.q2) : '-',
          "3. กดเจ็บที่กระดูกข้อเข่า": knee.pain === 1 ? formatAns(knee.q3) : '-',
          "4. ข้อใหญ่ผิดรูป": knee.pain === 1 ? formatAns(knee.q4) : '-',
          "5. ไม่พบข้ออุ่น": knee.pain === 1 ? formatAns(knee.q5) : '-',
          "เข่า: การแปลผล": kneeRefer ? 'มีโอกาสเป็นโรคข้อเข่าเสื่อม' : 'ปกติ',
        },
      });
    }
  };

  /* ── Result Screen ── */
  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,247,237,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${BONE_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cross s={14} c={BONE_COLOR} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>โรคทางกระดูกและข้อ — ผลการประเมิน</span>
          {patient && (
            <span style={{ fontSize: 11, color: BONE_COLOR, fontWeight: 600, background: BONE_BG, padding: '2px 8px', borderRadius: 20, border: `1px solid ${BONE_BORDER}`, marginLeft: 4, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {patient.name} · {patient.age} ปี
            </span>
          )}
        </div>

        <div style={{ flex: 1, maxWidth: 520, margin: '0 auto', width: '100%', padding: '28px 16px' }}>
          <div style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 22, background: hasAnyRisk ? '#fff7ed' : '#f0fdf9', border: `1.5px solid ${hasAnyRisk ? '#fcd34d' : '#6ee7d5'}` }}>
            <p style={{ fontWeight: 800, fontSize: 16, color: hasAnyRisk ? '#92400e' : '#065f46', marginBottom: 6 }}>
              {hasAnyRisk ? '⚠️ พบความเสี่ยงโรคทางกระดูกและข้อ' : '✅ กระดูกและข้ออยู่ในเกณฑ์ดี'}
            </p>
            <p style={{ fontSize: 13, color: hasAnyRisk ? '#b45309' : '#047857', lineHeight: 1.6 }}>
              {hasAnyRisk
                ? 'พบความเสี่ยงกระดูกพรุน หรือ ข้อเข่าเสื่อม ควรให้คำแนะนำ ส่งต่อแพทย์ หรือพิจารณาการรักษาตามเกณฑ์'
                : 'ไม่พบความเสี่ยงสูงในด้านกระดูกและข้อ ติดตามอาการตามแผนปกติ'}
            </p>
          </div>

          {/* OSTA Summary */}
          <div style={{ background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>OSTA Index (กระดูกพรุน)</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: ostaRisk === 'high' ? '#fff1f1' : ostaRisk === 'moderate' ? '#fffbeb' : '#f0fdf9', border: `1px solid ${ostaRisk === 'high' ? '#fca5a5' : ostaRisk === 'moderate' ? '#fde68a' : '#6ee7d5'}`, borderRadius: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--mint-text2)' }}>คะแนน OSTA: <strong>{ostaScore.toFixed(2)}</strong></p>
                <p style={{ fontSize: 14, fontWeight: 700, color: ostaRisk === 'high' ? '#dc2626' : ostaRisk === 'moderate' ? '#d97706' : '#065f46' }}>
                  {ostaRisk === 'high' ? '⚠️ ความเสี่ยงสูง' : ostaRisk === 'moderate' ? '⚠️ ความเสี่ยงปานกลาง' : '✅ ความเสี่ยงต่ำ'}
                </p>
              </div>
            </div>
          </div>

          {/* FRAX Summary */}
          <div style={{ background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>FRAX Score (โอกาสกระดูกหักใน 10 ปี)</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: fraxRefer ? '#fff1f1' : '#f0fdf9', border: `1px solid ${fraxRefer ? '#fca5a5' : '#6ee7d5'}`, borderRadius: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--mint-text2)' }}>Major Osteoporotic: <strong>{frax.major}%</strong></p>
                <p style={{ fontSize: 12, color: 'var(--mint-text2)' }}>Hip Fracture: <strong>{frax.hip}%</strong></p>
                <p style={{ fontSize: 14, fontWeight: 700, color: fraxRefer ? '#dc2626' : '#065f46', marginTop: 4 }}>
                  {fraxRefer ? '⚠️ เป็นข้อบ่งชี้เริ่มยารักษา' : '✅ ปกติ'}
                </p>
              </div>
            </div>
          </div>

          {/* Knee Summary */}
          <div style={{ background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 18, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>การคัดกรองโรคข้อเข่าเสื่อมทางคลินิก</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: kneeRefer ? '#fff7ed' : '#f0fdf9', border: `1px solid ${kneeRefer ? '#fcd34d' : '#6ee7d5'}`, borderRadius: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--mint-text2)' }}>อาการปวดเข่า: <strong>{knee.pain === 1 ? 'มี' : 'ไม่มี'}</strong></p>
                {knee.pain === 1 && <p style={{ fontSize: 12, color: 'var(--mint-text2)' }}>เข้าเกณฑ์วินิจฉัย: <strong>{kneeYesCount} ข้อ</strong></p>}
                <p style={{ fontSize: 14, fontWeight: 700, color: kneeRefer ? '#d97706' : '#065f46', marginTop: 4 }}>
                  {kneeRefer ? '⚠️ มีโอกาสที่จะเป็นโรคข้อเข่าเสื่อม' : '✅ ไม่พบอาการที่เข้าเกณฑ์'}
                </p>
              </div>
            </div>
          </div>

          <button onClick={onBack} style={{ width: '100%', padding: 13, background: `linear-gradient(135deg,${BONE_COLOR},#c2410c)`, color: 'white', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            ← กลับหน้าหลัก
          </button>
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
      {/* topbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,247,237,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${BONE_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cross s={14} c={BONE_COLOR} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>โรคทางกระดูกและข้อ</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ═══ OSTA Index ═══ */}
        <Section num="1" title="OSTA index (ความเสี่ยงกระดูกพรุน)">
          <div style={{ padding: '10px 14px', background: BONE_BG, border: `1px solid ${BONE_BORDER}`, borderRadius: 10, marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: '#9a3412', lineHeight: 1.6 }}>
              เครื่องมือประเมินความเสี่ยงโรคกระดูกพรุนในคนเอเชีย โดยใช้สูตร: <strong>0.2 x (น้ำหนัก - อายุ)</strong>
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>น้ำหนัก (กิโลกรัม)</label>
              <input 
                type="number" 
                value={osta.weight} 
                onChange={(e) => setOsta({...osta, weight: e.target.value})}
                placeholder="เช่น 55"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--mint-border)', fontSize: 14, background: 'var(--mint-surface2)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>อายุ (ปี)</label>
              <input 
                type="number" 
                value={osta.age} 
                onChange={(e) => setOsta({...osta, age: e.target.value})}
                placeholder="เช่น 65"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--mint-border)', fontSize: 14, background: 'var(--mint-surface2)' }}
              />
            </div>
          </div>
          {ostaScore !== null && (
            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: ostaRisk === 'high' ? '#dc2626' : ostaRisk === 'moderate' ? '#d97706' : '#065f46' }}>
              ผลคะแนนเบื้องต้น: {ostaScore.toFixed(2)} ({ostaRisk === 'high' ? 'ความเสี่ยงสูง' : ostaRisk === 'moderate' ? 'ความเสี่ยงปานกลาง' : 'ความเสี่ยงต่ำ'})
            </div>
          )}
        </Section>

        {/* ═══ FRAX Score ═══ */}
        <Section num="2" title="FRAX score (โอกาสกระดูกหัก 10 ปี)">
          <div style={{ padding: '12px 14px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 10, marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--mint-text2)', lineHeight: 1.6, marginBottom: 10 }}>
              ประเมินโอกาสเสี่ยงของการเกิดกระดูกหักในระยะ 10 ปี โดยกรอกข้อมูลในเว็บไซต์ FRAX ของมหาวิทยาลัย Sheffield
            </p>
            <a 
              href="https://www.sheffield.ac.uk/FRAX/tool.aspx?lang=th" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-block', width: '100%', textAlign: 'center', padding: '10px', background: 'white', border: `1.5px solid ${BONE_COLOR}`, color: BONE_COLOR, borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
            >
              เปิดหน้าเว็บคำนวณ FRAX ↗
            </a>
          </div>

          <p style={{ fontSize: 12, color: 'var(--mint-muted)', marginBottom: 10 }}>หลังจากคำนวณเสร็จสิ้น ให้นำค่าร้อยละ (%) มากรอกด้านล่างนี้</p>

          <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '14px', marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>1. Major osteoporotic fracture (%)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" step="0.1"
                value={frax.major} 
                onChange={(e) => setFrax({...frax, major: e.target.value})}
                placeholder="0.0"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--mint-border)', fontSize: 14, background: 'var(--mint-surface2)' }}
              />
              <span style={{ position: 'absolute', right: 14, top: 12, fontSize: 14, color: 'var(--mint-muted)', fontWeight: 600 }}>%</span>
            </div>
            {parseFloat(frax.major) >= 20 && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>⚠️ เกินเกณฑ์ (≥20%)</p>}
          </div>

          <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '14px' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>2. Hip fracture (%)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" step="0.1"
                value={frax.hip} 
                onChange={(e) => setFrax({...frax, hip: e.target.value})}
                placeholder="0.0"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--mint-border)', fontSize: 14, background: 'var(--mint-surface2)' }}
              />
              <span style={{ position: 'absolute', right: 14, top: 12, fontSize: 14, color: 'var(--mint-muted)', fontWeight: 600 }}>%</span>
            </div>
            {parseFloat(frax.hip) >= 3 && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>⚠️ เกินเกณฑ์ (≥3%)</p>}
          </div>
        </Section>

        {/* ═══ Knee OA Screening ═══ */}
        <Section num="3" title="การคัดกรองโรคข้อเข่าเสื่อมทางคลินิก">
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '14px', marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 8 }}>ผู้สูงอายุมีอาการ "ปวดเข่า" หรือไม่?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setKnee({ ...knee, pain: 1 })} style={{ flex: 1, padding: '12px', borderRadius: 10, fontWeight: 700, border: `1.5px solid ${knee.pain === 1 ? '#fca5a5' : 'var(--mint-border)'}`, background: knee.pain === 1 ? '#fff1f1' : 'white', color: knee.pain === 1 ? '#ef4444' : 'var(--mint-muted)' }}>มีอาการปวดเข่า</button>
              <button onClick={() => setKnee({ ...knee, pain: 0, q1: null, q2: null, q3: null, q4: null, q5: null })} style={{ flex: 1, padding: '12px', borderRadius: 10, fontWeight: 700, border: `1.5px solid ${knee.pain === 0 ? '#6ee7d5' : 'var(--mint-border)'}`, background: knee.pain === 0 ? '#f0fdf9' : 'white', color: knee.pain === 0 ? '#065f46' : 'var(--mint-muted)' }}>ไม่มีอาการ</button>
            </div>
          </div>

          {knee.pain === 1 && (
            <div style={{ marginTop: 16, borderTop: '1px dashed var(--mint-border2)', paddingTop: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--mint-muted)', marginBottom: 12 }}>หากมีอาการปวดเข่า กรุณาประเมินอาการร่วมดังต่อไปนี้:</p>
              
              <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>1. ข้อเข่าฝืดตึงหลังตื่นนอนตอนเช้านาน &lt; 30 นาที (Stiffness)</p>
                <YN val={knee.q1} onChange={v => setK('q1', v)} />
              </div>
              
              <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>2. เสียงดังกรอบแกรบในข้อเข่าขณะเคลื่อนไหว (Crepitus)</p>
                <YN val={knee.q2} onChange={v => setK('q2', v)} />
              </div>

              <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>3. กดเจ็บที่กระดูกข้อเข่า (Bony tenderness)</p>
                <YN val={knee.q3} onChange={v => setK('q3', v)} />
              </div>

              <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>4. ข้อใหญ่ผิดรูป (Bony enlargement)</p>
                <YN val={knee.q4} onChange={v => setK('q4', v)} />
              </div>

              <div style={{ background: 'white', border: '1px solid var(--mint-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>5. ไม่พบข้ออุ่น (No palpable warmth)</p>
                <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2 }}>(ข้อเข่าเสื่อมมักไม่พบข้ออุ่น ยกเว้นรุนแรง)</p>
                <YN val={knee.q5} onChange={v => setK('q5', v)} />
              </div>
            </div>
          )}
        </Section>

        {/* ═══ Submit Button ═══ */}
        <div style={{ background: 'white', border: `1.5px solid ${BONE_COLOR}44`, borderRadius: 20, padding: '20px 16px', boxShadow: 'var(--shadow-md)', marginBottom: 40 }}>
          <button onClick={handleFinish} style={{ width: '100%', padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${BONE_COLOR},#c2410c)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px rgba(234, 88, 12, 0.3)' }}>
            บันทึกและดูผลการประเมิน →
          </button>
        </div>

      </div>
    </div>
  );
}