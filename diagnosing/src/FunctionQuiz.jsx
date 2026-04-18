import React, { useState } from 'react';
import { loadDraft, saveDraft, clearDraft } from './shared/quizStorage';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

const FUNC_COLOR = '#4f46e5';
const FUNC_BG = '#e0e7ff';
const FUNC_BORDER = '#c7d2fe';

const Section = ({ title, desc, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${FUNC_COLOR}33`, borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: FUNC_COLOR }} />
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
          <button key={opt.v} onClick={() => onChange(opt.v)} style={{ flex: '1 1 auto', padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isSel ? (opt.warn ? '#fca5a5' : FUNC_COLOR) : 'var(--mint-border)'}`, background: isSel ? (opt.warn ? '#fff1f1' : FUNC_BG) : 'white', color: isSel ? (opt.warn ? '#dc2626' : FUNC_COLOR) : 'var(--mint-muted)', cursor: 'pointer', transition: 'all 0.18s' }}>
            {opt.l}
          </button>
        );
      })}
    </div>
  </div>
);

export default function FunctionQuiz({ tool, onBack, onComplete, patient }) {
  const [adl, setAdl] = useState(Array(10).fill(null));
  const [frail, setFrail] = useState(Array(5).fill(null));

  const handleFinishADL = () => {
    if (adl.includes(null)) { alert('⚠️ กรุณาประเมิน ADL ให้ครบทั้ง 10 ข้อ'); return; }
    const sumADL = adl.reduce((a, b) => a + b, 0);
    
    let res = 'กลุ่มติดสังคม';
    let impaired = false;
    if (sumADL <= 4) { res = 'กลุ่มติดเตียง'; impaired = true; }
    else if (sumADL <= 11) { res = 'กลุ่มติดบ้าน'; impaired = true; }

    if (onComplete) {
      onComplete({
        type: 'ADL (สมรรถนะกิจวัตรประจำวัน)',
        totalScore: sumADL, maxScore: 20, impaired, duration: 0, resultText: res,
        breakdown: {
          "1. รับประทานอาหาร (Feeding)": adl[0],
          "2. ล้างหน้าหวีผม (Grooming)": adl[1],
          "3. ลุกนั่งจากเตียง (Transfer)": adl[2],
          "4. ใช้ห้องน้ำ (Toilet use)": adl[3],
          "5. การเคลื่อนที่ (Mobility)": adl[4],
          "6. การสวมใส่เสื้อผ้า (Dressing)": adl[5],
          "7. การขึ้นลงบันได (Stairs)": adl[6],
          "8. การอาบน้ำ (Bathing)": adl[7],
          "9. การกลั้นอุจจาระ (Bowels)": adl[8],
          "10. การกลั้นปัสสาวะ (Bladder)": adl[9],
          "การแปลผล ADL": res
        }
      });
    }
  };

  const handleFinishFrail = () => {
    if (frail.includes(null)) { alert('⚠️ กรุณาประเมิน Frail Scale ให้ครบทั้ง 5 ข้อ'); return; }
    const sumFrail = frail.reduce((a, b) => a + b, 0); // 1 = มีอาการ, 0 = ไม่มี
    
    let res = 'ปกติ (Robust)';
    let impaired = false;
    if (sumFrail >= 3) { res = 'เปราะบาง (Frail)'; impaired = true; }
    else if (sumFrail >= 1) { res = 'ก่อนเปราะบาง (Pre-frail)'; impaired = true; }

    if (onComplete) {
      onComplete({
        type: 'Frail Scale (ความเปราะบาง)',
        totalScore: sumFrail, maxScore: 5, impaired, duration: 0, resultText: res,
        breakdown: {
          "F - เหนื่อยล้าตลอดเวลา": frail[0] === 1 ? 'ใช่' : 'ไม่ใช่',
          "R - เดินขึ้นบันได 1 ชั้นไม่ได้": frail[1] === 1 ? 'ใช่' : 'ไม่ใช่',
          "A - เดินระยะทาง 1 ช่วงตึกไม่ได้": frail[2] === 1 ? 'ใช่' : 'ไม่ใช่',
          "I - มีโรคประจำตัว ≥ 5 โรค": frail[3] === 1 ? 'ใช่' : 'ไม่ใช่',
          "L - น้ำหนักลด > 5% ใน 1 ปี": frail[4] === 1 ? 'ใช่' : 'ไม่ใช่',
          "การแปลผล Frail Scale": res
        }
      });
    }
  };

  const handleBack = () => {
    if (window.confirm('ออกจากการทดสอบ?\nคำตอบที่ตอบไปแล้วจะถูกบันทึกไว้ชั่วคราว')) {
      onBack();
    }
  };

  if (tool === 'ADL') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(238,242,255,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${FUNC_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={FUNC_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>กิจวัตรประจำวัน (ADL)</span></div>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
          <Section title="Barthel ADL Index" desc="ประเมินความสามารถในการทำกิจวัตรประจำวัน">
            <RadioGroup question="1. รับประทานอาหาร (Feeding)" options={[{v:0,l:'ทำไม่ได้'},{v:1,l:'ทำได้บ้าง/ต้องช่วย'},{v:2,l:'ทำเองได้ปกติ'}]} val={adl[0]} onChange={(v)=>{const n=[...adl];n[0]=v;setAdl(n);}} />
            <RadioGroup question="2. ล้างหน้า หวีผม แปรงฟัน (Grooming)" options={[{v:0,l:'ต้องการคนช่วย'},{v:1,l:'ทำเองได้'}]} val={adl[1]} onChange={(v)=>{const n=[...adl];n[1]=v;setAdl(n);}} />
            <RadioGroup question="3. ลุกนั่งจากเตียงไปเก้าอี้ (Transfer)" options={[{v:0,l:'ทำไม่ได้'},{v:1,l:'ใช้คนช่วย 2 คน'},{v:2,l:'ใช้คนช่วย 1 คน'},{v:3,l:'ทำเองได้'}]} val={adl[2]} onChange={(v)=>{const n=[...adl];n[2]=v;setAdl(n);}} />
            <RadioGroup question="4. การใช้ห้องน้ำ (Toilet use)" options={[{v:0,l:'ทำไม่ได้'},{v:1,l:'ทำได้บ้าง'},{v:2,l:'ทำเองได้ปกติ'}]} val={adl[3]} onChange={(v)=>{const n=[...adl];n[3]=v;setAdl(n);}} />
            <RadioGroup question="5. การเคลื่อนที่ภายในห้อง/บ้าน (Mobility)" options={[{v:0,l:'เดินไม่ได้'},{v:1,l:'นั่งรถเข็น/หมุนเองได้'},{v:2,l:'เดินโดยมีคนช่วยพยุง'},{v:3,l:'เดินเองได้'}]} val={adl[4]} onChange={(v)=>{const n=[...adl];n[4]=v;setAdl(n);}} />
            <RadioGroup question="6. การสวมใส่เสื้อผ้า (Dressing)" options={[{v:0,l:'ทำไม่ได้'},{v:1,l:'ทำได้ครึ่งหนึ่ง'},{v:2,l:'ทำเองได้ปกติ'}]} val={adl[5]} onChange={(v)=>{const n=[...adl];n[5]=v;setAdl(n);}} />
            <RadioGroup question="7. การขึ้นลงบันได 1 ชั้น (Stairs)" options={[{v:0,l:'ทำไม่ได้'},{v:1,l:'ต้องการคนช่วย'},{v:2,l:'ขึ้นลงเองได้'}]} val={adl[6]} onChange={(v)=>{const n=[...adl];n[6]=v;setAdl(n);}} />
            <RadioGroup question="8. การอาบน้ำ (Bathing)" options={[{v:0,l:'ต้องมีคนช่วย'},{v:1,l:'ทำเองได้'}]} val={adl[7]} onChange={(v)=>{const n=[...adl];n[7]=v;setAdl(n);}} />
            <RadioGroup question="9. การกลั้นอุจจาระ (Bowels)" options={[{v:0,l:'กลั้นไม่ได้เลย'},{v:1,l:'กลั้นไม่ได้บางครั้ง'},{v:2,l:'กลั้นได้ปกติ'}]} val={adl[8]} onChange={(v)=>{const n=[...adl];n[8]=v;setAdl(n);}} />
            <RadioGroup question="10. การกลั้นปัสสาวะ (Bladder)" options={[{v:0,l:'กลั้นไม่ได้/ใส่สายสวน'},{v:1,l:'กลั้นไม่ได้บางครั้ง'},{v:2,l:'กลั้นได้ปกติ'}]} val={adl[9]} onChange={(v)=>{const n=[...adl];n[9]=v;setAdl(n);}} />
          </Section>
          <button onClick={handleFinishADL} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${FUNC_COLOR},#3730a3)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}>บันทึกและดูผล →</button>
        </div>
      </div>
    );
  }

  if (tool === 'FRAIL') {
    const opts = [{v:0, l:'ไม่มี/ไม่ใช่'}, {v:1, l:'มี/ใช่', warn:true}];
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(238,242,255,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${FUNC_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={FUNC_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ความเปราะบาง (Frail Scale)</span></div>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
          <Section title="Frail Scale" desc="แบบประเมินความเปราะบางของผู้สูงอายุ">
            <RadioGroup question="F (Fatigue) - ท่านรู้สึกเหนื่อยล้าตลอดเวลาหรือไม่?" options={opts} val={frail[0]} onChange={(v)=>{const n=[...frail];n[0]=v;setFrail(n);}} />
            <RadioGroup question="R (Resistance) - ท่านไม่สามารถเดินขึ้นบันได 1 ชั้นได้ด้วยตนเองใช่หรือไม่?" options={opts} val={frail[1]} onChange={(v)=>{const n=[...frail];n[1]=v;setFrail(n);}} />
            <RadioGroup question="A (Ambulation) - ท่านไม่สามารถเดินระยะทาง 1 ช่วงตึกได้ด้วยตนเองใช่หรือไม่?" options={opts} val={frail[2]} onChange={(v)=>{const n=[...frail];n[2]=v;setFrail(n);}} />
            <RadioGroup question="I (Illness) - ท่านมีโรคประจำตัวตั้งแต่ 5 โรคขึ้นไปใช่หรือไม่?" options={opts} val={frail[3]} onChange={(v)=>{const n=[...frail];n[3]=v;setFrail(n);}} />
            <RadioGroup question="L (Loss of weight) - น้ำหนักตัวลดลงมากกว่า 5% ในช่วง 1 ปีที่ผ่านมาใช่หรือไม่?" options={opts} val={frail[4]} onChange={(v)=>{const n=[...frail];n[4]=v;setFrail(n);}} />
          </Section>
          <button onClick={handleFinishFrail} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${FUNC_COLOR},#3730a3)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}>บันทึกและดูผล →</button>
        </div>
      </div>
    );
  }
}