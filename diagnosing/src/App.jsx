import React, { useState, useEffect, useRef } from 'react';
import { saveLocalResult, loadLocalResults } from './shared/quizStorage';
import { toSheetPayload, fromSheetRow, newResultId, parseThaiDatetime, COL as SHEET_COL } from './shared/sheetSchema';
import { ChevronRight, Home, ClipboardList, BookOpen, RefreshCw, UploadCloud, Printer, Download, Search, SlidersHorizontal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CategoryIcon, TestIcon } from './shared/icons';
import CriteriaPage from './CriteriaPage';
import { text, radius, shadow, ui, palette, clamp } from './shared/theme';
import { useIsCompact } from './shared/useMediaQuery';

const SHEET_ID_COL = SHEET_COL.id;
import MiniCogQuiz from './MiniCogQuiz';
import TMSEQuiz from './TMSEQuiz';
import MoCAQuiz from './MoCAQuiz';
import MMSEQuiz from './MMSEQuiz';
import OralHealthQuiz from './OralHealthQuiz';
import EyeHealthQuiz from './EyeHealthQuiz';
import BoneJointQuiz from './BoneJointQuiz';
import DepressionQuiz from './DepressionQuiz';
import SuicideRiskQuiz from './SuicideRiskQuiz';
import TAIQuiz from './TAIQuiz';
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

/**
 * การ์ดหมวดหมู่ในหน้าแรก
 * แถวเดียวจบ ไอคอน–เนื้อหา–ลูกศร กดได้ทั้งใบ สูงอย่างน้อย 88px ให้นิ้วกดง่าย
 * ชื่อหมวดจำกัด 1 บรรทัด คำอธิบาย 2 บรรทัด การ์ดในกริดจึงสูงเท่ากันเสมอ
 */
const CategoryCard = ({ id, title, sub, count, pal, onClick }) => (
  <button onClick={onClick} className="lift" style={{
    background: 'white', border: `1.5px solid ${ui.border}`, borderRadius: radius.xl,
    padding: '18px 16px', cursor: 'pointer', boxShadow: shadow.sm, textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: 14, width: '100%', minHeight: 88,
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: radius.lg, background: pal.tint,
      border: `1px solid ${pal.line}`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, color: pal.base,
    }}>
      <CategoryIcon id={id} size={28} strokeWidth={1.8} />
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ ...text.h3, color: ui.text, marginBottom: 3, ...clamp(1) }}>{title}</h3>
      <p style={{ ...text.small, color: ui.muted, marginBottom: 8, ...clamp(2) }}>{sub}</p>
      <span style={{
        ...text.label, color: pal.deep, background: pal.tint,
        border: `1px solid ${pal.line}`, padding: '3px 9px', borderRadius: radius.pill,
        display: 'inline-block',
      }}>{count} แบบทดสอบ</span>
    </div>

    <ChevronRight size={22} strokeWidth={2.2} style={{ color: pal.base, flexShrink: 0 }} />
  </button>
);

