import React, { useState, useRef, useCallback } from 'react';

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

// Yes/No with custom labels
const YN = ({ val, onChange, yL = 'พบปัญหา', nL = 'ไม่พบปัญหา' }) => (
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

const SubQ = ({ label, val, onChange, yL, nL, hint }) => (
  <div style={{
    background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)',
    borderRadius: 12, padding: '12px 14px', marginBottom: 8,
  }}>
    <p style={{ fontSize: 13, color: 'var(--mint-text2)', fontWeight: 600 }}>{label}</p>
    {hint && <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2 }}>{hint}</p>}
    <YN val={val} onChange={onChange} yL={yL || 'พบปัญหา'} nL={nL || 'ไม่พบปัญหา'} />
  </div>
);

const CheckItem = ({ label, checked, onChange, hint }) => (
  <button onClick={() => onChange(!checked)} style={{
    display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
    padding: '10px 12px', borderRadius: 11, marginBottom: 6,
    background: checked ? ORAL_BG : 'var(--mint-surface2)',
    border: `1.5px solid ${checked ? ORAL_COLOR : 'var(--mint-border2)'}`,
    cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left',
  }}>
    <div style={{
      width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
      border: `2px solid ${checked ? ORAL_COLOR : 'var(--mint-border)'}`,
      background: checked ? ORAL_COLOR : 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, color: 'white', fontWeight: 700, transition: 'all 0.15s',
    }}>{checked ? '✓' : ''}</div>
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: checked ? ORAL_COLOR : 'var(--mint-text2)' }}>{label}</p>
      {hint && <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2 }}>{hint}</p>}
    </div>
  </button>
);

const DISEASES = [
  'เบาหวาน', 'ความดันโลหิตสูง', 'หลอดเลือดและหัวใจ', 'มะเร็งช่องปาก', 'อื่นๆ ที่ต้องกินยาเป็นประจำ',
];

