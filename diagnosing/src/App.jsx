import React, { useState, useEffect } from 'react';
import MiniCogQuiz from './MiniCogQuiz';
import TMSEQuiz from './TMSEQuiz';
import MoCAQuiz from './MoCAQuiz';
import MMSEQuiz from './MMSEQuiz';
import OralHealthQuiz from './OralHealthQuiz';
import EyeHealthQuiz from './EyeHealthQuiz';
import BoneJointQuiz from './BoneJointQuiz';
import DepressionQuiz from './DepressionQuiz';
import SuicideRiskQuiz from './SuicideRiskQuiz';
import FallRiskQuiz from './FallRiskQuiz';
import NutritionQuiz from './NutritionQuiz';
import FunctionQuiz from './FunctionQuiz';
import logoDementia from './assets/logo-dementia.svg';

const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL ?? '';

const Cross = ({ s = 16, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4"/>
    <rect x="1"   y="7.5" width="18" height="5" rx="1.4"/>
  </svg>
);

const Tag = ({ children, color = 'var(--mint-primary)', bg = 'var(--mint-primary-xl)' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color, background: bg, border: `1px solid ${color}33`, borderRadius: 20, padding: '3px 10px' }}>
    {children}
  </span>
);

const CategoryCard = ({ icon, title, sub, count, color, bg, onClick }) => (
  <div onClick={onClick} style={{
    background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 24, padding: '20px',
    cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)',
    display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden'
  }}
  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--mint-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
  >
    <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05 }}><Cross s={100} c={color} /></div>
    <div style={{ width: 64, height: 64, borderRadius: 18, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, border: `1px solid ${color}33` }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--mint-text)', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--mint-muted)', lineHeight: 1.4, marginBottom: 8 }}>{sub}</p>
      <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '4px 10px', borderRadius: 20, border: `1px solid ${color}33` }}>{count} แบบทดสอบ</span>
    </div>
    <div style={{ color: 'var(--mint-border2)', fontSize: 24, paddingRight: 8 }}>→</div>
  </div>
);

const TestCard = ({ icon, title, sub, badge, bColor, bBg, onClick }) => (
  <div onClick={onClick} style={{ background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 22, padding: '22px 20px', cursor: 'pointer', transition: 'all 0.22s ease', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}
    onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = bColor; }}
    onMouseOut={e  => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--mint-border)'; }}>
    <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.04 }}><Cross s={80} c={bColor} /></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: bBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      <Tag color={bColor} bg={bBg}>{badge}</Tag>
    </div>
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--mint-text)', marginBottom: 5 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--mint-muted)', lineHeight: 1.6 }}>{sub}</p>
    </div>
    <div style={{ fontSize: 13, fontWeight: 700, color: bColor, display: 'flex', alignItems: 'center', gap: 5 }}>เริ่มทดสอบ <span>→</span></div>
  </div>
);

const CriteriaBlock = ({ title, color, children }) => (
  <div style={{ background: 'white', border: `1.5px solid ${color}33`, borderRadius: 22, padding: '24px 20px', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 5, height: 26, borderRadius: 3, background: color, flexShrink: 0 }} />
      <h3 style={{ fontSize: 17, fontWeight: 800, color }}>{title}</h3>
    </div>
    {children}
  </div>
);

const ScoreRow = ({ label, val, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 10 }}>
    <span style={{ fontSize: 13, color: 'var(--mint-text2)' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 800, color }}>{val}</span>
  </div>
);

const WarnBadge = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff7ed', border: '1px solid #fcd34d55', borderRadius: 10, marginTop: 12 }}>
    <span style={{ fontSize: 14 }}>⚠️</span><p style={{ fontSize: 13, color: '#92400e' }}>{children}</p>
  </div>
);

