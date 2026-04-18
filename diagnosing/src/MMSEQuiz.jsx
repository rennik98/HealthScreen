import React, { useState, useEffect } from 'react';
import { useTimer } from './shared/useTimer';
import DrawingCanvas from './shared/DrawingCanvas';
import { loadDraft, saveDraft, clearDraft } from './shared/quizStorage';

/* ── shared atoms ── */
const Cross = ({ s=14, c='#0d9488' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1"   width="5"  height="18" rx="1.4"/>
    <rect x="1"   y="7.5" width="18" height="5"  rx="1.4"/>
  </svg>
);

const MMSE_COLOR = '#0d9488';
const MMSE_BG = '#f0fdfa';
const MMSE_BORDER = '#99f6e4';

const YN = ({ val, onChange, yL='ทำได้', nL='ไม่ได้' }) => (
  <div style={{ display:'flex', gap:8, marginTop:8 }}>
    {[[1,yL,MMSE_COLOR,MMSE_BG,MMSE_COLOR],
      [0,nL,'#ef4444','#fff1f1','#fca5a5']].map(([v,label,col,bg,border]) => (
      <button key={v} onClick={() => onChange(v)} style={{
        flex:1, padding:'10px 8px', borderRadius:10, fontSize:13, fontWeight:700,
        border:`1.5px solid ${val===v ? border : 'var(--mint-border)'}`,
        background: val===v ? bg : 'var(--mint-surface2)',
        color: val===v ? col : 'var(--mint-muted)',
        cursor:'pointer', transition:'all 0.18s',
        minHeight: 42,
      }}>
        {val===v ? (v===1?'✓ ':'✗ ') : ''}{label}
      </button>
    ))}
  </div>
);

const Section = ({ num, title, max, score, children }) => (
  <div style={{ background:'white', border:`1.5px solid ${MMSE_COLOR}33`, borderRadius:20, padding:'22px 18px', boxShadow:'var(--shadow-sm)', position:'relative', overflow:'hidden', marginBottom: 16 }}>
    <div style={{ position:'absolute', left:0, top:14, bottom:14, width:4, borderRadius:'0 3px 3px 0', background:MMSE_COLOR }} />
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
      <div style={{ width:30, height:30, borderRadius:9, background:`${MMSE_COLOR}18`, border:`1.5px solid ${MMSE_COLOR}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:MMSE_COLOR, flexShrink:0 }}>
        {num}
      </div>
      <h2 style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--mint-text)', lineHeight:1.3 }}>{title}</h2>
      <span style={{ fontSize:12, fontWeight:700, color:MMSE_COLOR, background:`${MMSE_COLOR}15`, border:`1px solid ${MMSE_COLOR}30`, borderRadius:20, padding:'2px 10px', flexShrink:0 }}>
        {score}/{max}
      </span>
    </div>
    {children}
  </div>
);

const SubQ = ({ label, val, onChange }) => (
  <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
    <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:500 }}>{label}</p>
    <YN val={val} onChange={onChange} />
  </div>
);

const ActionBtn = ({ children, onClick, variant='primary' }) => {
  const styles = {
    primary: { background:`linear-gradient(135deg, ${MMSE_COLOR}, #0f766e)`, color:'white', border:'none', boxShadow:`0 6px 18px rgba(13,148,136,0.28)` },
    outline: { background:'none', color:'var(--mint-muted)', border:'none' },
  };
  return (
    <button onClick={onClick} style={{ width:'100%', padding:'13px', borderRadius:13, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s', ...styles[variant] }}
      onMouseOver={e => { if(variant!=='outline') e.currentTarget.style.opacity='0.88'; }}
      onMouseOut={e  => e.currentTarget.style.opacity='1'}>
      {children}
    </button>
  );
};

/* ── main ── */
export default function MMSEQuiz({ onBack, onComplete, patient }) {
  const DRAFT_KEY = 'mmse';
  const draft = loadDraft(DRAFT_KEY, patient?.name);

  const [edu, setEdu] = useState(draft?.edu ?? null);
  const [oriTimeS, setOriTimeS] = useState(draft?.oriTimeS ?? Array(5).fill(null));
  const [oriPlaceS, setOriPlaceS] = useState(draft?.oriPlaceS ?? Array(5).fill(null));
  const [regS, setRegS] = useState(draft?.regS ?? null);
  const [attMode, setAttMode] = useState(draft?.attMode ?? 'calc');
  const [attS, setAttS] = useState(draft?.attS ?? null);
  const [recS, setRecS] = useState(draft?.recS ?? Array(3).fill(null));
  const [langS, setLangS] = useState(draft?.langS ?? { naming1:null, naming2:null, repeat:null, commands:Array(3).fill(null), read:null, write:null });
  const [visuoS, setVisuoS] = useState(draft?.visuoS ?? null);
  const [fullscreen, setFullscreen] = useState(null);
  const [done, setDone] = useState(false);
  const [finalDuration, setFinalDuration] = useState(0);
  const timer = useTimer(true);

  // Auto-save draft on every answer change
  useEffect(() => {
    if (done) return;
    saveDraft(DRAFT_KEY, patient?.name, { edu, oriTimeS, oriPlaceS, regS, attMode, attS, recS, langS, visuoS });
  }, [edu, oriTimeS, oriPlaceS, regS, attMode, attS, recS, langS, visuoS, done, patient?.name]);

  const handleBack = () => {
    if (window.confirm('ออกจากการทดสอบ?\nคำตอบที่ตอบไปแล้วจะถูกบันทึกไว้ชั่วคราว')) {
      onBack();
    }
  };

  // Calculations
  const oriTimeTotal  = oriTimeS.filter(v=>v===1).length;
  const oriPlaceTotal = oriPlaceS.filter(v=>v===1).length;
  const regTotal      = regS ?? 0;
  const attTotal      = attS ?? 0;
  const recTotal      = recS.filter(v=>v===1).length;
  const langTotal     = (langS.naming1??0) + (langS.naming2??0) + (langS.repeat??0) + langS.commands.reduce((a,v)=>a+(v??0),0) + (edu==='none'?0:(langS.read??0)) + (edu==='none'?0:(langS.write??0));
  const visuoTotal    = edu==='none'?0:(visuoS??0);
  
  const total = oriTimeTotal + oriPlaceTotal + regTotal + attTotal + recTotal + langTotal + visuoTotal;
  
  let cutoff = 0;
  if (edu === 'none') cutoff = 14;
  else if (edu === 'primary') cutoff = 17;
  else if (edu === 'high') cutoff = 22;
  const impaired = total <= cutoff;

  const setCmd = (i, v) => { const c=[...langS.commands]; c[i]=v; setLangS(s=>({...s,commands:c})); };
  const setRec = (i, v) => { const a=[...recS]; a[i]=v; setRecS(a); };

  const handleFinish = () => {
    if (!edu) { alert('⚠️ กรุณาเลือกระดับการศึกษาก่อน เนื่องจากมีผลต่อเกณฑ์การแปลผลครับ'); return; }

    const allAns = [
      ...oriTimeS, ...oriPlaceS, regS, ...recS,
      langS.naming1, langS.naming2, langS.repeat, ...langS.commands,
    ];
    if (edu !== 'none') {
      allAns.push(attS, langS.read, langS.write, visuoS);
    }

    if (allAns.includes(null)) {
      alert('⚠️ กรุณาประเมินให้ครบทุกข้อก่อนบันทึกผลครับ'); return;
    }

    const duration = timer.snapshot();
    timer.stop();
    setFinalDuration(duration);
    setDone(true);
    clearDraft(DRAFT_KEY, patient?.name);

    const resText = impaired ? `มีแนวโน้มภาวะสมองเสื่อม (จุดตัด ≤ ${cutoff})` : 'อยู่ในเกณฑ์ปกติ';

    if (onComplete) {
      onComplete({
        type: 'MMSE (Mini-Mental State)',
        totalScore: total,
        maxScore: 30,
        impaired,
        duration,
        resultText: resText,
        breakdown: {
          "ระดับการศึกษา": edu === 'none' ? 'ไม่ได้เรียน/อ่านไม่ออก' : edu === 'primary' ? 'ประถมศึกษา (ป.1-ป.6)' : 'สูงกว่าประถมศึกษา',
          "1. Orientation for Time (5)": oriTimeTotal,
          "2. Orientation for Place (5)": oriPlaceTotal,
          "3. Registration (3)": regTotal,
          [`4. Attention (${edu === 'none' ? 'ข้ามอัตโนมัติ' : attMode === 'calc' ? 'คิดเลข' : 'สะกดคำ'}) (${edu === 'none' ? 0 : 5})`]: attTotal,
          "5. Recall (3)": recTotal,
          "6. Language (8)": langTotal,
          "7. Visuospatial (1)": visuoTotal,
          "จุดตัดเกณฑ์ (Cut-off)": `<= ${cutoff}`,
          "การแปลผล MMSE": resText,
        }
      });
    }
  };

  /* ── 🌟 Fullscreen Render: เขียนประโยค ── */
  if (fullscreen === 'write') {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', flexDirection:'column', background:'#f8fafc' }}>
        <div style={{ padding:'16px 24px', background:'white', borderBottom:'1px solid var(--mint-border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <button onClick={() => setFullscreen(null)} style={{ background:'none', border:'none', color:'var(--mint-muted)', fontSize:16, fontWeight:700, cursor:'pointer' }}>✕ ยกเลิก</button>
          <span style={{ fontSize:18, fontWeight:800, color:MMSE_COLOR }}>เขียนประโยค 1 ประโยค</span>
          <div style={{ width: 80 }} />
        </div>
        {/* 🌟 เปลี่ยน overflow เป็น auto เพื่อให้เลื่อนจอได้ถ้าพื้นที่ไม่พอ */}
        <div style={{ flex:1, padding:'24px', display:'flex', flexDirection:'column', width:'100%', margin:'0 auto', maxWidth: 1000, overflowY: 'auto' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16, flexShrink: 0 }}>
            <div style={{ textAlign:'center', background:'white', padding:'20px 40px', borderRadius:20, border:'1.5px solid var(--mint-border)', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', width: '100%' }}>
              <p style={{ fontSize:16, fontWeight:800, color:'var(--mint-text)', margin: 0 }}>ให้ผู้ถูกทดสอบเขียนประโยคที่มีความหมาย 1 ประโยค</p>
            </div>
          </div>
          <DrawingCanvas height={400} onScoreSelect={(v) => { setLangS(s=>({...s, write:v})); setFullscreen(null); }} />
        </div>
      </div>
    );
  }

  /* ── 🌟 Fullscreen Render: วาดห้าเหลี่ยม ── */
  if (fullscreen === 'draw') {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', flexDirection:'column', background:'#f8fafc' }}>
        <div style={{ padding:'16px 24px', background:'white', borderBottom:'1px solid var(--mint-border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <button onClick={() => setFullscreen(null)} style={{ background:'none', border:'none', color:'var(--mint-muted)', fontSize:16, fontWeight:700, cursor:'pointer' }}>✕ ยกเลิก</button>
          <span style={{ fontSize:18, fontWeight:800, color:MMSE_COLOR }}>วาดภาพห้าเหลี่ยมซ้อนทับกัน</span>
          <div style={{ width: 80 }} />
        </div>
        {/* 🌟 เปลี่ยน overflow เป็น auto เพื่อให้เลื่อนจอได้ */}
        <div style={{ flex:1, padding:'24px', display:'flex', flexDirection:'column', width:'100%', margin:'0 auto', maxWidth: 1000, overflowY: 'auto' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16, flexShrink: 0 }}>
            <div style={{ textAlign:'center', background:'white', padding:'16px 32px', borderRadius:20, border:'1.5px solid var(--mint-border)', boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize:15, fontWeight:800, color:'var(--mint-text)', marginBottom:12 }}>วาดภาพให้เหมือนต้นแบบมากที่สุด</p>
              <svg width="220" height="110" viewBox="-10 -10 180 135">
                <polygon points="50,0 100,40 80,100 20,100 0,40" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinejoin="round" />
                <polygon points="110,15 160,55 140,115 80,115 60,55" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <DrawingCanvas height={400} onScoreSelect={(v) => { setVisuoS(v); setFullscreen(null); }} />
        </div>
      </div>
    );
  }

  /* ── Result Screen ── */
  if (done) {
    const sections=[
      {l:'Orientation Time',  s:oriTimeTotal,  m:5},
      {l:'Orientation Place', s:oriPlaceTotal, m:5},
      {l:'Registration',      s:regTotal,      m:3},
      {l:'Attention',         s:attTotal,      m:edu==='none'?0:5},
      {l:'Recall',            s:recTotal,      m:3},
      {l:'Language',          s:langTotal,     m:edu==='none'?5:8},
      {l:'Visuospatial',      s:visuoTotal,    m:edu==='none'?0:1},
    ];
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <div style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,253,250,0.9)',backdropFilter:'blur(18px)',borderBottom:`1px solid ${MMSE_BORDER}`,padding:'0 16px',height:56,display:'flex',alignItems:'center',gap:8 }}>
          <Cross s={14} c={MMSE_COLOR}/><span style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>MMSE-Thai — ผลการประเมิน</span>
        </div>
        <div style={{ flex:1,maxWidth:520,margin:'0 auto',width:'100%',padding:'28px 16px' }}>
          {patient && (
            <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:MMSE_BG,border:`1px solid ${MMSE_BORDER}`,borderRadius:14,marginBottom:20 }}>
              <span style={{ fontSize:18 }}>👤</span>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{patient.name}</p>
                <p style={{ fontSize:12,color:'var(--mint-muted)' }}>อายุ {patient.age} ปี</p>
              </div>
              <div style={{ marginLeft:'auto',fontSize:11,color:MMSE_COLOR,fontWeight:700,background:'white',padding:'4px 10px',borderRadius:20,border:`1px solid ${MMSE_BORDER}`,flexShrink:0 }}>✅ บันทึกแล้ว</div>
            </div>
          )}

          <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:10,marginBottom:16,flexWrap:'wrap' }}>
            <span style={{ fontSize:11,color:'var(--mint-muted)' }}>การศึกษา:</span>
            <span style={{ fontSize:11,fontWeight:700,color:MMSE_COLOR }}>{edu === 'none' ? 'ไม่ได้เรียน' : edu === 'primary' ? 'ประถมฯ' : 'มัธยมฯ ขึ้นไป'}</span>
            <span style={{ fontSize:11,color:'var(--mint-muted)',marginLeft:6 }}>(จุดตัด ≤ {cutoff})</span>
            <span style={{ marginLeft:'auto',fontSize:11,fontWeight:700,color:'var(--mint-text2)',background:'white',border:'1px solid var(--mint-border)',borderRadius:8,padding:'2px 8px',flexShrink:0 }}>
              ⏱ {String(Math.floor(finalDuration/60)).padStart(2,'0')}:{String(finalDuration%60).padStart(2,'0')}
            </span>
          </div>

          <div style={{ textAlign:'center',marginBottom:28 }}>
            <div style={{ position:'relative',width:130,height:130,margin:'0 auto 12px' }}>
              <svg width="130" height="130" style={{ position:'absolute',inset:0 }}>
                <circle cx="65" cy="65" r="56" fill="none" stroke="var(--mint-border2)" strokeWidth="8"/>
                <circle cx="65" cy="65" r="56" fill="none" stroke={impaired?'var(--mint-warn)':MMSE_COLOR} strokeWidth="8" strokeDasharray={`${(total/(edu==='none'?22:30))*351.9} 351.9`} strokeLinecap="round" transform="rotate(-90 65 65)" style={{ transition:'stroke-dasharray 0.9s ease' }}/>
              </svg>
              <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                <span style={{ fontSize:34,fontWeight:800,color:impaired?'var(--mint-warn)':MMSE_COLOR }}>{total}</span>
                <span style={{ fontSize:12,color:'var(--mint-muted)' }}>/ {edu==='none'?22:30}</span>
              </div>
            </div>
            <p style={{ fontSize:11,color:'var(--mint-muted)',letterSpacing:'0.08em',textTransform:'uppercase' }}>คะแนนรวม MMSE</p>
          </div>
          
          <div style={{ borderRadius:14,padding:'14px 18px',marginBottom:22,background:impaired?'#fff7ed':MMSE_BG,border:`1.5px solid ${impaired?'#fcd34d':MMSE_BORDER}` }}>
            <p style={{ fontWeight:700,textAlign:'center',fontSize:14,color:impaired?'#92400e':'#0f766e' }}>
              {impaired ? `⚠️ มีแนวโน้มภาวะสมองเสื่อม (คะแนน ≤ ${cutoff})` : '✅ ผลการประเมินอยู่ในเกณฑ์ปกติ'}
            </p>
          </div>

          <div style={{ background:'white',border:'1px solid var(--mint-border2)',borderRadius:18,padding:'20px',marginBottom:20,boxShadow:'var(--shadow-sm)' }}>
            <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:14,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase' }}>คะแนนแยกหมวด</p>
            {sections.map(({l,s,m}) => (
              <div key={l} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10,opacity:m===0?0.4:1 }}>
                <span style={{ fontSize:12,color:'var(--mint-text2)',width:110,flexShrink:0 }}>{l}</span>
                <div style={{ flex:1,height:7,borderRadius:4,background:'var(--mint-border2)',overflow:'hidden' }}>
                  <div style={{ height:'100%',borderRadius:4,background:`linear-gradient(90deg,${MMSE_COLOR},#0f766e)`,width:`${m>0?(s/m)*100:0}%`,transition:'width 0.8s ease' }}/>
                </div>
                <span style={{ fontSize:12,fontWeight:700,color:MMSE_COLOR,width:36,textAlign:'right' }}>{s}/{m}</span>
              </div>
            ))}
          </div>
          <ActionBtn onClick={onBack} variant="primary">← กลับหน้าหลัก</ActionBtn>
        </div>
      </div>
    );
  }

  /* ── Quiz Form ── */
  const MMSE_WORDS = ['ดอกไม้', 'แม่น้ำ', 'รถไฟ'];
  const attenQuestions = attMode === 'calc' 
    ? ["ครั้งที่ 1 (93)", "ครั้งที่ 2 (86)", "ครั้งที่ 3 (79)", "ครั้งที่ 4 (72)", "ครั้งที่ 5 (65)"]
    : ["ครั้งที่ 1 (ว)", "ครั้งที่ 2 (า)", "ครั้งที่ 3 (น)", "ครั้งที่ 4 (ะ)", "ครั้งที่ 5 (ม)"];

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,253,250,0.9)',backdropFilter:'blur(18px)',borderBottom:`1px solid ${MMSE_BORDER}`,padding:'0 16px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <button onClick={handleBack} style={{ background:'none',border:'none',color:'var(--mint-muted)',cursor:'pointer',fontSize:13,fontWeight:600,padding:'8px 0' }}>← กลับ</button>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <Cross s={14} c={MMSE_COLOR}/>
          <span style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>MMSE-Thai</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ fontSize:12,fontWeight:700,color:MMSE_COLOR,background:MMSE_BG,border:`1px solid ${MMSE_BORDER}`,borderRadius:20,padding:'3px 10px' }}>{total}/{edu==='none'?22:30}</div>
          <div style={{ fontSize:12,fontWeight:700,color:'var(--mint-text2)',background:'white',border:'1px solid var(--mint-border)',borderRadius:20,padding:'3px 10px',fontVariantNumeric:'tabular-nums',display:'flex',alignItems:'center',gap:4 }}>
            <span>⏱</span><span>{timer.fmt}</span>
          </div>
        </div>
      </div>

      <div style={{ flex:1,maxWidth:600,margin:'0 auto',width:'100%',padding:'20px 14px',display:'flex',flexDirection:'column',gap:12 }}>

        {/* Edu Picker */}
        <div style={{ background:'white', border:`1.5px solid ${edu ? MMSE_BORDER : '#fca5a5'}`, borderRadius:16, padding:'18px 16px', boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:14, fontWeight:800, color:'var(--mint-text)', marginBottom:4 }}>📚 ระดับการศึกษาของผู้สูงอายุ <span style={{color: '#ef4444'}}>*</span></p>
          <p style={{ fontSize:12, color:'var(--mint-muted)', marginBottom:12 }}>จำเป็นต้องเลือกเพื่อกำหนดเกณฑ์จุดตัด (Cut-off score) ที่ถูกต้อง</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button onClick={() => setEdu('none')} style={{ padding:'10px', borderRadius:10, fontSize:13, fontWeight:700, border:`1.5px solid ${edu === 'none' ? MMSE_COLOR : 'var(--mint-border)'}`, background: edu === 'none' ? MMSE_BG : 'white', color: edu === 'none' ? MMSE_COLOR : 'var(--mint-muted)', textAlign:'left' }}>
              {edu === 'none' ? '✅ ' : ''}ไม่ได้เรียนหนังสือ / อ่านไม่ออกเขียนไม่ได้ (จุดตัด ≤ 14)
            </button>
            <button onClick={() => setEdu('primary')} style={{ padding:'10px', borderRadius:10, fontSize:13, fontWeight:700, border:`1.5px solid ${edu === 'primary' ? MMSE_COLOR : 'var(--mint-border)'}`, background: edu === 'primary' ? MMSE_BG : 'white', color: edu === 'primary' ? MMSE_COLOR : 'var(--mint-muted)', textAlign:'left' }}>
              {edu === 'primary' ? '✅ ' : ''}ระดับประถมศึกษา ป.1 - ป.6 (จุดตัด ≤ 17)
            </button>
            <button onClick={() => setEdu('high')} style={{ padding:'10px', borderRadius:10, fontSize:13, fontWeight:700, border:`1.5px solid ${edu === 'high' ? MMSE_COLOR : 'var(--mint-border)'}`, background: edu === 'high' ? MMSE_BG : 'white', color: edu === 'high' ? MMSE_COLOR : 'var(--mint-muted)', textAlign:'left' }}>
              {edu === 'high' ? '✅ ' : ''}ระดับมัธยมศึกษาขึ้นไป (จุดตัด ≤ 22)
            </button>
          </div>
        </div>

        <Section num="1" title="Orientation for Time" max={5} score={oriTimeTotal}>
          {["วันนี้วันที่เท่าไร", "วันนี้วันอะไร (จันทร์-อาทิตย์)", "เดือนนี้เดือนอะไร", "ปีนี้ปีอะไร (พ.ศ. หรือ ค.ศ.)", "ฤดูนี้ฤดูอะไร"].map((q,i) => (
            <SubQ key={i} label={`${i+1}. ${q}`} val={oriTimeS[i]} onChange={v=>{const a=[...oriTimeS];a[i]=v;setOriTimeS(a);}} />
          ))}
        </Section>

        <Section num="2" title="Orientation for Place" max={5} score={oriPlaceTotal}>
          {["สถานที่ตรงนี้เรียกว่าอะไร (ชื่อ รพ./บ้าน)", "อยู่ที่ชั้นอะไร / ห้องอะไร", "อำเภอ / เขต อะไร", "จังหวัดอะไร", "ภาคอะไร"].map((q,i) => (
            <SubQ key={i} label={`${i+1}. ${q}`} val={oriPlaceS[i]} onChange={v=>{const a=[...oriPlaceS];a[i]=v;setOriPlaceS(a);}} />
          ))}
        </Section>

        <Section num="3" title="Registration" max={3} score={regTotal}>
          <div style={{ background:MMSE_BG,border:`1px solid ${MMSE_BORDER}`,borderRadius:14,padding:14,marginBottom:14 }}>
            <p style={{ fontSize:13,color:'#0f766e',fontStyle:'italic',textAlign:'center',lineHeight:1.7,marginBottom:12 }}>
              "เดี๋ยวจะบอกชื่อของ 3 อย่าง ให้ฟังดีๆ จะบอกเพียงครั้งเดียว เมื่อพูดจบแล้วให้พูดตาม"
            </p>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
              {MMSE_WORDS.map(w=>(
                <div key={w} style={{ background:'white',border:'1.5px solid var(--mint-border)',borderRadius:10,padding:'12px 8px',textAlign:'center',fontWeight:800,fontSize:14,color:MMSE_COLOR,boxShadow:'var(--shadow-sm)' }}>{w}</div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:12,color:'var(--mint-muted)',marginBottom:8 }}>ผู้ถูกทดสอบพูดตามได้กี่คำ?</p>
          <div style={{ display:'flex',gap:8 }}>
            {[0,1,2,3].map(n=>(
              <button key={n} onClick={()=>setRegS(n)} style={{ flex:1,padding:'12px 4px',borderRadius:10,fontSize:14,fontWeight:700,border:'1.5px solid',cursor:'pointer',transition:'all 0.18s',
                background:regS===n?MMSE_BG:'var(--mint-surface2)',
                borderColor:regS===n?MMSE_COLOR:'var(--mint-border)',
                color:regS===n?MMSE_COLOR:'var(--mint-muted)',
              }}>{n}</button>
            ))}
          </div>
        </Section>

        <Section num="4" title="Attention / Calculation" max={edu==='none'?0:5} score={attTotal}>
          {edu === 'none' ? (
            <div style={{ padding:'12px', background:'#fff1f1', borderRadius:10, fontSize:12, color:'#dc2626' }}>
              * ข้ามอัตโนมัติ เนื่องจากผู้ถูกทดสอบไม่เคยเรียนหนังสือ จึงไม่คุ้นเคยกับการคำนวณหรือการสะกดคำ
            </div>
          ) : (
            <>
              <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#c2410c', marginBottom:8 }}>เลือกรูปแบบการประเมินข้อ 4</p>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setAttMode('calc'); setAttS(null); }} style={{ flex:1, padding:'8px', borderRadius:8, fontSize:12, fontWeight:700, border:`1.5px solid ${attMode === 'calc' ? '#c2410c' : '#fed7aa'}`, background: attMode === 'calc' ? '#ffedd5' : 'white', color: attMode === 'calc' ? '#9a3412' : '#fb923c', cursor:'pointer' }}>🧮 ลบเลข 100 ทีละ 7</button>
                  <button onClick={() => { setAttMode('spell'); setAttS(null); }} style={{ flex:1, padding:'8px', borderRadius:8, fontSize:12, fontWeight:700, border:`1.5px solid ${attMode === 'spell' ? '#c2410c' : '#fed7aa'}`, background: attMode === 'spell' ? '#ffedd5' : 'white', color: attMode === 'spell' ? '#9a3412' : '#fb923c', cursor:'pointer' }}>🔤 สะกด มะนาว ถอยหลัง</button>
                </div>
              </div>
              <p style={{ fontSize:12,color:'var(--mint-muted)',marginBottom:12 }}>กดจำนวนครั้งที่ตอบถูกต้องต่อเนื่อง (หยุดนับเมื่อตอบผิดครั้งแรก)</p>
              <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:14 }}>
                {attenQuestions.map((q,i)=>{
                  const checked = attS !== null && i < (attS??0);
                  return (
                    <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:11, background: checked ? MMSE_BG : 'var(--mint-surface2)', border:`1.5px solid ${checked ? MMSE_COLOR : 'var(--mint-border2)'}` }}>
                      <div style={{ width:22,height:22,borderRadius:6,flexShrink:0, border:`2px solid ${checked?MMSE_COLOR:'var(--mint-border)'}`, background:checked?MMSE_COLOR:'white', display:'flex',alignItems:'center',justifyContent:'center', fontSize:13,color:'white',fontWeight:700 }}>{checked?'✓':''}</div>
                      <span style={{ fontSize:14,fontWeight:600,color:checked?MMSE_COLOR:'var(--mint-text)',flex:1 }}>{q}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize:12,color:'var(--mint-text2)',marginBottom:8,fontWeight:600 }}>ตอบถูกต้องต่อเนื่องกี่ครั้ง?</p>
              <div style={{ display:'flex',gap:6 }}>
                {[0,1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setAttS(n)} style={{ flex:1,padding:'11px 2px',borderRadius:10,fontSize:14,fontWeight:700, border:'1.5px solid',cursor:'pointer', background:attS===n?MMSE_BG:'var(--mint-surface2)', borderColor:attS===n?MMSE_COLOR:'var(--mint-border)', color:attS===n?MMSE_COLOR:'var(--mint-muted)' }}>{n}</button>
                ))}
              </div>
            </>
          )}
        </Section>

        <Section num="5" title="Recall" max={3} score={recTotal}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:8 }}>ผู้ถูกทดสอบระลึกคำสิ่งของ 3 อย่างได้หรือไม่?</p>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {MMSE_WORDS.map((word, i) => (
              <div key={word} style={{ background: recS[i]===1 ? MMSE_BG : recS[i]===0 ? '#fff1f1' : 'var(--mint-surface2)', border: `1.5px solid ${recS[i]===1 ? MMSE_COLOR : recS[i]===0 ? '#fca5a5' : 'var(--mint-border2)'}`, borderRadius:12, padding:'12px 14px', transition:'all 0.2s' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background: recS[i]===1 ? MMSE_COLOR : recS[i]===0 ? '#ef4444' : 'var(--mint-border2)', fontSize:14, color:'white' }}>
                      {recS[i]===1 ? '✓' : recS[i]===0 ? '✗' : ''}
                    </span>
                    <span style={{ fontSize:15, fontWeight:800, color: recS[i]===1 ? MMSE_COLOR : recS[i]===0 ? '#ef4444' : 'var(--mint-text)' }}>{word}</span>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setRec(i, 1)} style={{ padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:700, border:`1.5px solid ${recS[i]===1 ? MMSE_COLOR : 'var(--mint-border)'}`, background: recS[i]===1 ? MMSE_COLOR : 'white', color: recS[i]===1 ? 'white' : 'var(--mint-muted)', cursor:'pointer' }}>จำได้</button>
                    <button onClick={() => setRec(i, 0)} style={{ padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:700, border:`1.5px solid ${recS[i]===0 ? '#fca5a5' : 'var(--mint-border)'}`, background: recS[i]===0 ? '#ef4444' : 'white', color: recS[i]===0 ? 'white' : 'var(--mint-muted)', cursor:'pointer' }}>ลืม</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section num="6" title="Naming & Language" max={edu==='none'?5:8} score={langTotal}>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            <SubQ label="6.1 ชี้ที่นาฬิกาข้อมือ → 'สิ่งนี้เรียกว่าอะไร?'" val={langS.naming1} onChange={v=>setLangS(s=>({...s,naming1:v}))} />
            <SubQ label="6.2 ชี้ที่ดินสอ → 'สิ่งนี้เรียกว่าอะไร?'" val={langS.naming2} onChange={v=>setLangS(s=>({...s,naming2:v}))} />

            <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
              <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500 }}>6.3 พูดตามประโยค</p>
              <div style={{ margin:'8px 0',padding:'10px 14px',background:MMSE_BG,border:`1px solid ${MMSE_BORDER}`,borderRadius:10 }}>
                <p style={{ fontSize:13,color:'#0f766e',fontStyle:'italic',textAlign:'center' }}>"ใครใคร่ขายไก่ไข่"</p>
              </div>
              <YN val={langS.repeat} onChange={v=>setLangS(s=>({...s,repeat:v}))} />
            </div>

            <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
              <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:4 }}>6.4 ทำตามคำสั่ง 3 ขั้นตอน (3 คะแนน)</p>
              <div style={{ padding:'8px 12px',background:MMSE_BG,border:`1px solid ${MMSE_BORDER}`,borderRadius:10,marginBottom:10 }}>
                <p style={{ fontSize:12,color:'#0f766e',fontStyle:'italic' }}>"รับกระดาษด้วยมือขวา → พับครึ่งกระดาษ → วางกระดาษลงบนโต๊ะ/พื้น"</p>
              </div>
              {['รับด้วยมือขวา','พับครึ่ง','วางลงบนโต๊ะ/พื้น'].map((cmd,i)=>(
                <div key={i} style={{ marginBottom:6 }}>
                  <p style={{ fontSize:12,color:'var(--mint-muted)',marginBottom:2 }}>{i+1}. {cmd}</p>
                  <YN val={langS.commands[i]} onChange={v=>setCmd(i,v)} />
                </div>
              ))}
            </div>

            {edu === 'none' ? (
              <div style={{ padding:'12px', background:'#fff1f1', borderRadius:10, fontSize:12, color:'#dc2626' }}>
                * ข้อ 6.5 อ่านและทำตาม: ข้ามอัตโนมัติ เนื่องจากผู้ถูกทดสอบอ่านหนังสือไม่ออก
              </div>
            ) : (
              <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
                <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:10 }}>6.5 อ่านและทำตาม</p>
                <div style={{ textAlign:'center',fontSize:26,fontWeight:900,color:'var(--mint-text)',border:'1.5px solid var(--mint-border)',borderRadius:12,padding:16,marginBottom:10,background:'white',letterSpacing:'0.08em', boxShadow:'var(--shadow-sm)' }}>
                  หลับตาของท่าน
                </div>
                <YN val={langS.read} onChange={v=>setLangS(s=>({...s,read:v}))} />
              </div>
            )}

            {/* 🌟 6.6 เขียนประโยค */}
            {edu === 'none' ? (
               <div style={{ padding: '12px', background: '#fff1f1', borderRadius: 10, fontSize: 12, color: '#dc2626' }}>
                 * ข้อ 6.6 การเขียนประโยค: ข้ามอัตโนมัติ เนื่องจากผู้ประเมินไม่ได้เรียนหนังสือ
               </div>
            ) : (
              <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:600 }}>6.6 เขียนประโยคที่มีความหมาย 1 ประโยค</p>
                  {langS.write === null ? (
                    <button onClick={() => setFullscreen('write')} style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, background:MMSE_BG, border:`1.5px solid ${MMSE_COLOR}`, color:MMSE_COLOR, cursor:'pointer', flexShrink:0 }}>
                      🖥️ เริ่มทำ
                    </button>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <span style={{ fontSize:13, fontWeight:800, color: langS.write === 1 ? '#10b981' : '#ef4444' }}>
                        {langS.write === 1 ? '✓ 1/1' : '✗ 0/1'}
                      </span>
                      <button onClick={() => { setLangS(s=>({...s, write:null})); setFullscreen('write'); }} style={{ fontSize:11, color:'var(--mint-muted)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>ทำใหม่</button>
                    </div>
                  )}
                </div>
                {langS.write === null && (
                  <p style={{ fontSize:11, color:'var(--mint-muted)' }}>กดปุ่ม "เริ่มทำ" เพื่อเปิดกระดานเขียนเต็มจอ</p>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* 7. Visuospatial */}
        <Section num="7" title="Visuospatial (การวาดภาพ)" max={edu==='none'?0:1} score={visuoTotal}>
          {/* 🌟 7.1 วาดรูปห้าเหลี่ยมซ้อนกัน */}
          {edu === 'none' ? (
             <div style={{ padding: '12px', background: '#fff1f1', borderRadius: 10, fontSize: 12, color: '#dc2626' }}>
               * ข้ามการทดสอบวาดภาพ
             </div>
          ) : (
            <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:600 }}>7.1 วาดรูปห้าเหลี่ยมซ้อนทับกัน</p>
                {visuoS === null ? (
                  <button onClick={() => setFullscreen('draw')} style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, background:MMSE_BG, border:`1.5px solid ${MMSE_COLOR}`, color:MMSE_COLOR, cursor:'pointer', flexShrink:0 }}>
                    🖥️ เริ่มทำ
                  </button>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <span style={{ fontSize:13, fontWeight:800, color: visuoS === 1 ? '#10b981' : '#ef4444' }}>
                      {visuoS === 1 ? '✓ 1/1' : '✗ 0/1'}
                    </span>
                    <button onClick={() => { setVisuoS(null); setFullscreen('draw'); }} style={{ fontSize:11, color:'var(--mint-muted)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>ทำใหม่</button>
                  </div>
                )}
              </div>
              {visuoS === null && (
                <p style={{ fontSize:11, color:'var(--mint-muted)' }}>กดปุ่ม "เริ่มทำ" เพื่อเปิดกระดานวาดรูปเต็มจอ</p>
              )}
            </div>
          )}
        </Section>

        {/* Submit */}
        <div style={{ background:'white',border:'1px solid var(--mint-border)',borderRadius:20,padding:'20px 16px',boxShadow:'var(--shadow-md)',marginBottom:40 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
            <span style={{ fontSize:15,fontWeight:700,color:'var(--mint-text)' }}>คะแนนรวมทั้งหมด</span>
            <span style={{ fontSize:28,fontWeight:800,color:!impaired?MMSE_COLOR:'var(--mint-warn)' }}>
              {total}<span style={{ fontSize:14,color:'var(--mint-muted)',fontWeight:400 }}>/30</span>
            </span>
          </div>
          <div style={{ height:8,borderRadius:4,background:'var(--mint-border2)',overflow:'hidden',marginBottom:20 }}>
            <div style={{ height:'100%',borderRadius:4,background:`linear-gradient(90deg,${!impaired?`${MMSE_COLOR},#0f766e`:'var(--mint-warn),#fcd34d'})`,width:`${(total/(edu==='none'?22:30))*100}%`,transition:'width 0.5s ease' }}/>
          </div>
          <ActionBtn onClick={handleFinish} variant="primary">ดูผลการประเมิน →</ActionBtn>
          <div style={{ height:8 }}/>
          <ActionBtn onClick={handleBack} variant="outline">← กลับหน้าหลัก</ActionBtn>
        </div>
      </div>
    </div>
  );
}