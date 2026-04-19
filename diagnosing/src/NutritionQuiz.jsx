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
  const [mnaSF, setMnaSF] = useState(Array(7).fill(null)); // index 5=BMI, index 6=CC (alternative)
  const [mnaFull, setMnaFull] = useState(Array(12).fill(null));

  // MSRA-5 States
  const [msra, setMsra] = useState(Array(5).fill(null));

  /* ── MNA Logic ── */
  const handleNextMnaSF = () => {
    // Q1-Q5 must be answered; Q6 (BMI) or Q7 (CC) must be answered
    const q1to5 = mnaSF.slice(0, 5);
    if (q1to5.includes(null)) { alert('⚠️ กรุณาตอบคำถามข้อ 1–5 ให้ครบ'); return; }
    if (mnaSF[5] === null && mnaSF[6] === null) { alert('⚠️ กรุณาตอบคำถามข้อ 6 (BMI) หรือข้อ 7 (CC) อย่างน้อย 1 ข้อ'); return; }
    const q6val = mnaSF[5] !== null ? mnaSF[5] : mnaSF[6];
    const sumSF = q1to5.reduce((a, b) => a + b, 0) + q6val;
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
    const q6val = mnaSF[5] !== null ? mnaSF[5] : (mnaSF[6] ?? 0);
    const sumSF = mnaSF.slice(0, 5).reduce((a, b) => (a || 0) + (b || 0), 0) + q6val;
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
          "1. ในช่วง 3 เดือนที่ผ่านมา รับประทานอาหารได้น้อยลงเนื่องจากความอยากอาหารลดลง มีปัญหาการย่อย การเคี้ยว หรือปัญหาการกลืนหรือไม่": mnaSF[0] ?? '-',
          "2. ในช่วง 3 เดือนที่ผ่านมา น้ำหนักลดลงหรือไม่": mnaSF[1] ?? '-',
          "3. สามารถเคลื่อนไหวได้เองหรือไม่": mnaSF[2] ?? '-',
          "4. ใน 3 เดือนที่ผ่านมา มีความเครียดรุนแรงหรือป่วยเฉียบพลันหรือไม่": mnaSF[3] ?? '-',
          "5. มีปัญหาทางจิตประสาท (Neuropsychological problems) หรือไม่": mnaSF[4] ?? '-',
          "6. ดัชนีมวลกาย (BMI)": mnaSF[5] ?? '-',
          "7. เส้นรอบวงน่อง CC (ใช้แทน BMI)": mnaSF[6] ?? '-',
          "คะแนน MNA-SF": sumSF,
          "--- MNA Full Form ---": stepMNA === 'FULL' ? "" : "ไม่ได้ประเมิน",
          "G. ช่วยเหลือตัวเองได้หรือไม่": mnaFull[0] ?? '-',
          "H. รับประทานยามากกว่า 3 ชนิดต่อวันหรือไม่": mnaFull[1] ?? '-',
          "I. มีแผลกดทับหรือแผลที่ผิวหนังหรือไม่": mnaFull[2] ?? '-',
          "J. รับประทานอาหารเต็มมื้อ ได้กี่มื้อต่อวัน": mnaFull[3] ?? '-',
          "K. รับประทานอาหารจำพวกโปรตีน": mnaFull[4] ?? '-',
          "L. รับประทานผักหรือผลไม้อย่างน้อย 2 หน่วยบริโภคต่อวันหรือไม่": mnaFull[5] ?? '-',
          "M. ดื่มเครื่องดื่มปริมาณเท่าไรต่อวัน": mnaFull[6] ?? '-',
          "N. ความสามารถในการช่วยเหลือตัวเองขณะรับประทานอาหาร": mnaFull[7] ?? '-',
          "O. ท่านคิดว่าตนเองมีภาวะโภชนาการเป็นอย่างไร": mnaFull[8] ?? '-',
          "P. เมื่อเทียบกับคนในวัยเดียวกัน ท่านคิดว่าสุขภาพของตนเป็นอย่างไร": mnaFull[9] ?? '-',
          "Q. เส้นรอบวงแขน (Mid-arm circumference; MAC)": mnaFull[10] ?? '-',
          "R. เส้นรอบวงน่อง (Calf circumference; CC)": mnaFull[11] ?? '-',
          "คะแนนรวม MNA": stepMNA === 'FULL' ? totalMNA : '-',
          "การแปลผลโภชนาการ": res,
        }
      });
    }
  };

  /* ── MSRA-5 Logic ── */
  // Max score: 5+2+15+2+10 = 34; cutoff ≤ 20 = sarcopenia risk
  const handleFinishMSRA = () => {
    if (msra.includes(null)) { alert('⚠️ กรุณาตอบ Modified MSRA-5 ให้ครบทั้ง 5 ข้อ'); return; }
    const sumMSRA = msra.reduce((a, b) => a + b, 0);
    const impaired = sumMSRA <= 20;
    const res = impaired ? 'เสี่ยงต่อภาวะมวลกล้ามเนื้อน้อย (Sarcopenia)' : 'ปกติ (มวลกล้ามเนื้ออยู่ในเกณฑ์)';

    if (onComplete) {
      onComplete({
        type: 'Modified MSRA-5',
        totalScore: sumMSRA,
        maxScore: 34,
        impaired, duration: 0, resultText: res,
        breakdown: {
          "1. อายุ": msra[0],
          "2. นอนโรงพยาบาลในช่วงปีที่ผ่านมา": msra[1],
          "3. ระดับการทำกิจกรรม": msra[2],
          "4. รับประทานอาหาร 3 มื้อเป็นประจำ": msra[3],
          "5. น้ำหนักลดลงใน 1 ปีที่ผ่านมา": msra[4],
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
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,251,235,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${NUTRI_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={NUTRI_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ภาวะมวลกล้ามเนื้อ (MSRA-5)</span></div>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
          <Section title="Modified MSRA-5" desc="แบบคัดกรองภาวะมวลกล้ามเนื้อน้อย (Sarcopenia)">
            <RadioGroup question="1. คุณอายุเท่าไหร่" options={[{v:0,l:'มากกว่าหรือเท่ากับ 70 ปี',warn:true},{v:5,l:'น้อยกว่า 70 ปี'}]} val={msra[0]} onChange={(v) => { const n=[...msra]; n[0]=v; setMsra(n); }} />
            <RadioGroup question="2. คุณได้รับการรักษาโดยการนอนโรงพยาบาลในช่วงปีที่ผ่านมาหรือไม่" options={[{v:0,l:'รับการรักษาและมากกว่า 1 ครั้ง',warn:true},{v:1,l:'รับการรักษาเพียงครั้งเดียว'},{v:2,l:'ไม่ได้รับการรักษาในโรงพยาบาล'}]} val={msra[1]} onChange={(v) => { const n=[...msra]; n[1]=v; setMsra(n); }} />
            <RadioGroup question="3. ข้อใดเป็นระดับในการทำกิจกรรมของคุณ" options={[{v:0,l:'ฉันสามารถเดินได้น้อยกว่า 1,000 เมตร (1 กิโลเมตร)',warn:true},{v:15,l:'ฉันสามารถเดินได้มากกว่า 1,000 เมตร (1 กิโลเมตร)'}]} val={msra[2]} onChange={(v) => { const n=[...msra]; n[2]=v; setMsra(n); }} />
            <RadioGroup question="4. คุณรับประทานอาหาร 3 มื้อเป็นประจำหรือไม่" options={[{v:0,l:'ไม่ ฉันข้ามอาหารบางมื้อตั้งแต่ 2 ครั้งต่อสัปดาห์ขึ้นไป',warn:true},{v:2,l:'รับประทานอาหาร 3 มื้อเป็นประจำ'}]} val={msra[3]} onChange={(v) => { const n=[...msra]; n[3]=v; setMsra(n); }} />
            <RadioGroup question="5. คุณน้ำหนักลดลงในช่วง 1 ปีที่ผ่านมาหรือไม่" options={[{v:0,l:'ลดลงมากกว่า 2 กิโลกรัม',warn:true},{v:10,l:'ลดลงน้อยกว่าหรือเท่ากับ 2 กิโลกรัม'}]} val={msra[4]} onChange={(v) => { const n=[...msra]; n[4]=v; setMsra(n); }} />
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
            <Section title="ส่วนที่ 1: การคัดกรองเบื้องต้น">
              <RadioGroup question="1. ในช่วง 3 เดือนที่ผ่านมา รับประทานอาหารได้น้อยลงเนื่องจากความอยากอาหารลดลง มีปัญหาการย่อย การเคี้ยว หรือปัญหาการกลืนหรือไม่" options={[{v:0,l:'0 = รับประทานอาหารน้อยลงอย่างมาก',warn:true},{v:1,l:'1 = รับประทานอาหารน้อยลงปานกลาง'},{v:2,l:'2 = การรับประทานอาหารไม่เปลี่ยนแปลง'}]} val={mnaSF[0]} onChange={(v)=>{const n=[...mnaSF];n[0]=v;setMnaSF(n);}} />
              <RadioGroup question="2. ในช่วง 3 เดือนที่ผ่านมา น้ำหนักลดลงหรือไม่" options={[{v:0,l:'0 = น้ำหนักลดลงมากกว่า 3 กิโลกรัม',warn:true},{v:1,l:'1 = ไม่ทราบ'},{v:2,l:'2 = น้ำหนักลดลงระหว่าง 1-3 กิโลกรัม'},{v:3,l:'3 = น้ำหนักไม่ลดลง'}]} val={mnaSF[1]} onChange={(v)=>{const n=[...mnaSF];n[1]=v;setMnaSF(n);}} />
              <RadioGroup question="3. สามารถเคลื่อนไหวได้เองหรือไม่" options={[{v:0,l:'0 = นอนบนเตียงหรือต้องอาศัยรถเข็นตลอดเวลา',warn:true},{v:1,l:'1 = ลุกจากเตียงหรือรถเข็นได้บ้าง แต่ไม่สามารถไปข้างนอกได้เอง'},{v:2,l:'2 = เดินและเคลื่อนไหวได้ตามปกติ'}]} val={mnaSF[2]} onChange={(v)=>{const n=[...mnaSF];n[2]=v;setMnaSF(n);}} />
              <RadioGroup question="4. ใน 3 เดือนที่ผ่านมา มีความเครียดรุนแรงหรือป่วยเฉียบพลันหรือไม่" options={[{v:0,l:'0 = มี',warn:true},{v:2,l:'2 = ไม่มี'}]} val={mnaSF[3]} onChange={(v)=>{const n=[...mnaSF];n[3]=v;setMnaSF(n);}} />
              <RadioGroup question="5. มีปัญหาทางจิตประสาท (Neuropsychological problems) หรือไม่" options={[{v:0,l:'0 = ความจำเสื่อมหรือซึมเศร้าอย่างรุนแรง',warn:true},{v:1,l:'1 = ความจำเสื่อมเล็กน้อย'},{v:2,l:'2 = ไม่มีปัญหาทางประสาท'}]} val={mnaSF[4]} onChange={(v)=>{const n=[...mnaSF];n[4]=v;setMnaSF(n);}} />
              <RadioGroup question="6. ดัชนีมวลกาย (BMI) = น้ำหนักตัว (กก.) / [ส่วนสูง (ม.)²] มีค่าเท่าใด" options={[{v:0,l:'0 = BMI น้อยกว่า 19',warn:true},{v:1,l:'1 = BMI ตั้งแต่ 19 แต่น้อยกว่า 21'},{v:2,l:'2 = BMI ตั้งแต่ 21 แต่น้อยกว่า 23'},{v:3,l:'3 = BMI ตั้งแต่ 23 ขึ้นไป'}]} val={mnaSF[5]} onChange={(v)=>{const n=[...mnaSF];n[5]=v;n[6]=null;setMnaSF(n);}} />
              <div style={{ padding: '8px 12px', background: '#fff7ed', border: '1px solid #fcd34d', borderRadius: 10, fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                หากไม่สามารถหาค่าดัชนีมวลกายได้ให้เปลี่ยนคำถามข้อ 6 เป็น 7
              </div>
              <RadioGroup question="7. เส้นรอบวงน่อง (Calf circumference; CC) มีค่ากี่เซนติเมตร (ใช้ในกรณีที่ไม่สามารถหาค่า BMI ได้)" options={[{v:0,l:'0 = น้อยกว่า 31 เซนติเมตร',warn:true},{v:3,l:'3 = ตั้งแต่ 31 เซนติเมตรขึ้นไป'}]} val={mnaSF[6]} onChange={(v)=>{const n=[...mnaSF];n[6]=v;n[5]=null;setMnaSF(n);}} />
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
            <Section title="ส่วนที่ 1: ข้อมูลด้านสุขภาพทั่วไป">
              <RadioGroup question="ช่วยเหลือตัวเองได้หรือไม่ (ไม่ได้อยู่ในความดูแลของสถานพักฟื้นหรือโรงพยาบาล)" options={[{v:1,l:'1 = ใช่ (อยู่บ้าน/ดูแลตัวเองได้)'},{v:0,l:'0 = ไม่ใช่ (อยู่สถานพักฟื้น)',warn:true}]} val={mnaFull[0]} onChange={(v)=>{const n=[...mnaFull];n[0]=v;setMnaFull(n);}} />
              <RadioGroup question="รับประทานยามากกว่า 3 ชนิดต่อวันหรือไม่" options={[{v:0,l:'0 = ใช่',warn:true},{v:1,l:'1 = ไม่ใช่'}]} val={mnaFull[1]} onChange={(v)=>{const n=[...mnaFull];n[1]=v;setMnaFull(n);}} />
              <RadioGroup question="มีแผลกดทับหรือแผลที่ผิวหนังหรือไม่" options={[{v:0,l:'0 = ใช่',warn:true},{v:1,l:'1 = ไม่ใช่'}]} val={mnaFull[2]} onChange={(v)=>{const n=[...mnaFull];n[2]=v;setMnaFull(n);}} />
            </Section>
            <Section title="ส่วนที่ 2: พฤติกรรมการบริโภค">
              <RadioGroup question="รับประทานอาหารเต็มมื้อ ได้กี่มื้อต่อวัน" options={[{v:0,l:'0 = 1 มื้อ',warn:true},{v:1,l:'1 = 2 มื้อ'},{v:2,l:'2 = 3 มื้อ'}]} val={mnaFull[3]} onChange={(v)=>{const n=[...mnaFull];n[3]=v;setMnaFull(n);}} />
              <RadioGroup question="รับประทานอาหารจำพวกโปรตีนเหล่านี้บ้างหรือไม่: ดื่มนมหรือผลิตภัณฑ์จากนม (เช่น ชีส โยเกิร์ต) อย่างน้อย 1 หน่วยบริโภคต่อวัน / ทานถั่วหรือไข่อย่างน้อย 2 หน่วยบริโภคต่อสัปดาห์ / ทานเนื้อสัตว์ ปลา หรือสัตว์ปีกทุกวัน" options={[{v:0,l:'0 = ใช่เพียง 1 ข้อ หรือไม่ใช่เลย',warn:true},{v:0.5,l:'0.5 = ใช่ 2 ข้อ'},{v:1,l:'1 = ใช่ครบทั้ง 3 ข้อ'}]} val={mnaFull[4]} onChange={(v)=>{const n=[...mnaFull];n[4]=v;setMnaFull(n);}} />
              <RadioGroup question="รับประทานผักหรือผลไม้อย่างน้อย 2 หน่วยบริโภคต่อวันหรือไม่" options={[{v:0,l:'0 = ไม่ใช่ (น้อยกว่า 2 หน่วยบริโภค)',warn:true},{v:1,l:'1 = ใช่ (ตั้งแต่ 2 หน่วยบริโภคขึ้นไป)'}]} val={mnaFull[5]} onChange={(v)=>{const n=[...mnaFull];n[5]=v;setMnaFull(n);}} />
              <RadioGroup question="ดื่มเครื่องดื่ม (น้ำ น้ำผลไม้ กาแฟ ชา นม หรืออื่นๆ) ปริมาณเท่าไรต่อวัน" options={[{v:0,l:'0 = น้อยกว่า 3 ถ้วย',warn:true},{v:0.5,l:'0.5 = 3-5 ถ้วย'},{v:1,l:'1 = มากกว่า 5 ถ้วย'}]} val={mnaFull[6]} onChange={(v)=>{const n=[...mnaFull];n[6]=v;setMnaFull(n);}} />
              <RadioGroup question="ความสามารถในการช่วยเหลือตัวเองขณะรับประทานอาหารเป็นอย่างไร" options={[{v:0,l:'0 = ไม่สามารถรับประทานอาหารได้เอง',warn:true},{v:1,l:'1 = รับประทานอาหารได้เองแต่ค่อนข้างลำบาก'},{v:2,l:'2 = รับประทานอาหารได้เอง / ไม่มีปัญหา'}]} val={mnaFull[7]} onChange={(v)=>{const n=[...mnaFull];n[7]=v;setMnaFull(n);}} />
            </Section>
            <Section title="ส่วนที่ 3: การประเมินตนเอง">
              <RadioGroup question="ท่านคิดว่าตนเองมีภาวะโภชนาการเป็นอย่างไร" options={[{v:0,l:'0 = ขาดสารอาหาร',warn:true},{v:1,l:'1 = ไม่แน่ใจ'},{v:2,l:'2 = ไม่ขาดสารอาหาร'}]} val={mnaFull[8]} onChange={(v)=>{const n=[...mnaFull];n[8]=v;setMnaFull(n);}} />
              <RadioGroup question="เมื่อเทียบกับคนในวัยเดียวกัน ท่านคิดว่าสุขภาพของตนเป็นอย่างไร" options={[{v:0,l:'0 = ด้อยกว่า',warn:true},{v:0.5,l:'0.5 = ไม่ทราบ'},{v:1,l:'1 = พอกัน'},{v:2,l:'2 = ดีกว่า'}]} val={mnaFull[9]} onChange={(v)=>{const n=[...mnaFull];n[9]=v;setMnaFull(n);}} />
            </Section>
            <Section title="ส่วนที่ 4: การวัดสัดส่วนร่างกาย">
              <RadioGroup question="เส้นรอบวงแขน (Mid-arm circumference; MAC) มีค่ากี่เซนติเมตร" options={[{v:0,l:'0 = น้อยกว่า 21 ซม.',warn:true},{v:0.5,l:'0.5 = 21-22 ซม.'},{v:1,l:'1 = ตั้งแต่ 22 ซม. ขึ้นไป'}]} val={mnaFull[10]} onChange={(v)=>{const n=[...mnaFull];n[10]=v;setMnaFull(n);}} />
              <RadioGroup question="เส้นรอบวงน่อง (Calf circumference; CC) มีค่ากี่เซนติเมตร" options={[{v:0,l:'0 = น้อยกว่า 31 ซม.',warn:true},{v:1,l:'1 = ตั้งแต่ 31 ซม. ขึ้นไป'}]} val={mnaFull[11]} onChange={(v)=>{const n=[...mnaFull];n[11]=v;setMnaFull(n);}} />
            </Section>
            <button onClick={handleNextMnaFull} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${NUTRI_COLOR},#b45309)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)' }}>บันทึกและดูผล →</button>
          </div>
        </div>
      );
    }
  }

  return null;
}