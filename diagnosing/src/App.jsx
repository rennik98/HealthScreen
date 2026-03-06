import React, { useState, useEffect } from 'react';
import MiniCogQuiz from './MiniCogQuiz';
import TMSEQuiz from './TMSEQuiz';
import MoCAQuiz from './MoCAQuiz';
import logoDementia from './assets/logo-dementia.svg';

/* ─────────────────────────────────────────────────────────────────────────────
   🔧 GOOGLE SHEETS CONFIG
   Paste your Apps Script Web App deployment URL here.
───────────────────────────────────────────────────────────────────────────── */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwemYpgiRd8U6W8hxE2IHc8I9tFYjL3X5vuac58nsNekN4ymYEw0lOrAbweMn9j_v4S/exec';

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

  const typeLabel = quizType === 'minicog' ? 'Mini-Cog™' : quizType === 'moca' ? 'MoCA' : 'TMSE';
  const typeColor = quizType === 'minicog' ? 'var(--mint-primary)' : quizType === 'moca' ? '#8b5cf6' : 'var(--mint-blue)';
  const typeGrad  = quizType === 'minicog'
    ? 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))'
    : quizType === 'moca'
    ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
    : 'linear-gradient(135deg, var(--mint-blue), #60a5fa)';
  const typeIcon = quizType === 'minicog' ? '⚡' : quizType === 'moca' ? '📋' : '🧠';
  const typeBg   = quizType === 'minicog' ? 'var(--mint-primary-xl)' : quizType === 'moca' ? '#f3e8ff' : 'var(--mint-blue-xl)';

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
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: typeBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
          }}>
            {typeIcon}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-text)' }}>ข้อมูลผู้เข้ารับการทดสอบ</div>
            <div style={{ fontSize: 11, color: typeColor, fontWeight: 600 }}>{typeLabel}</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--mint-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          กรอกข้อมูลเพื่อบันทึกผลการทดสอบเข้า Google Sheets
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>
              ชื่อ-นามสกุล <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text" value={name} placeholder="เช่น สมชาย ใจดี"
              onChange={e => { setName(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 14px', background: 'var(--mint-surface2)',
                border: '1.5px solid var(--mint-border)', borderRadius: 12,
                fontSize: 14, fontWeight: 600, color: 'var(--mint-text)',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = typeColor}
              onBlur={e  => e.target.style.borderColor = 'var(--mint-border)'}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>
              อายุ (ปี) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number" value={age} placeholder="เช่น 72" min={1} max={120}
              onChange={e => { setAge(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 14px', background: 'var(--mint-surface2)',
                border: '1.5px solid var(--mint-border)', borderRadius: 12,
                fontSize: 14, fontWeight: 600, color: 'var(--mint-text)',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = typeColor}
              onBlur={e  => e.target.style.borderColor = 'var(--mint-border)'}
            />
          </div>
        </div>
        {err && (
          <div style={{ padding: '9px 14px', borderRadius: 10, marginBottom: 14, background: '#fff1f1', border: '1px solid #fca5a5', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
            ⚠️ {err}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)',
            color: 'var(--mint-muted)', cursor: 'pointer',
          }}>ยกเลิก</button>
          <button onClick={handleSubmit} style={{
            flex: 2, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: typeGrad, color: 'white', border: 'none', cursor: 'pointer',
          }}>เริ่มทดสอบ →</button>
        </div>
      </div>
    </div>
  );
};

/* ── Result Summary Modal ────────────────────────────────────────────────────*/
const ResultSummaryModal = ({ result, patient, onClose, onViewAll }) => {
  if (!result) return null;
  const isMini   = result.type === 'Mini-Cog';
  const isMoCA   = result.type === 'MoCA';
  const impaired = result.impaired;
  const accent   = isMini ? 'var(--mint-primary)' : isMoCA ? '#8b5cf6' : 'var(--mint-blue)';
  const grad     = isMini
    ? 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))'
    : isMoCA
    ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
    : 'linear-gradient(135deg, var(--mint-blue), #60a5fa)';
  const pct = (result.totalScore / result.maxScore) * 100;
  const circ = 2 * Math.PI * 52;

  const tmseRows = result.breakdown && !isMini && !isMoCA ? [
    { label: 'Orientation',  score: result.breakdown.orientation,  max: 6  },
    { label: 'Registration', score: result.breakdown.registration, max: 3  },
    { label: 'Attention',    score: result.breakdown.attention,    max: 5  },
    { label: 'Calculation',  score: result.breakdown.calculation,  max: 3  },
    { label: 'Language',     score: result.breakdown.language,     max: 10 },
    { label: 'Recall',       score: result.breakdown.recall,       max: 3  },
  ] : [];

  const miniRows = result.breakdown && isMini ? [
    { label: 'Clock Drawing', score: result.breakdown.clockDrawing, max: 2 },
    { label: 'Word Recall',   score: result.breakdown.wordRecall,   max: 3 },
  ] : [];

  const mocaRows = result.breakdown && isMoCA ? [
    { label: 'Visuospatial/Exec', score: result.breakdown.visuospatial,   max: 5 },
    { label: 'Naming',            score: result.breakdown.naming,          max: 3 },
    { label: 'Attention',         score: result.breakdown.attention,       max: 6 },
    { label: 'Language',          score: result.breakdown.language,        max: 3 },
    { label: 'Abstraction',       score: result.breakdown.abstraction,     max: 2 },
    { label: 'Delayed Recall',    score: result.breakdown.delayedRecall,   max: 5 },
    { label: 'Orientation',       score: result.breakdown.orientation,     max: 6 },
  ] : [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(15,43,40,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, overflowY: 'auto',
    }}>
      <div style={{
        background: 'white', borderRadius: 26, width: '100%', maxWidth: 460,
        boxShadow: '0 24px 80px rgba(14,159,142,0.25)',
        border: '1.5px solid var(--mint-border)',
        animation: 'scaleIn 0.32s ease both', overflow: 'hidden',
      }}>
        <div style={{ background: grad, padding: '22px 24px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.12 }}><Cross s={120} c="white" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {isMini ? '⚡' : isMoCA ? '📋' : '🧠'}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>ผลการประเมิน {result.type}</p>
              {patient && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{patient.name} · อายุ {patient.age} ปี</p>}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.25)', color: 'white', padding: '4px 10px', borderRadius: 20 }}>✅ บันทึกแล้ว</div>
          </div>
        </div>
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
            <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
              <svg width="110" height="110" style={{ position: 'absolute', inset: 0 }}>
                <circle cx="55" cy="55" r="52" fill="none" stroke="var(--mint-border2)" strokeWidth="7"/>
                <circle cx="55" cy="55" r="52" fill="none" stroke={impaired ? 'var(--mint-warn)' : accent} strokeWidth="7"
                  strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 55 55)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: impaired ? 'var(--mint-warn)' : accent }}>{result.totalScore}</span>
                <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>/ {result.maxScore}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ borderRadius: 14, padding: '14px 16px', background: impaired ? '#fff7ed' : '#f0fdf9', border: `1.5px solid ${impaired ? '#fcd34d' : '#6ee7d5'}`, marginBottom: 8 }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: impaired ? '#92400e' : '#065f46', marginBottom: 4 }}>
                  {impaired ? '⚠️ พบภาวะบกพร่อง' : '✅ อยู่ในเกณฑ์ปกติ'}
                </p>
                <p style={{ fontSize: 12, color: impaired ? '#b45309' : '#047857', lineHeight: 1.5 }}>
                  {isMini
                    ? (impaired ? 'คะแนน ≤ 3 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน > 3 → ไม่พบสัญญาณผิดปกติ')
                    : isMoCA
                    ? (impaired ? 'คะแนน < 25 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน ≥ 25 → ไม่พบสัญญาณผิดปกติ')
                    : (impaired ? 'คะแนน < 24 → มีแนวโน้ม Cognitive Impairment' : 'คะแนน ≥ 24 → ไม่พบสัญญาณผิดปกติ')}
                </p>
              </div>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', lineHeight: 1.5 }}>* เป็นการคัดกรองเบื้องต้นเท่านั้น</p>
              {result.duration != null && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 8 }}>
                  <span>⏱</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: accent }}>
                    {String(Math.floor(result.duration/60)).padStart(2,'0')}:{String(result.duration%60).padStart(2,'0')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: 'var(--mint-muted)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>คะแนนแยกหมวด</p>
            {isMini ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {miniRows.map(({ label, score, max }) => (
                  <div key={label} style={{ background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: accent }}>{score}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--mint-muted)' }}>/{max}</span></p>
                    <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 3 }}>{label}</p>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--mint-border2)', marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: accent, width: `${(score/max)*100}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(isMoCA ? mocaRows : tmseRows).map(({ label, score, max }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--mint-text2)', width: isMoCA ? 120 : 82, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'var(--mint-border2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, background: isMoCA ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' : `linear-gradient(90deg, ${accent}, #60a5fa)`, width: `${(score/max)*100}%` }}/>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: accent, width: 36, textAlign: 'right' }}>{score}/{max}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onViewAll} style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: grad, color: 'white', border: 'none', cursor: 'pointer' }}>
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
  const headers = ['ลำดับ','ชื่อ-นามสกุล','อายุ','ประเภทแบบทดสอบ','คะแนนรวม','คะแนนสูงสุด','การแปลผล','วันที่/เวลา','เวลาที่ใช้ (วินาที)','เวลาที่ใช้ (นาที:วินาที)','Clock Drawing (Mini-Cog)','Word Recall (Mini-Cog)','Orientation (TMSE)','Registration (TMSE)','Attention (TMSE)','Calculation (TMSE)','Language (TMSE)','Recall (TMSE)','Visuospatial (MoCA)','Naming (MoCA)','Attention (MoCA)','Language (MoCA)','Abstraction (MoCA)','Delayed Recall (MoCA)','Orientation (MoCA)'];
  const rows = results.map((r, i) => {
    const b = r.breakdown || {};
    const sec = r.duration ?? 0;
    const fmt = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    return [i+1, r.name, r.age, r.type, r.totalScore, r.maxScore, r.impaired ? 'มีภาวะ Cognitive Impairment' : 'อยู่ในเกณฑ์ปกติ', r.datetime, sec, fmt, b.clockDrawing??'', b.wordRecall??'', b.orientation??'', b.registration??'', b.attention??'', b.calculation??'', b.language??'', b.recall??'', b.visuospatial??'', b.naming??'', r.type==='MoCA'?(b.attention??''):'', r.type==='MoCA'?(b.language??''):'', b.abstraction??'', b.delayedRecall??'', r.type==='MoCA'?(b.orientation??''):'']
      .map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',');
  });
  const csv  = BOM + [headers.map(h => '"'+h+'"').join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'dementia_results_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click(); URL.revokeObjectURL(url);
}

