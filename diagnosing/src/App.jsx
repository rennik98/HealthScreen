import React, { useState, useEffect } from 'react';
import MiniCogQuiz from './MiniCogQuiz';
import TMSEQuiz from './TMSEQuiz';
import MoCAQuiz from './MoCAQuiz';
import OralHealthQuiz from './OralHealthQuiz';
import EyeHealthQuiz from './EyeHealthQuiz';
import logoDementia from './assets/logo-dementia.svg';

/* ─────────────────────────────────────────────────────────────────────────────
   🔧 GOOGLE SHEETS CONFIG
───────────────────────────────────────────────────────────────────────────── */
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL ?? '';

/* ── shared atoms ────────────────────────────────────────────────────────────*/
const Cross = ({ s = 16, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4"/>
    <rect x="1"   y="7.5" width="18" height="5" rx="1.4"/>
  </svg>
);

const Tag = ({ children, color = 'var(--mint-primary)', bg = 'var(--mint-primary-xl)' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
    color, background: bg, border: `1px solid ${color}33`,
    borderRadius: 20, padding: '3px 10px',
  }}>
    {children}
  </span>
);

const Pill = ({ label, value, color = 'var(--mint-primary)' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 14px', background: 'white',
    border: '1px solid var(--mint-border2)',
    borderRadius: 14, boxShadow: 'var(--shadow-sm)',
  }}>
    <span style={{ fontSize: 16, fontWeight: 800, color }}>{value}</span>
    <span style={{ fontSize: 10, color: 'var(--mint-muted)', marginTop: 2, textAlign: 'center' }}>{label}</span>
  </div>
);

const TestCard = ({ icon, title, sub, badge, bColor, bBg, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'white', border: '1.5px solid var(--mint-border)',
      borderRadius: 22, padding: '22px 20px',
      cursor: 'pointer', transition: 'all 0.22s ease',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative', overflow: 'hidden',
    }}
    onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = bColor; }}
    onMouseOut={e  => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--mint-border)'; }}
  >
    <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.04 }}>
      <Cross s={80} c={bColor} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: bBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
        {icon}
      </div>
      <Tag color={bColor} bg={bBg}>{badge}</Tag>
    </div>
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--mint-text)', marginBottom: 5 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--mint-muted)', lineHeight: 1.6 }}>{sub}</p>
    </div>
    <div style={{ fontSize: 13, fontWeight: 700, color: bColor, display: 'flex', alignItems: 'center', gap: 5 }}>
      เริ่มทดสอบ <span>→</span>
    </div>
  </div>
);

const InfoCard = ({ icon, title, desc }) => (
  <div style={{
    background: 'white', border: '1px solid var(--mint-border2)',
    borderRadius: 16, padding: '18px 16px',
    display: 'flex', gap: 12, boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--mint-primary-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--mint-muted)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  </div>
);

const CriteriaBlock = ({ title, color, children }) => (
  <div style={{
    background: 'white', border: `1.5px solid ${color}33`,
    borderRadius: 22, padding: '24px 20px', boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 5, height: 26, borderRadius: 3, background: color, flexShrink: 0 }} />
      <h3 style={{ fontSize: 17, fontWeight: 800, color }}>{title}</h3>
    </div>
    {children}
  </div>
);

const ScoreRow = ({ label, val, color }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'var(--mint-surface2)',
    border: '1px solid var(--mint-border2)', borderRadius: 10,
  }}>
    <span style={{ fontSize: 13, color: 'var(--mint-text2)' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 800, color }}>{val}</span>
  </div>
);

const WarnBadge = ({ children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    background: '#fff7ed', border: '1px solid #fcd34d55',
    borderRadius: 10, marginTop: 12,
  }}>
    <span style={{ fontSize: 14 }}>⚠️</span>
    <p style={{ fontSize: 13, color: '#92400e' }}>{children}</p>
  </div>
);