export default function OralHealthQuiz({ onBack, onComplete, patient }) {
  // General info
  const [adlGroup, setAdlGroup] = useState(null);    // 1,2,3
  const [diseases, setDiseases] = useState([]);
  const [chewing, setChewing] = useState(null);      // 0=normal,1=problem
  const [pain, setPain] = useState(null);            // 0=none,1=yes

  // Oral exam findings
  const [findings, setFindings] = useState({
    toothLoss: null,       // 0/1
    denture: null,         // 0/1
    decay: null,           // 0/1
    gum: null,             // 0/1
    ulcer: null,           // 0/1
    dry: null,             // 0/1
    wear: null,            // 0/1
    hygiene: null,         // 0/1
  });

  const [done, setDone] = useState(false);

  const setF = (key, val) => setFindings(prev => ({ ...prev, [key]: val }));
  const toggleDisease = (d) => setDiseases(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const problemCount = Object.values(findings).filter(v => v === 1).length;
  const hasMajorProblem = ['toothLoss', 'denture', 'decay', 'gum', 'ulcer', 'dry', 'wear'].some(k => findings[k] === 1);
  const poorHygiene = findings.hygiene === 1;
  const needsReferral = hasMajorProblem;

  const handleFinish = () => {
    // เช็คว่าตอบข้อมูลพื้นฐานและผลตรวจทั้ง 8 ข้อครบหรือยัง
    const isComplete = adlGroup !== null && 
                       chewing !== null && 
                       pain !== null && 
                       Object.values(findings).every(v => v !== null);

    if (!isComplete) {
      alert('⚠️ กรุณาประเมินสุขภาพช่องปากให้ครบทุกข้อก่อนกดดูผลครับ');
      return;
    }

    setDone(true);
    if (onComplete) {
      onComplete({
        type: 'Oral Health',
        totalScore: 8 - problemCount,
        maxScore: 8,
        impaired: needsReferral,
        duration: 0,
        resultText: needsReferral ? 'ควรส่งต่อทันตแพทย์' : 'ปกติ',
        breakdown: {
          "กลุ่ม ADL": adlGroup ?? 'ไม่ได้ระบุ',
          "โรคประจำตัว": diseases.length > 0 ? diseases.join(', ') : 'ไม่มี',
          "การเคี้ยว/กลืน": chewing === 1 ? 'มีปัญหา' : chewing === 0 ? 'ปกติ' : '',
          "การเจ็บปวดในช่องปาก": pain === 1 ? 'มีอาการ' : pain === 0 ? 'ไม่มี' : '',
          "1. การสูญเสียฟัน": findings.toothLoss === 1 ? 'พบปัญหา' : findings.toothLoss === 0 ? 'ไม่พบปัญหา' : '',
          "2. ใส่ฟันเทียม": findings.denture === 1 ? 'พบปัญหา' : findings.denture === 0 ? 'ไม่พบปัญหา' : '',
          "3. ฟันผุ/รากฟันผุ": findings.decay === 1 ? 'พบปัญหา' : findings.decay === 0 ? 'ไม่พบปัญหา' : '',
          "4. เหงือก/ปริทันต์": findings.gum === 1 ? 'พบปัญหา' : findings.gum === 0 ? 'ไม่พบปัญหา' : '',
          "5. แผล/มะเร็งช่องปาก": findings.ulcer === 1 ? 'พบปัญหา' : findings.ulcer === 0 ? 'ไม่พบปัญหา' : '',
          "6. ปากแห้ง/น้ำลายน้อย": findings.dry === 1 ? 'พบปัญหา' : findings.dry === 0 ? 'ไม่พบปัญหา' : '',
          "7. ฟันสึก": findings.wear === 1 ? 'พบปัญหา' : findings.wear === 0 ? 'ไม่พบปัญหา' : '',
          "8. อนามัยช่องปาก": findings.hygiene === 1 ? 'พบปัญหา' : findings.hygiene === 0 ? 'ไม่พบปัญหา' : '',
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
          {patient && (
            <span style={{ fontSize: 11, color: ORAL_COLOR, fontWeight: 600, background: ORAL_BG, padding: '2px 8px', borderRadius: 20, border: '1px solid var(--mint-border)', marginLeft: 4, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {patient.name} · {patient.age} ปี
            </span>
          )}
        </div>
        <div style={{ flex: 1, maxWidth: 520, margin: '0 auto', width: '100%', padding: '28px 16px' }}>
          {patient && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: ORAL_BG, border: '1px solid var(--mint-border)', borderRadius: 14, marginBottom: 20 }}>
              <span style={{ fontSize: 18 }}>👤</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</p>
                <p style={{ fontSize: 12, color: 'var(--mint-muted)' }}>อายุ {patient.age} ปี · กลุ่ม ADL {adlGroup}</p>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: ORAL_COLOR, fontWeight: 700, background: 'white', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--mint-border)', flexShrink: 0 }}>✅ บันทึกแล้ว</div>
            </div>
          )}

          {/* Overall result banner */}
          <div style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 22, background: needsReferral ? '#fff7ed' : '#f0fdf9', border: `1.5px solid ${needsReferral ? '#fcd34d' : '#6ee7d5'}` }}>
            <p style={{ fontWeight: 800, fontSize: 16, color: needsReferral ? '#92400e' : '#065f46', marginBottom: 6 }}>
              {needsReferral ? '⚠️ ควรส่งต่อทันตแพทย์' : '✅ สุขภาพช่องปากอยู่ในเกณฑ์ดี'}
            </p>
            <p style={{ fontSize: 13, color: needsReferral ? '#b45309' : '#047857', lineHeight: 1.6 }}>
              {needsReferral
                ? 'พบปัญหาสุขภาพช่องปาก — ควรส่งต่อเพื่อรับบริการทางทันตกรรม'
                : 'ไม่พบปัญหาสำคัญ — แนะนำการส่งเสริมและป้องกัน'}
            </p>
            {poorHygiene && (
              <p style={{ fontSize: 12, color: '#92400e', marginTop: 8, padding: '6px 10px', background: '#fef3c7', borderRadius: 8 }}>
                🪥 พบคราบจุลินทรีย์ — ควรฝึกแปรงฟันและใช้อุปกรณ์เสริม
              </p>
            )}
          </div>

          {/* Summary grid */}
          <div style={{ background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 18, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>สรุปผลการตรวจ</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['การสูญเสียฟัน', findings.toothLoss],
                ['ใส่ฟันเทียม', findings.denture],
                ['ฟันผุ/รากฟันผุ', findings.decay],
                ['เหงือก/ปริทันต์', findings.gum],
                ['แผล/มะเร็งช่องปาก', findings.ulcer],
                ['ปากแห้ง/น้ำลายน้อย', findings.dry],
                ['ฟันสึก', findings.wear],
                ['อนามัยช่องปาก', findings.hygiene],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: val === 1 ? '#fff7ed' : val === 0 ? '#f0fdf9' : 'var(--mint-surface2)', border: `1px solid ${val === 1 ? '#fcd34d88' : val === 0 ? '#6ee7d588' : 'var(--mint-border2)'}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 14 }}>{val === 1 ? '⚠️' : val === 0 ? '✓' : '—'}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: val === 1 ? '#92400e' : val === 0 ? '#065f46' : 'var(--mint-muted)' }}>{label}</span>
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
      {/* topbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,250,248,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cross s={14} c={ORAL_COLOR} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>การประเมินสุขภาพช่องปาก</span>
          {patient && (
            <span style={{ fontSize: 11, color: ORAL_COLOR, fontWeight: 600, background: ORAL_BG, padding: '2px 8px', borderRadius: 20, border: '1px solid var(--mint-border)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {patient.name}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: ORAL_COLOR, background: ORAL_BG, border: '1px solid var(--mint-border)', borderRadius: 20, padding: '3px 10px' }}>
          {problemCount} ปัญหา
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ═══ General Info ═══ */}
        <Section num="📋" title="ข้อมูลทั่วไป">
          {/* ADL Group */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--mint-text2)', fontWeight: 600, marginBottom: 8 }}>1. การจัดกลุ่มตามการปฏิบัติกิจวัตรประจำวัน (ADL)</p>
            {[
              [1, 'กลุ่มที่ 1', 'ช่วยเหลือตัวเองได้ และ/หรือ ช่วยเหลือผู้อื่น ชุมชน และสังคมได้'],
              [2, 'กลุ่มที่ 2', 'ช่วยเหลือและดูแลตนเองได้บ้าง'],
              [3, 'กลุ่มที่ 3', 'ช่วยเหลือตัวเองไม่ได้'],
            ].map(([v, label, desc]) => (
              <button key={v} onClick={() => setAdlGroup(v)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 12px', borderRadius: 11, marginBottom: 6,
                background: adlGroup === v ? ORAL_BG : 'var(--mint-surface2)',
                border: `1.5px solid ${adlGroup === v ? ORAL_COLOR : 'var(--mint-border2)'}`,
                cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left',
              }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: `2px solid ${adlGroup === v ? ORAL_COLOR : 'var(--mint-border)'}`, background: adlGroup === v ? ORAL_COLOR : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700, transition: 'all 0.15s' }}>
                  {adlGroup === v ? '✓' : v}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: adlGroup === v ? ORAL_COLOR : 'var(--mint-text2)' }}>{label}</p>
                  <p style={{ fontSize: 11, color: 'var(--mint-muted)' }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Diseases */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--mint-text2)', fontWeight: 600, marginBottom: 8 }}>2. โรคทางระบบที่สำคัญ (เลือกทั้งหมดที่เป็น)</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
              {DISEASES.map(d => (
                <CheckItem key={d} label={d} checked={diseases.includes(d)} onChange={() => toggleDisease(d)} />
              ))}
            </div>
          </div>

          {/* Chewing */}
          <SubQ label="3. ความสามารถในการเคี้ยว กัด กลืนอาหาร" val={chewing}
            onChange={setChewing} yL="มีปัญหา" nL="ปกติ" />

          {/* Pain */}
          <SubQ label="4. การเจ็บปวดในช่องปาก" val={pain}
            onChange={setPain} yL="มีอาการ" nL="ไม่มี" />
        </Section>

        {/* ═══ Oral Exam ═══ */}
        <Section num="🔍" title="การตรวจสภาวะช่องปาก">
          <div style={{ padding: '10px 14px', background: ORAL_BG, border: `1px solid ${ORAL_BORDER}`, borderRadius: 10, marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: '#0e7490', lineHeight: 1.6 }}>
              ตรวจในช่องปากโดยทันตบุคลากร ใช้เครื่องมือตรวจและแสงไฟ — ระบุว่าแต่ละรายการ <strong>"ไม่พบปัญหา"</strong> หรือ <strong>"พบปัญหา"</strong>
            </p>
          </div>

          {/* 1 Tooth loss */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>1. การสูญเสียฟัน</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2, marginBottom: 4 }}>พบปัญหา: ฟันแท้ที่ใช้งานได้ &lt; 20 ซี่ หรือ คู่สบฟันหลัง &lt; 4 คู่สบ</p>
            <YN val={findings.toothLoss} onChange={v => setF('toothLoss', v)} />
          </div>

          {/* 2 Denture */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>2. ความจำเป็นในการใส่ฟันเทียม</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2, marginBottom: 4 }}>พบปัญหา: สูญเสียฟันจนเคี้ยวไม่ได้ หรือ ฟันเทียมเดิมหลวม/ผุ ต้องทำใหม่</p>
            <YN val={findings.denture} onChange={v => setF('denture', v)} />
          </div>

          {/* 3 Decay */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>3. ฟันผุ / รากฟันผุ</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2, marginBottom: 4 }}>พบปัญหา: ฟัน/รากฟันมีรูผุ, ฝีหนองบริเวณปลายราก, เหงือกรนจนรากโผล่</p>
            <YN val={findings.decay} onChange={v => setF('decay', v)} />
          </div>

          {/* 4 Gum */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>4. เหงือกและเนื้อเยื่อปริทันต์</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2, marginBottom: 4 }}>พบปัญหา: เหงือกอักเสบ/มีเลือดออก, มีหินปูน, ฟันโยก, ฝีหนองที่เหงือก</p>
            <YN val={findings.gum} onChange={v => setF('gum', v)} />
          </div>

          {/* 5 Ulcer */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>5. แผล / มะเร็งช่องปาก</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2, marginBottom: 4 }}>พบปัญหา: กอนเนื้อ, รอยแดง/ขาว, แผลเรื้อรัง &gt; 2 สัปดาห์ บริเวณริมฝีปาก แก้ม ลิ้น เพดาน</p>
            <YN val={findings.ulcer} onChange={v => setF('ulcer', v)} />
          </div>

          {/* 6 Dry */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>6. สภาวะปากแห้ง น้ำลายน้อย</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2, marginBottom: 4 }}>พบปัญหา: เนื้อเยื่อในช่องปากแห้ง, น้ำลายเหนียว/ไม่มี, กระจกติดแก้มเมื่อสอดเข้าปาก</p>
            <YN val={findings.dry} onChange={v => setF('dry', v)} />
          </div>

          {/* 7 Wear */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>7. ฟันสึก</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2, marginBottom: 4 }}>พบปัญหา: ฟันสึกด้านบดเคี้ยวเกินครึ่งหนึ่งของตัวฟัน</p>
            <YN val={findings.wear} onChange={v => setF('wear', v)} />
          </div>

          {/* 8 Hygiene */}
          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>8. การดูแลอนามัยช่องปาก</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2, marginBottom: 4 }}>พบปัญหา: คราบจุลินทรีย์ชัดเจน, มีหินปูน, กลิ่นปาก, ไม่ใช้อุปกรณ์เสริมที่จำเป็น</p>
            <YN val={findings.hygiene} onChange={v => setF('hygiene', v)} />
          </div>
        </Section>

        {/* ═══ Result Preview ═══ */}
        <div style={{ background: 'white', border: `1.5px solid ${ORAL_COLOR}44`, borderRadius: 20, padding: '20px 16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--mint-text)' }}>สรุปผลการประเมิน</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: problemCount > 0 ? 'var(--mint-warn)' : ORAL_COLOR }}>
              {problemCount} <span style={{ fontSize: 13, color: 'var(--mint-muted)', fontWeight: 400 }}>ปัญหา</span>
            </span>
          </div>

          {needsReferral ? (
            <div style={{ padding: '10px 14px', background: '#fff7ed', border: '1px solid #fcd34d', borderRadius: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>⚠️ ควรส่งต่อเพื่อรับบริการทางทันตกรรม</p>
            </div>
          ) : problemCount === 0 ? (
            <div style={{ padding: '10px 14px', background: '#f0fdf9', border: '1px solid #6ee7d5', borderRadius: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>✅ ยังไม่ประเมินครบ หรือ ไม่พบปัญหา</p>
            </div>
          ) : null}

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