/* ── Google Sheets helpers ───────────────────────────────────────────────────*/
const isConfigured = () => SCRIPT_URL !== 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE';

async function saveToSheets(record) {
  if (!isConfigured()) return { success: false, error: 'not configured' };
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify(record),
  });
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
  console.log('Raw rows from Sheets:', JSON.stringify(json.data?.[0]));
  return (json.data || []).map(row => ({
    name:       String(row[1] ?? ''),
    age:        row[2],
    type:       String(row[3] ?? ''),
    totalScore: Number(row[4]),
    maxScore:   Number(row[5]),
    impaired:   String(row[6]).includes('Impairment'),
    datetime: (() => {
      const raw = String(row[7] ?? '');
      if (/\d{4}-\d{2}-\d{2}T/.test(raw)) {
        const d = new Date(raw);
        if (!isNaN(d)) {
          const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
          const day = d.getDate();
          const month = monthNames[d.getMonth()];
          const year = d.getFullYear() + 543;
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          return `${day} ${month} ${year} ${hh}:${mm}`;
        }
      }
      return raw;
    })(),
    duration:   Number(row[8]) || 0,
    breakdown: {
      clockDrawing:  row[9]  !== '' ? Number(row[9])  : undefined,
      wordRecall:    row[10] !== '' ? Number(row[10]) : undefined,
      orientation:   row[11] !== '' ? Number(row[11]) : undefined,
      registration:  row[12] !== '' ? Number(row[12]) : undefined,
      attention:     row[13] !== '' ? Number(row[13]) : undefined,
      calculation:   row[14] !== '' ? Number(row[14]) : undefined,
      language:      row[15] !== '' ? Number(row[15]) : undefined,
      recall:        row[16] !== '' ? Number(row[16]) : undefined,
      visuospatial:  row[17] !== '' && row[17] !== undefined ? Number(row[17]) : undefined,
      naming:        row[18] !== '' && row[18] !== undefined ? Number(row[18]) : undefined,
      abstraction:   row[21] !== '' && row[21] !== undefined ? Number(row[21]) : undefined,
      delayedRecall: row[22] !== '' && row[22] !== undefined ? Number(row[22]) : undefined,
    },
  }));
}