const Spinner = ({ size = 20, color = 'var(--mint-primary)' }) => (
  <span style={{ display: 'inline-block', width: size, height: size, border: `3px solid ${color}33`, borderTop: `3px solid ${color}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const cfg = { success: { bg: '#f0fdf9', border: '#6ee7d5', text: '#065f46', icon: '✅' }, error: { bg: '#fff1f1', border: '#fca5a5', text: '#dc2626', icon: '❌' }, info: { bg: 'var(--mint-blue-xl)', border: 'var(--mint-blue-l)', text: 'var(--mint-blue)', icon: 'ℹ️' } }[type];
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 14, padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, animation: 'scaleIn 0.25s ease both', maxWidth: 340 }}>
      <span style={{ fontSize: 16 }}>{cfg.icon}</span><p style={{ fontSize: 13, fontWeight: 600, color: cfg.text, flex: 1 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: cfg.text, opacity: 0.5 }}>×</button>
    </div>
  );
};

const PatientForm = ({ quizType, onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  const [age,  setAge]  = useState('');
  const [gender, setGender] = useState(''); // 👈 เพิ่ม State เพศ
  const [err,  setErr]  = useState('');

  const handleSubmit = () => {
    if (!name.trim()) { setErr('กรุณากรอกชื่อ-นามสกุล'); return; }
    if (!age || isNaN(age) || Number(age) < 1 || Number(age) > 120) { setErr('กรุณากรอกอายุที่ถูกต้อง (1–120)'); return; }
    if (!gender) { setErr('กรุณาระบุเพศ'); return; } // 👈 ดักการกรอกเพศ
    onConfirm({ name: name.trim(), age: parseInt(age), gender });
  };

  const typeConfigs = {
    minicog: { label: 'Mini-Cog™',        color: 'var(--mint-primary)', grad: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))', icon: '⚡', bg: 'var(--mint-primary-xl)' },
    tmse:    { label: 'TMSE',              color: 'var(--mint-blue)',    grad: 'linear-gradient(135deg, var(--mint-blue), #60a5fa)',                    icon: '🧠', bg: 'var(--mint-blue-xl)' },
    mmse:    { label: 'MMSE-Thai',         color: '#0d9488',             grad: 'linear-gradient(135deg, #0d9488, #0f766e)',                              icon: '🧩', bg: '#f0fdfa' },
    moca:    { label: 'MoCA',              color: '#8b5cf6',             grad: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',                              icon: '📋', bg: '#f3e8ff' },
    oral:    { label: 'สุขภาพช่องปาก',    color: '#0891b2',             grad: 'linear-gradient(135deg, #0891b2, #0e7490)',                              icon: '🦷', bg: '#ecfeff' },
    eye:     { label: 'สุขภาวะทางตา',     color: '#7c3aed',             grad: 'linear-gradient(135deg, #7c3aed, #6d28d9)',                              icon: '👁️', bg: '#f5f3ff' },
    bone:    { label: 'โรคทางกระดูกและข้อ', color: '#ea580c',             grad: 'linear-gradient(135deg, #ea580c, #c2410c)',                              icon: '🦴', bg: '#fff7ed' },
    depress: { label: 'ภาวะซึมเศร้า (2Q/9Q)',color: '#e11d48',            grad: 'linear-gradient(135deg, #e11d48, #be123c)',                              icon: '❤️‍🩹', bg: '#fff1f2' },
    suicide: { label: 'ความเสี่ยงฆ่าตัวตาย (8Q)',color: '#dc2626',        grad: 'linear-gradient(135deg, #dc2626, #991b1b)',                              icon: '🆘', bg: '#fef2f2' },
    fall:    { label: 'ภาวะหกล้ม (TUGT)',  color: '#059669',             grad: 'linear-gradient(135deg, #059669, #047857)',                              icon: '🚶‍♂️', bg: '#ecfdf5' },
    mna:     { label: 'โภชนาการ (MNA)',    color: '#d97706',             grad: 'linear-gradient(135deg, #d97706, #b45309)',                              icon: '🥗', bg: '#fffbeb' },
    msra:    { label: 'มวลกล้ามเนื้อ (MSRA)',color: '#d97706',             grad: 'linear-gradient(135deg, #d97706, #b45309)',                              icon: '💪', bg: '#fffbeb' },
    adl:     { label: 'กิจวัตรประจำวัน (ADL)', color: '#4f46e5',             grad: 'linear-gradient(135deg, #4f46e5, #3730a3)',                              icon: '🛌', bg: '#e0e7ff' },
    frail:   { label: 'ความเปราะบาง (Frail)',color: '#4f46e5',             grad: 'linear-gradient(135deg, #4f46e5, #3730a3)',                              icon: '🍂', bg: '#e0e7ff' },
  };
  const cfg = typeConfigs[quizType] || typeConfigs.minicog;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,43,40,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 22, padding: '28px 22px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(14,159,142,0.2)', border: '1.5px solid var(--mint-border)', animation: 'scaleIn 0.28s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cfg.icon}</div>
          <div><div style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-text)' }}>ข้อมูลผู้เข้ารับการทดสอบ</div><div style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{cfg.label}</div></div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--mint-muted)', marginBottom: 20, lineHeight: 1.6 }}>กรอกข้อมูลเพื่อบันทึกผลการทดสอบเข้า Google Sheets</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>ชื่อ-นามสกุล <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" value={name} placeholder="เช่น สมชาย ใจดี" onChange={e => { setName(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ width: '100%', padding: '12px 14px', background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--mint-text)', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = cfg.color} onBlur={e => e.target.style.borderColor = 'var(--mint-border)'} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>อายุ (ปี) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="number" value={age} placeholder="เช่น 72" onChange={e => { setAge(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ width: '100%', padding: '12px 14px', background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--mint-text)', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = cfg.color} onBlur={e => e.target.style.borderColor = 'var(--mint-border)'} />
          </div>
          {/* 👈 เพิ่มกล่องเลือกเพศ */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>เพศ <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['ชาย', 'หญิง'].map(g => (
                <button type="button" key={g} onClick={() => { setGender(g); setErr(''); }} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1.5px solid ${gender === g ? cfg.color : 'var(--mint-border)'}`, background: gender === g ? cfg.bg : 'var(--mint-surface2)', color: gender === g ? cfg.color : 'var(--mint-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {err && <div style={{ padding: '9px 14px', borderRadius: 10, marginBottom: 14, background: '#fff1f1', border: '1px solid #fca5a5', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>⚠️ {err}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', color: 'var(--mint-muted)', cursor: 'pointer' }}>ยกเลิก</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: cfg.grad, color: 'white', border: 'none', cursor: 'pointer' }}>เริ่มทดสอบ →</button>
        </div>
      </div>
    </div>
  );
};

const ResultSummaryModal = ({ result, patient, onClose, onViewAll }) => {
  if (!result) return null;
  const isMini = result.type === 'Mini-Cog';
  const isTMSE = result.type === 'TMSE';
  const isMoCA = result.type === 'MoCA';
  const isMMSE = result.type.includes('MMSE');
  const isOral = result.type === 'Oral Health';
  const isEye  = result.type === 'Eye Health';
  const isBone = result.type === 'Bone and Joint';
  const isDepress = result.type === 'Depression (2Q/9Q)';
  const isSuicide = result.type === 'Suicide Risk (8Q)';
  const isFall = result.type === 'Fall Risk (TUGT)';
  const isMna = result.type === 'MNA (Malnutrition)';
  const isMsra = result.type === 'Modified MSRA-5';
  const impaired = result.impaired;

  const typeMap = {
    'Mini-Cog':          { color: 'var(--mint-primary)', grad: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))', icon: '⚡' },
    'TMSE':              { color: 'var(--mint-blue)',    grad: 'linear-gradient(135deg, var(--mint-blue), #60a5fa)',                    icon: '🧠' },
    'MMSE (Mini-Mental State)': { color: '#0d9488',      grad: 'linear-gradient(135deg, #0d9488, #0f766e)',                              icon: '🧩' },
    'MoCA':              { color: '#8b5cf6',             grad: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',                              icon: '📋' },
    'Oral Health':       { color: '#0891b2',             grad: 'linear-gradient(135deg, #0891b2, #0e7490)',                              icon: '🦷' },
    'Eye Health':        { color: '#7c3aed',             grad: 'linear-gradient(135deg, #7c3aed, #6d28d9)',                              icon: '👁️' },
    'Bone and Joint':    { color: '#ea580c',             grad: 'linear-gradient(135deg, #ea580c, #c2410c)',                              icon: '🦴' },
    'Depression (2Q/9Q)':{ color: '#e11d48',             grad: 'linear-gradient(135deg, #e11d48, #be123c)',                              icon: '❤️‍🩹' },
    'Suicide Risk (8Q)': { color: '#dc2626',             grad: 'linear-gradient(135deg, #dc2626, #991b1b)',                              icon: '🆘' },
    'Fall Risk (TUGT)':  { color: '#059669',             grad: 'linear-gradient(135deg, #059669, #047857)',                              icon: '🚶‍♂️' },
    'MNA (Malnutrition)':{ color: '#d97706',             grad: 'linear-gradient(135deg, #d97706, #b45309)',                              icon: '🥗' },
    'Modified MSRA-5':   { color: '#d97706',             grad: 'linear-gradient(135deg, #d97706, #b45309)',                              icon: '💪' },
    'ADL (สมรรถนะกิจวัตรประจำวัน)':{ color: '#4f46e5',   grad: 'linear-gradient(135deg, #4f46e5, #3730a3)',                              icon: '🛌' },
    'Frail Scale (ความเปราะบาง)':  { color: '#4f46e5',   grad: 'linear-gradient(135deg, #4f46e5, #3730a3)',                              icon: '🍂' },
  };
  const tc = typeMap[result.type] || typeMap['Mini-Cog'];
  const pct = result.maxScore > 0 ? (result.totalScore / result.maxScore) * 100 : (impaired ? 100 : 0);
  const circ = 2 * Math.PI * 52;
  const noCircleTests = isBone || isDepress || isSuicide || isFall || isMsra;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,43,40,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 26, width: '100%', maxWidth: 460, boxShadow: '0 24px 80px rgba(14,159,142,0.25)', border: '1.5px solid var(--mint-border)', animation: 'scaleIn 0.32s ease both', overflow: 'hidden' }}>
        <div style={{ background: tc.grad, padding: '22px 24px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.12 }}><Cross s={120} c="white" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{tc.icon}</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>ผลการประเมิน {result.type}</p>
              {/* 👇 โชว์เพศในหน้าต่างประเมินผล */}
              {patient && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{patient.name} · {patient.gender} · อายุ {patient.age} ปี</p>}
            </div>
          </div>
        </div>
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
            {!noCircleTests && (
              <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                <svg width="110" height="110" style={{ position: 'absolute', inset: 0 }}>
                  <circle cx="55" cy="55" r="52" fill="none" stroke="var(--mint-border2)" strokeWidth="7"/>
                  <circle cx="55" cy="55" r="52" fill="none" stroke={impaired ? 'var(--mint-warn)' : tc.color} strokeWidth="7" strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 55 55)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: impaired ? 'var(--mint-warn)' : tc.color }}>{result.totalScore}</span>
                  <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>/ {result.maxScore}</span>
                </div>
              </div>
            )}
            {isFall && (
              <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', borderRadius: '50%' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: impaired ? 'var(--mint-warn)' : tc.color }}>{result.totalScore}</span>
                  <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>วินาที</span>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ borderRadius: 14, padding: '14px 16px', background: impaired ? '#fff7ed' : '#f0fdf9', border: `1.5px solid ${impaired ? '#fcd34d' : '#6ee7d5'}`, marginBottom: 8 }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: impaired ? '#92400e' : '#065f46', marginBottom: 4 }}>
                  {impaired ? '⚠️ พบสัญญาณความเสี่ยง' : '✅ อยู่ในเกณฑ์ปกติ'}
                </p>
                <p style={{ fontSize: 12, color: impaired ? '#b45309' : '#047857', lineHeight: 1.5 }}>
                  {result.resultText ? `ผลประเมิน: ${result.resultText}` : 
                   isMini ? (impaired ? 'คะแนน ≤ 3 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน > 3 → ไม่พบสัญญาณผิดปกติ') :
                   isMoCA ? (impaired ? 'คะแนน < 25 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน ≥ 25 → ไม่พบสัญญาณผิดปกติ') :
                   isMMSE ? (impaired ? 'คะแนนต่ำกว่าจุดตัดเกณฑ์การศึกษา' : 'คะแนนผ่านจุดตัดเกณฑ์การศึกษา') :
                            (impaired ? 'คะแนน < 24 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน ≥ 24 → ไม่พบสัญญาณผิดปกติ')}
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onViewAll} style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: tc.grad, color: 'white', border: 'none', cursor: 'pointer' }}>📋 ดูผลทั้งหมด</button>
            <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', color: 'var(--mint-text2)', cursor: 'pointer' }}>← กลับหน้าหลัก</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 👇 เพิ่มเพศเข้าไปในไฟล์ Export CSV
