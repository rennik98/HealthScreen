import React, { useState } from 'react';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

// Theme สีชมพูเข้ม สำหรับการประเมินภาวะพึ่งพิง TAI
const TAI_COLOR = '#be185d';
const TAI_BG = '#fdf2f8';
const TAI_BORDER = '#fbcfe8';

const Section = ({ title, desc, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${TAI_COLOR}33`, borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: TAI_COLOR }} />
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--mint-text)', lineHeight: 1.3, marginBottom: 4 }}>{title}</h2>
      {desc && <p style={{ fontSize: 12, color: 'var(--mint-muted)', lineHeight: 1.5 }}>{desc}</p>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
  </div>
);

// ตัวเลือกของ TAI ยาวกว่าแบบทดสอบอื่น จึงวางเป็นคอลัมน์เดียว พร้อม badge เลขระดับ
const RadioGroup = ({ question, options, val, onChange }) => (
  <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 14, padding: '14px' }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 10, lineHeight: 1.5 }}>{question}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {options.map((opt) => {
        const isSel = val === opt.v;
        return (
          <button key={opt.v} onClick={() => onChange(opt.v)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, lineHeight: 1.5, border: `1.5px solid ${isSel ? TAI_COLOR : 'var(--mint-border)'}`, background: isSel ? TAI_BG : 'white', color: isSel ? TAI_COLOR : 'var(--mint-muted)', cursor: 'pointer', transition: 'all 0.18s' }}>
            <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, background: isSel ? TAI_COLOR : 'var(--mint-border2)', color: isSel ? 'white' : 'var(--mint-muted)' }}>{opt.v}</span>
            <span style={{ flex: 1 }}>{opt.l}</span>
          </button>
        );
      })}
    </div>
  </div>
);

// 4 Function ของ TAI แต่ละด้านแบ่ง 6 ระดับ (5 = ทำได้มากที่สุด, 0 = ทำได้น้อยที่สุด)
const TAI_DOMAINS = [
  {
    key: 'm', title: '1. การเคลื่อนที่', en: 'Motility',
    options: [
      { v: 5, l: 'เดินขึ้นบันไดได้เอง' },
      { v: 4, l: 'เดินทางราบได้โดยไม่ต้องช่วย แต่เดินขึ้นบันไดเองไม่ได้' },
      { v: 3, l: 'เดินทางราบได้ โดยต้องช่วย' },
      { v: 2, l: 'ลุกขึ้นนั่ง และสามารถที่จะลงมายืนข้างเตียงได้' },
      { v: 1, l: 'นอนบนเตียง สามารถตะแคงไปมาได้' },
      { v: 0, l: 'นอนบนเตียง ไม่สามารถตะแคงไปมาได้' },
    ],
  },
  {
    key: 'mn', title: '2. สุขภาพจิตและสติปัญญา', en: 'Mental',
    options: [
      { v: 5, l: 'ไม่มีปัญหาสุขภาพจิต' },
      { v: 4, l: 'มีปัญหาด้านการตัดสินใจและความจำ แต่ไม่มีความผิดปกติของการรับรู้บุคคล สถานที่ เวลา และปัญหาด้านพฤติกรรม' },
      { v: 3, l: 'ไม่มีปัญหาด้านการรับรู้ บุคคล สถานที่ เวลา แต่มีปัญหาด้านพฤติกรรมจนสร้างความรำคาญแก่ญาติ' },
      { v: 2, l: 'มีปัญหาด้านการรับรู้บุคคล สถานที่ เวลา แต่ไม่มีปัญหาเรื่องพฤติกรรมผิดปกติ' },
      { v: 1, l: 'มีปัญหาเรื่องการรับรู้บุคคล สถานที่ เวลา (Orientation) ร่วมกับปัญหาพฤติกรรม' },
      { v: 0, l: 'ไม่มีการตอบสนองทางสมอง' },
    ],
  },
  {
    key: 'f', title: '3. การกินอาหาร', en: 'Feeding',
    options: [
      { v: 5, l: 'กินอาหารได้เอง ไม่หกเลอะเทอะ' },
      { v: 4, l: 'กินอาหารได้เอง หกเลอะเทอะบ้าง' },
      { v: 3, l: 'ต้องป้อน แต่กลืนได้ปกติ' },
      { v: 2, l: 'ต้องป้อน และมีปัญหาการกลืน' },
      { v: 1, l: 'ใส่สายป้อนอาหารทางจมูก' },
      { v: 0, l: 'ให้น้ำเกลือทางเส้นเลือด' },
    ],
  },
  {
    key: 't', title: '4. การใช้ห้องน้ำ', en: 'Toilet',
    options: [
      { v: 5, l: 'ไปห้องน้ำได้เอง โดยถ่ายสำเร็จทุกครั้งในช่วง 2 อาทิตย์ที่ผ่านมา' },
      { v: 4, l: 'ไปห้องน้ำได้เอง โดยถ่ายไม่สำเร็จในบางครั้ง' },
      { v: 3, l: 'ต้องช่วยประคองไปห้องน้ำ และช่วยจัดการหลังถ่ายเสร็จ' },
      { v: 2, l: 'ใส่/เปลี่ยน ผ้าอ้อม โดยไม่ยากลำบาก' },
      { v: 1, l: 'ใส่/เปลี่ยน ผ้าอ้อม อย่างยากลำบาก' },
      { v: 0, l: 'ใส่สายสวนปัสสาวะ' },
    ],
  },
];

// จัดกลุ่มตามตาราง Classified Disability in Elderly by TAI (3 กลุ่มใหญ่ 9 กลุ่มย่อย)
// ltcGroup = กลุ่มภาวะพึ่งพิงของ สปสช. (null = ไม่เข้าเกณฑ์ภาวะพึ่งพิง)
function classifyTAI(m, mn, f, t) {
  // Immobilize — เคลื่อนที่ได้น้อย (ติดเตียง) แยกตามปัญหาการกินอาหาร
  if (m <= 2) {
    if (f >= 4) return { code: 'I3', label: 'มีปัญหาการเคลื่อนที่', ltcGroup: 3 };
    if (f === 3) return { code: 'I2', label: 'มีปัญหาการเคลื่อนที่และการกินอาหาร', ltcGroup: 4 };
    return { code: 'I1', label: 'มีปัญหาการเคลื่อนที่และการกินอาหารอย่างมาก', ltcGroup: 4 };
  }
  // Border — เคลื่อนที่ได้ดีหรือช่วยเหลือบ้าง และไม่สับสน
  if (mn >= 4) {
    if (m === 5 && mn === 5 && f === 5 && t === 5) return { code: 'B5', label: 'มีความผิดปกติน้อยมากหรือปกติ', ltcGroup: null };
    if (f >= 4 && t >= 4) return { code: 'B4', label: 'มีปัญหาการกินและการขับถ่ายเล็กน้อย', ltcGroup: null };
    return { code: 'B3', label: 'มีปัญหาการกินและการขับถ่ายอย่างมาก', ltcGroup: 1 };
  }
  // Confuse — เคลื่อนที่ได้ แต่มีปัญหาด้านการรับรู้/พฤติกรรม
  if (f >= 4 && t >= 4) return { code: 'C4', label: 'มีปัญหาสุขภาพจิต การกินและการขับถ่ายเล็กน้อย', ltcGroup: 2 };
  if (Math.min(f, t) === 3 && Math.max(f, t) >= 4) return { code: 'C3', label: 'มีปัญหาสุขภาพจิต การกิน และการขับถ่าย', ltcGroup: 2 };
  return { code: 'C2', label: 'มีปัญหาสุขภาพจิต การกิน และการขับถ่าย อย่างมาก', ltcGroup: 2 };
}

export default function TAIQuiz({ onBack, onComplete }) {
  const [ans, setAns] = useState({ m: null, mn: null, f: null, t: null });

  const setValue = (key, val) => setAns(prev => ({ ...prev, [key]: val }));

  const optLabel = (key, v) => TAI_DOMAINS.find(d => d.key === key).options.find(o => o.v === v).l;

  const handleFinish = () => {
    const { m, mn, f, t } = ans;
    if ([m, mn, f, t].includes(null)) {
      alert('⚠️ กรุณาตอบคำถามให้ครบทุกข้อครับ'); return;
    }

    const total = m + mn + f + t;
    const { code, label, ltcGroup } = classifyTAI(m, mn, f, t);
    const resultText = `${code} – ${label}${ltcGroup ? ` (สปสช. กลุ่ม ${ltcGroup})` : ''}`;

    if (onComplete) {
      onComplete({
        type: 'TAI (ภาวะพึ่งพิง)',
        totalScore: total,
        maxScore: 20,
        impaired: code !== 'B5' && code !== 'B4',
        duration: 0,
        resultText,
        breakdown: {
          'TAI-1. การเคลื่อนที่ (Motility)': `${m} – ${optLabel('m', m)}`,
          'TAI-2. สุขภาพจิต (Mental)': `${mn} – ${optLabel('mn', mn)}`,
          'TAI-3. การกินอาหาร (Feeding)': `${f} – ${optLabel('f', f)}`,
          'TAI-4. การใช้ห้องน้ำ (Toilet)': `${t} – ${optLabel('t', t)}`,
          'TAI คะแนนรวม': `${total} / 20`,
          'TAI กลุ่ม': code,
          'TAI การแปลผล': label,
          'กลุ่มภาวะพึ่งพิง สปสช.': ltcGroup ? `กลุ่ม ${ltcGroup}` : 'ไม่เข้าเกณฑ์ภาวะพึ่งพิง',
        },
      });
    }
  };

  const handleBack = () => {
    if (window.confirm('ออกจากการทดสอบ?\nคำตอบที่ตอบไปแล้วจะถูกบันทึกไว้ชั่วคราว')) {
      onBack();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(253,242,248,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${TAI_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={TAI_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ประเมินภาวะพึ่งพิง (TAI)</span></div>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px' }}>
        <Section title="แบบประเมิน TAI (Typology of Aged with Illustration)" desc="ประเมินความสามารถในการทำกิจกรรม 4 ด้าน เลือกระดับที่ตรงกับสภาพผู้สูงอายุมากที่สุดในแต่ละด้าน (0 = ทำได้น้อยที่สุด, 5 = ทำได้มากที่สุด)">
          {TAI_DOMAINS.map(d => (
            <RadioGroup key={d.key} question={`${d.title} (${d.en})`} options={d.options} val={ans[d.key]} onChange={(v) => setValue(d.key, v)} />
          ))}
        </Section>
        <button onClick={handleFinish} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${TAI_COLOR},#9d174d)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(190, 24, 93, 0.3)' }}>
          บันทึกและดูผลการประเมิน →
        </button>
      </div>
    </div>
  );
}
