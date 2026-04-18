import React, { useState } from 'react';
import { loadDraft, saveDraft, clearDraft } from './shared/quizStorage';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

const NUTRI_COLOR = '#d97706';
const NUTRI_BG = '#fffbeb';
const NUTRI_BORDER = '#fde68a';

const Section = ({ title, desc, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${NUTRI_COLOR}33`, borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: NUTRI_COLOR }} />
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--mint-text)', lineHeight: 1.3, marginBottom: 4 }}>{title}</h2>
      {desc && <p style={{ fontSize: 12, color: 'var(--mint-muted)', lineHeight: 1.5 }}>{desc}</p>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
  </div>
);

const RadioGroup = ({ question, options, val, onChange }) => (
  <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 14, padding: '14px' }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 10, lineHeight: 1.5 }}>{question}</p>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const isSel = val === opt.v;
        return (
          <button key={opt.v} onClick={() => onChange(opt.v)} style={{ flex: '1 1 auto', padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isSel ? (opt.warn ? '#fca5a5' : NUTRI_COLOR) : 'var(--mint-border)'}`, background: isSel ? (opt.warn ? '#fff1f1' : NUTRI_BG) : 'white', color: isSel ? (opt.warn ? '#dc2626' : NUTRI_COLOR) : 'var(--mint-muted)', cursor: 'pointer', transition: 'all 0.18s' }}>
            {opt.l}
          </button>
        );
      })}
    </div>
  </div>
);