function exportCSV(results) {
  const BOM = '\uFEFF';
  const headers = ['ลำดับ','ชื่อ-นามสกุล','อายุ','เพศ','ประเภทแบบทดสอบ','คะแนนรวม','คะแนนสูงสุด','การแปลผล','วันที่/เวลา','เวลาที่ใช้ (วินาที)','เวลาที่ใช้ (นาที:วินาที)'];
  const rows = results.map((r, i) => {
    const sec = r.duration ?? 0;
    const fmt = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    return [i+1, r.name, r.age, r.gender, r.type, r.totalScore, r.maxScore, r.impaired ? 'พบปัญหา/บกพร่อง' : 'อยู่ในเกณฑ์ปกติ', r.datetime, sec, fmt]
      .map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',');
  });
  const csv  = BOM + [headers.map(h => '"'+h+'"').join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'health_screening_results_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click(); URL.revokeObjectURL(url);
}

const isConfigured = () => SCRIPT_URL !== '' && SCRIPT_URL !== 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE';

async function saveToSheets(record) {
  if (!isConfigured()) return { success: false, error: 'not configured' };
  const res = await fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(record) });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { success: false, error: text }; }
}

async function loadFromSheets() {
  if (!isConfigured()) return [];
  const url = `${SCRIPT_URL}?t=${Date.now()}`;
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('Invalid response: ' + text.slice(0, 100)); }
  if (!json.success) throw new Error(json.error || 'Unknown error');
  return (json.data || []).map(row => ({
    name:       String(row[1] ?? ''),
    age:        row[2],
    gender:     String(row[3] ?? '-'), // 👈 3. ดึงค่าเพศจาก Sheet (อยู่ตำแหน่งที่ 3)
    type:       String(row[4] ?? ''),  // ขยับ Index ที่เหลือลง 1 ช่อง
    totalScore: Number(row[5]),
    maxScore:   Number(row[6]),
    impaired:   String(row[7]).includes('บกพร่อง') || String(row[7]).includes('Impairment') || String(row[7]).includes('พบปัญหา') || String(row[7]).includes('ควรส่งต่อ') || String(row[7]).includes('พบความเสี่ยง') || String(row[7]).includes('ซึมเศร้า') || String(row[7]).includes('เสี่ยงฆ่าตัวตาย') || String(row[7]).includes('เสี่ยงหกล้ม') || String(row[7]).includes('เสี่ยงต่อภาวะมวลกล้ามเนื้อ') || String(row[7]).includes('ขาดสารอาหาร') || String(row[7]).includes('ติดเตียง') || String(row[7]).includes('ติดบ้าน') || String(row[7]).includes('เปราะบาง') || String(row[7]).includes('แนวโน้มภาวะสมองเสื่อม'),
    datetime: (() => {
      const raw = String(row[8] ?? ''); // ขยับ Index
      const d = new Date(raw);
      if (!isNaN(d) && raw.trim() !== '') {
        const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
        let year = d.getFullYear();
        if (year < 2500) year += 543;
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${year} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      }
      return raw;
    })(),
    duration: Number(row[9]) || 0, // ขยับ Index
    breakdown: {},
  }));
}