/* ── Loading Spinner ─────────────────────────────────────────────────────────*/
const Spinner = ({ size = 20, color = 'var(--mint-primary)' }) => (
  <span style={{
    display: 'inline-block',
    width: size, height: size,
    border: `3px solid ${color}33`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  }} />
);

/* ── Toast ───────────────────────────────────────────────────────────────────*/
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { bg: '#f0fdf9', border: '#6ee7d5', text: '#065f46', icon: '✅' },
    error:   { bg: '#fff1f1', border: '#fca5a5', text: '#dc2626', icon: '❌' },
    info:    { bg: 'var(--mint-blue-xl)', border: 'var(--mint-blue-l)', text: 'var(--mint-blue)', icon: 'ℹ️' },
  }[type];
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
      borderRadius: 14, padding: '12px 18px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'scaleIn 0.25s ease both', maxWidth: 340,
    }}>
      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
      <p style={{ fontSize: 13, fontWeight: 600, color: cfg.text, flex: 1 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: cfg.text, opacity: 0.5 }}>×</button>
    </div>
  );
};

/* ── Patient Form Modal ──────────────────────────────────────────────────────*/
const PatientForm = ({ quizType, onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  const [age,  setAge]  = useState('');
  const [err,  setErr]  = useState('');

  const handleSubmit = () => {
    if (!name.trim()) { setErr('กรุณากรอกชื่อ-นามสกุล'); return; }
    if (!age || isNaN(age) || Number(age) < 1 || Number(age) > 120) {
      setErr('กรุณากรอกอายุที่ถูกต้อง (1–120)'); return;
    }
    onConfirm({ name: name.trim(), age: parseInt(age) });
  };

  const typeConfigs = {
    minicog: { label: 'Mini-Cog™',        color: 'var(--mint-primary)', grad: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))', icon: '⚡', bg: 'var(--mint-primary-xl)' },
    tmse:    { label: 'TMSE',              color: 'var(--mint-blue)',    grad: 'linear-gradient(135deg, var(--mint-blue), #60a5fa)',                    icon: '🧠', bg: 'var(--mint-blue-xl)' },
    moca:    { label: 'MoCA',              color: '#8b5cf6',             grad: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',                              icon: '📋', bg: '#f3e8ff' },
    oral:    { label: 'สุขภาพช่องปาก',    color: '#0891b2',             grad: 'linear-gradient(135deg, #0891b2, #0e7490)',                              icon: '🦷', bg: '#ecfeff' },
    eye:     { label: 'สุขภาวะทางตา',     color: '#7c3aed',             grad: 'linear-gradient(135deg, #7c3aed, #6d28d9)',                              icon: '👁️', bg: '#f5f3ff' },
  };
  const cfg = typeConfigs[quizType] || typeConfigs.minicog;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,43,40,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 22, padding: '28px 22px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(14,159,142,0.2)',
        border: '1.5px solid var(--mint-border)',
        animation: 'scaleIn 0.28s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-text)' }}>ข้อมูลผู้เข้ารับการทดสอบ</div>
            <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--mint-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          กรอกข้อมูลเพื่อบันทึกผลการทดสอบเข้า Google Sheets
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {[
            { label: 'ชื่อ-นามสกุล', placeholder: 'เช่น สมชาย ใจดี', val: name, set: setName, type: 'text' },
            { label: 'อายุ (ปี)',      placeholder: 'เช่น 72',            val: age,  set: setAge,  type: 'number' },
          ].map(({ label, placeholder, val, set, type }) => (
            <div key={label}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>
                {label} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type={type} value={val} placeholder={placeholder}
                onChange={e => { set(e.target.value); setErr(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--mint-text)', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = cfg.color}
                onBlur={e  => e.target.style.borderColor = 'var(--mint-border)'}
              />
            </div>
          ))}
        </div>
        {err && (
          <div style={{ padding: '9px 14px', borderRadius: 10, marginBottom: 14, background: '#fff1f1', border: '1px solid #fca5a5', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
            ⚠️ {err}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', color: 'var(--mint-muted)', cursor: 'pointer' }}>ยกเลิก</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: cfg.grad, color: 'white', border: 'none', cursor: 'pointer' }}>เริ่มทดสอบ →</button>
        </div>
      </div>
    </div>
  );
};

/* ── Result Summary Modal ────────────────────────────────────────────────────*/
const ResultSummaryModal = ({ result, patient, onClose, onViewAll }) => {
  if (!result) return null;
  const isMini = result.type === 'Mini-Cog';
  const isMoCA = result.type === 'MoCA';
  const isOral = result.type === 'Oral Health';
  const isEye  = result.type === 'Eye Health';
  const impaired = result.impaired;

  const typeMap = {
    'Mini-Cog':    { color: 'var(--mint-primary)', grad: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))', icon: '⚡' },
    'TMSE':        { color: 'var(--mint-blue)',    grad: 'linear-gradient(135deg, var(--mint-blue), #60a5fa)',                    icon: '🧠' },
    'MoCA':        { color: '#8b5cf6',             grad: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',                              icon: '📋' },
    'Oral Health': { color: '#0891b2',             grad: 'linear-gradient(135deg, #0891b2, #0e7490)',                              icon: '🦷' },
    'Eye Health':  { color: '#7c3aed',             grad: 'linear-gradient(135deg, #7c3aed, #6d28d9)',                              icon: '👁️' },
  };
  const tc = typeMap[result.type] || typeMap['Mini-Cog'];
  const pct = (result.totalScore / result.maxScore) * 100;
  const circ = 2 * Math.PI * 52;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,43,40,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 26, width: '100%', maxWidth: 460, boxShadow: '0 24px 80px rgba(14,159,142,0.25)', border: '1.5px solid var(--mint-border)', animation: 'scaleIn 0.32s ease both', overflow: 'hidden' }}>
        <div style={{ background: tc.grad, padding: '22px 24px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.12 }}><Cross s={120} c="white" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {tc.icon}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>ผลการประเมิน {result.type}</p>
              {patient && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{patient.name} · อายุ {patient.age} ปี</p>}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.25)', color: 'white', padding: '4px 10px', borderRadius: 20 }}>✅ บันทึกแล้ว</div>
          </div>
        </div>
        <div style={{ padding: '24px 24px 20px' }}>
          {/* Score ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
            <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
              <svg width="110" height="110" style={{ position: 'absolute', inset: 0 }}>
                <circle cx="55" cy="55" r="52" fill="none" stroke="var(--mint-border2)" strokeWidth="7"/>
                <circle cx="55" cy="55" r="52" fill="none" stroke={impaired ? 'var(--mint-warn)' : tc.color} strokeWidth="7"
                  strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 55 55)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: impaired ? 'var(--mint-warn)' : tc.color }}>{result.totalScore}</span>
                <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>/ {result.maxScore}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ borderRadius: 14, padding: '14px 16px', background: impaired ? '#fff7ed' : '#f0fdf9', border: `1.5px solid ${impaired ? '#fcd34d' : '#6ee7d5'}`, marginBottom: 8 }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: impaired ? '#92400e' : '#065f46', marginBottom: 4 }}>
                  {impaired ? '⚠️ พบสัญญาณผิดปกติ' : '✅ อยู่ในเกณฑ์ปกติ'}
                </p>
                <p style={{ fontSize: 12, color: impaired ? '#b45309' : '#047857', lineHeight: 1.5 }}>
                  {isOral ? (impaired ? 'พบปัญหาช่องปาก — ควรส่งต่อทันตแพทย์' : 'ไม่พบปัญหาสำคัญ') :
                   isEye  ? (impaired ? 'พบปัญหาการมองเห็น — ควรส่งต่อแพทย์' : 'ไม่พบปัญหาการมองเห็น') :
                   isMini ? (impaired ? 'คะแนน ≤ 3 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน > 3 → ไม่พบสัญญาณผิดปกติ') :
                   isMoCA ? (impaired ? 'คะแนน < 25 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน ≥ 25 → ไม่พบสัญญาณผิดปกติ') :
                            (impaired ? 'คะแนน < 24 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน ≥ 24 → ไม่พบสัญญาณผิดปกติ')}
                </p>
              </div>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', lineHeight: 1.5 }}>* เป็นการคัดกรองเบื้องต้นเท่านั้น</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onViewAll} style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: tc.grad, color: 'white', border: 'none', cursor: 'pointer' }}>
              📋 ดูผลทั้งหมด
            </button>
            <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', color: 'var(--mint-text2)', cursor: 'pointer' }}>
              ← กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── CSV Export ──────────────────────────────────────────────────────────────*/
function exportCSV(results) {
  const BOM = '\uFEFF';
  const headers = ['ลำดับ','ชื่อ-นามสกุล','อายุ','ประเภทแบบทดสอบ','คะแนนรวม','คะแนนสูงสุด','การแปลผล','วันที่/เวลา','เวลาที่ใช้ (วินาที)','เวลาที่ใช้ (นาที:วินาที)'];
  const rows = results.map((r, i) => {
    const sec = r.duration ?? 0;
    const fmt = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    return [i+1, r.name, r.age, r.type, r.totalScore, r.maxScore, r.impaired ? 'พบปัญหา/บกพร่อง' : 'อยู่ในเกณฑ์ปกติ', r.datetime, sec, fmt]
      .map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',');
  });
  const csv  = BOM + [headers.map(h => '"'+h+'"').join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'health_screening_results_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click(); URL.revokeObjectURL(url);
}

/* ── Google Sheets helpers ───────────────────────────────────────────────────*/
const isConfigured = () => SCRIPT_URL !== '' && SCRIPT_URL !== 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE';

async function saveToSheets(record) {
  if (!isConfigured()) return { success: false, error: 'not configured' };
  const res = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify(record) });
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
    type:       String(row[3] ?? ''),
    totalScore: Number(row[4]),
    maxScore:   Number(row[5]),
    impaired:   String(row[6]).includes('บกพร่อง') || String(row[6]).includes('Impairment') || String(row[6]).includes('พบปัญหา') || String(row[6]).includes('ควรส่งต่อ'),
    
    // 👇 แก้ไขบล็อก datetime ตรงนี้ครับ 👇
    datetime: (() => {
      const raw = String(row[7] ?? '');
      const d = new Date(raw);
      if (!isNaN(d) && raw.trim() !== '') {
        const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
        let year = d.getFullYear();
        if (year < 2500) {
          year += 543;
        }
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${year} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      }
      return raw;
    })(),
    // 👆 สิ้นสุดส่วนที่แก้ไข 👆

    duration: Number(row[8]) || 0,
    breakdown: {},
  }));
}

