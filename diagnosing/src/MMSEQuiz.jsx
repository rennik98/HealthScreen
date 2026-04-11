import React, { useState } from 'react';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

// Theme สี Teal สำหรับ MMSE
const MMSE_COLOR = '#0d9488';
const MMSE_BG = '#f0fdfa';
const MMSE_BORDER = '#99f6e4';

const Section = ({ num, title, desc, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${MMSE_COLOR}33`, borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: MMSE_COLOR }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: desc ? 8 : 18 }}>
      {num && <div style={{ width: 30, height: 30, borderRadius: 9, background: MMSE_BG, border: `1.5px solid ${MMSE_COLOR}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: MMSE_COLOR, flexShrink: 0 }}>{num}</div>}
      <h2 style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', lineHeight: 1.3 }}>{title}</h2>
    </div>
    {desc && <p style={{ fontSize: 12, color: 'var(--mint-muted)', lineHeight: 1.5, marginBottom: 16 }}>{desc}</p>}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
  </div>
);

const RadioGroup = ({ question, options, val, onChange }) => (
  <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px' }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 10, lineHeight: 1.4 }}>{question}</p>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const isSel = val === opt.v;
        return (
          <button key={opt.v} onClick={() => onChange(opt.v)} style={{ flex: '1 1 auto', padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isSel ? (opt.warn ? '#fca5a5' : MMSE_COLOR) : 'var(--mint-border)'}`, background: isSel ? (opt.warn ? '#fff1f1' : MMSE_BG) : 'white', color: isSel ? (opt.warn ? '#dc2626' : MMSE_COLOR) : 'var(--mint-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>
            {opt.l}
          </button>
        );
      })}
    </div>
  </div>
);

export default function MMSEQuiz({ onBack, onComplete, patient }) {
  // การศึกษา (สำคัญมากสำหรับเกณฑ์ MMSE)
  const [edu, setEdu] = useState(null); // 'none' (≤14), 'primary' (≤17), 'high' (≤22)

  // แบบทดสอบ
  const [oriTime, setOriTime] = useState(Array(5).fill(null));
  const [oriPlace, setOriPlace] = useState(Array(5).fill(null));
  const [regis, setRegis] = useState(Array(3).fill(null));
  const [atten, setAtten] = useState(Array(5).fill(null));
  const [recall, setRecall] = useState(Array(3).fill(null));
  const [naming, setNaming] = useState(Array(2).fill(null));
  const [langVisuo, setLangVisuo] = useState(Array(6).fill(null));

  const handleFinish = () => {
    if (!edu) { alert('⚠️ กรุณาเลือกระดับการศึกษาก่อน เนื่องจากมีผลต่อเกณฑ์การแปลผลครับ'); return; }

    const allAns = [...oriTime, ...oriPlace, ...regis, ...atten, ...recall, ...naming, ...langVisuo];
    if (allAns.includes(null)) {
      alert('⚠️ กรุณาประเมินให้ครบทุกข้อก่อนบันทึกผลครับ'); return;
    }

    const sum = allAns.reduce((a, b) => a + b, 0);
    
    // เกณฑ์ MMSE-Thai 2002
    let impaired = false;
    let cutoff = 0;
    if (edu === 'none') { cutoff = 14; if (sum <= 14) impaired = true; }
    else if (edu === 'primary') { cutoff = 17; if (sum <= 17) impaired = true; }
    else if (edu === 'high') { cutoff = 22; if (sum <= 22) impaired = true; }

    const resText = impaired ? `มีแนวโน้มภาวะสมองเสื่อม (จุดตัด ≤ ${cutoff})` : 'อยู่ในเกณฑ์ปกติ';

    if (onComplete) {
      onComplete({
        type: 'MMSE (Mini-Mental State)',
        totalScore: sum,
        maxScore: 30,
        impaired,
        duration: 0,
        resultText: resText,
        breakdown: {
          "ระดับการศึกษา": edu === 'none' ? 'ไม่ได้เรียน/อ่านไม่ออก' : edu === 'primary' ? 'ประถมศึกษา (ป.1-ป.6)' : 'สูงกว่าประถมศึกษา',
          "1. Orientation for Time (5)": oriTime.reduce((a, b) => a + b, 0),
          "2. Orientation for Place (5)": oriPlace.reduce((a, b) => a + b, 0),
          "3. Registration (3)": regis.reduce((a, b) => a + b, 0),
          "4. Attention/Calculation (5)": atten.reduce((a, b) => a + b, 0),
          "5. Recall (3)": recall.reduce((a, b) => a + b, 0),
          "6. Naming (2)": naming.reduce((a, b) => a + b, 0),
          "7. Language & Visuospatial (6)": langVisuo.reduce((a, b) => a + b, 0),
          "จุดตัดเกณฑ์ (Cut-off)": `<= ${cutoff}`,
          "การแปลผล MMSE": resText,
        }
      });
    }
  };

  const optsYN = [{v:1, l:'ทำได้/ตอบถูก'}, {v:0, l:'ทำไม่ได้/ผิด', warn:true}];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,253,250,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${MMSE_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={MMSE_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ประเมิน MMSE</span></div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        {/* เลือกระดับการศึกษา */}
        <div style={{ background: 'white', border: `1.5px solid ${edu ? MMSE_BORDER : '#fca5a5'}`, borderRadius: 16, padding: '18px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--mint-text)', marginBottom: 4 }}>📚 ระดับการศึกษาของผู้สูงอายุ <span style={{color: '#ef4444'}}>*</span></p>
          <p style={{ fontSize: 12, color: 'var(--mint-muted)', marginBottom: 12 }}>จำเป็นต้องเลือกเพื่อกำหนดเกณฑ์จุดตัด (Cut-off score) ที่ถูกต้อง</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setEdu('none')} style={{ padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1.5px solid ${edu === 'none' ? MMSE_COLOR : 'var(--mint-border)'}`, background: edu === 'none' ? MMSE_BG : 'white', color: edu === 'none' ? MMSE_COLOR : 'var(--mint-muted)', textAlign: 'left' }}>
              {edu === 'none' ? '✅ ' : ''}ไม่ได้เรียนหนังสือ / อ่านไม่ออกเขียนไม่ได้ (จุดตัด ≤ 14)
            </button>
            <button onClick={() => setEdu('primary')} style={{ padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1.5px solid ${edu === 'primary' ? MMSE_COLOR : 'var(--mint-border)'}`, background: edu === 'primary' ? MMSE_BG : 'white', color: edu === 'primary' ? MMSE_COLOR : 'var(--mint-muted)', textAlign: 'left' }}>
              {edu === 'primary' ? '✅ ' : ''}ระดับประถมศึกษา ป.1 - ป.6 (จุดตัด ≤ 17)
            </button>
            <button onClick={() => setEdu('high')} style={{ padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1.5px solid ${edu === 'high' ? MMSE_COLOR : 'var(--mint-border)'}`, background: edu === 'high' ? MMSE_BG : 'white', color: edu === 'high' ? MMSE_COLOR : 'var(--mint-muted)', textAlign: 'left' }}>
              {edu === 'high' ? '✅ ' : ''}ระดับมัธยมศึกษาขึ้นไป (จุดตัด ≤ 22)
            </button>
          </div>
        </div>

        <Section num="1" title="Orientation for Time (5 คะแนน)" desc="ถามเกี่ยวกับเวลาปัจจุบัน">
          {["วันนี้วันที่เท่าไร", "วันนี้วันอะไร (จันทร์-อาทิตย์)", "เดือนนี้เดือนอะไร", "ปีนี้ปีอะไร (พ.ศ. หรือ ค.ศ.)", "ฤดูนี้ฤดูอะไร"].map((q, i) => (
            <RadioGroup key={i} question={`${i+1}. ${q}`} options={optsYN} val={oriTime[i]} onChange={v => { const n = [...oriTime]; n[i] = v; setOriTime(n); }} />
          ))}
        </Section>

        <Section num="2" title="Orientation for Place (5 คะแนน)" desc="ถามเกี่ยวกับสถานที่ที่อยู่ตอนนี้">
          {["สถานที่ตรงนี้เรียกว่าอะไร (ชื่อ รพ./บ้าน)", "อยู่ที่ชั้นอะไร / ห้องอะไร", "อำเภอ / เขต อะไร", "จังหวัดอะไร", "ภาคอะไร"].map((q, i) => (
            <RadioGroup key={i} question={`${i+1}. ${q}`} options={optsYN} val={oriPlace[i]} onChange={v => { const n = [...oriPlace]; n[i] = v; setOriPlace(n); }} />
          ))}
        </Section>

        <Section num="3" title="Registration (3 คะแนน)" desc="บอกสิ่งของ 3 อย่างช้าๆ ชัดๆ (ห่างกันคำละ 1 วินาที) ให้ผู้ทดสอบจำและทวนซ้ำ (เช่น ดอกไม้ แม่น้ำ รถไฟ)">
          {["คำที่ 1 (เช่น ดอกไม้)", "คำที่ 2 (เช่น แม่น้ำ)", "คำที่ 3 (เช่น รถไฟ)"].map((q, i) => (
            <RadioGroup key={i} question={`${i+1}. ${q}`} options={optsYN} val={regis[i]} onChange={v => { const n = [...regis]; n[i] = v; setRegis(n); }} />
          ))}
        </Section>

        <Section num="4" title="Attention / Calculation (5 คะแนน)" desc="ให้ลบเลข 100 ทีละ 7 ไปเรื่อยๆ 5 ครั้ง (หรือสะกดคำว่า 'ม-ะ-ก-ร' ถอยหลังหากคิดเลขไม่ได้)">
          {["ครั้งที่ 1 (93 / ร)", "ครั้งที่ 2 (86 / ก)", "ครั้งที่ 3 (79 / ะ)", "ครั้งที่ 4 (72 / ม)", "ครั้งที่ 5 (65)"].map((q, i) => (
            <RadioGroup key={i} question={`${i+1}. ${q}`} options={optsYN} val={atten[i]} onChange={v => { const n = [...atten]; n[i] = v; setAtten(n); }} />
          ))}
        </Section>

        <Section num="5" title="Recall (3 คะแนน)" desc="ให้ทวนคำสิ่งของ 3 อย่างที่ให้จำไว้ในข้อ 3">
          {["จำคำที่ 1 ได้", "จำคำที่ 2 ได้", "จำคำที่ 3 ได้"].map((q, i) => (
            <RadioGroup key={i} question={`${i+1}. ${q}`} options={optsYN} val={recall[i]} onChange={v => { const n = [...recall]; n[i] = v; setRecall(n); }} />
          ))}
        </Section>

        <Section num="6" title="Naming & Language (8 คะแนน)" desc="ทดสอบการใช้ภาษา การทำตามคำสั่ง และมิติสัมพันธ์">
          <p style={{ fontSize: 12, fontWeight: 700, color: MMSE_COLOR, marginTop: 8 }}>เรียกชื่อสิ่งของ (Naming)</p>
          <RadioGroup question="1. ชี้ที่นาฬิกาแล้วถามว่า 'นี่คืออะไร'" options={optsYN} val={naming[0]} onChange={v => { const n = [...naming]; n[0] = v; setNaming(n); }} />
          <RadioGroup question="2. ชี้ที่ดินสอแล้วถามว่า 'นี่คืออะไร'" options={optsYN} val={naming[1]} onChange={v => { const n = [...naming]; n[1] = v; setNaming(n); }} />
          
          <p style={{ fontSize: 12, fontWeight: 700, color: MMSE_COLOR, marginTop: 8 }}>พูดตามประโยค (Repetition)</p>
          <RadioGroup question="3. ให้พูดตามว่า 'ใครใคร่ขายไก่ไข่'" options={optsYN} val={langVisuo[0]} onChange={v => { const n = [...langVisuo]; n[0] = v; setLangVisuo(n); }} />
          
          <p style={{ fontSize: 12, fontWeight: 700, color: MMSE_COLOR, marginTop: 8 }}>ทำตามคำสั่ง 3 ขั้นตอน (Verbal Command)</p>
          <RadioGroup question="4. รับกระดาษด้วยมือขวา" options={optsYN} val={langVisuo[1]} onChange={v => { const n = [...langVisuo]; n[1] = v; setLangVisuo(n); }} />
          <RadioGroup question="5. พับครึ่งกระดาษ" options={optsYN} val={langVisuo[2]} onChange={v => { const n = [...langVisuo]; n[2] = v; setLangVisuo(n); }} />
          <RadioGroup question="6. วางกระดาษลงบนโต๊ะ/พื้น" options={optsYN} val={langVisuo[3]} onChange={v => { const n = [...langVisuo]; n[3] = v; setLangVisuo(n); }} />
          
          <p style={{ fontSize: 12, fontWeight: 700, color: MMSE_COLOR, marginTop: 8 }}>อ่าน, เขียน และวาดภาพ</p>
          <RadioGroup question="7. (อ่าน) ทำตามตัวหนังสือ 'หลับตาของท่าน'" options={optsYN} val={langVisuo[4]} onChange={v => { const n = [...langVisuo]; n[4] = v; setLangVisuo(n); }} />
          {/* ข้อเขียนและวาด หากการศึกษาเป็น none ให้ข้ามหรือถือว่า 0 */}
          {edu === 'none' ? (
             <div style={{ padding: '12px', background: '#fff1f1', borderRadius: 10, fontSize: 12, color: '#dc2626' }}>
               * ข้อ 8-9 สำหรับการเขียนและวาดภาพ จะให้คะแนนเป็น 0 อัตโนมัติเนื่องจากผู้ประเมินไม่อ่านไม่ออกเขียนไม่ได้
             </div>
          ) : (
            <>
              <RadioGroup question="8. (เขียน) เขียนประโยคที่มีความหมาย 1 ประโยค" options={optsYN} val={langVisuo[5]} onChange={v => { const n = [...langVisuo]; n[5] = v; setLangVisuo(n); }} />
              {/* ข้อนี้ขอใช้รวมกับ langVisuo index ถัดไปเพื่อให้ array ไม่รวน */}
            </>
          )}
        </Section>
        {/* ข้อ 9 วาดรูป แยกออกมา */}
        <Section num="7" title="Visuospatial (1 คะแนน)">
          {edu === 'none' ? (
             <div style={{ padding: '12px', background: '#fff1f1', borderRadius: 10, fontSize: 12, color: '#dc2626' }}>
               * ข้ามการทดสอบวาดภาพ
             </div>
          ) : (
            <RadioGroup question="9. (วาดภาพ) วาดรูปห้าเหลี่ยม 2 รูปซ้อนทับกัน" options={optsYN} val={langVisuo[5]} onChange={v => { const n = [...langVisuo]; n[5] = v; setLangVisuo(n); }} />
          )}
        </Section>

        <div style={{ background: 'white', border: `1.5px solid ${MMSE_COLOR}44`, borderRadius: 20, padding: '20px 16px', boxShadow: 'var(--shadow-md)', marginBottom: 40 }}>
          <button onClick={handleFinish} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${MMSE_COLOR},#0f766e)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)' }}>
            บันทึกและดูผลการประเมิน →
          </button>
        </div>

      </div>
    </div>
  );
}