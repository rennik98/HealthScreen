import React, { useState, useEffect, useRef } from 'react';

const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4" />
    <rect x="1" y="7.5" width="18" height="5" rx="1.4" />
  </svg>
);

// Theme สีเขียว Emerald สำหรับการเคลื่อนไหว/หกล้ม
const FALL_COLOR = '#059669';
const FALL_BG = '#ecfdf5';
const FALL_BORDER = '#a7f3d0';

const Section = ({ title, desc, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${FALL_COLOR}33`, borderRadius: 20, padding: '22px 18px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 3px 3px 0', background: FALL_COLOR }} />
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--mint-text)', lineHeight: 1.3, marginBottom: 4 }}>{title}</h2>
      {desc && <p style={{ fontSize: 12, color: 'var(--mint-muted)', lineHeight: 1.5 }}>{desc}</p>}
    </div>
    {children}
  </div>
);

export default function FallRiskQuiz({ onBack, onComplete, patient }) {
  // จับเวลา
  const [timeMs, setTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isManual, setIsManual] = useState(false); // เลือกว่าจะพิมพ์เวลาเองหรือจับเวลา
  const [manualTime, setManualTime] = useState('');
  
  // เครื่องช่วยเดิน
  const [useAid, setUseAid] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeMs(prev => prev + 100);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleStartStop = () => setIsRunning(!isRunning);
  const handleReset = () => { setIsRunning(false); setTimeMs(0); };

  const handleFinish = () => {
    // หาเวลาที่ใช้ (วินาที)
    let finalTimeSeconds = 0;
    if (isManual) {
      if (!manualTime || isNaN(manualTime) || Number(manualTime) <= 0) {
        alert('⚠️ กรุณาระบุเวลาที่ใช้ (วินาที) ให้ถูกต้องครับ'); return;
      }
      finalTimeSeconds = parseFloat(manualTime);
    } else {
      if (timeMs === 0) {
        alert('⚠️ กรุณาจับเวลา หรือสลับไปกรอกเวลาด้วยตนเองครับ'); return;
      }
      finalTimeSeconds = timeMs / 1000;
    }

    if (useAid === null) {
      alert('⚠️ กรุณาระบุว่าผู้สูงอายุใช้อุปกรณ์ช่วยเดินหรือไม่ครับ'); return;
    }

    const impaired = finalTimeSeconds >= 12;
    const resText = impaired ? 'เสี่ยงหกล้ม (≥ 12 วินาที)' : 'ปกติ (< 12 วินาที)';

    if (onComplete) {
      onComplete({
        type: 'Fall Risk (TUGT)',
        totalScore: finalTimeSeconds.toFixed(1), // บันทึกเวลาเป็นคะแนนเพื่อนำไปโชว์
        maxScore: 0, // 0 หมายถึงไม่มีคะแนนเต็ม (เป็นเวลา)
        impaired: impaired,
        duration: 0,
        resultText: resText,
        breakdown: {
          "เวลาที่ใช้ (วินาที)": finalTimeSeconds.toFixed(1),
          "ใช้อุปกรณ์ช่วยเดิน": useAid === 1 ? 'ใช้' : 'ไม่ใช้',
          "TUGT การแปลผล": resText,
        },
      });
    }
  };

  const displayTime = (timeMs / 1000).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(236,253,245,0.9)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${FALL_BORDER}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cross s={14} c={FALL_COLOR} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>ภาวะหกล้ม (TUGT)</span></div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        <div style={{ padding: '12px 16px', background: FALL_BG, border: `1.5px solid ${FALL_BORDER}`, borderRadius: 14 }}>
          <p style={{ fontSize: 13, color: '#065f46', lineHeight: 1.7, fontWeight: 600 }}>
            ทดสอบ Timed Up and Go Test (TUGT)<br/>
            <span style={{ fontWeight: 400 }}>ให้ผู้สูงอายุลุกจากเก้าอี้ เดินไปข้างหน้า 3 เมตร หมุนตัวเดินกลับมานั่งพิงพนักเก้าอี้ตามเดิม (สามารถใช้อุปกรณ์ช่วยเดินได้)</span>
          </p>
        </div>

        <Section title="1. บันทึกเวลาที่ใช้ (วินาที)">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => setIsManual(false)} style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1.5px solid ${!isManual ? FALL_COLOR : 'var(--mint-border)'}`, background: !isManual ? FALL_BG : 'white', color: !isManual ? FALL_COLOR : 'var(--mint-muted)' }}>⏱️ จับเวลาในแอป</button>
            <button onClick={() => setIsManual(true)} style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isManual ? FALL_COLOR : 'var(--mint-border)'}`, background: isManual ? FALL_BG : 'white', color: isManual ? FALL_COLOR : 'var(--mint-muted)' }}>⌨️ กรอกเวลาเอง</button>
          </div>

          {!isManual ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border)', borderRadius: 16, padding: '24px 16px' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: FALL_COLOR, fontFamily: 'monospace', marginBottom: 16, fontVariantNumeric: 'tabular-nums' }}>
                {displayTime} <span style={{ fontSize: 18, color: 'var(--mint-muted)', fontWeight: 600 }}>วินาที</span>
              </div>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button onClick={handleReset} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'white', border: '1.5px solid var(--mint-border)', color: 'var(--mint-muted)', cursor: 'pointer' }}>รีเซ็ต</button>
                <button onClick={handleStartStop} style={{ flex: 2, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: isRunning ? '#fef2f2' : FALL_COLOR, color: isRunning ? '#dc2626' : 'white', border: isRunning ? '1.5px solid #fca5a5' : 'none', cursor: 'pointer' }}>
                  {isRunning ? '⏸ หยุดจับเวลา' : (timeMs > 0 ? '▶️ จับเวลาต่อ' : '▶️ เริ่มจับเวลา')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border)', borderRadius: 16, padding: '20px 16px' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 8 }}>เวลาที่ใช้ทั้งหมด (วินาที)</label>
              <input type="number" step="0.1" value={manualTime} onChange={e => setManualTime(e.target.value)} placeholder="เช่น 14.5" style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid var(--mint-border)', fontSize: 16, fontWeight: 700, outline: 'none' }} />
            </div>
          )}
        </Section>

        <Section title="2. การใช้อุปกรณ์ช่วยเดิน">
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setUseAid(1)} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1.5px solid ${useAid === 1 ? FALL_COLOR : 'var(--mint-border)'}`, background: useAid === 1 ? FALL_BG : 'var(--mint-surface2)', color: useAid === 1 ? FALL_COLOR : 'var(--mint-muted)' }}>ใช้อุปกรณ์</button>
            <button onClick={() => setUseAid(0)} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1.5px solid ${useAid === 0 ? FALL_COLOR : 'var(--mint-border)'}`, background: useAid === 0 ? FALL_BG : 'var(--mint-surface2)', color: useAid === 0 ? FALL_COLOR : 'var(--mint-muted)' }}>เดินได้เอง</button>
          </div>
        </Section>

        <div style={{ background: 'white', border: `1.5px solid ${FALL_COLOR}44`, borderRadius: 20, padding: '20px 16px', boxShadow: 'var(--shadow-md)', marginBottom: 40 }}>
          <div style={{ padding: '10px 14px', background: '#f0fdf9', border: `1px solid ${FALL_BORDER}`, borderRadius: 12, marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>เกณฑ์การประเมิน: หากใช้เวลา ≥ 12 วินาที ถือว่ามีความเสี่ยงต่อภาวะหกล้ม</p>
          </div>
          <button onClick={handleFinish} style={{ width: '100%', padding: 14, borderRadius: 13, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg,${FALL_COLOR},#047857)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)' }}>
            บันทึกและดูผลการประเมิน →
          </button>
        </div>

      </div>
    </div>
  );
}