import React, { useState } from 'react';
import { loadDraft, saveDraft, clearDraft } from './shared/quizStorage';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

// Theme สีแดง สำหรับความเสี่ยงฆ่าตัวตาย
const SUI_COLOR = '#dc2626';
const SUI_BG = '#fef2f2';
const SUI_BORDER = '#fecaca';

const Section = ({ title, desc, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${SUI_COLOR}33`, borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: SUI_COLOR }} />
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
          <button key={opt.v} onClick={() => onChange(opt.v)} style={{ flex: '1 1 auto', padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isSel ? (opt.warn ? '#fca5a5' : SUI_COLOR) : 'var(--mint-border)'}`, background: isSel ? (opt.warn ? '#fff1f1' : SUI_BG) : 'white', color: isSel ? (opt.warn ? '#dc2626' : SUI_COLOR) : 'var(--mint-muted)', cursor: 'pointer', transition: 'all 0.18s' }}>
            {opt.l}
          </button>
        );
      })}
    </div>
  </div>
);

export default function SuicideRiskQuiz({ onBack, onComplete, patient }) {
  const [q8, setQ8] = useState(Array(8).fill(null));

  const setQ8Value = (idx, val) => {
    const newQ8 = [...q8];
    newQ8[idx] = val;
    // Skip Logic: ถ้าข้อ 3 ตอบ ไม่มี (0) ให้ล้างข้อ 4-7
    if (idx === 2 && val === 0) {
      newQ8[3] = 0; newQ8[4] = 0; newQ8[5] = 0; newQ8[6] = 0;
    }
    setQ8(newQ8);
  };

  const handleFinish = () => {
    const isQ3No = q8[2] === 0;
    if (isQ3No) {
      if (q8[0] === null || q8[1] === null || q8[2] === null || q8[7] === null) {
        alert('⚠️ กรุณาตอบคำถามให้ครบทุกข้อครับ'); return;
      }
    } else {
      if (q8.includes(null)) {
        alert('⚠️ กรุณาตอบคำถามให้ครบทุกข้อครับ'); return;
      }
    }

    const w8Q = [1, 2, 6, 8, 9, 4, 10, 4];
    const sum8Q = q8.reduce((sum, val, idx) => sum + (val === 1 ? w8Q[idx] : 0), 0);

    let res8Q = 'ไม่มีแนวโน้ม';
    if (sum8Q >= 17) res8Q = 'เสี่ยงฆ่าตัวตายระดับรุนแรง';
    else if (sum8Q >= 9) res8Q = 'เสี่ยงฆ่าตัวตายระดับปานกลาง';
    else if (sum8Q >= 1) res8Q = 'เสี่ยงฆ่าตัวตายระดับน้อย';

    const fAns = (v) => v === 1 ? 'มี' : v === 0 ? 'ไม่มี' : 'ไม่ได้ประเมิน';

    if (onComplete) {
      onComplete({
        type: 'Suicide Risk (8Q)',
        totalScore: sum8Q,
        maxScore: 44, // คะแนนเต็มจริงๆ ของ 8Q คือผลรวมน้ำหนักทุกข้อ
        impaired: sum8Q > 0,
        duration: 0,
        resultText: res8Q,
        breakdown: {
          "8Q-1. คิดอยากตาย": fAns(q8[0]),
          "8Q-2. อยากทำร้ายตัวเอง": fAns(q8[1]),
          "8Q-3. คิดเกี่ยวกับการฆ่าตัวตาย": fAns(q8[2]),
          "8Q-4. มีแผนฆ่าตัวตาย": fAns(q8[3]),
          "8Q-5. เตรียมการจะฆ่าตัวตาย": fAns(q8[4]),
          "8Q-6. ทำให้ตนเองบาดเจ็บ(ไม่ตั้งใจตาย)": fAns(q8[5]),
          "8Q-7. พยายามฆ่าตัวตาย(หวังตาย)": fAns(q8[6]),
          "8Q-8. ตลอดชีวิตเคยพยายามฆ่าตัวตาย": fAns(q8[7]),
          "8Q การแปลผล": res8Q,
        },
      });
    }
  };

  const q8Text = [
    "1. คิดอยากตาย หรือ คิดว่าตายไปจะดีกว่า", "2. อยากทำร้ายตัวเอง หรือ ทำให้ตัวเองบาดเจ็บ", "3. คิดเกี่ยวกับการฆ่าตัวตาย",
    "4. มีแผนการฆ่าตัวตาย", "5. ได้เตรียมการที่จะทำร้ายตนเอง หรือเตรียมการจะฆ่าตัวตาย",
    "6. ได้ทำให้ตนเองบาดเจ็บ แต่ไม่ตั้งใจที่จะทำให้เสียชีวิต", "7. ได้พยายามฆ่าตัวตาย โดยหวังให้เสียชีวิต",
    "8. ตลอดชีวิตที่ผ่านมา ท่านเคยพยายามฆ่าตัวตาย"
  ];
  const opts8Q = [{v:0, l:'ไม่มี'}, {v:1, l:'มี', warn:true}];
  const isQ3No = q8[2] === 0;

  const handleBack = () => {
    if (window.confirm('ออกจากการทดสอบ?\nคำตอบที่ตอบไปแล้วจะถูกบันทึกไว้ชั่วคราว')) {
      onBack();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(254,242,242,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${SUI_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={SUI_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ประเมินความเสี่ยงฆ่าตัวตาย (8Q)</span></div>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
        <Section title="แบบประเมินความเสี่ยงฆ่าตัวตาย (8Q)" desc="ในช่วง 1 เดือนที่ผ่านมา ท่านมีอาการหรือพฤติกรรมต่อไปนี้หรือไม่?">
          {[0, 1, 2].map(i => <RadioGroup key={i} question={q8Text[i]} options={opts8Q} val={q8[i]} onChange={(v) => setQ8Value(i, v)} />)}
          {!isQ3No && [3, 4, 5, 6].map(i => <RadioGroup key={i} question={q8Text[i]} options={opts8Q} val={q8[i]} onChange={(v) => setQ8Value(i, v)} />)}
          {isQ3No && <p style={{ fontSize: 12, color: 'var(--mint-muted)', textAlign: 'center', margin: '8px 0' }}>(ข้ามข้อ 4-7 เนื่องจากข้อ 3 ตอบว่าไม่มี)</p>}
          <RadioGroup question={q8Text[7]} options={opts8Q} val={q8[7]} onChange={(v) => setQ8Value(7, v)} />
        </Section>
        <button onClick={handleFinish} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${SUI_COLOR},#991b1b)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)' }}>
          บันทึกและดูผลการประเมิน →
        </button>
      </div>
    </div>
  );
}