const TYPE_COLORS = { 'Mini-Cog': 'var(--mint-primary)', 'TMSE': 'var(--mint-blue)', 'MoCA': '#8b5cf6', 'MMSE (Mini-Mental State)': '#0d9488', 'Oral Health': '#0891b2', 'Eye Health': '#7c3aed', 'Bone and Joint': '#ea580c', 'Depression (2Q/9Q)': '#e11d48', 'Suicide Risk (8Q)': '#dc2626', 'Fall Risk (TUGT)': '#059669', 'MNA (Malnutrition)': '#d97706', 'Modified MSRA-5': '#d97706', 'ADL (สมรรถนะกิจวัตรประจำวัน)': '#4f46e5', 'Frail Scale (ความเปราะบาง)': '#4f46e5' };
const TYPE_BG = { 'Mini-Cog': 'var(--mint-primary-xl)', 'TMSE': 'var(--mint-blue-xl)', 'MoCA': '#f3e8ff', 'MMSE (Mini-Mental State)': '#f0fdfa', 'Oral Health': '#ecfeff', 'Eye Health': '#f5f3ff', 'Bone and Joint': '#fff7ed', 'Depression (2Q/9Q)': '#fff1f2', 'Suicide Risk (8Q)': '#fef2f2', 'Fall Risk (TUGT)': '#ecfdf5', 'MNA (Malnutrition)': '#fffbeb', 'Modified MSRA-5': '#fffbeb', 'ADL (สมรรถนะกิจวัตรประจำวัน)': '#e0e7ff', 'Frail Scale (ความเปราะบาง)': '#e0e7ff' };