/** การ์ดแบบทดสอบในหน้าหมวด — โครงเดียวกับการ์ดหมวดเพื่อให้จังหวะสายตาต่อเนื่อง */
const TestCard = ({ testKey, title, sub, badge, pal, onClick }) => (
  <button onClick={onClick} className="lift" style={{
    background: 'white', border: `1.5px solid ${ui.border}`, borderRadius: radius.xl,
    padding: '18px 16px', cursor: 'pointer', boxShadow: shadow.sm, textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: 12, width: '100%', height: '100%',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 48, height: 48, borderRadius: radius.md, background: pal.tint,
        border: `1px solid ${pal.line}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, color: pal.base,
      }}>
        <TestIcon testKey={testKey} size={24} strokeWidth={1.8} />
      </div>
      <h3 style={{ ...text.h3, color: ui.text, flex: 1, minWidth: 0, ...clamp(2) }}>{title}</h3>
    </div>

    <p style={{ ...text.small, color: ui.muted, flex: 1, ...clamp(2) }}>{sub}</p>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{
        ...text.label, color: pal.deep, background: pal.tint,
        border: `1px solid ${pal.line}`, padding: '3px 9px', borderRadius: radius.pill,
      }}>{badge}</span>
      <span style={{ ...text.small, fontWeight: 700, color: pal.deep, display: 'flex', alignItems: 'center', gap: 4 }}>
        เริ่มทดสอบ <ChevronRight size={16} strokeWidth={2.5} />
      </span>
    </div>
  </button>
);




const Spinner = ({ size = 20, color = 'var(--mint-primary)' }) => (
  <span style={{ display: 'inline-block', width: size, height: size, border: `3px solid ${color}33`, borderTop: `3px solid ${color}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const cfg = { success: { bg: '#f0fdf9', border: '#6ee7d5', text: '#065f46', icon: '✅' }, error: { bg: '#fff1f1', border: '#fca5a5', text: '#dc2626', icon: '❌' }, info: { bg: 'var(--mint-blue-xl)', border: 'var(--mint-blue-l)', text: 'var(--mint-blue)', icon: 'ℹ️' } }[type];
  return (
    <div className="bottom-dock" style={{ right: 24, zIndex: 999, background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 14, padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, animation: 'scaleIn 0.25s ease both', maxWidth: 340 }}>
      <span style={{ fontSize: 16 }}>{cfg.icon}</span><p style={{ fontSize: 13, fontWeight: 600, color: cfg.text, flex: 1 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: cfg.text, opacity: 0.5 }}>×</button>
    </div>
  );
};

const PatientForm = ({ quizType, onConfirm, onCancel, prefill }) => {
  const [name,   setName]   = useState(prefill?.name   ?? '');
  const [age,    setAge]    = useState(prefill?.age     ? String(prefill.age) : '');
  const [gender, setGender] = useState(prefill?.gender  ?? '');
  const [hn,     setHn]     = useState(prefill?.hn      ?? '');
  const [err,    setErr]    = useState('');

  const handleSubmit = () => {
    if (!name.trim()) { setErr('กรุณากรอกชื่อ-นามสกุล'); return; }
    if (!age || isNaN(age) || Number(age) < 1 || Number(age) > 120) { setErr('กรุณากรอกอายุที่ถูกต้อง (1–120)'); return; }
    if (!gender) { setErr('กรุณาระบุเพศ'); return; }
    onConfirm({ name: name.trim(), age: parseInt(age), gender, hn: hn.trim() });
  };

  const typeConfigs = {
    minicog: { label: 'Mini-Cog™',        color: 'var(--mint-primary)', grad: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))', icon: '⚡', bg: 'var(--mint-primary-xl)' },
    tmse:    { label: 'TMSE',              color: 'var(--mint-blue)',    grad: 'linear-gradient(135deg, var(--mint-blue), #60a5fa)',                    icon: '🧠', bg: 'var(--mint-blue-xl)' },
    mmse:    { label: 'MMSE-Thai',         color: '#0d9488',             grad: 'linear-gradient(135deg, #0d9488, #0f766e)',                              icon: '🧩', bg: '#f0fdfa' },
    moca:    { label: 'MoCA',              color: '#8b5cf6',             grad: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',                              icon: '📋', bg: '#f3e8ff' },
    oral:    { label: 'สุขภาพช่องปาก',    color: '#0891b2',             grad: 'linear-gradient(135deg, #0891b2, #0e7490)',                              icon: '🦷', bg: '#ecfeff' },
    eye:     { label: 'สุขภาวะทางตา',     color: '#7c3aed',             grad: 'linear-gradient(135deg, #7c3aed, #6d28d9)',                              icon: '👁️', bg: '#f5f3ff' },
    osta:    { label: 'OSTA Index (กระดูกพรุน)',  color: '#047857', grad: 'linear-gradient(135deg, #047857, #065f46)', icon: '🦴', bg: '#e7f7f1' },
    frax:    { label: 'FRAX Score (กระดูกหัก)',  color: '#047857', grad: 'linear-gradient(135deg, #047857, #065f46)', icon: '🦴', bg: '#e7f7f1' },
    knee:    { label: 'การคัดกรองข้อเข่าเสื่อม', color: '#047857', grad: 'linear-gradient(135deg, #047857, #065f46)', icon: '🦵', bg: '#e7f7f1' },
    depress: { label: 'ภาวะซึมเศร้า (2Q/9Q)',color: '#e11d48',            grad: 'linear-gradient(135deg, #e11d48, #be123c)',                              icon: '❤️‍🩹', bg: '#fff1f2' },
    suicide: { label: 'ความเสี่ยงฆ่าตัวตาย (8Q)',color: '#dc2626',        grad: 'linear-gradient(135deg, #dc2626, #991b1b)',                              icon: '🆘', bg: '#fef2f2' },
    tai:     { label: 'ภาวะพึ่งพิง (TAI)',  color: '#4f46e5',             grad: 'linear-gradient(135deg, #4f46e5, #3730a3)',                              icon: '🧓', bg: '#eef0fe' },
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
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>เลข HN / รหัสผู้ป่วย <span style={{ color: 'var(--mint-muted)', fontWeight: 400 }}>(ไม่บังคับ)</span></label>
            <input type="text" value={hn} placeholder="เช่น HN-00123" onChange={e => { setHn(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ width: '100%', padding: '12px 14px', background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--mint-text)', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = cfg.color} onBlur={e => e.target.style.borderColor = 'var(--mint-border)'} />
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

const ResultSummaryModal = ({ result, patient, onClose, onViewAll, onContinue }) => {
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
    'Bone and Joint':    { color: '#047857',             grad: 'linear-gradient(135deg, #047857, #065f46)',                              icon: '🦴' },
    'Depression (2Q/9Q)':{ color: '#e11d48',             grad: 'linear-gradient(135deg, #e11d48, #be123c)',                              icon: '❤️‍🩹' },
    'Suicide Risk (8Q)': { color: '#dc2626',             grad: 'linear-gradient(135deg, #dc2626, #991b1b)',                              icon: '🆘' },
    'TAI (ภาวะพึ่งพิง)':  { color: '#4f46e5',             grad: 'linear-gradient(135deg, #4f46e5, #3730a3)',                              icon: '🧓' },
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
            {onContinue && <button onClick={onContinue} style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: 'white', border: 'none', cursor: 'pointer' }}>🔄 ทำแบบทดสอบอื่นกับผู้ป่วยคนนี้</button>}
            <button onClick={onViewAll} style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: tc.grad, color: 'white', border: 'none', cursor: 'pointer' }}>📋 ดูผลทั้งหมด</button>
            <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', color: 'var(--mint-text2)', cursor: 'pointer' }}>← กลับหน้าหลัก</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultDetailModal = ({ result, onClose }) => {
  if (!result) return null;
  const bd = result.breakdown ?? {};
  const entries = Object.entries(bd);
  const tc = TYPE_COLORS[result.type] || 'var(--mint-primary)';
  const tcBg = TYPE_BG[result.type] || 'var(--mint-primary-xl)';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(15,43,40,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 22, width: '100%', maxWidth: 520, boxShadow: '0 24px 80px rgba(14,159,142,0.2)', border: '1.5px solid var(--mint-border)', animation: 'scaleIn 0.28s ease both', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--mint-border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, background: tcBg }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-text)' }}>{result.name}{result.hn ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mint-muted)', marginLeft: 8 }}>HN: {result.hn}</span> : ''}</p>
            <p style={{ fontSize: 12, color: tc, fontWeight: 600, marginTop: 3 }}>{result.type}</p>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2 }}>{result.datetime}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--mint-muted)', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 24px 8px', flex: 1 }}>
          {entries.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--mint-muted)', textAlign: 'center', padding: '32px 0', lineHeight: 1.8 }}>ไม่มีข้อมูลรายละเอียด<br/><span style={{ fontSize: 11 }}>(ผลที่บันทึกก่อนอัปเดตระบบ หรือโหลดจาก Google Sheets)</span></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {entries.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 12px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 10, gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--mint-text2)', flex: 1, lineHeight: 1.5 }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tc, flexShrink: 0 }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '14px 24px 18px', borderTop: '1px solid var(--mint-border2)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: '100%', padding: '11px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', color: 'var(--mint-text2)', cursor: 'pointer' }}>ปิด</button>
        </div>
      </div>
    </div>
  );
};

function exportCSV(results) {
  const BOM = '\uFEFF';
  const headers = ['ลำดับ','HN/รหัสผู้ป่วย','ชื่อ-นามสกุล','อายุ','เพศ','ประเภทแบบทดสอบ','คะแนนรวม','คะแนนสูงสุด','การแปลผล','วันที่/เวลา','เวลาที่ใช้ (วินาที)','เวลาที่ใช้ (นาที:วินาที)'];
  const rows = results.map((r, i) => {
    const sec = r.duration ?? 0;
    const fmt = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    return [i+1, r.hn || '-', r.name, r.age, r.gender, r.type, r.totalScore, r.maxScore, r.impaired ? 'พบปัญหา/บกพร่อง' : 'อยู่ในเกณฑ์ปกติ', r.datetime, sec, fmt]
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
  // ส่ง { row, detail } ที่ key เป็นชื่อหัวคอลัมน์ไปเลย — Apps Script จับคู่/สร้างคอลัมน์ให้เอง
  // text/plain เพื่อเลี่ยง CORS preflight ที่ Apps Script ตอบไม่ได้
  const res = await fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(toSheetPayload(record)) });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { success: false, error: text }; }
}

