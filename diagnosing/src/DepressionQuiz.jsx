import React, { useState } from 'react';
import { loadDraft, saveDraft, clearDraft } from './shared/quizStorage';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

const DEP_COLOR = '#e11d48';
const DEP_BG = '#fff1f2';
const DEP_BORDER = '#fecdd3';

const Section = ({ title, desc, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${DEP_COLOR}33`, borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: DEP_COLOR }} />
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
          <button key={opt.v} onClick={() => onChange(opt.v)} style={{ flex: '1 1 auto', padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isSel ? (opt.warn ? '#fca5a5' : DEP_COLOR) : 'var(--mint-border)'}`, background: isSel ? (opt.warn ? '#fff1f1' : DEP_BG) : 'white', color: isSel ? (opt.warn ? '#dc2626' : DEP_COLOR) : 'var(--mint-muted)', cursor: 'pointer', transition: 'all 0.18s' }}>
            {opt.l}
          </button>
        );
      })}
    </div>
  </div>
);

export default function DepressionQuiz({ onBack, onComplete, patient }) {
  const [step, setStep] = useState('2Q');
  const [q2, setQ2] = useState([null, null]);
  const [q9, setQ9] = useState(Array(9).fill(null));

  const handleNext2Q = () => {
    if (q2.includes(null)) { alert('⚠️ กรุณาตอบแบบคัดกรอง 2Q ให้ครบทั้ง 2 ข้อครับ'); return; }
    const sum2Q = q2.reduce((a, b) => a + b, 0);
    if (sum2Q > 0) setStep('9Q');
    else finishQuiz();
  };

  const handleNext9Q = () => {
    if (q9.includes(null)) { alert('⚠️ กรุณาตอบแบบประเมิน 9Q ให้ครบทั้ง 9 ข้อครับ'); return; }
    finishQuiz();
  };

  const finishQuiz = () => {
    const sum2Q = q2.reduce((a, b) => (a || 0) + (b || 0), 0);
    const sum9Q = step === '9Q' ? q9.reduce((a, b) => (a || 0) + (b || 0), 0) : 0;
    
    let res9Q = 'ปกติ';
    if (sum9Q >= 19) res9Q = 'ซึมเศร้าระดับรุนแรง';
    else if (sum9Q >= 13) res9Q = 'ซึมเศร้าระดับปานกลาง';
    else if (sum9Q >= 7) res9Q = 'ซึมเศร้าระดับน้อย';
    else if (step === '9Q') res9Q = 'ไม่มีอาการซึมเศร้า';

    // เช็คข้อ 9 ว่าคิดอยากตายหรือไม่ ถ้ามีให้บวกคำเตือน
    const suicideWarn = q9[8] > 0 ? ' (ควรประเมิน 8Q ต่อ)' : '';
    
    const impaired = sum2Q > 0;
    const finalResultText = step === '2Q' ? 'ปกติ (ผ่าน 2Q)' : (sum9Q >= 7 || q9[8] > 0 ? `${res9Q}${suicideWarn}` : res9Q);

    const fAns = (v) => v === 1 ? 'มี' : v === 0 ? 'ไม่มี' : 'ไม่ได้ประเมิน';
    const f9Ans = (v) => v === 3 ? 'เป็นทุกวัน' : v === 2 ? 'เป็นบ่อย' : v === 1 ? 'เป็นบางวัน' : v === 0 ? 'ไม่มีเลย' : 'ไม่ได้ประเมิน';

    if (onComplete) {
      onComplete({
        type: 'Depression (2Q/9Q)',
        totalScore: sum9Q,
        maxScore: 27,
        impaired: impaired,
        duration: 0,
        resultText: finalResultText,
        breakdown: {
          "2Q-1. รู้สึกหดหู่ เศร้า ท้อแท้": fAns(q2[0]),
          "2Q-2. เบื่อ ทำอะไรไม่เพลิดเพลิน": fAns(q2[1]),
          "2Q ผลคัดกรอง": sum2Q > 0 ? 'พบความเสี่ยง (ทำ 9Q ต่อ)' : 'ปกติ',
          "9Q-1. เบื่อ ไม่สนใจอยากทำอะไร": f9Ans(q9[0]),
          "9Q-2. ไม่สบายใจ ซึมเศร้า ท้อแท้": f9Ans(q9[1]),
          "9Q-3. หลับยาก/หลับๆตื่นๆ/หลับมากไป": f9Ans(q9[2]),
          "9Q-4. เหนื่อยง่าย/ไม่ค่อยมีแรง": f9Ans(q9[3]),
          "9Q-5. เบื่ออาหาร/กินมากเกินไป": f9Ans(q9[4]),
          "9Q-6. รู้สึกไม่ดีกับตัวเอง/ล้มเหลว": f9Ans(q9[5]),
          "9Q-7. สมาธิไม่ดีเวลาทำอะไร": f9Ans(q9[6]),
          "9Q-8. พูดช้า/ทำอะไรช้าลง/กระสับกระส่าย": f9Ans(q9[7]),
          "9Q-9. คิดทำร้ายตนเอง/อยากตาย": f9Ans(q9[8]),
          "9Q คะแนนรวม": step === '9Q' ? sum9Q : '-',
          "9Q การแปลผล": step === '9Q' ? res9Q : '-',
        },
      });
    }
  };

  const handleBack = () => {
    if (window.confirm('ออกจากการทดสอบ?\nคำตอบที่ตอบไปแล้วจะถูกบันทึกไว้ชั่วคราว')) {
      onBack();
    }
  };

  if (step === '2Q') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,241,242,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${DEP_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={DEP_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>คัดกรองโรคซึมเศร้า (2Q)</span></div>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
          <Section title="แบบคัดกรองโรคซึมเศร้า 2 คำถาม (2Q)" desc="ใน 2 สัปดาห์ที่ผ่านมา รวมวันนี้ ท่านมีอาการเหล่านี้หรือไม่?">
            <RadioGroup question="1. ท่านรู้สึก หดหู่ เศร้า หรือท้อแท้สิ้นหวัง หรือไม่?" options={[{v:0, l:'ไม่มี'}, {v:1, l:'มี', warn:true}]} val={q2[0]} onChange={(v) => { const n = [...q2]; n[0]=v; setQ2(n); }} />
            <RadioGroup question="2. ท่านรู้สึก เบื่อ ทำอะไรก็ไม่เพลิดเพลิน หรือไม่?" options={[{v:0, l:'ไม่มี'}, {v:1, l:'มี', warn:true}]} val={q2[1]} onChange={(v) => { const n = [...q2]; n[1]=v; setQ2(n); }} />
          </Section>
          <button onClick={handleNext2Q} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${DEP_COLOR},#be123c)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)' }}>ถัดไป →</button>
        </div>
      </div>
    );
  }

  if (step === '9Q') {
    const q9Text = ["1. เบื่อ ไม่สนใจอยากทำอะไร", "2. ไม่สบายใจ ซึมเศร้า ท้อแท้", "3. หลับยาก หรือหลับๆ ตื่นๆ หรือหลับมากไป", "4. เหนื่อยง่าย หรือ ไม่ค่อยมีแรง", "5. เบื่ออาหาร หรือ กินมากเกินไป", "6. รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว หรือทำให้ตนเอง/ครอบครัวผิดหวัง", "7. สมาธิไม่ดีเวลาทำอะไร เช่น ดูโทรทัศน์ ฟังวิทยุ", "8. พูดช้า ทำอะไรช้าลงจนคนอื่นสังเกตเห็นได้ หรือกระสับกระส่าย", "9. คิดทำร้ายตนเอง หรือคิดว่าถ้าตายไปคงจะดี"];
    const opts9Q = [{v:0,l:'ไม่มีเลย'}, {v:1,l:'เป็นบางวัน (1-7 วัน)'}, {v:2,l:'เป็นบ่อย (>7 วัน)'}, {v:3,l:'เป็นทุกวัน', warn:true}];
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,241,242,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${DEP_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setStep('2Q')} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ (2Q)</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={DEP_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ประเมินความรุนแรง (9Q)</span></div>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
          <Section title="แบบประเมินโรคซึมเศร้า 9 คำถาม (9Q)" desc="ในช่วง 2 สัปดาห์ที่ผ่านมา ท่านมีอาการดังต่อไปนี้บ่อยแค่ไหน?">
            {q9Text.map((q, i) => <RadioGroup key={i} question={q} options={opts9Q} val={q9[i]} onChange={(v) => { const n=[...q9]; n[i]=v; setQ9(n); }} />)}
          </Section>
          <button onClick={handleNext9Q} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${DEP_COLOR},#be123c)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)' }}>บันทึกและดูผล →</button>
        </div>
      </div>
    );
  }
}