const ResultsPage = ({ results, onExport, onRefresh, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const uniqueTypes = [...new Set(results.map(r => r.type))];
  const processedResults = results.map((r, i) => ({ ...r, originalIndex: i }));

  const filtered = processedResults.filter(r => {
    const matchName = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'All' ? true : r.type === filterType;
    return matchName && matchType;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return b.originalIndex - a.originalIndex;
    if (sortBy === 'date-asc') return a.originalIndex - b.originalIndex;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'th');
    if (sortBy === 'age-asc') return (Number(a.age) || 0) - (Number(b.age) || 0);
    if (sortBy === 'age-desc') return (Number(b.age) || 0) - (Number(a.age) || 0);
    return 0;
  });

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--mint-text)' }}>ผลการทดสอบทั้งหมด</h2>
          <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 4 }}>
            {loading ? 'กำลังโหลดจาก Google Sheets…' : <> พบ <strong style={{ color: 'var(--mint-primary)' }}>{filtered.length}</strong> จากทั้งหมด {results.length} รายการ</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onRefresh} disabled={loading} style={{ padding: '9px 14px', borderRadius: 11, fontSize: 13, fontWeight: 700, background: 'var(--mint-primary-xl)', border: '1px solid var(--mint-border)', color: 'var(--mint-primary)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
            {loading ? <Spinner size={14} color="var(--mint-primary)" /> : '🔄'} รีเฟรช
          </button>
          {results.length > 0 && (
            <button onClick={onExport} style={{ padding: '9px 16px', borderRadius: 11, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(14,159,142,0.28)' }}>📥 ดาวน์โหลด CSV</button>
          )}
        </div>
      </div>

      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input type="text" placeholder="🔍 ค้นหาชื่อ-นามสกุล..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--mint-border)', fontSize: 13, fontWeight: 600, outline: 'none', flex: '1 1 200px', background: 'white' }} />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--mint-border)', fontSize: 13, fontWeight: 600, outline: 'none', background: 'white', flex: '1 1 150px', cursor: 'pointer', color: 'var(--mint-text)' }}>
            <option value="All">📌 ทุกแบบทดสอบ</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--mint-border)', fontSize: 13, fontWeight: 600, outline: 'none', background: 'white', flex: '1 1 150px', cursor: 'pointer', color: 'var(--mint-text)' }}>
            <option value="date-desc">🕒 วันที่: ล่าสุด - เก่าสุด</option>
            <option value="date-asc">🕒 วันที่: เก่าสุด - ล่าสุด</option>
            <option value="name-asc">🔤 ชื่อ: ก - ฮ</option>
            <option value="age-asc">👤 อายุ: น้อย - มาก</option>
            <option value="age-desc">👤 อายุ: มาก - น้อย</option>
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Spinner size={36} /></div><p style={{ fontSize: 14, color: 'var(--mint-muted)' }}>กำลังโหลดข้อมูลจาก Google Sheets…</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', border: '1.5px dashed var(--mint-border)', borderRadius: 22, color: 'var(--mint-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div><p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>ยังไม่มีข้อมูล</p><p style={{ fontSize: 13 }}>ทำแบบทดสอบก่อนแล้วผลจะปรากฏที่นี่</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', border: '1.5px dashed var(--mint-border)', borderRadius: 22, color: 'var(--mint-muted)' }}>
          <p style={{ fontSize: 15, fontWeight: 700 }}>ไม่พบข้อมูลที่ค้นหา</p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 22, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ background: 'var(--mint-surface2)', borderBottom: '2px solid var(--mint-border2)' }}>
                  {/* 👇 เพิ่มหัวตารางเพศ */}
                  {['#','ชื่อ-นามสกุล','อายุ','เพศ','แบบทดสอบ','คะแนน/ผล','การแปลผล','วันที่/เวลา','ระยะเวลา'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--mint-text2)', fontSize: 11, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const noScoreMax = r.type === 'Bone and Joint' || r.type.includes('Depression') || r.type.includes('Suicide') || r.type.includes('MSRA');
                  return (
                  <tr key={r.originalIndex} style={{ borderBottom: '1px solid var(--mint-border2)', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--mint-surface2)'} onMouseOut={e  => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 14px', color: 'var(--mint-muted)', fontWeight: 600 }}>{i+1}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--mint-text)' }}>{r.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--mint-text2)' }}>{r.age} ปี</td>
                    {/* 👇 แสดงเพศในตาราง */}
                    <td style={{ padding: '11px 14px', color: 'var(--mint-text2)' }}>{r.gender}</td>
                    <td style={{ padding: '11px 14px' }}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: TYPE_BG[r.type] || 'var(--mint-surface2)', color: TYPE_COLORS[r.type] || 'var(--mint-muted)', whiteSpace: 'nowrap' }}>{r.type}</span></td>
                    <td style={{ padding: '11px 14px', fontWeight: 800, fontSize: 15, color: r.impaired ? 'var(--mint-warn)' : (TYPE_COLORS[r.type] || 'var(--mint-primary)') }}>
                      {noScoreMax ? '—' : r.totalScore}
                      {(!noScoreMax && r.type !== 'Fall Risk (TUGT)') && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--mint-muted)' }}>/{r.maxScore}</span>}
                      {r.type === 'Fall Risk (TUGT)' && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--mint-muted)' }}> วิ.</span>}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: r.impaired ? '#fff7ed' : '#f0fdf9', color: r.impaired ? '#92400e' : '#065f46', border: '1px solid ' + (r.impaired ? '#fcd34d88' : '#6ee7d588'), whiteSpace: 'nowrap' }}>
                        {r.impaired ? '⚠️ พบปัญหา' : '✅ ปกติ'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--mint-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{r.datetime}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--mint-text2)', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {r.duration > 0 ? `⏱ ${String(Math.floor(r.duration/60)).padStart(2,'0')}:${String(r.duration%60).padStart(2,'0')}` : '—'}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [tab,           setTab]           = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quiz,          setQuiz]          = useState(null);
  const [showForm,      setShowForm]      = useState(null);
  const [patient,       setPatient]       = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [allResults,    setAllResults]    = useState([]);
  const [saving,        setSaving]        = useState(false);
  const [loadingData,   setLoadingData]   = useState(false);
  const [toast,         setToast]         = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadResults = async () => {
    if (!isConfigured()) return;
    setLoadingData(true);
    try { const rows = await loadFromSheets(); setAllResults(rows); }
    catch (err) { showToast('ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้: ' + err.message, 'error'); }
    finally { setLoadingData(false); }
  };

  useEffect(() => { loadResults(); }, []);

  const handleTabChange = (newTab) => { 
    setTab(newTab); 
    if (newTab === 'home') setSelectedCategory(null);
    if (newTab === 'results') loadResults(); 
  };

  const handleFormConfirm = (info) => { setPatient(info); setShowForm(null); setQuiz(showForm); };

  const handleComplete = async (scoreData) => {
    const now = new Date();
    const datetime = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    
    // 👇 ส่งข้อมูลเพศเข้าไปใน Google Sheets
    const newRecord = { name: patient?.name ?? 'ไม่ระบุ', age: patient?.age ?? '-', gender: patient?.gender ?? '-', type: scoreData.type, totalScore: scoreData.totalScore, maxScore: scoreData.maxScore, impaired: scoreData.impaired, breakdown: scoreData.breakdown, duration: scoreData.duration ?? 0, datetime, resultText: scoreData.resultText };
    
    setPendingResult({ ...scoreData, datetime });
    setQuiz(null);
    setSaving(true);
    try {
      const res = await saveToSheets(newRecord);
      if (res.success) { setAllResults(prev => [...prev, newRecord]); showToast('บันทึกลง Google Sheets สำเร็จ ✅'); }
      else throw new Error(res.error || 'save failed');
    } catch (err) { setAllResults(prev => [...prev, newRecord]); showToast('บันทึกไม่สำเร็จ — ตรวจสอบ SCRIPT_URL', 'error'); } 
    finally { setSaving(false); }
  };

  const handleBack = () => { setQuiz(null); setPatient(null); setTab('home'); };
  const handleSummaryClose   = () => { setPendingResult(null); setPatient(null); setTab('home'); };
  const handleSummaryViewAll = () => { setPendingResult(null); setPatient(null); handleTabChange('results'); };

  if (quiz === 'minicog') return <MiniCogQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'tmse')    return <TMSEQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'mmse')    return <MMSEQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'moca')    return <MoCAQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'oral')    return <OralHealthQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'eye')     return <EyeHealthQuiz  patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'bone')    return <BoneJointQuiz  patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'depress') return <DepressionQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'suicide') return <SuicideRiskQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'fall')    return <FallRiskQuiz   patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'mna')     return <NutritionQuiz tool="MNA" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'msra')    return <NutritionQuiz tool="MSRA5" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'adl')     return <FunctionQuiz tool="ADL" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'frail')   return <FunctionQuiz tool="FRAIL" patient={patient} onBack={handleBack} onComplete={handleComplete} />;

  const cognitiveTests = [
    { key: 'minicog', icon: '⚡', title: 'Mini-Cog™',   sub: 'ทดสอบความจำ 3 คำ + วาดรูปนาฬิกา', badge: '5 คะแนน', bColor: 'var(--mint-primary)', bBg: 'var(--mint-primary-xl)' },
    { key: 'tmse',    icon: '🧠', title: 'TMSE',         sub: 'Thai Mental State Examination', badge: '30 คะแนน', bColor: 'var(--mint-blue)',    bBg: 'var(--mint-blue-xl)' },
    { key: 'mmse',    icon: '🧩', title: 'MMSE-Thai',    sub: 'Mini-Mental State Examination', badge: '30 คะแนน', bColor: '#0d9488',             bBg: '#f0fdfa' },
    { key: 'moca',    icon: '📋', title: 'MoCA',         sub: 'Montreal Cognitive Assessment', badge: '30 คะแนน', bColor: '#8b5cf6',             bBg: '#f3e8ff' },
  ];
  const nutritionTests = [
    { key: 'mna',  icon: '🥗', title: 'ภาวะโภชนาการ (MNA)', sub: 'คัดกรองด้วย MNA Short Form และ Full Form', badge: 'MNA', bColor: '#d97706', bBg: '#fffbeb' },
    { key: 'msra', icon: '💪', title: 'มวลกล้ามเนื้อน้อย', sub: 'แบบคัดกรอง Modified MSRA-5', badge: 'MSRA-5', bColor: '#d97706', bBg: '#fffbeb' },
  ];
  const functionTests = [
    { key: 'adl',   icon: '🛌', title: 'กิจวัตรประจำวัน (ADL)', sub: 'ประเมิน 10 ด้าน กลุ่มติดสังคม/บ้าน/เตียง', badge: 'ADL Index', bColor: '#4f46e5', bBg: '#e0e7ff' },
    { key: 'frail', icon: '🍂', title: 'ความเปราะบาง (Frail)', sub: 'คัดกรองความเปราะบาง Frail Scale 5 ข้อ', badge: 'FRAIL', bColor: '#4f46e5', bBg: '#e0e7ff' },
  ];
  const healthTests = [
    { key: 'oral', icon: '🦷', title: 'สุขภาพช่องปาก',   sub: 'ประเมินโดยทันตบุคลากร 8 ด้าน', badge: '8 รายการ',  bColor: '#0891b2', bBg: '#ecfeff' },
    { key: 'eye',  icon: '👁️', title: 'สุขภาวะทางตา',    sub: 'ต้อกระจก ต้อหิน จอตาเสื่อม + Snellen Chart', badge: 'ระยะ+ใกล้', bColor: '#7c3aed', bBg: '#f5f3ff' },
    { key: 'bone', icon: '🦴', title: 'โรคทางกระดูกและข้อ', sub: 'OSTA index, FRAX score, ข้อเข่าเสื่อม', badge: '3 รายการ', bColor: '#ea580c', bBg: '#fff7ed' },
  ];
  const syndromeTests = [
    { key: 'fall', icon: '🚶‍♂️', title: 'ภาวะหกล้ม (TUGT)', sub: 'ทดสอบ Timed Up and Go Test จับเวลา', badge: 'TUGT', bColor: '#059669', bBg: '#ecfdf5' },
  ];
  const mentalTests = [
    { key: 'depress', icon: '❤️‍🩹', title: 'ภาวะซึมเศร้า (2Q/9Q)', sub: 'คัดกรองด้วย 2Q และประเมินต่อด้วย 9Q', badge: '2Q, 9Q', bColor: '#e11d48', bBg: '#fff1f2' },
    { key: 'suicide', icon: '🆘', title: 'ความเสี่ยงฆ่าตัวตาย', sub: 'ประเมินความเสี่ยงฆ่าตัวตาย (8Q)', badge: '8Q', bColor: '#dc2626', bBg: '#fef2f2' },
  ];

  const CATEGORIES = [
    { id: 'cog', icon: '🧠', title: 'สมรรถภาพสมอง', sub: 'การรับรู้ ความจำ ความคิด', count: cognitiveTests.length, color: 'var(--mint-primary)', bg: 'var(--mint-primary-xl)', tests: cognitiveTests },
    { id: 'nut', icon: '🥗', title: 'โภชนาการและกล้ามเนื้อ', sub: 'ภาวะขาดสารอาหารและมวลกล้ามเนื้อ', count: nutritionTests.length, color: '#d97706', bg: '#fffbeb', tests: nutritionTests },
    { id: 'fun', icon: '🛌', title: 'สมรรถนะการดูแล', sub: 'ADL กิจวัตรประจำวัน และความเปราะบาง', count: functionTests.length, color: '#4f46e5', bg: '#e0e7ff', tests: functionTests },
    { id: 'gen', icon: '🏥', title: 'สุขภาพทั่วไป', sub: 'ช่องปาก สายตา กระดูกและข้อ', count: healthTests.length, color: '#0891b2', bg: '#ecfeff', tests: healthTests },
    { id: 'syn', icon: '🚶‍♂️', title: 'กลุ่มอาการในผู้สูงอายุ', sub: 'ความเสี่ยงภาวะหกล้ม (TUGT)', count: syndromeTests.length, color: '#059669', bg: '#ecfdf5', tests: syndromeTests },
    { id: 'men', icon: '❤️‍🩹', title: 'สุขภาพจิต', sub: 'ภาวะซึมเศร้าและความเสี่ยงฆ่าตัวตาย', count: mentalTests.length, color: '#e11d48', bg: '#fff1f2', tests: mentalTests },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {showForm && <PatientForm quizType={showForm} onConfirm={handleFormConfirm} onCancel={() => setShowForm(null)} />}
      {pendingResult && <ResultSummaryModal result={pendingResult} patient={patient} onClose={handleSummaryClose} onViewAll={handleSummaryViewAll} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {saving && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: 'white', borderRadius: 14, padding: '10px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: '1px solid var(--mint-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Spinner size={16} /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>กำลังบันทึกไปยัง Google Sheets…</span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border2)', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => handleTabChange('home')}>
          <img src={logoDementia} alt="logo" style={{ width: 38, height: 38, borderRadius: 12, boxShadow: '0 4px 12px rgba(14,159,142,0.2)', flexShrink: 0 }}/>
          <div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-text)', letterSpacing: '0.02em', lineHeight: 1.2 }}>Health<span style={{ color: 'var(--mint-primary)' }}>Screen</span></div><div style={{ fontSize: 9, color: 'var(--mint-muted)', letterSpacing: '0.08em', fontWeight: 700 }}>GERIATRIC CARE</div></div>
        </div>
        <div style={{ display: 'flex', gap: 3, background: 'var(--mint-surface2)', borderRadius: 12, padding: 4, border: '1px solid var(--mint-border2)', flexShrink: 0 }}>
          {[['home','หน้าหลัก'],['results','ผลประเมิน' + (allResults.length > 0 ? ` (${allResults.length})` : '')],['about','เกณฑ์']].map(([key, label]) => (
            <button key={key} onClick={() => handleTabChange(key)} style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.18s', background: tab === key ? 'white' : 'transparent', color: tab === key ? 'var(--mint-primary)' : 'var(--mint-muted)', boxShadow: tab === key ? '0 2px 6px rgba(0,0,0,0.06)' : 'none', position: 'relative', whiteSpace: 'nowrap' }}>
              {label}{key === 'results' && allResults.length > 0 && tab !== 'results' && <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: 'var(--mint-warn)', border: '2px solid var(--mint-surface2)' }} />}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1160, margin: '0 auto', width: '100%', padding: '32px 16px' }}>
        {tab === 'home' && (
          <div className="fade-up">
            {!selectedCategory ? (
              <>
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                  <Tag><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint-primary)', display: 'inline-block', animation: 'breathe 2.2s ease infinite' }} /> มาตรฐานกระทรวงสาธารณสุข พ.ศ.2564</Tag>
                  <h1 style={{ fontFamily: "'Lora','Sarabun',serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: 800, color: 'var(--mint-text)', marginTop: 16, marginBottom: 12 }}>
                    ประเมินสุขภาพ<span style={{ color: 'var(--mint-primary)' }}>ผู้สูงอายุ</span>
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--mint-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                    เลือกหมวดหมู่ที่ต้องการประเมิน ระบบจะบันทึกผลและแปลผลอัตโนมัติ
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                  {CATEGORIES.map(cat => (
                    <CategoryCard key={cat.id} {...cat} onClick={() => setSelectedCategory(cat)} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setSelectedCategory(null)} style={{ background: 'white', border: '1.5px solid var(--mint-border)', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--mint-text2)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
                  ← กลับไปหน้าหมวดหมู่
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, background: selectedCategory.bg, padding: '24px', borderRadius: 24, border: `1.5px solid ${selectedCategory.color}33` }}>
                  <div style={{ fontSize: 40 }}>{selectedCategory.icon}</div>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: selectedCategory.color, marginBottom: 4 }}>{selectedCategory.title}</h2>
                    <p style={{ fontSize: 14, color: 'var(--mint-text2)' }}>กรุณาเลือกแบบทดสอบที่ต้องการ</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px),1fr))', gap: 16 }}>
                  {selectedCategory.tests.map(t => (
                    <TestCard key={t.key} {...t} onClick={() => setShowForm(t.key)} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'results' && <ResultsPage results={allResults} onExport={() => exportCSV(allResults)} onRefresh={loadResults} loading={loadingData} />}

        {tab === 'about' && (
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
            <div style={{ marginBottom: 12, textAlign: 'center' }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--mint-text)' }}>เกณฑ์การประเมินและแปลผล</h2>
              <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 5, lineHeight: 1.6 }}>
                อ้างอิงจากคู่มือการคัดกรองและประเมินสุขภาพผู้สูงอายุ พ.ศ. 2564 <br/>กรมการแพทย์ กระทรวงสาธารณสุข
              </p>
            </div>

            {/* 🧠 1. สมรรถภาพสมอง */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: -10 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: 'var(--mint-primary)' }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--mint-text)' }}>สมรรถภาพสมอง (Cognitive Function)</h2>
            </div>

            <CriteriaBlock title="Mini-Cog™" color="var(--mint-primary)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                ทดสอบการจำคำ 3 คำ (0-3 คะแนน) และการวาดรูปนาฬิกา (0 หรือ 2 คะแนน) <strong>คะแนนเต็ม 5 คะแนน</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
                <ScoreRow label="3 - 5 คะแนน" val="ปกติ (Negative)" color="var(--mint-primary)" />
                <ScoreRow label="0 - 2 คะแนน" val="สงสัยภาวะสมองเสื่อม (Positive)" color="#dc2626" />
              </div>
              <p style={{ fontSize: 13, color: 'var(--mint-text2)', background: 'var(--mint-surface2)', padding: '10px 14px', borderRadius: 10 }}>
                <strong>วิธีคิดคะแนน:</strong> จำได้ 3 คำ = ปกติ (ไม่ต้องดูนาฬิกา), จำไม่ได้เลย (0 คำ) = ผิดปกติ, จำได้ 1-2 คำ = ให้ดูรูปนาฬิกา (ถ้านาฬิกาปกติ +2 คะแนน / ถ้านาฬิกาผิดปกติ +0 คะแนน)
              </p>
            </CriteriaBlock>

            <CriteriaBlock title="TMSE (Thai Mental State Examination)" color="var(--mint-blue)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                แบบทดสอบสภาพสมองผู้สูงอายุไทย 6 ด้าน <strong>คะแนนเต็ม 30 คะแนน</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="≥ 24 คะแนน" val="อยู่ในเกณฑ์ปกติ" color="var(--mint-blue)" />
                <ScoreRow label="< 24 (≤ 23) คะแนน" val="สงสัยภาวะสมองเสื่อม" color="#dc2626" />
              </div>
            </CriteriaBlock>

            <CriteriaBlock title="MMSE-Thai 2002" color="#0d9488">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                ประเมินสภาพสมองเบื้องต้น <strong>คะแนนเต็ม 30 คะแนน</strong> (เกณฑ์จุดตัดขึ้นอยู่กับระดับการศึกษาของผู้ทดสอบ)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="ไม่ได้เรียนหนังสือ / อ่านไม่ออก" val="จุดตัด ≤ 14 คะแนน" color="#0d9488" />
                <ScoreRow label="ระดับประถมศึกษา (ป.1 - ป.6)" val="จุดตัด ≤ 17 คะแนน" color="#0d9488" />
                <ScoreRow label="ระดับสูงกว่าประถมศึกษา" val="จุดตัด ≤ 22 คะแนน" color="#0d9488" />
              </div>
              <WarnBadge>หากคะแนนรวม <strong>น้อยกว่าหรือเท่ากับ (≤)</strong> จุดตัด ถือว่ามีแนวโน้มภาวะสมองเสื่อม</WarnBadge>
            </CriteriaBlock>

            <CriteriaBlock title="MoCA (Montreal Cognitive Assessment)" color="#8b5cf6">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                เหมาะสำหรับคัดกรองภาวะสมองเสื่อมระยะเริ่มต้น (MCI) <strong>คะแนนเต็ม 30 คะแนน</strong> (บวกเพิ่ม 1 คะแนน หากการศึกษา ≤ 6 ปี)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="≥ 25 คะแนน" val="อยู่ในเกณฑ์ปกติ" color="#8b5cf6" />
                <ScoreRow label="< 25 (≤ 24) คะแนน" val="สงสัยภาวะสมองเสื่อม" color="#dc2626" />
              </div>
            </CriteriaBlock>

            {/* 🥗 2. โภชนาการและมวลกล้ามเนื้อ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: -10 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: '#d97706' }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--mint-text)' }}>โภชนาการและมวลกล้ามเนื้อ</h2>
            </div>

            <CriteriaBlock title="ภาวะโภชนาการ (MNA - Mini Nutritional Assessment)" color="#d97706">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 8 }}>
                <strong>ส่วนที่ 1: แบบคัดกรอง (MNA-SF) คะแนนเต็ม 14 คะแนน</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
                <ScoreRow label="12 - 14 คะแนน" val="ภาวะโภชนาการปกติ" color="#d97706" />
                <ScoreRow label="8 - 11 คะแนน" val="เสี่ยงขาดสารอาหาร (ทำแบบเต็มต่อ)" color="#d97706" />
                <ScoreRow label="0 - 7 คะแนน" val="ขาดสารอาหาร (ทำแบบเต็มต่อ)" color="#dc2626" />
              </div>
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 8 }}>
                <strong>ส่วนที่ 2: แบบประเมินเต็ม (MNA-Full) คะแนนเต็ม 30 คะแนน</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="24 - 30 คะแนน" val="ภาวะโภชนาการปกติ" color="#d97706" />
                <ScoreRow label="17 - 23.5 คะแนน" val="มีความเสี่ยงต่อภาวะขาดสารอาหาร" color="#b45309" />
                <ScoreRow label="< 17 คะแนน" val="ภาวะขาดสารอาหาร" color="#dc2626" />
              </div>
            </CriteriaBlock>

            <CriteriaBlock title="มวลกล้ามเนื้อน้อย (Modified MSRA-5)" color="#d97706">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                ประเมินความเสี่ยงมวลกล้ามเนื้อน้อย (Sarcopenia) จำนวน 5 ข้อ (ตอบ "ไม่ใช่" = 1 คะแนน, ตอบ "ใช่" = 0 คะแนน)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="4 - 5 คะแนน" val="มวลกล้ามเนื้อปกติ" color="#d97706" />
                <ScoreRow label="≤ 3 คะแนน" val="เสี่ยงภาวะมวลกล้ามเนื้อน้อย" color="#dc2626" />
              </div>
            </CriteriaBlock>

            {/* 🛌 3. สมรรถนะการดูแล */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: -10 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: '#4f46e5' }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--mint-text)' }}>สมรรถนะผู้สูงอายุเพื่อการดูแล</h2>
            </div>

            <CriteriaBlock title="กิจวัตรประจำวัน (Barthel ADL Index)" color="#4f46e5">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                ประเมินความสามารถในการทำกิจวัตรพื้นฐาน 10 ประการ <strong>คะแนนเต็ม 20 คะแนน</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="12 - 20 คะแนน" val="กลุ่มติดสังคม (พึ่งพาตนเองได้)" color="#4f46e5" />
                <ScoreRow label="5 - 11 คะแนน" val="กลุ่มติดบ้าน (พึ่งพาผู้อื่นปานกลาง)" color="#b45309" />
                <ScoreRow label="0 - 4 คะแนน" val="กลุ่มติดเตียง (พึ่งพาผู้อื่นทั้งหมด)" color="#dc2626" />
              </div>
            </CriteriaBlock>

            <CriteriaBlock title="ความเปราะบาง (Frail Scale)" color="#4f46e5">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                คัดกรองปัจจัยเสี่ยง 5 ข้อ (เหนื่อยล้า, ขึ้นบันได, เดิน 1 ช่วงตึก, โรคประจำตัว ≥5, น้ำหนักลด)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="0 ข้อ" val="ปกติ (Robust)" color="#4f46e5" />
                <ScoreRow label="1 - 2 ข้อ" val="ก่อนเปราะบาง (Pre-frail)" color="#b45309" />
                <ScoreRow label="3 - 5 ข้อ" val="เปราะบาง (Frail)" color="#dc2626" />
              </div>
            </CriteriaBlock>

            {/* 🏥 4. สุขภาพทั่วไปและกลุ่มอาการ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: -10 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: '#0891b2' }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--mint-text)' }}>สุขภาพทั่วไป และ กลุ่มอาการผู้สูงอายุ</h2>
            </div>

            <CriteriaBlock title="สุขภาพช่องปาก และ สุขภาวะทางตา" color="#0891b2">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 8 }}>
                <strong>ช่องปาก (8 รายการ):</strong> หากพบความผิดปกติในข้อ 1 - 7 แม้เพียงข้อเดียว ควรส่งต่อทันตแพทย์
              </p>
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 4 }}>
                <strong>สายตา (5 รายการ + Snellen):</strong> ควรส่งต่อจักษุแพทย์เมื่อ...
              </p>
              <ul style={{ fontSize: 13, color: 'var(--mint-text2)', lineHeight: 1.6, paddingLeft: 20, marginBottom: 4 }}>
                <li>ตอบ "ใช่" ในคำถามคัดกรองข้อใดข้อหนึ่ง (ต้อกระจก, ต้อหิน, จอตาเสื่อม)</li>
                <li>อ่าน Snellen Chart ได้น้อยกว่าแถวที่ 5 (แย่กว่า 20/40) หรือรู้สึกสายตาแย่ลง</li>
              </ul>
            </CriteriaBlock>

            <CriteriaBlock title="โรคทางกระดูกและข้อ (Bone and Joint)" color="#ea580c">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>ประกอบด้วยการประเมิน 3 ส่วนหลัก หากพบความเสี่ยงข้อใดข้อหนึ่งควรพิจารณาส่งต่อ:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="OSTA Index" val="≤ -4 = ความเสี่ยงสูง" color="#ea580c" />
                <ScoreRow label="FRAX Score" val="Major ≥ 20% หรือ Hip ≥ 3%" color="#ea580c" />
                <ScoreRow label="โรคข้อเข่าเสื่อม" val="ปวดเข่า + พบอาการร่วม ≥ 2 ข้อ" color="#ea580c" />
              </div>
            </CriteriaBlock>

            <CriteriaBlock title="ภาวะหกล้ม (Timed Up and Go Test: TUGT)" color="#059669">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                จับเวลาลุกจากเก้าอี้ เดิน 3 เมตร และกลับมานั่งที่เดิม
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="เวลาที่ใช้ < 12 วินาที" val="การทรงตัวปกติ" color="#059669" />
                <ScoreRow label="เวลาที่ใช้ ≥ 12 วินาที" val="มีความเสี่ยงต่อภาวะหกล้ม" color="#dc2626" />
              </div>
            </CriteriaBlock>

            {/* ❤️‍🩹 5. สุขภาพจิต */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: -10 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: '#e11d48' }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--mint-text)' }}>สุขภาพจิต (Mental Health)</h2>
            </div>

            <CriteriaBlock title="โรคซึมเศร้า (2Q และ 9Q)" color="#e11d48">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 8 }}>
                <strong>2Q (คัดกรอง):</strong> หากตอบ "มี" อย่างน้อย 1 ข้อ ถือว่ามีความเสี่ยง ต้องประเมิน 9Q ต่อ
              </p>
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                <strong>9Q (ประเมินความรุนแรง):</strong> คะแนนเต็ม 27 คะแนน
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
                <ScoreRow label="< 7 คะแนน" val="ไม่มีอาการซึมเศร้า" color="#e11d48" />
                <ScoreRow label="7 - 12 คะแนน" val="ซึมเศร้าระดับน้อย" color="#e11d48" />
                <ScoreRow label="13 - 18 คะแนน" val="ซึมเศร้าระดับปานกลาง" color="#dc2626" />
                <ScoreRow label="≥ 19 คะแนน" val="ซึมเศร้าระดับรุนแรง" color="#991b1b" />
              </div>
              <WarnBadge>หากข้อ 9 ใน 9Q (คิดทำร้ายตัวเอง) มีคะแนน ต้องประเมินความเสี่ยงฆ่าตัวตาย (8Q) ทันที</WarnBadge>
            </CriteriaBlock>

            <CriteriaBlock title="ความเสี่ยงฆ่าตัวตาย (8Q)" color="#dc2626">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                คัดกรองแนวโน้มการฆ่าตัวตาย (น้ำหนักคะแนนแต่ละข้อไม่เท่ากัน)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="0 คะแนน" val="ไม่มีแนวโน้ม" color="#dc2626" />
                <ScoreRow label="1 - 8 คะแนน" val="เสี่ยงฆ่าตัวตายระดับน้อย" color="#dc2626" />
                <ScoreRow label="9 - 16 คะแนน" val="เสี่ยงฆ่าตัวตายระดับปานกลาง" color="#991b1b" />
                <ScoreRow label="≥ 17 คะแนน" val="เสี่ยงฆ่าตัวตายระดับรุนแรง" color="#7f1d1d" />
              </div>
            </CriteriaBlock>

          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--mint-border)', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'white', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Cross s={12} /><span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>HealthScreen — เครื่องมือคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</span></div>
        <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>อ้างอิง: กระทรวงสาธารณสุข พ.ศ.2564</span>
      </footer>
    </div>
  );
}