// คีย์สำรองสำหรับรายการเก่าที่ยังไม่มี id
const resultKey = (r) => [r.name, r.type, r.datetime].map(v => String(v ?? '').replace(/\s+/g, ' ').trim()).join('|');

async function loadFromSheets() {
  const local = loadLocalResults();
  // ยังไม่ได้ตั้ง SCRIPT_URL — แสดงผลที่บันทึกไว้ในเครื่องนี้แทน
  if (!isConfigured()) return local.map(r => ({ ...r, mine: true }));
  const url = `${SCRIPT_URL}?t=${Date.now()}`;
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('Invalid response: ' + text.slice(0, 100)); }
  if (!json.success) throw new Error(json.error || 'Unknown error');
  // doGet คืนแถวเป็น object ที่ key คือหัวคอลัมน์ — การแปลงทั้งหมดอยู่ใน sheetSchema.js
  const localById  = new Map(local.filter(r => r.id).map(r => [r.id, r]));
  const localByKey = new Map(local.map(r => [resultKey(r), r]));

  // ถ้าส่งซ้ำแล้วครั้งแรกเข้าไปเงียบ ๆ ชีทจะมีสอง แถวที่ id ซ้ำให้แสดงแค่ครั้งแรก
  const seenIds = new Set();

  const sheetRows = (json.data || []).filter(row => {
    const id = String(row[SHEET_ID_COL] ?? '');
    if (!id) return true;
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  }).map(row => {
    const rec = fromSheetRow(row);
    // จับคู่ด้วย id ก่อน (แม่นยำ) ถอยไปใช้ ชื่อ+แบบทดสอบ+วันเวลา เฉพาะรายการเก่าที่ไม่มี id
    const localMatch = (rec.id && localById.get(rec.id)) || localByKey.get(resultKey(rec));
    return {
      ...rec,
      hn:        rec.hn || localMatch?.hn || '',
      // แถวใหม่มี breakdown มาจาก Sheets แล้ว (ดูข้ามเครื่องได้) แถวเก่ายังต้องกู้จากในเครื่อง
      breakdown: Object.keys(rec.breakdown).length ? rec.breakdown : (localMatch?.breakdown ?? {}),
      timestamp: localMatch?.timestamp ?? rec.timestamp,
      mine:      !!localMatch,
    };
  });

  // ผลที่บันทึกในเครื่องแต่ยังไม่ขึ้น Sheets (เช่นตอนบันทึกแล้วเน็ตหลุด) — ต่อท้ายไว้ไม่ให้ตกหล่น
  const sheetIds  = new Set(sheetRows.filter(r => r.id).map(r => r.id));
  const sheetKeys = new Set(sheetRows.map(resultKey));
  const localOnly = local
    .filter(r => !(r.id && sheetIds.has(r.id)) && !sheetKeys.has(resultKey(r)))
    .map(r => ({ ...r, mine: true, unsynced: true }));
  return [...sheetRows, ...localOnly];
}

const TYPE_COLORS = { 'Mini-Cog': 'var(--mint-primary)', 'TMSE': 'var(--mint-blue)', 'MoCA': '#8b5cf6', 'MMSE (Mini-Mental State)': '#0d9488', 'Oral Health': '#0891b2', 'Eye Health': '#7c3aed', 'Bone and Joint': '#047857', 'Depression (2Q/9Q)': '#e11d48', 'Suicide Risk (8Q)': '#dc2626', 'TAI (ภาวะพึ่งพิง)': '#4f46e5', 'Fall Risk (TUGT)': '#059669', 'MNA (Malnutrition)': '#d97706', 'Modified MSRA-5': '#d97706', 'ADL (สมรรถนะกิจวัตรประจำวัน)': '#4f46e5', 'Frail Scale (ความเปราะบาง)': '#4f46e5' };
const TYPE_BG = { 'Mini-Cog': 'var(--mint-primary-xl)', 'TMSE': 'var(--mint-blue-xl)', 'MoCA': '#f3e8ff', 'MMSE (Mini-Mental State)': '#f0fdfa', 'Oral Health': '#ecfeff', 'Eye Health': '#f5f3ff', 'Bone and Joint': '#e7f7f1', 'Depression (2Q/9Q)': '#fff1f2', 'Suicide Risk (8Q)': '#fef2f2', 'TAI (ภาวะพึ่งพิง)': '#eef0fe', 'Fall Risk (TUGT)': '#ecfdf5', 'MNA (Malnutrition)': '#fffbeb', 'Modified MSRA-5': '#fffbeb', 'ADL (สมรรถนะกิจวัตรประจำวัน)': '#e0e7ff', 'Frail Scale (ความเปราะบาง)': '#e0e7ff' };

/** ผู้ใช้มักพิมพ์ HN มาพร้อมคำนำหน้าอยู่แล้ว ("HN-00123") เติมซ้ำจะได้ "HN HN-00123" */
const fmtHN = (hn) => `HN ${String(hn).replace(/^\s*HN[\s:-]*/i, '')}`;