/* ── Results Page ────────────────────────────────────────────────────────────*/
const ResultsPage = ({ results, onExport, onRefresh, loading }) => {
  const getTypeColor = (type) => type === 'Mini-Cog' ? 'var(--mint-primary)' : type === 'MoCA' ? '#8b5cf6' : 'var(--mint-blue)';
  const getTypeBg    = (type) => type === 'Mini-Cog' ? 'var(--mint-primary-xl)' : type === 'MoCA' ? '#f3e8ff' : 'var(--mint-blue-xl)';
  const getTypeBorder = (type) => type === 'MoCA' ? '#c4b5fd' : type === 'Mini-Cog' ? 'var(--mint-border)' : '#bfdbfe';

  return (
  <div className="fade-up">
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--mint-text)' }}>ผลการทดสอบทั้งหมด</h2>
        <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 4 }}>
          {loading
            ? 'กำลังโหลดจาก Google Sheets…'
            : <> บันทึกแล้ว <strong style={{ color: 'var(--mint-primary)' }}>{results.length}</strong> รายการ</>
          }
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onRefresh} disabled={loading} style={{
          padding: '9px 14px', borderRadius: 11, fontSize: 13, fontWeight: 700,
          background: 'var(--mint-primary-xl)', border: '1px solid var(--mint-border)',
          color: 'var(--mint-primary)', cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1,
        }}>
          {loading ? <Spinner size={14} color="var(--mint-primary)" /> : '🔄'} รีเฟรช
        </button>
        {results.length > 0 && (
          <button onClick={onExport} style={{
            padding: '9px 16px', borderRadius: 11, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))',
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(14,159,142,0.28)',
          }}>📥 ดาวน์โหลด CSV</button>
        )}
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'white', border: '1px solid var(--mint-border2)', borderRadius: 14, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
      <span style={{ fontSize: 20 }}>📊</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)' }}>ข้อมูลบันทึกใน Google Sheets</p>
        <p style={{ fontSize: 11, color: 'var(--mint-muted)' }}>ผลทุกรายการส่งไปยัง Google Sheets โดยอัตโนมัติ เข้าถึงได้จากทุกอุปกรณ์</p>
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
                  onMouseOut={e  => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 14px', color: 'var(--mint-muted)', fontWeight: 600 }}>{i+1}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--mint-text)' }}>{r.name}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--mint-text2)' }}>{r.age} ปี</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: getTypeBg(r.type), color: getTypeColor(r.type) }}>{r.type}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 800, fontSize: 15, color: r.impaired ? 'var(--mint-warn)' : getTypeColor(r.type) }}>
                    {r.totalScore}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--mint-muted)' }}>/{r.maxScore}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: r.impaired ? '#fff7ed' : '#f0fdf9', color: r.impaired ? '#92400e' : '#065f46', border: '1px solid ' + (r.impaired ? '#fcd34d88' : '#6ee7d588'), whiteSpace: 'nowrap' }}>
                      {r.impaired ? '⚠️ บกพร่อง' : '✅ ปกติ'}
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

        <div style={{ padding: '16px', borderTop: '1px solid var(--mint-border2)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {results.map((r, i) => {
            const b = r.breakdown || {};
            const isMini = r.type === 'Mini-Cog';
            const isMoCA = r.type === 'MoCA';
            const color  = getTypeColor(r.type);
            return (
              <div key={i} style={{ background: 'var(--mint-surface2)', border: '1px solid ' + getTypeBorder(r.type), borderRadius: 14, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--mint-muted)' }}>{r.type} · {r.datetime}</p>
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 800, color, flexShrink: 0, marginLeft: 8 }}>{r.totalScore}/{r.maxScore}</span>
                </div>
                {isMini ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['🕐 Clock', b.clockDrawing, 2], ['💬 Recall', b.wordRecall, 3]].map(([lb, sc, mx]) => (
                      <div key={lb} style={{ flex: 1, textAlign: 'center', padding: '6px', background: 'white', borderRadius: 8, fontSize: 11 }}>
                        <div style={{ fontWeight: 700, color }}>{sc}/{mx}</div>
                        <div style={{ color: 'var(--mint-muted)', marginTop: 1 }}>{lb}</div>
                      </div>
                    ))}
                  </div>
                ) : isMoCA ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
                    {[['V/E',b.visuospatial,5],['Nam',b.naming,3],['Att',b.attention,6],['Lng',b.language,3],['Abs',b.abstraction,2],['DRc',b.delayedRecall,5],['Ori',b.orientation,6]].map(([lb,sc,mx]) => (
                      <div key={lb} style={{ textAlign: 'center', padding: '4px', background: 'white', borderRadius: 6, fontSize: 10 }}>
                        <div style={{ fontWeight: 700, color }}>{sc !== undefined ? sc : '–'}/{mx}</div>
                        <div style={{ color: 'var(--mint-muted)' }}>{lb}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                    {[['Ori',b.orientation,6],['Reg',b.registration,3],['Att',b.attention,5],['Cal',b.calculation,3],['Lng',b.language,10],['Rec',b.recall,3]].map(([lb,sc,mx]) => (
                      <div key={lb} style={{ textAlign: 'center', padding: '4px', background: 'white', borderRadius: 6, fontSize: 10 }}>
                        <div style={{ fontWeight: 700, color }}>{sc}/{mx}</div>
                        <div style={{ color: 'var(--mint-muted)' }}>{lb}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
  );
};

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
    try {
      const rows = await loadFromSheets();
      setAllResults(rows);
    } catch (err) {
      console.error('Load error:', err);
      showToast('ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้: ' + err.message, 'error');
    } finally {
      setLoadingData(false);
    }
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
    const datetime =
      now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
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
      if (res.success) {
        setAllResults(prev => [...prev, newRecord]);
        showToast('บันทึกลง Google Sheets สำเร็จ ✅');
      } else {
        throw new Error(res.error || 'save failed');
      }
    } catch (err) {
      console.error('Save error:', err);
      setAllResults(prev => [...prev, newRecord]);
      showToast('บันทึกไม่สำเร็จ — ตรวจสอบ SCRIPT_URL และ deployment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => { setQuiz(null); setPatient(null); setTab('home'); };
  const handleSummaryClose   = () => { setPendingResult(null); setPatient(null); setTab('home'); };
  const handleSummaryViewAll = () => { setPendingResult(null); setPatient(null); handleTabChange('results'); };

  if (quiz === 'minicog') return <MiniCogQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'tmse')    return <TMSEQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'moca')    return <MoCAQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;

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
            ยังไม่ได้ตั้งค่า Google Sheets — กรุณาแก้ไข <code style={{ background: '#fed7aa', padding: '1px 5px', borderRadius: 4 }}>SCRIPT_URL</code> ในบรรทัดที่ 10 ของ App.jsx
          </p>
        </div>
      )}

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,250,248,0.92)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--mint-border)', padding: '0 16px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }} onClick={() => handleTabChange('home')}>
          <img src={logoDementia} alt="DementiaEval logo" style={{ width: 34, height: 34, borderRadius: 10, boxShadow: '0 4px 12px rgba(14,159,142,0.3)', flexShrink: 0 }}/>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--mint-text)', letterSpacing: '0.02em', lineHeight: 1.2 }}>
              Dementia<span style={{ color: 'var(--mint-primary)' }}>Eval</span>
            </div>
            <div style={{ fontSize: 8, color: 'var(--mint-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>COGNITIVE SCREENING</div>
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

        {/* HOME */}
        {tab === 'home' && (
          <div className="fade-up">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 36, alignItems: 'center', marginBottom: 48 }}>
              <div>
                <div style={{ marginBottom: 18 }}>
                  <Tag>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint-primary)', display: 'inline-block', animation: 'breathe 2.2s ease infinite' }} />
                    VALIDATED CLINICAL TOOLS
                  </Tag>
                </div>
                <h1 style={{ fontFamily: "'Lora','Sarabun',serif", fontSize: 'clamp(32px,6vw,52px)', fontWeight: 600, lineHeight: 1.15, color: 'var(--mint-text)', marginBottom: 16 }}>
                  ประเมินสุขภาพ
                  <span style={{ color: 'var(--mint-primary)', fontStyle: 'italic' }}>สมอง<br /> </span>
                  <span style={{ color: 'var(--mint-text)' }}>ด้วย</span>
                  มาตรฐานสากล
                </h1>
                <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.8, marginBottom: 28, maxWidth: 420 }}>
                  คัดกรองภาวะสมองเสื่อมเบื้องต้นด้วยแบบทดสอบ Mini-Cog, TMSE และ MoCA ที่ผ่านการรับรองทางการแพทย์
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
                  <button onClick={() => setShowForm('minicog')} style={{ padding: '12px 22px', background: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))', color: 'white', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(14,159,142,0.35)', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
                    onMouseOut={e  => e.currentTarget.style.transform='translateY(0)'}>
                    เริ่ม Mini-Cog →
                  </button>
                  <button onClick={() => setShowForm('tmse')} style={{ padding: '12px 22px', background: 'var(--mint-blue-xl)', color: 'var(--mint-blue)', border: '1.5px solid var(--mint-blue-l)', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background='var(--mint-ice)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                    onMouseOut={e  => { e.currentTarget.style.background='var(--mint-blue-xl)'; e.currentTarget.style.transform='translateY(0)'; }}>
                    เริ่ม TMSE →
                  </button>
                  <button onClick={() => setShowForm('moca')} style={{ padding: '12px 22px', background: '#f3e8ff', color: '#8b5cf6', border: '1.5px solid #c4b5fd', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background='#ede9fe'; e.currentTarget.style.transform='translateY(-2px)'; }}
                    onMouseOut={e  => { e.currentTarget.style.background='#f3e8ff'; e.currentTarget.style.transform='translateY(0)'; }}>
                    เริ่ม MoCA →
                  </button>
                  {allResults.length > 0 && (
                    <button onClick={() => handleTabChange('results')} style={{ padding: '12px 18px', background: 'white', color: 'var(--mint-text)', border: '1.5px solid var(--mint-border)', borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                      onMouseOut={e  => { e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='translateY(0)'; }}>
                      📋 ดูผล ({allResults.length})
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Pill label="ความแม่นยำ" value="76–99%" color="var(--mint-primary)" />
                  <Pill label="MoCA/TMSE สูงสุด" value="30 pts" color="#8b5cf6" />
                  <Pill label="ระยะเวลา" value="3–15 min" color="var(--mint-warn)" />
                  {allResults.length > 0 && <Pill label="บันทึกแล้ว" value={allResults.length + ' ราย'} color="var(--mint-primary)" />}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <TestCard icon="⚡" title="Mini-Cog™" sub="การทดสอบความจำ 3 คำ + การวาดรูปนาฬิกา เหมาะสำหรับการคัดกรองเบื้องต้นอย่างรวดเร็ว" badge="5 คะแนน" bColor="var(--mint-primary)" bBg="var(--mint-primary-xl)" onClick={() => setShowForm('minicog')} />
                <TestCard icon="🧠" title="TMSE" sub="Thai Mental State Examination ครอบคลุม 6 ด้านของการรับรู้ทางปัญญา" badge="30 คะแนน" bColor="var(--mint-blue)" bBg="var(--mint-blue-xl)" onClick={() => setShowForm('tmse')} />
                <TestCard icon="📋" title="MoCA" sub="Montreal Cognitive Assessment ครอบคลุม 7 ด้าน ละเอียดกว่า TMSE เหมาะสำหรับภาวะ MCI" badge="30 คะแนน" bColor="#8b5cf6" bBg="#f3e8ff" onClick={() => setShowForm('moca')} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 14 }}>
              <InfoCard icon="🔬" title="Evidence-Based" desc="Mini-Cog, TMSE และ MoCA ผ่านการรับรองและตีพิมพ์ในวารสารการแพทย์ระดับสากล" />
              <InfoCard icon="📊" title="Google Sheets" desc="ผลการทดสอบทุกรายการถูกบันทึกอัตโนมัติลง Google Sheets เข้าถึงได้จากทุกอุปกรณ์" />
              <InfoCard icon="📥" title="Export CSV" desc="ดาวน์โหลดผลการทดสอบทุกรายการเป็นไฟล์ CSV รองรับภาษาไทย พร้อมรายละเอียดคะแนน" />
            </div>
          </div>
        )}

        {/* RESULTS */}
        {tab === 'results' && (
          <ResultsPage results={allResults} onExport={() => exportCSV(allResults)} onRefresh={loadResults} loading={loadingData} />
        )}

        {/* ABOUT */}
        {tab === 'about' && (
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--mint-text)' }}>เกณฑ์การประเมิน</h2>
              <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 5 }}>มาตรฐานการตีความผลการทดสอบสมรรถภาพสมอง</p>
            </div>
            <CriteriaBlock title="Mini-Cog™" color="var(--mint-primary)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>คะแนนเต็ม <strong style={{ color: 'var(--mint-text)' }}>5 คะแนน</strong> — คะแนน ≤ 3 ถือว่ามีภาวะ Cognitive Impairment</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="Word Recall" val="3 คะแนน" color="var(--mint-primary)" />
                <ScoreRow label="Clock Drawing" val="2 คะแนน" color="var(--mint-primary)" />
              </div>
              <WarnBadge>คะแนน ≤ 3 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
            </CriteriaBlock>
            <CriteriaBlock title="TMSE — Thai Mental State Examination" color="var(--mint-blue)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>คะแนนเต็ม <strong style={{ color: 'var(--mint-text)' }}>30 คะแนน</strong> — คะแนน &lt; 24 ถือว่ามีภาวะ Cognitive Impairment</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 4 }}>
                {[['Orientation','6 คะแนน'],['Registration','3 คะแนน'],['Attention','5 คะแนน'],['Calculation','3 คะแนน'],['Language','10 คะแนน'],['Recall','3 คะแนน']].map(([n,v]) => (
                  <ScoreRow key={n} label={n} val={v} color="var(--mint-blue)" />
                ))}
              </div>
              <WarnBadge>คะแนน &lt; 24 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 14 }}>ที่มา: กลุ่มฟื้นฟูสมรรถภาพสมอง สารศิริราช 45(6) มิถุนายน 2536 : 359-374</p>
            </CriteriaBlock>
            <CriteriaBlock title="MoCA — Montreal Cognitive Assessment" color="#8b5cf6">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>คะแนนเต็ม <strong style={{ color: 'var(--mint-text)' }}>30 คะแนน</strong> — คะแนน &lt; 25 ถือว่ามีภาวะ Cognitive Impairment (เพิ่ม 1 คะแนน ถ้าการศึกษา ≤ 6 ปี)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 4 }}>
                {[['Visuospatial/Executive','5 คะแนน'],['Naming','3 คะแนน'],['Attention','6 คะแนน'],['Language','3 คะแนน'],['Abstraction','2 คะแนน'],['Delayed Recall','5 คะแนน'],['Orientation','6 คะแนน']].map(([n,v]) => (
                  <ScoreRow key={n} label={n} val={v} color="#8b5cf6" />
                ))}
              </div>
              <WarnBadge>คะแนน &lt; 25 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 14 }}>MoCA © Z. Nasreddine MD · แปลโดย Solaphat Hemrungrojn MD · www.mocatest.org</p>
            </CriteriaBlock>
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--mint-border)', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'white', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cross s={12} />
          <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>DementiaEval — เครื่องมือคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>Mini-Cog™ © S. Borson · MoCA © Z. Nasreddine MD</span>
      </footer>
    </div>
  );
}