/* ── Results Page ────────────────────────────────────────────────────────────*/
const TYPE_COLORS = {
  'Mini-Cog':    'var(--mint-primary)',
  'TMSE':        'var(--mint-blue)',
  'MoCA':        '#8b5cf6',
  'Oral Health': '#0891b2',
  'Eye Health':  '#7c3aed',
};
const TYPE_BG = {
  'Mini-Cog':    'var(--mint-primary-xl)',
  'TMSE':        'var(--mint-blue-xl)',
  'MoCA':        '#f3e8ff',
  'Oral Health': '#ecfeff',
  'Eye Health':  '#f5f3ff',
};

const ResultsPage = ({ results, onExport, onRefresh, loading }) => (
  <div className="fade-up">
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--mint-text)' }}>ผลการทดสอบทั้งหมด</h2>
        <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 4 }}>
          {loading ? 'กำลังโหลดจาก Google Sheets…' : <> บันทึกแล้ว <strong style={{ color: 'var(--mint-primary)' }}>{results.length}</strong> รายการ</>}
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

    {loading ? (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Spinner size={36} /></div>
        <p style={{ fontSize: 14, color: 'var(--mint-muted)' }}>กำลังโหลดข้อมูลจาก Google Sheets…</p>
      </div>
    ) : results.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', border: '1.5px dashed var(--mint-border)', borderRadius: 22, color: 'var(--mint-muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>ยังไม่มีข้อมูล</p>
        <p style={{ fontSize: 13 }}>ทำแบบทดสอบก่อนแล้วผลจะปรากฏที่นี่</p>
      </div>
    ) : (
      <div style={{ background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 22, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
            <thead>
              <tr style={{ background: 'var(--mint-surface2)', borderBottom: '2px solid var(--mint-border2)' }}>
                {['#','ชื่อ-นามสกุล','อายุ','แบบทดสอบ','คะแนน','การแปลผล','วันที่/เวลา','ระยะเวลา'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--mint-text2)', fontSize: 11, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--mint-border2)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--mint-surface2)'}
                  onMouseOut={e  => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '11px 14px', color: 'var(--mint-muted)', fontWeight: 600 }}>{i+1}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--mint-text)' }}>{r.name}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--mint-text2)' }}>{r.age} ปี</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: TYPE_BG[r.type] || 'var(--mint-surface2)', color: TYPE_COLORS[r.type] || 'var(--mint-muted)' }}>{r.type}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 800, fontSize: 15, color: r.impaired ? 'var(--mint-warn)' : (TYPE_COLORS[r.type] || 'var(--mint-primary)') }}>
                    {r.totalScore}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--mint-muted)' }}>/{r.maxScore}</span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