const fmtDuration = (sec) => sec > 0
  ? `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
  : '—';

/** แบบทดสอบที่ไม่มีคะแนนเต็มให้เทียบ จึงแสดงเป็น — แทนตัวเลข/เลข */
const noScoreMax = (type) => type === 'Bone and Joint' || type.includes('Depression') || type.includes('Suicide') || type.includes('MSRA');

const TypeChip = ({ type }) => (
  <span style={{ padding: '4px 10px', borderRadius: radius.pill, ...text.label, whiteSpace: 'nowrap',
    background: TYPE_BG[type] || ui.surface2, color: TYPE_COLORS[type] || ui.muted }}>{type}</span>
);

const StatusChip = ({ impaired }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: radius.pill, ...text.label, whiteSpace: 'nowrap',
    background: impaired ? ui.warnBg : ui.okBg, color: impaired ? ui.warn : ui.ok,
    border: `1px solid ${impaired ? '#f3d19a' : '#a3ddc8'}` }}>
    {impaired ? <AlertTriangle size={13} strokeWidth={2.4} /> : <CheckCircle2 size={13} strokeWidth={2.4} />}
    {impaired ? 'พบปัญหา' : 'ปกติ'}
  </span>
);

const ScoreCell = ({ r }) => (
  <span style={{ ...text.h3, color: r.impaired ? ui.warn : (TYPE_COLORS[r.type] || 'var(--mint-primary-d)') }}>
    {noScoreMax(r.type) ? '—' : r.totalScore}
    {!noScoreMax(r.type) && r.type !== 'Fall Risk (TUGT)' && <span style={{ ...text.small, fontWeight: 400, color: ui.muted }}>/{r.maxScore}</span>}
    {r.type === 'Fall Risk (TUGT)' && <span style={{ ...text.small, fontWeight: 400, color: ui.muted }}> วิ.</span>}
  </span>
);

/** ป้ายบอกว่ารายการนี้บันทึกจากเครื่องนี้ และซิงก์ขึ้น Sheets แล้วหรือยัง */
const OwnerChip = ({ r }) => r.mine ? (
  <span title={r.unsynced ? 'บันทึกในเครื่องนี้ · ยังไม่ขึ้น Google Sheets' : 'บันทึกจากเครื่องนี้'}
    style={{ marginLeft: 6, padding: '2px 8px', borderRadius: radius.pill, ...text.label, whiteSpace: 'nowrap',
      background: r.unsynced ? ui.warnBg : 'var(--mint-primary-xl)',
      color: r.unsynced ? ui.warn : 'var(--mint-primary-d)',
      border: `1px solid ${r.unsynced ? '#f3d19a' : ui.border}` }}>
    {r.unsynced ? 'ยังไม่ซิงก์' : 'ของฉัน'}
  </span>
) : null;

/** การ์ด 1 รายการสำหรับมือถือ — แทนตารางที่ต้องเลื่อนแนวนอน */
const ResultCard = ({ r, onOpen }) => (
  <button onClick={onOpen} className="lift" style={{
    width: '100%', textAlign: 'left', cursor: 'pointer', background: 'white',
    border: `1.5px solid ${ui.border}`, borderRadius: radius.lg, padding: '14px',
    boxShadow: shadow.sm, display: 'flex', flexDirection: 'column', gap: 10,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ ...text.bodyStrong, color: ui.text, ...clamp(1) }}>{r.name}<OwnerChip r={r} /></div>
        <div style={{ ...text.small, color: ui.muted, marginTop: 2 }}>
          {r.age} ปี · {r.gender}{r.hn ? ` · ${fmtHN(r.hn)}` : ''}
        </div>
      </div>
      <ScoreCell r={r} />
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      <TypeChip type={r.type} />
      <StatusChip impaired={r.impaired} />
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, ...text.small, color: ui.muted, borderTop: `1px solid ${ui.border2}`, paddingTop: 9 }}>
      <span>{r.datetime}</span>
      {r.duration > 0 && <span style={{ fontWeight: 700, color: ui.text2 }}>⏱ {fmtDuration(r.duration)}</span>}
    </div>
  </button>
);

const NAV_ITEMS = [
  { key: 'home',    label: 'หน้าหลัก',   Icon: Home },
  { key: 'results', label: 'ผลประเมิน',  Icon: ClipboardList },
  { key: 'about',   label: 'เกณฑ์',      Icon: BookOpen },
];

/** แถบแท็บล่างสำหรับมือถือ — ตำแหน่งที่นิ้วโป้งถึงง่ายที่สุดขณะถือเครื่องมือเดียว */
const BottomTabBar = ({ tab, onChange, badge }) => (
  <nav className="no-print" style={{
    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60,
    height: 'var(--tabbar-h)', paddingBottom: 'env(safe-area-inset-bottom)',
    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(18px)',
    borderTop: `1px solid ${ui.border}`, display: 'flex', alignItems: 'stretch',
  }}>
    {NAV_ITEMS.map(({ key, label, Icon }) => {
      const on = tab === key;
      return (
        <button key={key} onClick={() => onChange(key)} style={{
          flex: 1, border: 'none', background: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, position: 'relative',
          color: on ? 'var(--mint-primary-d)' : ui.muted,
        }}>
          <Icon size={23} strokeWidth={on ? 2.4 : 1.9} />
          <span style={{ fontSize: 11, fontWeight: on ? 800 : 600 }}>{label}</span>
          {key === 'results' && badge > 0 && (
            <span style={{
              position: 'absolute', top: 6, left: 'calc(50% + 8px)', minWidth: 18, height: 18,
              padding: '0 5px', borderRadius: radius.pill, background: ui.warn, color: 'white',
              fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{badge > 99 ? '99+' : badge}</span>
          )}
        </button>
      );
    })}
  </nav>
);

const ResultsPage = ({ results, onExport, onRefresh, onSyncPending, loading, syncing }) => {
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filterType,    setFilterType]    = useState('All');
  const [sortBy,        setSortBy]        = useState('date-desc');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [filterImpaired,setFilterImpaired]= useState('all');
  const [filterOwner,   setFilterOwner]   = useState('all');
  const [detailResult,  setDetailResult]  = useState(null);

  const uniqueTypes = [...new Set(results.map(r => r.type))];
  const mineCount   = results.filter(r => r.mine).length;
  const pendingCount = results.filter(r => r.unsynced).length;
  // แถวจาก Sheets ไม่มี timestamp ติดมา — ถอดจากข้อความวันที่แทน เพื่อให้เรียง/กรองได้จริง
  const processedResults = results.map((r, i) => ({ ...r, originalIndex: i, sortTime: r.timestamp ?? parseThaiDatetime(r.datetime) }));

  const filtered = processedResults.filter(r => {
    const matchName     = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType     = filterType === 'All' || r.type === filterType;
    const matchImpaired = filterImpaired === 'all' || (filterImpaired === 'impaired' ? r.impaired : !r.impaired);
    const matchOwner    = filterOwner === 'all' || !!r.mine;
    let   matchDate     = true;
    if (r.sortTime != null) {
      if (dateFrom) matchDate = matchDate && r.sortTime >= new Date(dateFrom).getTime();
      if (dateTo)   matchDate = matchDate && r.sortTime <= new Date(dateTo + 'T23:59:59').getTime();
    }
    return matchName && matchType && matchImpaired && matchOwner && matchDate;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'date-desc' || sortBy === 'date-asc') {
      // อ่านวันที่ไม่ออก → ดันไปท้ายตารางเสมอ ไม่ปนกับรายการที่เรียงถูก
      if (a.sortTime == null && b.sortTime == null) return b.originalIndex - a.originalIndex;
      if (a.sortTime == null) return 1;
      if (b.sortTime == null) return -1;
      return sortBy === 'date-desc' ? b.sortTime - a.sortTime : a.sortTime - b.sortTime;
    }
    if (sortBy === 'name-asc')  return a.name.localeCompare(b.name, 'th');
    if (sortBy === 'age-asc')   return (Number(a.age) || 0) - (Number(b.age) || 0);
    if (sortBy === 'age-desc')  return (Number(b.age) || 0) - (Number(a.age) || 0);
    return 0;
  });

  const isCompact = useIsCompact();
  const [showFilters, setShowFilters] = useState(false);
  // นับตัวกรองที่กำลังทำงาน เพื่อบอกผู้ใช้ว่ามีอะไรซ่อนอยู่หลังปุ่ม "ตัวกรอง"
  const activeFilters = [filterType !== 'All', filterImpaired !== 'all', dateFrom, dateTo].filter(Boolean).length;

  const selectStyle = { padding: '11px 13px', borderRadius: radius.md, border: `1.5px solid ${ui.border}`, ...text.small, fontWeight: 600, outline: 'none', background: 'white', cursor: 'pointer', color: ui.text, minHeight: 44, width: '100%' };
  const actionStyle = (primary) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: isCompact ? '10px 12px' : '10px 15px', borderRadius: radius.md, ...text.small, fontWeight: 700,
    cursor: 'pointer', minHeight: 44, whiteSpace: 'nowrap',
    background: primary ? 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))' : 'white',
    color: primary ? 'white' : ui.text2,
    border: primary ? 'none' : `1.5px solid ${ui.border}`,
  });

  return (
    <div className="fade-up">
      {detailResult && <ResultDetailModal result={detailResult} onClose={() => setDetailResult(null)} />}

      <div style={{ marginBottom: 14 }}>
        <h2 style={{ ...text.h1, color: ui.text }}>ผลการทดสอบทั้งหมด</h2>
        <p style={{ ...text.small, color: ui.muted, marginTop: 4 }}>
          {loading ? 'กำลังโหลดจาก Google Sheets…'
            : <>พบ <strong style={{ color: 'var(--mint-primary-d)' }}>{filtered.length}</strong> จาก {results.length} รายการ · บันทึกจากเครื่องนี้ {mineCount}</>}
        </p>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button onClick={onRefresh} disabled={loading} style={{ ...actionStyle(false), opacity: loading ? 0.6 : 1 }}>
          {loading ? <Spinner size={15} color="var(--mint-primary)" /> : <RefreshCw size={16} strokeWidth={2.2} />} รีเฟรช
        </button>
        {pendingCount > 0 && (
          <button onClick={onSyncPending} disabled={syncing || loading} style={{ ...actionStyle(false), background: ui.warnBg, borderColor: '#f3d19a', color: ui.warn, opacity: (syncing || loading) ? 0.6 : 1 }}>
            {syncing ? <Spinner size={15} color={ui.warn} /> : <UploadCloud size={16} strokeWidth={2.2} />} ซิงก์ที่ค้าง ({pendingCount})
          </button>
        )}
        {results.length > 0 && <>
          <button onClick={() => window.print()} style={actionStyle(false)}><Printer size={16} strokeWidth={2.2} />{!isCompact && ' พิมพ์'}</button>
          <button onClick={onExport} style={actionStyle(true)}><Download size={16} strokeWidth={2.2} /> CSV</button>
        </>}
      </div>

      {!loading && results.length > 0 && (
        <div className="no-print" style={{ marginBottom: 14 }}>
          {/* ขอบเขต: ทั้งหมด vs เฉพาะที่บันทึกจากเครื่องนี้ */}
          <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: ui.surface2, border: `1.5px solid ${ui.border}`, borderRadius: radius.md, marginBottom: 10 }}>
            {[{ v: 'all', label: 'ผลทั้งหมด', n: results.length }, { v: 'mine', label: 'ของฉัน', n: mineCount }].map(o => {
              const on = filterOwner === o.v;
              return (
                <button key={o.v} onClick={() => setFilterOwner(o.v)} style={{ padding: '9px 15px', borderRadius: radius.sm, ...text.small, fontWeight: 700, border: 'none', cursor: 'pointer', minHeight: 40, background: on ? 'white' : 'transparent', color: on ? 'var(--mint-primary-d)' : ui.muted, boxShadow: on ? shadow.sm : 'none' }}>
                  {o.label} <span style={{ opacity: 0.7 }}>({o.n})</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={17} strokeWidth={2.2} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: ui.muted }} />
              <input type="text" placeholder="ค้นหาชื่อ-นามสกุล" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ ...selectStyle, paddingLeft: 37, cursor: 'text' }} />
            </div>
            {isCompact && (
              <button onClick={() => setShowFilters(v => !v)} style={{ ...actionStyle(false), position: 'relative' }}>
                <SlidersHorizontal size={17} strokeWidth={2.2} />
                {activeFilters > 0 && <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 17, height: 17, borderRadius: radius.pill, background: 'var(--mint-primary)', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilters}</span>}
              </button>
            )}
          </div>

          {/* บนมือถือซ่อนตัวกรองที่เหลือไว้หลังปุ่ม ของเดิมยัด 5 ช่องเรียงกันจนล้น */}
          {(!isCompact || showFilters) && (
            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8, marginTop: 8 }}>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
                <option value="All">ทุกแบบทดสอบ</option>
                {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={filterImpaired} onChange={e => setFilterImpaired(e.target.value)} style={selectStyle}>
                <option value="all">ทุกผลลัพธ์</option>
                <option value="impaired">พบปัญหา</option>
                <option value="normal">ปกติ</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
                <option value="date-desc">วันที่: ล่าสุดก่อน</option>
                <option value="date-asc">วันที่: เก่าสุดก่อน</option>
                <option value="name-asc">ชื่อ: ก - ฮ</option>
                <option value="age-asc">อายุ: น้อย - มาก</option>
                <option value="age-desc">อายุ: มาก - น้อย</option>
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...selectStyle, flex: 1 }} />
                <span style={{ ...text.small, color: ui.muted }}>ถึง</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...selectStyle, flex: 1 }} />
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '56px 20px', background: 'white', border: `1.5px solid ${ui.border}`, borderRadius: radius.xl }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Spinner size={34} /></div>
          <p style={{ ...text.small, color: ui.muted }}>กำลังโหลดข้อมูลจาก Google Sheets…</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 20px', background: 'white', border: `1.5px dashed ${ui.border}`, borderRadius: radius.xl, color: ui.muted }}>
          <ClipboardList size={44} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ ...text.h3, color: ui.text2, marginBottom: 6 }}>ยังไม่มีข้อมูล</p>
          <p style={{ ...text.small }}>ทำแบบทดสอบก่อน แล้วผลจะปรากฏที่นี่</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', border: `1.5px dashed ${ui.border}`, borderRadius: radius.xl, color: ui.muted }}>
          <p style={{ ...text.h3, color: ui.text2 }}>ไม่พบข้อมูลที่ค้นหา</p>
        </div>
      ) : isCompact ? (
        /* มือถือ: การ์ดต่อ 1 รายการ ของเดิมเป็นตารางกว้าง 560px ต้องเลื่อนแนวนอนอ่าน */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(r => <ResultCard key={r.originalIndex} r={r} onOpen={() => setDetailResult(r)} />)}
        </div>
      ) : (
        <div style={{ background: 'white', border: `1.5px solid ${ui.border}`, borderRadius: radius.xl, overflow: 'hidden', boxShadow: shadow.md }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: ui.surface2, borderBottom: `2px solid ${ui.border2}` }}>
                  {['#','ชื่อ-นามสกุล','อายุ','เพศ','แบบทดสอบ','คะแนน/ผล','การแปลผล','วันที่/เวลา','ระยะเวลา'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: ui.text2, ...text.label, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.originalIndex}
                    style={{ borderBottom: `1px solid ${ui.border2}`, cursor: 'pointer' }}
                    onClick={() => setDetailResult(r)}
                    onMouseOver={e => e.currentTarget.style.background = ui.surface2}
                    onMouseOut={e  => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 14px', color: ui.muted, fontWeight: 600, ...text.small }}>{i+1}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span onClick={e => { e.stopPropagation(); setSearchTerm(r.name); }} title="คลิกเพื่อกรองผลของผู้ป่วยคนนี้"
                        style={{ ...text.bodyStrong, color: 'var(--mint-primary-d)', textDecoration: 'underline' }}>{r.name}</span>
                      <OwnerChip r={r} />
                      {r.hn && <span style={{ ...text.label, fontWeight: 500, color: ui.muted, display: 'block' }}>{fmtHN(r.hn)}</span>}
                    </td>
                    <td style={{ padding: '12px 14px', color: ui.text2, ...text.small }}>{r.age} ปี</td>
                    <td style={{ padding: '12px 14px', color: ui.text2, ...text.small }}>{r.gender}</td>
                    <td style={{ padding: '12px 14px' }}><TypeChip type={r.type} /></td>
                    <td style={{ padding: '12px 14px' }}><ScoreCell r={r} /></td>
                    <td style={{ padding: '12px 14px' }}><StatusChip impaired={r.impaired} /></td>
                    <td style={{ padding: '12px 14px', color: ui.muted, ...text.small, whiteSpace: 'nowrap' }}>{r.datetime}</td>
                    <td style={{ padding: '12px 14px', color: ui.text2, ...text.small, fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtDuration(r.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...text.small, color: ui.muted, padding: '10px 16px', textAlign: 'right' }} className="no-print">คลิกแถวเพื่อดูรายละเอียด · คลิกชื่อเพื่อกรองผู้ป่วย</p>
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
  const [batteryPatient,setBatteryPatient] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [allResults,    setAllResults]    = useState([]);
  const [saving,        setSaving]        = useState(false);
  const [syncingPending,setSyncingPending]= useState(false);
  const [loadingData,   setLoadingData]   = useState(false);
  const [toast,         setToast]         = useState(null);
  const isCompact = useIsCompact();

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadResults = async () => {
    setLoadingData(true);
    try { const rows = await loadFromSheets(); setAllResults(rows); }
    catch (err) {
      // โหลดจาก Sheets ไม่ได้ — อย่างน้อยยังเห็นผลที่บันทึกไว้ในเครื่องนี้
      setAllResults(loadLocalResults().map(r => ({ ...r, mine: true })));
      showToast('ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้: ' + err.message, 'error');
    }
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
    
    const newRecord = { id: newResultId(), hn: patient?.hn ?? '', name: patient?.name ?? 'ไม่ระบุ', age: patient?.age ?? '-', gender: patient?.gender ?? '-', type: scoreData.type, totalScore: scoreData.totalScore, maxScore: scoreData.maxScore, impaired: scoreData.impaired, breakdown: scoreData.breakdown ?? {}, duration: scoreData.duration ?? 0, datetime, resultText: scoreData.resultText, timestamp: now.getTime() };
    saveLocalResult(newRecord);
    setPendingResult({ ...scoreData, datetime });
    setQuiz(null);
    setSaving(true);
    try {
      const res = await saveToSheets(newRecord);
      if (res.success) { setAllResults(prev => [...prev, { ...newRecord, mine: true }]); showToast('บันทึกลง Google Sheets สำเร็จ ✅'); }
      else throw new Error(res.error || 'save failed');
    } catch (err) { setAllResults(prev => [...prev, { ...newRecord, mine: true, unsynced: true }]); showToast('บันทึกไม่สำเร็จ — ตรวจสอบ SCRIPT_URL', 'error'); }
    finally { setSaving(false); }
  };

  // ดันผลที่บันทึกไว้ในเครื่องแต่ยังไม่ขึ้น Sheets (เช่นตอนบันทึกแล้วเน็ตหลุด/URL ผิด) ขึ้นไปใหม่
  const handleSyncPending = async () => {
    const pending = allResults.filter(r => r.unsynced);
    if (!pending.length || syncingPending) return;
    setSyncingPending(true);
    let ok = 0, failed = 0;
    for (const rec of pending) {
      try {
        const res = await saveToSheets(rec);
        if (res.success) ok++; else failed++;
      } catch { failed++; }
    }
    setSyncingPending(false);
    if (failed === 0)      showToast(`ซิงก์ขึ้น Google Sheets สำเร็จ ${ok} รายการ ✅`);
    else if (ok > 0)       showToast(`ซิงก์สำเร็จ ${ok} รายการ · ไม่สำเร็จ ${failed} รายการ`, 'info');
    else                   showToast(`ซิงก์ไม่สำเร็จทั้ง ${failed} รายการ — ตรวจสอบการเชื่อมต่อ`, 'error');
    await loadResults();
  };

  const handleBack = () => { setQuiz(null); setPatient(null); setBatteryPatient(null); setTab('home'); };
  const handleSummaryClose   = () => { setPendingResult(null); setPatient(null); setBatteryPatient(null); setTab('home'); };
  const handleSummaryViewAll = () => { setPendingResult(null); setPatient(null); setBatteryPatient(null); handleTabChange('results'); };
  const handleSummaryContinue = () => { setBatteryPatient(patient); setPendingResult(null); setTab('home'); };

  if (quiz === 'minicog') return <MiniCogQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'tmse')    return <TMSEQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'mmse')    return <MMSEQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'moca')    return <MoCAQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'oral')    return <OralHealthQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'eye')     return <EyeHealthQuiz  patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'osta')    return <BoneJointQuiz tool="OSTA" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'frax')    return <BoneJointQuiz tool="FRAX" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'knee')    return <BoneJointQuiz tool="KNEE" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'depress') return <DepressionQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'suicide') return <SuicideRiskQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'tai')     return <TAIQuiz      patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'fall')    return <FallRiskQuiz   patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'mna')     return <NutritionQuiz tool="MNA" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'msra')    return <NutritionQuiz tool="MSRA5" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'adl')     return <FunctionQuiz tool="ADL" patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'frail')   return <FunctionQuiz tool="FRAIL" patient={patient} onBack={handleBack} onComplete={handleComplete} />;

  // สีของแต่ละชุดมาจาก palette กลาง ไม่ใช่ hex กระจายในไฟล์อีกต่อไป
  const cognitiveTests = [
    { key: 'minicog', title: 'Mini-Cog™',   sub: 'ทดสอบความจำ 3 คำ + วาดรูปนาฬิกา', badge: '5 คะแนน',  pal: palette.teal },
    { key: 'tmse',    title: 'TMSE',        sub: 'Thai Mental State Examination',   badge: '30 คะแนน', pal: palette.teal },
    { key: 'mmse',    title: 'MMSE-Thai',   sub: 'Mini-Mental State Examination',   badge: '30 คะแนน', pal: palette.teal },
    { key: 'moca',    title: 'MoCA',        sub: 'Montreal Cognitive Assessment',   badge: '30 คะแนน', pal: palette.indigo },
  ];
  const nutritionTests = [
    { key: 'mna',  title: 'ภาวะโภชนาการ (MNA)', sub: 'คัดกรองด้วย MNA Short Form และ Full Form', badge: 'MNA',    pal: palette.amber },
    { key: 'msra', title: 'มวลกล้ามเนื้อ',       sub: 'แบบคัดกรอง Modified MSRA-5',              badge: 'MSRA-5', pal: palette.amber },
  ];
  const functionTests = [
    { key: 'adl',   title: 'กิจวัตรประจำวัน (ADL)', sub: 'ประเมิน 10 ด้าน กลุ่มติดสังคม/บ้าน/เตียง', badge: 'ADL Index', pal: palette.indigo },
    { key: 'frail', title: 'ความเปราะบาง (Frail)',  sub: 'คัดกรองความเปราะบาง Frail Scale 5 ข้อ',   badge: 'FRAIL',     pal: palette.indigo },
    { key: 'tai',   title: 'ภาวะพึ่งพิง (TAI)',      sub: 'ประเมิน 4 ด้าน จัดกลุ่ม B/C/I และกลุ่ม สปสช.', badge: 'TAI',       pal: palette.indigo },
  ];
  const healthTests = [
    { key: 'oral', title: 'สุขภาพช่องปาก',          sub: 'ประเมินโดยทันตบุคลากร 8 ด้าน',              badge: '8 รายการ',  pal: palette.cyan },
    { key: 'eye',  title: 'สุขภาวะทางตา',           sub: 'ต้อกระจก ต้อหิน จอตาเสื่อม + Snellen Chart', badge: 'ระยะ+ใกล้', pal: palette.cyan },
  ];
  const syndromeTests = [
    { key: 'fall', title: 'ความเสี่ยงหกล้ม (TUGT)', sub: 'ทดสอบ Timed Up and Go Test จับเวลา', badge: 'TUGT', pal: palette.green },
    { key: 'osta', title: 'OSTA Index',            sub: 'ประเมินความเสี่ยงโรคกระดูกพรุน',            badge: 'OSTA',      pal: palette.green },
    { key: 'frax', title: 'FRAX Score',            sub: 'โอกาสกระดูกหักใน 10 ปี',                    badge: 'FRAX',      pal: palette.green },
    { key: 'knee', title: 'การคัดกรองข้อเข่าเสื่อม', sub: 'คัดกรองโรคข้อเข่าเสื่อมทางคลินิก',          badge: 'Knee OA',   pal: palette.green },
  ];
  const mentalTests = [
    { key: 'depress', title: 'ภาวะซึมเศร้า (2Q/9Q)', sub: 'คัดกรองด้วย 2Q และประเมินต่อด้วย 9Q',       badge: '2Q, 9Q', pal: palette.rose },
    { key: 'suicide', title: 'ความเสี่ยงฆ่าตัวตาย',   sub: 'ประเมินความเสี่ยงฆ่าตัวตาย (8Q)',            badge: '8Q',     pal: palette.rose },
  ];

  const CATEGORIES = [
    { id: 'cog', title: 'สมรรถภาพสมอง',        sub: 'การรับรู้ ความจำ ความคิด',              tests: cognitiveTests, pal: palette.teal },
    { id: 'nut', title: 'โภชนาการและกล้ามเนื้อ', sub: 'ภาวะขาดสารอาหารและมวลกล้ามเนื้อ',       tests: nutritionTests, pal: palette.amber },
    { id: 'fun', title: 'สมรรถนะเพื่อการดูแล',   sub: 'ADL ความเปราะบาง และภาวะพึ่งพิง',   tests: functionTests,  pal: palette.indigo },
    { id: 'gen', title: 'สุขภาพทั่วไป',          sub: 'ช่องปากและสายตา',            tests: healthTests,    pal: palette.cyan },
    { id: 'syn', title: 'กลุ่มอาการผู้สูงอายุ',    sub: 'หกล้ม กระดูกพรุน และข้อเข่าเสื่อม',      tests: syndromeTests,  pal: palette.green },
    { id: 'men', title: 'สุขภาพจิต',            sub: 'ภาวะซึมเศร้าและความเสี่ยงฆ่าตัวตาย',  tests: mentalTests,    pal: palette.rose },
  ].map(c => ({ ...c, count: c.tests.length }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {showForm && <PatientForm quizType={showForm} onConfirm={handleFormConfirm} onCancel={() => setShowForm(null)} />}
      {pendingResult && <ResultSummaryModal result={pendingResult} patient={patient} onClose={handleSummaryClose} onViewAll={handleSummaryViewAll} onContinue={handleSummaryContinue} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {saving && (
        <div className="bottom-dock" style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: 'white', borderRadius: 14, padding: '10px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: '1px solid var(--mint-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Spinner size={16} /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>กำลังบันทึกไปยัง Google Sheets…</span>
        </div>
      )}

      {/* แถบบน: บนมือถือเหลือแค่โลโก้ ปุ่มย้ายลงแถบล่างให้นิ้วโป้งถึง */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${ui.border2}`, padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <button onClick={() => handleTabChange('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0, background: 'none', border: 'none', padding: 0 }}>
          <img src={logoDementia} alt="" style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0 }}/>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: ui.text, lineHeight: 1.15 }}>Health<span style={{ color: 'var(--mint-primary-d)' }}>Screen</span></div>
            <div style={{ fontSize: 9, color: ui.muted, letterSpacing: '0.1em', fontWeight: 700 }}>GERIATRIC CARE</div>
          </div>
        </button>
        {!isCompact && (
          <div style={{ display: 'flex', gap: 4, background: ui.surface2, borderRadius: radius.md, padding: 4, border: `1px solid ${ui.border2}`, flexShrink: 0 }}>
            {NAV_ITEMS.map(({ key, label }) => (
              <button key={key} onClick={() => handleTabChange(key)} style={{ padding: '9px 16px', borderRadius: radius.sm, ...text.small, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.18s', background: tab === key ? 'white' : 'transparent', color: tab === key ? 'var(--mint-primary-d)' : ui.muted, boxShadow: tab === key ? shadow.sm : 'none', whiteSpace: 'nowrap' }}>
                {label}{key === 'results' && allResults.length > 0 ? ` (${allResults.length})` : ''}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1160, margin: '0 auto', width: '100%', padding: isCompact ? '20px 14px' : '32px 16px', paddingBottom: isCompact ? 'calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 20px)' : 32 }}>
        {tab === 'home' && (
          <div className="fade-up">
            {batteryPatient && (
              <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7d5', borderRadius: 16, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>🔄 โหมดทดสอบต่อเนื่อง</p>
                  <p style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>{batteryPatient.name} · {batteryPatient.gender} · อายุ {batteryPatient.age} ปี{batteryPatient.hn ? ` · HN: ${batteryPatient.hn}` : ''}</p>
                </div>
                <button onClick={() => setBatteryPatient(null)} style={{ background: 'none', border: '1.5px solid #6ee7d5', borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#065f46', cursor: 'pointer', flexShrink: 0 }}>เปลี่ยนผู้ป่วย ×</button>
              </div>
            )}
            {!selectedCategory ? (
              <>
                {/* หัวเรื่อง: ชิดซ้ายและเตี้ยลงมากบนมือถือ ของเดิมกินพื้นที่เกือบครึ่งจอก่อนเห็นการ์ดใบแรก */}
                <div style={{ marginBottom: isCompact ? 20 : 28, textAlign: isCompact ? 'left' : 'center' }}>
                  <Tag><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint-primary)', display: 'inline-block', animation: 'breathe 2.2s ease infinite' }} /> มาตรฐานกระทรวงสาธารณสุข พ.ศ.2564</Tag>
                  <h1 style={{ ...text.display, color: ui.text, marginTop: 12, marginBottom: 8 }}>
                    ประเมินสุขภาพ<span style={{ color: 'var(--mint-primary-d)' }}>ผู้สูงอายุ</span>
                  </h1>
                  <p style={{ ...text.body, color: ui.muted, maxWidth: 480, margin: isCompact ? 0 : '0 auto' }}>
                    เลือกหมวดหมู่ที่ต้องการประเมิน ระบบจะบันทึกผลและแปลผลอัตโนมัติ
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(330px, 1fr))', gap: 14 }}>
                  {CATEGORIES.map(cat => (
                    <CategoryCard key={cat.id} {...cat} onClick={() => setSelectedCategory(cat)} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setSelectedCategory(null)} style={{ background: 'white', border: `1.5px solid ${ui.border}`, padding: '11px 16px', borderRadius: radius.md, ...text.small, fontWeight: 700, color: ui.text2, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, boxShadow: shadow.sm, minHeight: 44 }}>
                  <ChevronRight size={16} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} /> ทุกหมวดหมู่
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, background: selectedCategory.pal.tint, padding: isCompact ? '16px' : '22px', borderRadius: radius.xl, border: `1px solid ${selectedCategory.pal.line}` }}>
                  <div style={{ width: 52, height: 52, borderRadius: radius.lg, background: 'white', border: `1px solid ${selectedCategory.pal.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: selectedCategory.pal.base }}>
                    <CategoryIcon id={selectedCategory.id} size={28} strokeWidth={1.8} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ ...text.h1, color: selectedCategory.pal.deep, marginBottom: 2 }}>{selectedCategory.title}</h2>
                    <p style={{ ...text.small, color: ui.text2 }}>เลือกแบบทดสอบที่ต้องการ · {selectedCategory.count} ชุด</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                  {selectedCategory.tests.map(t => (
                    <TestCard key={t.key} testKey={t.key} title={t.title} sub={t.sub} badge={t.badge} pal={t.pal} onClick={() => {
                      if (batteryPatient) { setPatient(batteryPatient); setQuiz(t.key); }
                      else setShowForm(t.key);
                    }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'results' && <ResultsPage results={allResults} onExport={() => exportCSV(allResults)} onRefresh={loadResults} onSyncPending={handleSyncPending} loading={loadingData} syncing={syncingPending} />}

        {tab === 'about' && <CriteriaPage />}

      </main>

      {/* บนมือถือ footer ซ้อนกับแถบแท็บล่าง จึงแสดงเฉพาะตอนพิมพ์และบนจอใหญ่ */}
      {!isCompact && (
        <footer style={{ borderTop: `1px solid ${ui.border}`, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'white', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Cross s={12} /><span style={{ fontSize: 12, color: ui.muted }}>HealthScreen — เครื่องมือคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</span></div>
          <span style={{ fontSize: 12, color: ui.muted }}>อ้างอิง: กระทรวงสาธารณสุข พ.ศ.2564</span>
        </footer>
      )}

      {isCompact && <BottomTabBar tab={tab} onChange={handleTabChange} badge={allResults.length} />}
    </div>
  );
}