export default function NutritionQuiz({ tool, onBack, onComplete, patient }) {
  // MNA States
  const [stepMNA, setStepMNA] = useState('SF'); // 'SF', 'FULL'
  const [mnaSF, setMnaSF] = useState(Array(6).fill(null));
  const [mnaFull, setMnaFull] = useState(Array(12).fill(null));

  // MSRA-5 States
  const [msra, setMsra] = useState(Array(5).fill(null));

  /* ── MNA Logic ── */
  const handleNextMnaSF = () => {
    if (mnaSF.includes(null)) { alert('⚠️ กรุณาตอบ MNA แบบคัดกรองเบื้องต้นให้ครบ 6 ข้อ'); return; }
    const sumSF = mnaSF.reduce((a, b) => a + b, 0);
    if (sumSF <= 11) {
      alert('⚠️ ผลประเมินเบื้องต้นพบความเสี่ยง (คะแนน ≤ 11) ระบบจะพาไปสู่แบบประเมินแบบเต็ม (MNA-Full)');
      setStepMNA('FULL');
    } else {
      finishMNA();
    }
  };

  const handleNextMnaFull = () => {
    if (mnaFull.includes(null)) { alert('⚠️ กรุณาตอบ MNA แบบเต็มให้ครบทุกข้อ'); return; }
    finishMNA();
  };

  const finishMNA = () => {
    const sumSF = mnaSF.reduce((a, b) => (a || 0) + (b || 0), 0);
    const sumFull = stepMNA === 'FULL' ? mnaFull.reduce((a, b) => (a || 0) + (b || 0), 0) : 0;
    const totalMNA = sumSF + sumFull;

    let res = 'ปกติ (ภาวะโภชนาการดี)';
    let impaired = false;
    if (stepMNA === 'FULL') {
      if (totalMNA < 17) { res = 'ขาดสารอาหาร'; impaired = true; }
      else if (totalMNA <= 23.5) { res = 'มีความเสี่ยงต่อภาวะขาดสารอาหาร'; impaired = true; }
    } else {
      if (sumSF <= 11) impaired = true;
    }

    if (onComplete) {
      onComplete({
        type: 'MNA (Malnutrition)',
        totalScore: stepMNA === 'FULL' ? totalMNA : sumSF,
        maxScore: stepMNA === 'FULL' ? 30 : 14,
        impaired, duration: 0, resultText: res,
        breakdown: {
          "--- MNA Short Form ---": "",
          "A. ความอยากอาหารลดลง": mnaSF[0] ?? '-',
          "B. น้ำหนักลดใน 3 เดือน": mnaSF[1] ?? '-',
          "C. การเคลื่อนไหว": mnaSF[2] ?? '-',
          "D. ความเครียด/ป่วยหนัก": mnaSF[3] ?? '-',
          "E. ปัญหาประสาท/สมอง": mnaSF[4] ?? '-',
          "F. BMI": mnaSF[5] ?? '-',
          "คะแนน MNA-SF": sumSF,
          "--- MNA Full Form ---": stepMNA === 'FULL' ? "" : "ไม่ได้ประเมิน",
          "G. อยู่เป็นอิสระ": mnaFull[0] ?? '-',
          "H. ยา >3 ชนิด": mnaFull[1] ?? '-',
          "I. แผลกดทับ": mnaFull[2] ?? '-',
          "J. มื้ออาหารหลัก/วัน": mnaFull[3] ?? '-',
          "K. การบริโภคโปรตีน": mnaFull[4] ?? '-',
          "L. ผักผลไม้ ≥2 ส่วน/วัน": mnaFull[5] ?? '-',
          "M. ปริมาณน้ำดื่ม": mnaFull[6] ?? '-',
          "N. รูปแบบการกิน": mnaFull[7] ?? '-',
          "O. ประเมินโภชนาการตนเอง": mnaFull[8] ?? '-',
          "P. เทียบสุขภาพกับคนอื่น": mnaFull[9] ?? '-',
          "Q. เส้นรอบวงแขน": mnaFull[10] ?? '-',
          "R. เส้นรอบน่อง": mnaFull[11] ?? '-',
          "คะแนนรวม MNA": stepMNA === 'FULL' ? totalMNA : '-',
          "การแปลผลโภชนาการ": res,
        }
      });
    }
  };

  /* ── MSRA-5 Logic ── */
  const handleFinishMSRA = () => {
    if (msra.includes(null)) { alert('⚠️ กรุณาตอบ Modified MSRA-5 ให้ครบทั้ง 5 ข้อ'); return; }
    // การให้คะแนน: Yes=0 (มีอาการ), No=1 (ไม่มีอาการ) -> คะแนนเต็ม 5
    const sumMSRA = msra.reduce((a, b) => a + b, 0);
    const impaired = sumMSRA <= 3;
    const res = impaired ? 'เสี่ยงต่อภาวะมวลกล้ามเนื้อน้อย (Sarcopenia)' : 'ปกติ (มวลกล้ามเนื้ออยู่ในเกณฑ์)';

    if (onComplete) {
      onComplete({
        type: 'Modified MSRA-5',
        totalScore: sumMSRA,
        maxScore: 5,
        impaired, duration: 0, resultText: res,
        breakdown: {
          "1. อายุ > 70 ปี": msra[0] === 0 ? 'ใช่' : 'ไม่ใช่',
          "2. น้ำหนักลด > 2กก. ใน 1 ปี": msra[1] === 0 ? 'ใช่' : 'ไม่ใช่',
          "3. เดิน 1000ม. ไม่ได้": msra[2] === 0 ? 'ใช่' : 'ไม่ใช่',
          "4. ลุกจากเก้าอี้โดยไม่ใช้แขนไม่ได้": msra[3] === 0 ? 'ใช่' : 'ไม่ใช่',
          "5. เส้นรอบน่อง ≤ 31 ซม.": msra[4] === 0 ? 'ใช่' : 'ไม่ใช่',
          "การแปลผล MSRA-5": res,
        }
      });
    }
  };

  const handleBack = () => {
    if (window.confirm('ออกจากการทดสอบ?\nคำตอบที่ตอบไปแล้วจะถูกบันทึกไว้ชั่วคราว')) {
      onBack();
    }
  };

  // Render MSRA-5
  if (tool === 'MSRA5') {
    const opts = [{v:0, l:'ใช่ (มีความเสี่ยง)', warn:true}, {v:1, l:'ไม่ใช่ (ปกติ)'}];
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,251,235,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${NUTRI_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={NUTRI_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ภาวะมวลกล้ามเนื้อน้อย (MSRA-5)</span></div>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
          <Section title="Modified MSRA-5" desc="แบบคัดกรองภาวะมวลกล้ามเนื้อน้อย (Sarcopenia)">
            <RadioGroup question="1. อายุมากกว่า 70 ปี" options={opts} val={msra[0]} onChange={(v) => { const n=[...msra]; n[0]=v; setMsra(n); }} />
            <RadioGroup question="2. น้ำหนักลดลงมากกว่า 2 กก. ในช่วง 1 ปีที่ผ่านมา" options={opts} val={msra[1]} onChange={(v) => { const n=[...msra]; n[1]=v; setMsra(n); }} />
            <RadioGroup question="3. ไม่สามารถเดินได้ในระยะทาง 1,000 เมตร" options={opts} val={msra[2]} onChange={(v) => { const n=[...msra]; n[2]=v; setMsra(n); }} />
            <RadioGroup question="4. ไม่สามารถลุกจากเก้าอี้ได้หากไม่ใช้แขนยัน" options={opts} val={msra[3]} onChange={(v) => { const n=[...msra]; n[3]=v; setMsra(n); }} />
            <RadioGroup question="5. ความยาวเส้นรอบน่อง ≤ 31 ซม." options={opts} val={msra[4]} onChange={(v) => { const n=[...msra]; n[4]=v; setMsra(n); }} />
          </Section>
          <button onClick={handleFinishMSRA} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${NUTRI_COLOR},#b45309)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)' }}>บันทึกและดูผล →</button>
        </div>
      </div>
    );
  }

  // Render MNA
  if (tool === 'MNA') {
    if (stepMNA === 'SF') {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,251,235,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${NUTRI_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={NUTRI_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>คัดกรองโภชนาการ (MNA-SF)</span></div>
            <div style={{ width: 40 }} />
          </div>
          <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
            <Section title="MNA Short Form (คัดกรองเบื้องต้น)">
              <RadioGroup question="A. ความอยากอาหารลดลงในช่วง 3 เดือนที่ผ่านมา?" options={[{v:0,l:'ลดลงมาก'},{v:1,l:'ลดลงปานกลาง'},{v:2,l:'ไม่ลดลง'}]} val={mnaSF[0]} onChange={(v)=>{const n=[...mnaSF];n[0]=v;setMnaSF(n);}} />
              <RadioGroup question="B. น้ำหนักลดลงในช่วง 3 เดือนที่ผ่านมา?" options={[{v:0,l:'> 3 กก.'},{v:1,l:'ไม่ทราบ'},{v:2,l:'1-3 กก.'},{v:3,l:'ไม่ลดลง'}]} val={mnaSF[1]} onChange={(v)=>{const n=[...mnaSF];n[1]=v;setMnaSF(n);}} />
              <RadioGroup question="C. การเคลื่อนไหว" options={[{v:0,l:'ติดเตียง/รถเข็น'},{v:1,l:'ลุกเดินได้ แต่ไม่ออกนอกบ้าน'},{v:2,l:'ออกนอกบ้านได้ปกติ'}]} val={mnaSF[2]} onChange={(v)=>{const n=[...mnaSF];n[2]=v;setMnaSF(n);}} />
              <RadioGroup question="D. มีความเครียดรุนแรงหรือป่วยหนักใน 3 เดือน?" options={[{v:0,l:'มี'},{v:2,l:'ไม่มี'}]} val={mnaSF[3]} onChange={(v)=>{const n=[...mnaSF];n[3]=v;setMnaSF(n);}} />
              <RadioGroup question="E. ปัญหาทางประสาท/สมอง" options={[{v:0,l:'สมองเสื่อม/ซึมเศร้ารุนแรง'},{v:1,l:'สมองเสื่อมเล็กน้อย'},{v:2,l:'ไม่มีปัญหา'}]} val={mnaSF[4]} onChange={(v)=>{const n=[...mnaSF];n[4]=v;setMnaSF(n);}} />
              <RadioGroup question="F. ดัชนีมวลกาย (BMI)" options={[{v:0,l:'< 19'},{v:1,l:'19 ถึง < 21'},{v:2,l:'21 ถึง < 23'},{v:3,l:'≥ 23'}]} val={mnaSF[5]} onChange={(v)=>{const n=[...mnaSF];n[5]=v;setMnaSF(n);}} />
            </Section>
            <button onClick={handleNextMnaSF} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${NUTRI_COLOR},#b45309)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)' }}>ถัดไป →</button>
          </div>
        </div>
      );
    }

    if (stepMNA === 'FULL') {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,251,235,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${NUTRI_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => setStepMNA('SF')} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ (MNA-SF)</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={NUTRI_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ประเมินโภชนาการ (MNA-Full)</span></div>
            <div style={{ width: 40 }} />
          </div>
          <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
            <div style={{ padding: '12px', background: '#fff7ed', border: '1px solid #fcd34d', borderRadius: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>⚠️ คะแนน MNA-SF ≤ 11 (มีความเสี่ยง) กรุณาประเมินแบบเต็มต่อ</p>
            </div>
            <Section title="MNA Full Form (ประเมินแบบเต็ม)">
              <RadioGroup question="G. ผู้สูงอายุอาศัยอยู่เป็นอิสระที่บ้าน?" options={[{v:0,l:'ไม่ใช่'},{v:1,l:'ใช่'}]} val={mnaFull[0]} onChange={(v)=>{const n=[...mnaFull];n[0]=v;setMnaFull(n);}} />
              <RadioGroup question="H. กินยามากกว่า 3 ชนิดต่อวัน?" options={[{v:0,l:'ใช่'},{v:1,l:'ไม่ใช่'}]} val={mnaFull[1]} onChange={(v)=>{const n=[...mnaFull];n[1]=v;setMnaFull(n);}} />
              <RadioGroup question="I. มีแผลกดทับ หรือแผลที่ผิวหนัง?" options={[{v:0,l:'ใช่'},{v:1,l:'ไม่ใช่'}]} val={mnaFull[2]} onChange={(v)=>{const n=[...mnaFull];n[2]=v;setMnaFull(n);}} />
              <RadioGroup question="J. กินอาหารมื้อหลักวันละกี่มื้อ?" options={[{v:0,l:'1 มื้อ'},{v:1,l:'2 มื้อ'},{v:2,l:'3 มื้อ'}]} val={mnaFull[3]} onChange={(v)=>{const n=[...mnaFull];n[3]=v;setMnaFull(n);}} />
              <RadioGroup question="K. บริโภคโปรตีน (นม/ไข่/ถั่ว/เนื้อสัตว์) ได้ครบตามเกณฑ์กี่อย่าง?" options={[{v:0,l:'0-1 อย่าง'},{v:0.5,l:'2 อย่าง'},{v:1,l:'ครบ 3 อย่าง'}]} val={mnaFull[4]} onChange={(v)=>{const n=[...mnaFull];n[4]=v;setMnaFull(n);}} />
              <RadioGroup question="L. กินผักผลไม้อย่างน้อยวันละ 2 ส่วน?" options={[{v:0,l:'ไม่ใช่'},{v:1,l:'ใช่'}]} val={mnaFull[5]} onChange={(v)=>{const n=[...mnaFull];n[5]=v;setMnaFull(n);}} />
              <RadioGroup question="M. ปริมาณน้ำดื่มต่อวัน" options={[{v:0,l:'< 3 แก้ว'},{v:0.5,l:'3-5 แก้ว'},{v:1,l:'> 5 แก้ว'}]} val={mnaFull[6]} onChange={(v)=>{const n=[...mnaFull];n[6]=v;setMnaFull(n);}} />
              <RadioGroup question="N. รูปแบบการกินอาหาร" options={[{v:0,l:'ต้องมีคนป้อน'},{v:1,l:'กินเองได้แต่ลำบาก'},{v:2,l:'กินเองได้ปกติ'}]} val={mnaFull[7]} onChange={(v)=>{const n=[...mnaFull];n[7]=v;setMnaFull(n);}} />
              <RadioGroup question="O. ประเมินภาวะโภชนาการตนเอง" options={[{v:0,l:'ขาดสารอาหาร'},{v:1,l:'ไม่แน่ใจ'},{v:2,l:'ปกติ'}]} val={mnaFull[8]} onChange={(v)=>{const n=[...mnaFull];n[8]=v;setMnaFull(n);}} />
              <RadioGroup question="P. เทียบสุขภาพกับคนวัยเดียวกัน" options={[{v:0,l:'แย่กว่า'},{v:0.5,l:'ไม่แน่ใจ'},{v:1,l:'เท่าๆ กัน'},{v:2,l:'ดีกว่า'}]} val={mnaFull[9]} onChange={(v)=>{const n=[...mnaFull];n[9]=v;setMnaFull(n);}} />
              <RadioGroup question="Q. เส้นรอบวงแขน (MAC)" options={[{v:0,l:'< 21 ซม.'},{v:0.5,l:'21-22 ซม.'},{v:1,l:'≥ 22 ซม.'}]} val={mnaFull[10]} onChange={(v)=>{const n=[...mnaFull];n[10]=v;setMnaFull(n);}} />
              <RadioGroup question="R. เส้นรอบน่อง (CC)" options={[{v:0,l:'< 31 ซม.'},{v:1,l:'≥ 31 ซม.'}]} val={mnaFull[11]} onChange={(v)=>{const n=[...mnaFull];n[11]=v;setMnaFull(n);}} />
            </Section>
            <button onClick={handleNextMnaFull} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${NUTRI_COLOR},#b45309)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)' }}>บันทึกและดูผล →</button>
          </div>
        </div>
      );
    }
  }

  return null;
}