/* ── App ─────────────────────────────────────────────────────────────────────*/
export default function App() {
  const [tab,           setTab]           = useState('home');
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
    if (newTab === 'results') loadResults();
  };

  const handleFormConfirm = (info) => {
    setPatient(info);
    setShowForm(null);
    setQuiz(showForm);
  };

  const handleComplete = async (scoreData) => {
    const now = new Date();
    const datetime = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
      + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const newRecord = {
      name:       patient?.name ?? 'ไม่ระบุ',
      age:        patient?.age  ?? '-',
      type:       scoreData.type,
      totalScore: scoreData.totalScore,
      maxScore:   scoreData.maxScore,
      impaired:   scoreData.impaired,
      breakdown:  scoreData.breakdown,
      duration:   scoreData.duration ?? 0,
      datetime,
    };

    setPendingResult({ ...scoreData, datetime });
    setQuiz(null);

    setSaving(true);
    try {
      const res = await saveToSheets(newRecord);
      if (res.success) { setAllResults(prev => [...prev, newRecord]); showToast('บันทึกลง Google Sheets สำเร็จ ✅'); }
      else throw new Error(res.error || 'save failed');
    } catch (err) {
      setAllResults(prev => [...prev, newRecord]);
      showToast('บันทึกไม่สำเร็จ — ตรวจสอบ SCRIPT_URL', 'error');
    } finally { setSaving(false); }
  };

  const handleBack = () => { setQuiz(null); setPatient(null); setTab('home'); };
  const handleSummaryClose   = () => { setPendingResult(null); setPatient(null); setTab('home'); };
  const handleSummaryViewAll = () => { setPendingResult(null); setPatient(null); handleTabChange('results'); };

  // Route to correct quiz
  if (quiz === 'minicog') return <MiniCogQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'tmse')    return <TMSEQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'moca')    return <MoCAQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'oral')    return <OralHealthQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'eye')     return <EyeHealthQuiz  patient={patient} onBack={handleBack} onComplete={handleComplete} />;

  /* ── Test groups config ── */
  const cognitiveTests = [
    { key: 'minicog', icon: '⚡', title: 'Mini-Cog™',   sub: 'การทดสอบความจำ 3 คำ + การวาดรูปนาฬิกา เหมาะสำหรับการคัดกรองเบื้องต้นอย่างรวดเร็ว', badge: '5 คะแนน',  bColor: 'var(--mint-primary)', bBg: 'var(--mint-primary-xl)' },
    { key: 'tmse',    icon: '🧠', title: 'TMSE',         sub: 'Thai Mental State Examination ครอบคลุม 6 ด้านของการรับรู้ทางปัญญา',                     badge: '30 คะแนน', bColor: 'var(--mint-blue)',    bBg: 'var(--mint-blue-xl)' },
    { key: 'moca',    icon: '📋', title: 'MoCA',         sub: 'Montreal Cognitive Assessment ครอบคลุม 7 ด้าน ละเอียดกว่า TMSE เหมาะสำหรับภาวะ MCI',   badge: '30 คะแนน', bColor: '#8b5cf6',             bBg: '#f3e8ff' },
  ];
  const healthTests = [
    { key: 'oral', icon: '🦷', title: 'สุขภาพช่องปาก',   sub: 'ประเมินสุขภาพช่องปากผู้สูงอายุโดยทันตบุคลากร ครอบคลุม 8 ด้าน', badge: '8 รายการ',  bColor: '#0891b2', bBg: '#ecfeff' },
    { key: 'eye',  icon: '👁️', title: 'สุขภาวะทางตา',    sub: 'คัดกรองปัญหาการมองเห็น ต้อกระจก ต้อหิน จอตาเสื่อม + Snellen Chart', badge: 'ระยะ+ใกล้', bColor: '#7c3aed', bBg: '#f5f3ff' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {showForm && <PatientForm quizType={showForm} onConfirm={handleFormConfirm} onCancel={() => setShowForm(null)} />}
      {pendingResult && <ResultSummaryModal result={pendingResult} patient={patient} onClose={handleSummaryClose} onViewAll={handleSummaryViewAll} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {saving && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: 'white', borderRadius: 14, padding: '10px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: '1px solid var(--mint-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Spinner size={16} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint-text2)' }}>กำลังบันทึกไปยัง Google Sheets…</span>
        </div>
      )}

      {!isConfigured() && (
        <div style={{ background: '#fff7ed', borderBottom: '1px solid #fcd34d', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠️</span>
          <p style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
            ยังไม่ได้ตั้งค่า Google Sheets — กรุณาแก้ไข <code style={{ background: '#fed7aa', padding: '1px 5px', borderRadius: 4 }}>SCRIPT_URL</code> ในไฟล์ App.jsx
          </p>
        </div>
      )}

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,250,248,0.92)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border)', padding: '0 16px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }} onClick={() => handleTabChange('home')}>
          <img src={logoDementia} alt="logo" style={{ width: 34, height: 34, borderRadius: 10, boxShadow: '0 4px 12px rgba(14,159,142,0.3)', flexShrink: 0 }}/>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--mint-text)', letterSpacing: '0.02em', lineHeight: 1.2 }}>
              Health<span style={{ color: 'var(--mint-primary)' }}>Screen</span>
            </div>
            <div style={{ fontSize: 8, color: 'var(--mint-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>GERIATRIC SCREENING</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3, background: 'white', borderRadius: 11, padding: 3, border: '1px solid var(--mint-border)', flexShrink: 0 }}>
          {[['home','หน้าหลัก'],['results','ผล' + (allResults.length > 0 ? ` (${allResults.length})` : '')],['about','เกณฑ์']].map(([key, label]) => (
            <button key={key} onClick={() => handleTabChange(key)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.18s', background: tab === key ? 'var(--mint-primary)' : 'transparent', color: tab === key ? 'white' : 'var(--mint-muted)', boxShadow: tab === key ? '0 2px 8px rgba(14,159,142,0.3)' : 'none', position: 'relative', whiteSpace: 'nowrap' }}>
              {label}
              {key === 'results' && allResults.length > 0 && tab !== 'results' && (
                <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: 'var(--mint-warn)', border: '2px solid white' }} />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1160, margin: '0 auto', width: '100%', padding: '32px 16px' }}>

        {/* ── HOME ── */}
        {tab === 'home' && (
          <div className="fade-up">
            {/* Hero */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 12 }}>
                <Tag>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint-primary)', display: 'inline-block', animation: 'breathe 2.2s ease infinite' }} />
                  VALIDATED CLINICAL TOOLS · กระทรวงสาธารณสุข พ.ศ.2564
                </Tag>
              </div>
              <h1 style={{ fontFamily: "'Lora','Sarabun',serif", fontSize: 'clamp(28px,5vw,46px)', fontWeight: 600, lineHeight: 1.2, color: 'var(--mint-text)', marginBottom: 12 }}>
                คัดกรองสุขภาพ<span style={{ color: 'var(--mint-primary)', fontStyle: 'italic' }}>ผู้สูงอายุ</span><br/>ด้วยมาตรฐานสากล
              </h1>
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.8, maxWidth: 520 }}>
                แบบคัดกรองสุขภาพผู้สูงอายุตามแนวทางกระทรวงสาธารณสุข ครอบคลุมด้านสมรรถภาพสมอง สุขภาพช่องปาก และสุขภาวะทางตา
              </p>
            </div>

            {/* Section: สมรรถภาพสมอง */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 4, height: 22, borderRadius: 2, background: 'var(--mint-primary)' }} />
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--mint-text)' }}>🧠 สมรรถภาพสมอง (Cognitive Function)</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,280px),1fr))', gap: 14 }}>
                {cognitiveTests.map(t => (
                  <TestCard key={t.key} {...t} onClick={() => setShowForm(t.key)} />
                ))}
              </div>
            </div>

            {/* Section: สุขภาพทั่วไป */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 4, height: 22, borderRadius: 2, background: '#0891b2' }} />
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--mint-text)' }}>🏥 สุขภาพทั่วไป (General Health)</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,280px),1fr))', gap: 14 }}>
                {healthTests.map(t => (
                  <TestCard key={t.key} {...t} onClick={() => setShowForm(t.key)} />
                ))}
              </div>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 14 }}>
              <InfoCard icon="🔬" title="Evidence-Based" desc="เครื่องมือทุกชิ้นผ่านการรับรองและอ้างอิงจากแนวทางกระทรวงสาธารณสุข พ.ศ.2564" />
              <InfoCard icon="📊" title="Google Sheets" desc="ผลการทดสอบทุกรายการบันทึกอัตโนมัติลง Google Sheets เข้าถึงได้จากทุกอุปกรณ์" />
              <InfoCard icon="📥" title="Export CSV" desc="ดาวน์โหลดผลการทดสอบทุกรายการเป็นไฟล์ CSV รองรับภาษาไทย" />
              <InfoCard icon="🦷" title="ครอบคลุม 5 แบบทดสอบ" desc="Mini-Cog, TMSE, MoCA, สุขภาพช่องปาก และสุขภาวะทางตา" />
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {tab === 'results' && (
          <ResultsPage results={allResults} onExport={() => exportCSV(allResults)} onRefresh={loadResults} loading={loadingData} />
        )}

        {/* ── ABOUT ── */}
        {tab === 'about' && (
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--mint-text)' }}>เกณฑ์การประเมิน</h2>
              <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 5 }}>มาตรฐานการตีความผลการทดสอบ</p>
            </div>

            <CriteriaBlock title="Mini-Cog™" color="var(--mint-primary)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>คะแนนเต็ม <strong>5 คะแนน</strong> — คะแนน ≤ 3 ถือว่ามีภาวะ Cognitive Impairment</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="Word Recall" val="3 คะแนน" color="var(--mint-primary)" />
                <ScoreRow label="Clock Drawing" val="2 คะแนน" color="var(--mint-primary)" />
              </div>
              <WarnBadge>คะแนน ≤ 3 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
            </CriteriaBlock>

            <CriteriaBlock title="TMSE — Thai Mental State Examination" color="var(--mint-blue)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>คะแนนเต็ม <strong>30 คะแนน</strong> — คะแนน &lt; 24 ถือว่ามีภาวะ Cognitive Impairment</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 4 }}>
                {[['Orientation','6'],['Registration','3'],['Attention','5'],['Calculation','3'],['Language','10'],['Recall','3']].map(([n,v]) => (
                  <ScoreRow key={n} label={n} val={v+' คะแนน'} color="var(--mint-blue)" />
                ))}
              </div>
              <WarnBadge>คะแนน &lt; 24 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
            </CriteriaBlock>

            <CriteriaBlock title="MoCA — Montreal Cognitive Assessment" color="#8b5cf6">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>คะแนนเต็ม <strong>30 คะแนน</strong> — คะแนน &lt; 25 ถือว่ามีภาวะ Cognitive Impairment (เพิ่ม 1 คะแนน ถ้าการศึกษา ≤ 6 ปี)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 4 }}>
                {[['Visuospatial/Exec','5'],['Naming','3'],['Attention','6'],['Language','3'],['Abstraction','2'],['Delayed Recall','5'],['Orientation','6']].map(([n,v]) => (
                  <ScoreRow key={n} label={n} val={v+' คะแนน'} color="#8b5cf6" />
                ))}
              </div>
              <WarnBadge>คะแนน &lt; 25 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
            </CriteriaBlock>

            <CriteriaBlock title="การประเมินสุขภาพช่องปาก" color="#0891b2">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>ตรวจ <strong>8 รายการ</strong> โดยทันตบุคลากร</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                {['การสูญเสียฟัน','ความจำเป็นใส่ฟันเทียม','ฟันผุ/รากฟันผุ','เหงือกและปริทันต์','แผล/มะเร็งช่องปาก','ปากแห้ง/น้ำลายน้อย','ฟันสึก','อนามัยช่องปาก'].map(n => (
                  <ScoreRow key={n} label={n} val="ตรวจ" color="#0891b2" />
                ))}
              </div>
              <WarnBadge>พบปัญหา ≥ 1 รายการ (ข้อ 1–7) → ส่งต่อทันตบุคลากร</WarnBadge>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 14 }}>ที่มา: สถาบันทันตกรรม กรมการแพทย์ และสำนักทันตสาธารณสุข กรมอนามัย</p>
            </CriteriaBlock>

            <CriteriaBlock title="การคัดกรองสุขภาวะทางตา + Snellen Chart" color="#7c3aed">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>คัดกรอง <strong>5 รายการ</strong> (ต้อกระจก ต้อหิน จอตาเสื่อม สายตาระยะไกล-ใกล้) และประเมิน Snellen Chart</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 4 }}>
                {[['Snellen แถวที่ 5','20/40 (6/12)'],['ต่ำกว่าแถว 5','ส่งต่อ'],['แถว 5 ขึ้นไป','ปกติ'],['พบปัญหา 1 อย่าง','ส่งต่อแพทย์']].map(([n,v]) => (
                  <ScoreRow key={n} label={n} val={v} color="#7c3aed" />
                ))}
              </div>
              <WarnBadge>ตอบ "ใช่" ข้อใดข้อหนึ่ง หรืออ่าน Snellen ได้น้อยกว่าแถวที่ 5 → ส่งต่อแพทย์</WarnBadge>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 14 }}>ที่มา: คณะกรรมการพัฒนาเครื่องมือคัดกรองฯ กระทรวงสาธารณสุข พ.ศ.2564</p>
            </CriteriaBlock>
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--mint-border)', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'white', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cross s={12} />
          <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>HealthScreen — เครื่องมือคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>Mini-Cog™ © S. Borson · MoCA © Z. Nasreddine MD · กระทรวงสาธารณสุข พ.ศ.2564</span>
      </footer>
    </div>
  );
}