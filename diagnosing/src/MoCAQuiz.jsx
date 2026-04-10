import React, { useState, useRef, useCallback, useEffect } from 'react';
import lionImg from './assets/lion.png';
import rhinoImg from './assets/rhino.png';
import camelImg from './assets/camel.png';

/* ── useTimer hook ── */
function useTimer(autoStart = false) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef  = useRef(0);
  const intervalRef = useRef(null);
  const startedAt   = useRef(null);
  const stoppedRef  = useRef(false);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stoppedRef.current = false;
    startedAt.current = Date.now() - elapsedRef.current * 1000;
    intervalRef.current = setInterval(() => {
      if (stoppedRef.current) return;
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      elapsedRef.current = s;
      setElapsed(s);
    }, 500);
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const snapshot = useCallback(() => elapsedRef.current, []);

  useEffect(() => {
    if (autoStart) start();
    return () => { clearInterval(intervalRef.current); intervalRef.current = null; };
  }, [autoStart, start]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  return { elapsed, fmt: fmt(elapsed), start, stop, snapshot };
}

/* ── MoCA Memory Word Sets (5 words each) ── */
const WORD_SETS = [
  ['หน้า', 'ผ้าไหม', 'วัด', 'มะลิ', 'สีแดง'],
];
const WORD_SET_LABELS = ['ชุดคำมาตรฐาน'];

/* ── shared atoms ── */
const Cross = ({ s=14, c='var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1"   width="5"  height="18" rx="1.4"/>
    <rect x="1"   y="7.5" width="18" height="5"  rx="1.4"/>
  </svg>
);

const YN = ({ val, onChange, yL='ถูก', nL='ผิด' }) => (
  <div style={{ display:'flex', gap:8, marginTop:8 }}>
    {[[1,yL,'var(--mint-primary)','var(--mint-primary-xl)','var(--mint-primary)'],
      [0,nL,'#ef4444','#fff1f1','#fca5a5']].map(([v,label,col,bg,border]) => (
      <button key={v} onClick={() => onChange(v)} style={{
        flex:1, padding:'10px 8px', borderRadius:10, fontSize:13, fontWeight:700,
        border:`1.5px solid ${val===v ? border : 'var(--mint-border)'}`,
        background: val===v ? bg : 'var(--mint-surface2)',
        color: val===v ? col : 'var(--mint-muted)',
        cursor:'pointer', transition:'all 0.18s', minHeight: 42,
      }}>
        {val===v ? (v===1?'✓ ':'✗ ') : ''}{label}
      </button>
    ))}
  </div>
);

const Section = ({ num, title, max, score, color='var(--mint-purple)', children }) => (
  <div style={{ background:'white', border:`1.5px solid ${color}33`, borderRadius:20, padding:'22px 18px', boxShadow:'var(--shadow-sm)', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', left:0, top:14, bottom:14, width:4, borderRadius:'0 3px 3px 0', background:color }} />
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
      <div style={{ width:30, height:30, borderRadius:9, background:`${color}18`, border:`1.5px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color, flexShrink:0 }}>
        {num}
      </div>
      <h2 style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--mint-text)', lineHeight:1.3 }}>{title}</h2>
      <span style={{ fontSize:12, fontWeight:700, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:20, padding:'2px 10px', flexShrink:0 }}>
        {score}/{max}
      </span>
    </div>
    {children}
  </div>
);

const SubQ = ({ label, val, onChange, yL, nL }) => (
  <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
    <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:500 }}>{label}</p>
    <YN val={val} onChange={onChange} yL={yL} nL={nL} />
  </div>
);

const ActionBtn = ({ children, onClick, variant='primary' }) => {
  const styles = {
    primary: { background:'linear-gradient(135deg,#8b5cf6,#a78bfa)', color:'white', border:'none', boxShadow:'0 6px 18px rgba(139,92,246,0.28)' },
    ghost:   { background:'var(--mint-surface2)', color:'var(--mint-text2)', border:'1.5px solid var(--mint-border)' },
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

/* ── Freehand Drawing Canvas ── */
function DrawingCanvas({ width: propW, height: propH, onScoreSelect, maxScore=2, labels, fillContainer=false }) {
  const canvasRef    = useRef(null);
  const wrapRef      = useRef(null);
  const drawing      = useRef(false);
  const strokesRef   = useRef([]);
  const currentRef   = useRef([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isEmpty,   setIsEmpty]   = useState(true);
  const [size, setSize] = useState({ w: propW || 280, h: propH || 200 });

  // Auto-measure container when fillContainer is true
  useEffect(() => {
    if (!fillContainer || !wrapRef.current) return;
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setSize({ w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [fillContainer]);

  // Use props when not filling container
  const cw = fillContainer ? size.w : (propW || 280);
  const ch = fillContainer ? size.h : (propH || 200);

  const scoreLabels = labels || (maxScore === 2
    ? [{s:0,icon:'✗',label:'ไม่ถูกต้อง'},{s:1,icon:'△',label:'บางส่วน'},{s:2,icon:'✓✓',label:'สมบูรณ์'}]
    : maxScore === 3
    ? [{s:0,icon:'✗',label:'0 คะแนน'},{s:1,icon:'△',label:'1 คะแนน'},{s:2,icon:'✓',label:'2 คะแนน'},{s:3,icon:'✓✓',label:'3 คะแนน'}]
    : [{s:0,icon:'✗',label:'ไม่ถูกต้อง'},{s:1,icon:'✓',label:'ถูกต้อง'}]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0f2b28'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const stroke of strokesRef.current) {
      if (stroke.length < 2) continue;
      ctx.beginPath(); ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }, []);

  useEffect(() => { redrawAll(); }, [redrawAll, cw, ch]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x:(src.clientX-rect.left)*scaleX, y:(src.clientY-rect.top)*scaleY };
  };

  const startDraw = (e) => {
    if (confirmed) return; e.preventDefault();
    drawing.current = true; currentRef.current = [];
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    currentRef.current.push(pos);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f2b28'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!drawing.current || confirmed) return; e.preventDefault();
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    currentRef.current.push(pos); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setIsEmpty(false);
  };

  const stopDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, [...currentRef.current]];
      currentRef.current = [];
    }
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    redrawAll(); setIsEmpty(strokesRef.current.length === 0);
  };

  const handleClear = () => {
    strokesRef.current = []; currentRef.current = [];
    redrawAll(); setIsEmpty(true);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex: fillContainer ? 1 : 'none', minHeight: fillContainer ? 0 : 'auto', overflow:'hidden' }}>
      {/* Canvas area — shrinks when buttons appear */}
      <div ref={wrapRef} style={{ flex: fillContainer ? '1 1 0px' : 'none', minHeight: fillContainer ? 0 : 'auto', display:'flex', justifyContent:'center', alignItems:'center', padding: fillContainer ? '4px 8px' : 0, overflow:'hidden' }}>
        <canvas ref={canvasRef} width={cw} height={ch}
          style={{
            display:'block', width: fillContainer ? '100%' : cw, height: fillContainer ? '100%' : ch,
            maxWidth:'100%', maxHeight:'100%',
            border: confirmed ? '1.5px solid #8b5cf6' : '1.5px dashed var(--mint-border)',
            borderRadius:14, cursor: confirmed ? 'default' : 'crosshair',
            background:'white', touchAction:'none',
            opacity: confirmed ? 0.85 : 1, transition:'border-color 0.2s, opacity 0.2s',
          }}
          onMouseDown={!confirmed ? startDraw : undefined}
          onMouseMove={!confirmed ? draw : undefined}
          onMouseUp={!confirmed ? stopDraw : undefined}
          onMouseLeave={!confirmed ? stopDraw : undefined}
          onTouchStart={!confirmed ? startDraw : undefined}
          onTouchMove={!confirmed ? draw : undefined}
          onTouchEnd={!confirmed ? stopDraw : undefined}
        />
      </div>
      {/* Button bar — both states identical height */}
      <div style={{ flexShrink:0, paddingTop:8, minHeight:90 }}>
        {!confirmed ? (
          <div style={{ display:'flex', gap:8, height:80 }}>
            <button onClick={handleUndo} disabled={isEmpty} style={{
              flex:1, borderRadius:12, fontSize:13, fontWeight:800,
              background: isEmpty ? 'var(--mint-border2)' : 'var(--mint-surface2)',
              border:'1.5px solid var(--mint-border)',
              color: isEmpty ? 'var(--mint-muted)' : 'var(--mint-text2)',
              cursor: isEmpty ? 'not-allowed' : 'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
            }}>
              <span style={{ fontSize:20 }}>↩</span>
              <span>ย้อนกลับ</span>
            </button>
            <button onClick={handleClear} disabled={isEmpty} style={{
              flex:1, borderRadius:12, fontSize:13, fontWeight:800,
              background: isEmpty ? 'var(--mint-border2)' : 'var(--mint-surface2)',
              border:'1.5px solid var(--mint-border)',
              color: isEmpty ? 'var(--mint-muted)' : 'var(--mint-muted)',
              cursor: isEmpty ? 'not-allowed' : 'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
            }}>
              <span style={{ fontSize:20 }}>🗑️</span>
              <span>ล้างใหม่</span>
            </button>
            <button onClick={()=>setConfirmed(true)} disabled={isEmpty} style={{
              flex:2, borderRadius:12, fontSize:13, fontWeight:800,
              background: isEmpty ? 'var(--mint-border2)' : 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
              color: isEmpty ? 'var(--mint-muted)' : 'white', border:'none',
              cursor: isEmpty ? 'not-allowed' : 'pointer',
              boxShadow: isEmpty ? 'none' : '0 4px 14px rgba(139,92,246,0.3)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
            }}>
              <span style={{ fontSize:20 }}>✓</span>
              <span>ยืนยันการวาด</span>
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:8, height:80 }}>
            <button onClick={()=>setConfirmed(false)} style={{
              width:50, flexShrink:0, borderRadius:12, fontSize:11, fontWeight:700,
              background:'var(--mint-surface2)', border:'1.5px solid var(--mint-border)',
              color:'var(--mint-text2)', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
            }}>
              <span style={{ fontSize:16 }}>←</span>
              <span>แก้ไข</span>
            </button>
            {scoreLabels.map(({s:n, icon, label:lb})=>(
              <button key={n} onClick={()=>onScoreSelect(n)} style={{
                flex:1, borderRadius:12, fontSize:12, fontWeight:800,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
                background: n===maxScore ? '#f3e8ff' : n===0 ? '#fff1f1' : '#fef9c3',
                border:`1.5px solid ${n===maxScore?'#8b5cf6':n===0?'#fca5a5':'#fcd34d'}`,
                color: n===maxScore ? '#8b5cf6' : n===0 ? '#dc2626' : '#92400e',
                cursor:'pointer',
              }}>
                <span style={{fontSize:18}}>{icon}</span>
                <span>{n}</span>
                <span style={{fontSize:9,opacity:0.7}}>{lb}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Clock Canvas (circle pre-drawn, like Mini-Cog) ── */
function ClockCanvas({ onConfirm }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const strokesRef = useRef([]);
  const currentRef = useRef([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const SIZE = Math.min(280, (typeof window !== 'undefined' ? window.innerWidth : 400) - 60);
  const CX = SIZE / 2;

  const drawBase = useCallback((ctx) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CX, CX - 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }, [CX]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    drawBase(ctx);
    ctx.strokeStyle = '#0f2b28'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const stroke of strokesRef.current) {
      if (stroke.length < 2) continue;
      ctx.beginPath(); ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }, [SIZE, drawBase]);

  useEffect(() => { redrawAll(); }, [redrawAll]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x:(src.clientX-rect.left)*scaleX, y:(src.clientY-rect.top)*scaleY };
  };

  const startDraw = (e) => {
    if (confirmed) return; e.preventDefault();
    drawing.current = true; currentRef.current = [];
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    currentRef.current.push(pos);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f2b28'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!drawing.current || confirmed) return; e.preventDefault();
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    currentRef.current.push(pos); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setIsEmpty(false);
  };

  const stopDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, [...currentRef.current]];
      currentRef.current = [];
    }
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    redrawAll(); setIsEmpty(strokesRef.current.length === 0);
  };

  const handleClear = () => {
    strokesRef.current = []; currentRef.current = [];
    redrawAll(); setIsEmpty(true);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
      <p style={{ fontSize:13, color:'var(--mint-text2)', textAlign:'center', lineHeight:1.7 }}>
        วาด <strong>ตัวเลข 1–12</strong> และ <strong>เข็มนาฬิกา</strong> ให้แสดงเวลา{' '}
        <strong style={{ color:'#8b5cf6' }}>11:10 น.</strong>
      </p>
      <canvas ref={canvasRef} width={SIZE} height={SIZE}
        style={{
          borderRadius:'50%', cursor: confirmed ? 'default' : 'crosshair',
          display:'block', boxShadow:'0 4px 20px rgba(139,92,246,0.15)',
          touchAction:'none',
          border: confirmed ? '2px solid #8b5cf6' : '2px solid var(--mint-border2)',
          opacity: confirmed ? 0.92 : 1,
        }}
        onMouseDown={!confirmed ? startDraw : undefined}
        onMouseMove={!confirmed ? draw : undefined}
        onMouseUp={!confirmed ? stopDraw : undefined}
        onMouseLeave={!confirmed ? stopDraw : undefined}
        onTouchStart={!confirmed ? startDraw : undefined}
        onTouchMove={!confirmed ? draw : undefined}
        onTouchEnd={!confirmed ? stopDraw : undefined}
      />
      {!confirmed ? (
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          <button onClick={handleUndo} disabled={isEmpty} style={{
            flex:1, padding:'11px', borderRadius:12, fontSize:13, fontWeight:700,
            background: isEmpty ? 'var(--mint-border2)' : 'var(--mint-surface2)',
            border:'1.5px solid var(--mint-border)',
            color: isEmpty ? 'var(--mint-muted)' : 'var(--mint-text2)',
            cursor: isEmpty ? 'not-allowed' : 'pointer',
          }}>↩ ย้อนกลับ</button>
          <button onClick={handleClear} disabled={isEmpty} style={{
            flex:1, padding:'11px', borderRadius:12, fontSize:13, fontWeight:700,
            background: isEmpty ? 'var(--mint-border2)' : 'var(--mint-surface2)',
            border:'1.5px solid var(--mint-border)', color:'var(--mint-muted)',
            cursor: isEmpty ? 'not-allowed' : 'pointer',
          }}>🗑️ ล้างใหม่</button>
          <button onClick={()=>setConfirmed(true)} disabled={isEmpty} style={{
            flex:2, padding:'11px', borderRadius:12, fontSize:13, fontWeight:700,
            background: isEmpty ? 'var(--mint-border2)' : 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
            color: isEmpty ? 'var(--mint-muted)' : 'white', border:'none',
            cursor: isEmpty ? 'not-allowed' : 'pointer',
          }}>ยืนยันการวาด ✓</button>
        </div>
      ) : (
        <div style={{ width:'100%' }}>
          <div style={{ padding:'10px 14px', background:'#f3e8ff', border:'1px solid #c4b5fd', borderRadius:10, marginBottom:14 }}>
            <p style={{ fontSize:12, color:'#6d28d9', textAlign:'center', lineHeight:1.7 }}>
              เกณฑ์ให้คะแนน (3 คะแนน):<br/>
              <strong>รูปร่าง</strong> (1) ตัวเลขครบ 1–12 · <strong>ตัวเลข</strong> (1) ตำแหน่งถูกต้อง · <strong>เข็ม</strong> (1) ชี้ 11:10 น. ถูกต้อง
            </p>
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--mint-text)', marginBottom:10, textAlign:'center' }}>ให้คะแนนการวาดนาฬิกา (0–3)</p>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {[0,1,2,3].map(n=>(
              <button key={n} onClick={()=>onConfirm(n)} style={{
                flex:1, padding:'16px 6px', borderRadius:14, fontSize:15, fontWeight:800,
                display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                background: n===3?'#f3e8ff':n===0?'#fff1f1':n>=2?'#fef9c3':'#fff7ed',
                border:`1.5px solid ${n===3?'#8b5cf6':n===0?'#fca5a5':'#fcd34d'}`,
                color: n===3?'#8b5cf6':n===0?'#dc2626':'#92400e',
                cursor:'pointer',
              }}>
                <span style={{fontSize:22}}>{n===3?'✓✓✓':n===2?'✓✓':n===1?'△':'✗'}</span>
                <span>{n}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>setConfirmed(false)} style={{
            width:'100%', padding:'9px', borderRadius:10,
            background:'none', border:'none', color:'var(--mint-muted)', fontSize:12, cursor:'pointer',
          }}>← วาดใหม่ / แก้ไข</button>
        </div>
      )}
    </div>
  );
}

/* ── Trail Making Test (Interactive — no hints, auto-check) ── */
function TrailMaking({ onScore, fullscreen: fs = false }) {
  const NODES = [
    { id: '1', label: '1', x: 70,  y: 250 },
    { id: 'ก', label: 'ก', x: 160, y: 140 },
    { id: '2', label: '2', x: 280, y: 80  },
    { id: 'ข', label: 'ข', x: 130, y: 50  },
    { id: '3', label: '3', x: 350, y: 200 },
    { id: 'ค', label: 'ค', x: 230, y: 260 },
    { id: '4', label: '4', x: 380, y: 60  },
    { id: 'ง', label: 'ง', x: 50,  y: 130 },
    { id: '5', label: '5', x: 200, y: 180 },
    { id: 'จ', label: 'จ', x: 330, y: 140 },
  ];
  const CORRECT = ['1','ก','2','ข','3','ค','4','ง','5','จ'];
  const VW = 440, VH = 310; // viewBox coords (never changes)
  const R  = fs ? 30 : 22;  // node radius scales up in fullscreen
  const fontSize  = fs ? 22 : 16;
  const badgeSize = fs ? 24 : 18;

  const [visited, setVisited] = useState([]);      // ids in tap order
  const [checked, setChecked] = useState(false);    // has been auto-checked
  const [isCorrect, setIsCorrect] = useState(false);

  const handleNodeClick = (id) => {
    if (checked) return;
    if (visited.includes(id)) {
      // Undo: if last node tapped, remove it
      if (visited[visited.length - 1] === id) {
        setVisited(prev => prev.slice(0, -1));
      }
      return;
    }
    setVisited(prev => [...prev, id]);
  };

  const handleCheck = () => {
    const correct = visited.length === CORRECT.length && visited.every((id, i) => id === CORRECT[i]);
    setIsCorrect(correct);
    setChecked(true);
    onScore(correct ? 1 : 0);
  };

  const handleReset = () => {
    setVisited([]); setChecked(false); setIsCorrect(false);
    onScore(null);
  };

  // Build lines from visited sequence
  const lines = [];
  for (let i = 1; i < visited.length; i++) {
    const from = NODES.find(n => n.id === visited[i - 1]);
    const to   = NODES.find(n => n.id === visited[i]);
    if (from && to) lines.push({ from, to, idx: i });
  }

  // After check, color each line/node as correct or wrong
  const getNodeStyle = (id) => {
    const isStart = id === '1';
    const isEnd   = id === 'จ';
    const idx = visited.indexOf(id);
    if (idx === -1) {
      // Not visited
      if (checked) return { bg: 'var(--mint-surface2)', border: 'var(--mint-border2)', text: 'var(--mint-muted)' };
      // Start = green, End = red, others = default
      if (isStart) return { bg: '#f0fdf9', border: '#10b981', text: '#065f46' };
      if (isEnd)   return { bg: '#fff1f1', border: '#ef4444', text: '#dc2626' };
      return { bg: 'white', border: 'var(--mint-border)', text: 'var(--mint-text)' };
    }
    if (!checked) {
      // Tapped but not checked yet — neutral purple tint
      return { bg: '#f3e8ff', border: '#8b5cf6', text: '#8b5cf6' };
    }
    // Checked — show correct/wrong per position
    if (CORRECT[idx] === id) return { bg: '#f0fdf9', border: '#10b981', text: '#065f46' };
    return { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' };
  };

  const getLineColor = (lineIdx) => {
    if (!checked) return '#8b5cf6';
    // lineIdx corresponds to visited[lineIdx] (the "to" node)
    const fromOk = CORRECT[lineIdx - 1] === visited[lineIdx - 1];
    const toOk   = CORRECT[lineIdx] === visited[lineIdx];
    return (fromOk && toOk) ? '#10b981' : '#ef4444';
  };

  // Show order number on each visited node
  const getOrderLabel = (id) => {
    const idx = visited.indexOf(id);
    if (idx === -1) return null;
    return idx + 1;
  };

  const allTapped = visited.length === CORRECT.length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12, flex: fs ? 1 : 'none' }}>
      <p style={{ fontSize: fs ? 16 : 13, color:'var(--mint-text2)', lineHeight:1.7, textAlign:'center', flexShrink:0 }}>
        ให้ผู้ทำแบบทดสอบ กดวงกลมและลากเส้นเชื่อมตัวเลขกับตัวอักษรไทยสลับกันตามลำดับ
    เริ่มจาก 1 → ก → 2 → ข … ไปเรื่อย ๆ 
    จนกว่าจะครบทุกวงกลม โดยต้องทำ ให้ถูกต้องและรวดเร็วที่สุด.
      </p>

      {/* Canvas */}
      <div style={{ position:'relative', width: fs ? 'calc(100% - 16px)' : '100%', ...(fs ? { flex:1, minHeight:0, maxHeight:'calc(100% - 8px)' } : { maxWidth:440, aspectRatio:`${VW}/${VH}` }), margin:'0 auto', background:'white', border: checked ? `2px solid ${isCorrect?'#10b981':'#ef4444'}` : '2px dashed var(--mint-border)', borderRadius:18, overflow:'hidden', touchAction:'manipulation', transition:'border-color 0.3s' }}>
        {/* Lines — use percentage viewBox so lines match %-positioned nodes */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {lines.map((l, i) => (
            <line key={i}
              x1={(l.from.x/VW)*100} y1={(l.from.y/VH)*100}
              x2={(l.to.x/VW)*100}   y2={(l.to.y/VH)*100}
              stroke={getLineColor(l.idx)} strokeWidth={0.5} strokeLinecap="round"
              strokeDasharray={checked && getLineColor(l.idx)==='#ef4444' ? '2,1' : 'none'}
              opacity={0.7}
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: fs ? 4 : 3 }}
            />
          ))}
        </svg>

        {/* Nodes */}
        {NODES.map(node => {
          const s = getNodeStyle(node.id);
          const order = getOrderLabel(node.id);
          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              disabled={checked}
              style={{
                position:'absolute',
                left:`${(node.x/VW)*100}%`, top:`${(node.y/VH)*100}%`,
                transform:'translate(-50%,-50%)',
                width:R*2, height:R*2, borderRadius:'50%',
                background:s.bg, border:`2.5px solid ${s.border}`, color:s.text,
                fontSize, fontWeight:800,
                cursor: checked ? 'default' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.18s', boxShadow:'var(--shadow-sm)', zIndex:2,
              }}
            >
              {node.label}
              {/* Small order badge */}
              {order !== null && (
                <span style={{
                  position:'absolute', top: fs ? -10 : -8, right: fs ? -10 : -8,
                  width:badgeSize, height:badgeSize, borderRadius:'50%',
                  background: !checked ? '#8b5cf6' : (CORRECT[order-1]===node.id ? '#10b981' : '#ef4444'),
                  color:'white', fontSize: fs ? 11 : 9, fontWeight:800,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:'2px solid white', boxShadow:'0 1px 4px rgba(0,0,0,0.15)',
                }}>
                  {order}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Controls — fixed height single row, same size both states */}
      <div style={{ flexShrink:0, paddingTop:8 }}>
        {!checked ? (
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={handleReset} disabled={visited.length===0} style={{
              flex:1, padding:'11px 6px', borderRadius:10, fontSize:12, fontWeight:700,
              background: visited.length===0 ? 'var(--mint-border2)' : 'var(--mint-surface2)',
              border:'1.5px solid var(--mint-border)',
              color: visited.length===0 ? 'var(--mint-muted)' : 'var(--mint-text2)',
              cursor: visited.length===0 ? 'not-allowed' : 'pointer',
            }}>🔄 เริ่มใหม่</button>
            <button onClick={handleCheck} disabled={!allTapped} style={{
              flex:2, padding:'11px 6px', borderRadius:10, fontSize:12, fontWeight:700,
              background: allTapped ? 'linear-gradient(135deg,#8b5cf6,#a78bfa)' : 'var(--mint-border2)',
              color: allTapped ? 'white' : 'var(--mint-muted)',
              border:'none',
              cursor: allTapped ? 'pointer' : 'not-allowed',
            }}>✓ ตรวจคำตอบ</button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <div style={{ flex:1, padding:'8px 12px', borderRadius:10, background: isCorrect ? '#f0fdf9' : '#fff1f1', border:`1.5px solid ${isCorrect?'#6ee7d5':'#fca5a5'}`, textAlign:'center' }}>
              <span style={{ fontWeight:800, fontSize:13, color: isCorrect ? '#065f46' : '#dc2626' }}>
                {isCorrect ? '✓ ถูกต้อง — 1 คะแนน' : '✗ ผิด — 0 คะแนน'}
              </span>
            </div>
            <button onClick={handleReset} style={{ padding:'11px 14px', borderRadius:10, fontSize:12, fontWeight:700, background:'white', border:'1.5px solid var(--mint-border)', color:'var(--mint-text2)', cursor:'pointer', flexShrink:0 }}>ทำใหม่</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Score Selector ── */
const ScoreSelect = ({ label, max, val, onChange, descriptions }) => (
  <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
    <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:500, marginBottom:8 }}>{label}</p>
    <div style={{ display:'flex', gap:6 }}>
      {Array.from({length:max+1},(_,i)=>i).map(n=>(
        <button key={n} onClick={()=>onChange(n)} style={{
          flex:1, padding:'10px 4px', borderRadius:10, fontSize:14, fontWeight:700,
          border:'1.5px solid', cursor:'pointer', transition:'all 0.18s',
          background: val===n ? '#f3e8ff' : 'var(--mint-surface2)',
          borderColor: val===n ? '#8b5cf6' : 'var(--mint-border)',
          color: val===n ? '#8b5cf6' : 'var(--mint-muted)',
        }}>
          {n}
        </button>
      ))}
    </div>
    {descriptions && val !== null && descriptions[val] && (
      <p style={{ fontSize:11, color:'#6d28d9', marginTop:6, textAlign:'center' }}>{descriptions[val]}</p>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   MoCA QUIZ — Main Component
   Based on: Montreal Cognitive Assessment (MoCA) Thai version
   Total: 30 points, cutoff ≥ 25 (add 1 pt if education ≤ 6 years)
   Translated by Solaphat Hemrungrojn MD
══════════════════════════════════════════════════════════════════════════════ */
export default function MoCAQuiz({ onBack, onComplete, patient }) {
  const MOCA_COLOR = '#8b5cf6';
  const MOCA_BG    = '#f3e8ff';
  const MOCA_LIGHT = '#ede9fe';

  const timer = useTimer(true);

  /* ── State for each section ── */
  // 1. Visuospatial/Executive (/5)
  const [trailScore, setTrailScore]     = useState(null); // 0 or 1
  const [cubeScore, setCubeScore]       = useState(null);  // 0 or 1
  const [clockContour, setClockContour] = useState(null);  // 0 or 1
  const [clockNumbers, setClockNumbers] = useState(null);  // 0 or 1
  const [clockHands, setClockHands]     = useState(null);    // 0 or 1
  const [fullscreen, setFullscreen]     = useState(null);    // 'trail' | 'cube' | 'clock' | null

  // 2. Naming (/3)
  const [naming, setNaming] = useState([null, null, null]); // lion, rhino, camel

  // 3. Attention (/6)
  const [digitForward, setDigitForward]   = useState(null); // 0 or 1 (2 1 8 5 4)
  const [digitBackward, setDigitBackward] = useState(null); // 0 or 1 (7 4 2)
  const [tapScore, setTapScore]           = useState(null); // 0 or 1 (tap on 'ก')
  const [serialScore, setSerialScore]     = useState(null); // 0–3 (serial 7 subtraction)

  // 4. Language (/3)
  const [repeat1, setRepeat1]   = useState(null); // 0 or 1
  const [repeat2, setRepeat2]   = useState(null); // 0 or 1
  const [fluency, setFluency]   = useState(null); // 0 or 1 (≥11 words starting with น)

  // 5. Abstraction (/2)
  const [abstract1, setAbstract1] = useState(null); // 0 or 1 (train-bicycle)
  const [abstract2, setAbstract2] = useState(null); // 0 or 1 (watch-ruler)

  // 6. Delayed Recall (/5)
  const [recall, setRecall] = useState([null, null, null, null, null]); // 5 words

  // 7. Orientation (/6)
  const [oriDate, setOriDate]     = useState(null);
  const [oriMonth, setOriMonth]   = useState(null);
  const [oriYear, setOriYear]     = useState(null);
  const [oriDay, setOriDay]       = useState(null);
  const [oriPlace, setOriPlace]   = useState(null);
  const [oriCity, setOriCity]     = useState(null);

  // Education bonus
  const [eduBonus, setEduBonus] = useState(false);

  const [done, setDone]             = useState(false);
  const [finalDuration, setFinalDuration] = useState(0);

  /* ── Score computation ── */
  const visuoScore = (trailScore??0) + (cubeScore??0) + (clockContour??0) + (clockNumbers??0) + (clockHands??0);
  const namingScore = naming.reduce((a,v)=>a+(v??0), 0);
  const attentionScore = (digitForward??0) + (digitBackward??0) + (tapScore??0) + (serialScore??0);
  const languageScore = (repeat1??0) + (repeat2??0) + (fluency??0);
  const abstractionScore = (abstract1??0) + (abstract2??0);
  const recallScore = recall.reduce((a,v)=>a+(v??0), 0);
  const orientationScore = (oriDate??0) + (oriMonth??0) + (oriYear??0) + (oriDay??0) + (oriPlace??0) + (oriCity??0);

  const rawTotal = visuoScore + namingScore + attentionScore + languageScore + abstractionScore + recallScore + orientationScore;
  const total = Math.min(30, rawTotal + (eduBonus ? 1 : 0));
  const impaired = total < 25;

  const setNam = (i, v) => { const a=[...naming]; a[i]=v; setNaming(a); };
  const setRec = (i, v) => { const a=[...recall]; a[i]=v; setRecall(a); };

  const handleFinish = () => {
    // เช็คว่ามีข้อไหนที่ยังไม่ได้ทำ (ยังมีค่าเป็น null) หรือไม่
    const allAnswered = [
      trailScore, cubeScore, clockContour, clockNumbers, clockHands,
      ...naming, digitForward, digitBackward, tapScore, serialScore,
      repeat1, repeat2, fluency, abstract1, abstract2,
      ...recall, oriDate, oriMonth, oriYear, oriDay, oriPlace, oriCity
    ].every(v => v !== null);

    if (!allAnswered) {
      alert('⚠️ กรุณาทำแบบทดสอบให้ครบทุกข้อ (เลือกคำตอบให้ครบ) ก่อนกดดูผลประเมินครับ');
      return;
    }

    const duration = timer.snapshot();
    timer.stop();
    setFinalDuration(duration);
    setDone(true);
    if (onComplete) {
      onComplete({
        type: 'MoCA',
        totalScore: total,
        maxScore: 30,
        impaired,
        duration,
        breakdown: {
          "คะแนนมิติสัมพันธ์ (5)": visuoScore,
          "คะแนนเรียกชื่อ (3)": namingScore,
          "คะแนนความสนใจ (6)": attentionScore,
          "คะแนนภาษา (3)": languageScore,
          "คะแนนตรรกะ (2)": abstractionScore,
          "คะแนนระลึกคำ (5)": recallScore,
          "คะแนนรับรู้เวลา/สถานที่ (6)": orientationScore,
          
          "1a. ลากเส้น (Trail)": trailScore ?? '',
          "1b. ลูกบาศก์ (Cube)": cubeScore ?? '',
          "1c. นาฬิกา (รูปร่าง)": clockContour ?? '',
          "1c. นาฬิกา (ตัวเลข)": clockNumbers ?? '',
          "1c. นาฬิกา (เข็ม)": clockHands ?? '',

          "2. เรียกชื่อ (สิงโต)": naming[0] ?? '',
          "2. เรียกชื่อ (แรด)": naming[1] ?? '',
          "2. เรียกชื่อ (อูฐ)": naming[2] ?? '',

          "4a. ทวนเลข (เดินหน้า)": digitForward ?? '',
          "4b. ทวนเลข (ถอยหลัง)": digitBackward ?? '',
          "4c. เคาะโต๊ะเลข 1": tapScore ?? '',
          "4d. ลบเลขทีละ 7": serialScore ?? '',

          "5a. พูดตามประโยค 1": repeat1 ?? '',
          "5b. พูดตามประโยค 2": repeat2 ?? '',
          "5c. ความคล่อง (น.)": fluency ?? '',

          "6a. นามธรรม (รถไฟ-จักรยาน)": abstract1 ?? '',
          "6b. นามธรรม (นาฬิกา-ไม้บรรทัด)": abstract2 ?? '',

          "7. ระลึกคำ (หน้า)": recall[0] ?? '',
          "7. ระลึกคำ (ผ้าไหม)": recall[1] ?? '',
          "7. ระลึกคำ (วัด)": recall[2] ?? '',
          "7. ระลึกคำ (มะลิ)": recall[3] ?? '',
          "7. ระลึกคำ (สีแดง)": recall[4] ?? '',

          "8. รับรู้ (วันที่)": oriDate ?? '',
          "8. รับรู้ (เดือน)": oriMonth ?? '',
          "8. รับรู้ (ปี)": oriYear ?? '',
          "8. รับรู้ (วัน)": oriDay ?? '',
          "8. รับรู้ (สถานที่)": oriPlace ?? '',
          "8. รับรู้ (จังหวัด)": oriCity ?? '',

          "บวกคะแนนการศึกษา <= 6 ปี (+1)": eduBonus ? 1 : 0
        },
      });
    }
  };

  /* ══════ RESULT SCREEN ══════ */
  if (done) {
    const sections = [
      { l:'Visuospatial/Exec', s:visuoScore,      m:5 },
      { l:'Naming',            s:namingScore,      m:3 },
      { l:'Attention',         s:attentionScore,   m:6 },
      { l:'Language',          s:languageScore,     m:3 },
      { l:'Abstraction',       s:abstractionScore,  m:2 },
      { l:'Delayed Recall',    s:recallScore,       m:5 },
      { l:'Orientation',       s:orientationScore,  m:6 },
    ];
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <div style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,250,248,0.9)',backdropFilter:'blur(18px)',borderBottom:'1px solid var(--mint-border)',padding:'0 16px',height:56,display:'flex',alignItems:'center',gap:8 }}>
          <Cross s={14} c={MOCA_COLOR}/>
          <span style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>MoCA — ผลการประเมิน</span>
          {patient && (
            <span style={{ fontSize:11,color:MOCA_COLOR,fontWeight:600,background:MOCA_BG,padding:'2px 8px',borderRadius:20,border:'1px solid var(--mint-border)',marginLeft:4,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
              {patient.name} · {patient.age} ปี
            </span>
          )}
        </div>
        <div style={{ flex:1,maxWidth:520,margin:'0 auto',width:'100%',padding:'28px 16px' }}>
          {patient && (
            <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:MOCA_BG,border:'1px solid var(--mint-border)',borderRadius:14,marginBottom:20 }}>
              <span style={{ fontSize:18 }}>👤</span>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{patient.name}</p>
                <p style={{ fontSize:12,color:'var(--mint-muted)' }}>อายุ {patient.age} ปี</p>
              </div>
              <div style={{ marginLeft:'auto',fontSize:11,color:MOCA_COLOR,fontWeight:700,background:'white',padding:'4px 10px',borderRadius:20,border:'1px solid var(--mint-border)',flexShrink:0 }}>
                ✅ บันทึกแล้ว
              </div>
            </div>
          )}

          <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:10,marginBottom:16,flexWrap:'wrap' }}>
            <span style={{ fontSize:11,color:'var(--mint-muted)' }}>ชุดคำที่ใช้:</span>
            <span style={{ fontSize:11,fontWeight:700,color:MOCA_COLOR }}>มาตรฐาน MoCA</span>
            {WORD_SETS[0].map(w=>(
              <span key={w} style={{ fontSize:10,background:MOCA_BG,color:MOCA_COLOR,padding:'1px 6px',borderRadius:6,fontWeight:700 }}>{w}</span>
            ))}
            <span style={{ marginLeft:'auto',fontSize:11,fontWeight:700,color:'var(--mint-text2)',background:'white',border:'1px solid var(--mint-border)',borderRadius:8,padding:'2px 8px',flexShrink:0 }}>
              ⏱ {String(Math.floor(finalDuration/60)).padStart(2,'0')}:{String(finalDuration%60).padStart(2,'0')}
            </span>
          </div>

          {eduBonus && (
            <div style={{ padding:'8px 14px', background:'#fef9c3', border:'1px solid #fcd34d', borderRadius:10, marginBottom:16 }}>
              <p style={{ fontSize:12, color:'#92400e', textAlign:'center' }}>📚 เพิ่ม 1 คะแนน (การศึกษา ≤ 6 ปี)</p>
            </div>
          )}

          <div style={{ textAlign:'center',marginBottom:28 }}>
            <div style={{ position:'relative',width:130,height:130,margin:'0 auto 12px' }}>
              <svg width="130" height="130" style={{ position:'absolute',inset:0 }}>
                <circle cx="65" cy="65" r="56" fill="none" stroke="var(--mint-border2)" strokeWidth="8"/>
                <circle cx="65" cy="65" r="56" fill="none"
                  stroke={impaired?'var(--mint-warn)':MOCA_COLOR} strokeWidth="8"
                  strokeDasharray={`${(total/30)*351.9} 351.9`}
                  strokeLinecap="round" transform="rotate(-90 65 65)"
                  style={{ transition:'stroke-dasharray 0.9s ease' }}/>
              </svg>
              <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                <span style={{ fontSize:34,fontWeight:800,color:impaired?'var(--mint-warn)':MOCA_COLOR }}>{total}</span>
                <span style={{ fontSize:12,color:'var(--mint-muted)' }}>/ 30</span>
              </div>
            </div>
            <p style={{ fontSize:11,color:'var(--mint-muted)',letterSpacing:'0.08em',textTransform:'uppercase' }}>คะแนนรวม MoCA</p>
          </div>

          <div style={{ borderRadius:14,padding:'14px 18px',marginBottom:22,background:impaired?'#fff7ed':'#f0fdf9',border:`1.5px solid ${impaired?'#fcd34d':'#6ee7d5'}` }}>
            <p style={{ fontWeight:700,textAlign:'center',fontSize:14,color:impaired?'#92400e':'#065f46' }}>
              {impaired?'⚠️ มีภาวะ Cognitive Impairment (คะแนน < 25)':'✅ ผลการประเมินอยู่ในเกณฑ์ปกติ (≥ 25)'}
            </p>
          </div>

          <div style={{ background:'white',border:'1px solid var(--mint-border2)',borderRadius:18,padding:'20px',marginBottom:20,boxShadow:'var(--shadow-sm)' }}>
            <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:14,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase' }}>คะแนนแยกหมวด</p>
            {sections.map(({l,s,m}) => (
              <div key={l} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                <span style={{ fontSize:12,color:'var(--mint-text2)',width:120,flexShrink:0 }}>{l}</span>
                <div style={{ flex:1,height:7,borderRadius:4,background:'var(--mint-border2)',overflow:'hidden' }}>
                  <div style={{ height:'100%',borderRadius:4,background:`linear-gradient(90deg,#8b5cf6,#a78bfa)`,width:`${(s/m)*100}%`,transition:'width 0.8s ease' }}/>
                </div>
                <span style={{ fontSize:12,fontWeight:700,color:MOCA_COLOR,width:36,textAlign:'right' }}>{s}/{m}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize:11,color:'var(--mint-muted)',textAlign:'center',marginBottom:20 }}>
            * ผลนี้เป็นการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์<br/>
            MoCA © Z. Nasreddine MD · แปลโดย Solaphat Hemrungrojn MD
          </p>
          <ActionBtn onClick={onBack} variant="primary">← กลับหน้าหลัก</ActionBtn>
        </div>
        <div style={{ textAlign:'center',fontSize:11,color:'var(--mint-muted)',padding:14,background:'white',borderTop:'1px solid var(--mint-border2)' }}>MoCA © Z. Nasreddine MD · www.mocatest.org</div>
      </div>
    );
  }

  /* ══════ QUIZ FORM ══════ */
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* topbar */}
      <div style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,250,248,0.9)',backdropFilter:'blur(18px)',borderBottom:'1px solid var(--mint-border)',padding:'0 16px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <button onClick={onBack} style={{ background:'none',border:'none',color:'var(--mint-muted)',cursor:'pointer',fontSize:13,fontWeight:600,padding:'8px 0' }}>← กลับ</button>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <Cross s={14} c={MOCA_COLOR}/>
          <span style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>MoCA</span>
          {patient && (
            <span style={{ fontSize:11,color:MOCA_COLOR,fontWeight:600,background:MOCA_BG,padding:'2px 8px',borderRadius:20,border:'1px solid var(--mint-border)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
              {patient.name}
            </span>
          )}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ fontSize:12,fontWeight:700,color:MOCA_COLOR,background:MOCA_BG,border:'1px solid var(--mint-border)',borderRadius:20,padding:'3px 10px' }}>
            {total}/30
          </div>
          <div style={{ fontSize:12,fontWeight:700,color:'var(--mint-text2)',background:'white',border:'1px solid var(--mint-border)',borderRadius:20,padding:'3px 10px',fontVariantNumeric:'tabular-nums',display:'flex',alignItems:'center',gap:4 }}>
            <span>⏱</span><span>{timer.fmt}</span>
          </div>
        </div>
      </div>

      <div style={{ flex:1,maxWidth:600,margin:'0 auto',width:'100%',padding:'20px 14px',display:'flex',flexDirection:'column',gap:12 }}>

        {/* ═══ FULLSCREEN OVERLAY for 1a/1b/1c ═══ */}
        {fullscreen && (
          <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--mint-bg)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Fullscreen topbar */}
            <div style={{ zIndex:10, background:'rgba(240,250,248,0.95)', backdropFilter:'blur(18px)', borderBottom:'1px solid var(--mint-border)', padding:'0 16px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Cross s={14} c={MOCA_COLOR}/>
                <span style={{ fontSize:16, fontWeight:700, color:'var(--mint-text)' }}>
                  {fullscreen === 'trail' ? '1a. Trail Making' : fullscreen === 'cube' ? '1b. คัดลอกลูกบาศก์' : '1c. วาดนาฬิกา (3 คะแนน)'}
                </span>
              </div>
              <button onClick={() => setFullscreen(null)} style={{ padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:700, background:MOCA_BG, border:'1.5px solid #c4b5fd', color:MOCA_COLOR, cursor:'pointer' }}>
                ✕ ปิด
              </button>
            </div>

            {/* Fullscreen content — fills remaining height, no scroll */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 16px', minHeight:0 }}>

              {fullscreen === 'trail' && (
                <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
                  <TrailMaking fullscreen onScore={(s) => { setTrailScore(s); if (s !== null) setFullscreen(null); }} />
                </div>
              )}

              {fullscreen === 'cube' && (
                <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
                  <p style={{ fontSize:16, color:'var(--mint-text2)', textAlign:'center', marginBottom:10, lineHeight:1.7, flexShrink:0 }}>
                    วาดรูป <strong>ลูกบาศก์</strong> ตามตัวอย่าง
                  </p>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:10, flexShrink:0 }}>
                    <svg viewBox="0 0 150 150" style={{ width:'min(120px, 25vw)', height:'min(120px, 25vw)', border:'1.5px solid var(--mint-border)', borderRadius:14, background:'white', padding:6 }}>
                      <rect x="15" y="45" width="80" height="80" fill="none" stroke="var(--mint-text2)" strokeWidth="2.5"/>
                      <rect x="55" y="10" width="80" height="80" fill="none" stroke="var(--mint-text2)" strokeWidth="2.5"/>
                      <line x1="15" y1="45" x2="55" y2="10" stroke="var(--mint-text2)" strokeWidth="2.5"/>
                      <line x1="95" y1="45" x2="135" y2="10" stroke="var(--mint-text2)" strokeWidth="2.5"/>
                      <line x1="15" y1="125" x2="55" y2="90" stroke="var(--mint-text2)" strokeWidth="2.5"/>
                      <line x1="95" y1="125" x2="135" y2="90" stroke="var(--mint-text2)" strokeWidth="2.5"/>
                    </svg>
                  </div>
                  <DrawingCanvas
                    fillContainer
                    onScoreSelect={(s) => { setCubeScore(s > 0 ? 1 : 0); setFullscreen(null); }}
                    maxScore={1}
                    labels={[{s:0,icon:'✗',label:'ไม่ถูกต้อง'},{s:1,icon:'✓',label:'ถูกต้อง'}]}
                  />
                </div>
              )}

              {fullscreen === 'clock' && (
                <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
                  <p style={{ fontSize:16, color:'var(--mint-text2)', textAlign:'center', marginBottom:4, lineHeight:1.7, flexShrink:0 }}>
                    วาดรูปนาฬิกาบอกเวลา <strong style={{ color:MOCA_COLOR }}>11:10 น.</strong>
                  </p>
                  <p style={{ fontSize:11, color:'var(--mint-muted)', textAlign:'center', marginBottom:8, flexShrink:0 }}>
                    วาดหน้าปัด ตัวเลข และเข็มนาฬิกาทั้งหมด · เกณฑ์: รูปร่าง(1) + ตัวเลข(1) + เข็ม(1)
                  </p>
                  <DrawingCanvas
                    fillContainer
                    maxScore={3}
                    labels={[
                      {s:0, icon:'✗', label:'ไม่ถูกต้อง'},
                      {s:1, icon:'△', label:'รูปร่างถูก'},
                      {s:2, icon:'✓', label:'รูปร่าง+เลข'},
                      {s:3, icon:'✓✓✓', label:'สมบูรณ์'},
                    ]}
                    onScoreSelect={(s) => {
                      if (s === 3) { setClockContour(1); setClockNumbers(1); setClockHands(1); }
                      else if (s === 2) { setClockContour(1); setClockNumbers(1); setClockHands(0); }
                      else if (s === 1) { setClockContour(1); setClockNumbers(0); setClockHands(0); }
                      else { setClockContour(0); setClockNumbers(0); setClockHands(0); }
                      setFullscreen(null);
                    }}
                  />
                </div>
              )}

            </div>
          </div>
        )}

        {/* ═══ 1. VISUOSPATIAL / EXECUTIVE (/5) ═══ */}
        <Section num="1" title="ด้านมิติสัมพันธ์/บริหารจัดการ (Visuospatial/Executive)" max={5} score={visuoScore} color={MOCA_COLOR}>

          {/* 1a. Trail Making */}
          <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:600 }}>1a. ลากเส้นเชื่อมตัวเลขและตัวอักษรสลับกัน</p>
              {trailScore === null ? (
                <button onClick={() => setFullscreen('trail')} style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, background:MOCA_BG, border:'1.5px solid #c4b5fd', color:MOCA_COLOR, cursor:'pointer', flexShrink:0 }}>
                  🖥️ เริ่มทำ
                </button>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:13, fontWeight:800, color: trailScore === 1 ? '#10b981' : '#ef4444' }}>
                    {trailScore === 1 ? '✓ 1/1' : '✗ 0/1'}
                  </span>
                  <button onClick={() => { setTrailScore(null); setFullscreen('trail'); }} style={{ fontSize:11, color:'var(--mint-muted)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>ทำใหม่</button>
                </div>
              )}
            </div>
            {trailScore === null && (
              <p style={{ fontSize:11, color:'var(--mint-muted)' }}>กดปุ่ม "เริ่มทำ" เพื่อเปิดแบบทดสอบเต็มจอ</p>
            )}
          </div>

          {/* 1b. Cube Copy */}
          <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:600 }}>1b. คัดลอกรูปลูกบาศก์</p>
              {cubeScore === null ? (
                <button onClick={() => setFullscreen('cube')} style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, background:MOCA_BG, border:'1.5px solid #c4b5fd', color:MOCA_COLOR, cursor:'pointer', flexShrink:0 }}>
                  🖥️ เริ่มทำ
                </button>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:13, fontWeight:800, color: cubeScore === 1 ? '#10b981' : '#ef4444' }}>
                    {cubeScore === 1 ? '✓ 1/1' : '✗ 0/1'}
                  </span>
                  <button onClick={() => { setCubeScore(null); setFullscreen('cube'); }} style={{ fontSize:11, color:'var(--mint-muted)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>ทำใหม่</button>
                </div>
              )}
            </div>
            {cubeScore === null && (
              <p style={{ fontSize:11, color:'var(--mint-muted)' }}>กดปุ่ม "เริ่มทำ" เพื่อเปิดแบบทดสอบเต็มจอ</p>
            )}
          </div>

          {/* 1c. Clock Drawing */}
          <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:600 }}>1c. วาดนาฬิกาบอกเวลา 11:10 น. (3 คะแนน)</p>
              {clockContour === null ? (
                <button onClick={() => setFullscreen('clock')} style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, background:MOCA_BG, border:'1.5px solid #c4b5fd', color:MOCA_COLOR, cursor:'pointer', flexShrink:0 }}>
                  🖥️ เริ่มทำ
                </button>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color: clockContour ? '#10b981' : '#ef4444' }}>รูปร่าง:{clockContour}/1</span>
                    <span style={{ fontSize:11, fontWeight:700, color: clockNumbers ? '#10b981' : '#ef4444' }}>ตัวเลข:{clockNumbers}/1</span>
                    <span style={{ fontSize:11, fontWeight:700, color: clockHands ? '#10b981' : '#ef4444' }}>เข็ม:{clockHands}/1</span>
                  </div>
                  <button onClick={() => { setClockContour(null); setClockNumbers(null); setClockHands(null); setFullscreen('clock'); }} style={{ fontSize:11, color:'var(--mint-muted)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>ทำใหม่</button>
                </div>
              )}
            </div>
            {clockContour === null && (
              <p style={{ fontSize:11, color:'var(--mint-muted)' }}>กดปุ่ม "เริ่มทำ" เพื่อเปิดแบบทดสอบเต็มจอ</p>
            )}
          </div>
        </Section>

        {/* ═══ 2. NAMING (/3) ═══ */}
        <Section num="2" title="การเรียกชื่อ (Naming)" max={3} score={namingScore} color={MOCA_COLOR}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:12 }}>ถามว่า "สัตว์นี้คืออะไร?"</p>
          {[
            { img: lionImg },
            { img: rhinoImg },
            { img: camelImg },
          ].map((animal, i) => (
            <div key={i} style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'14px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                <img src={animal.img} alt={`สัตว์ที่ ${i+1}`} style={{ width:'100%', maxWidth:320, borderRadius:16, border:'1.5px solid var(--mint-border)', boxShadow:'var(--shadow-md)', display:'block' }} />
              </div>
              <p style={{ fontSize:14, color:'var(--mint-text2)', fontWeight:600, textAlign:'center', marginBottom:8 }}>{i+1}. สัตว์นี้คืออะไร?</p>
              <YN val={naming[i]} onChange={v=>setNam(i,v)} yL="ตอบถูก" nL="ตอบผิด" />
            </div>
          ))}
        </Section>

        {/* ═══ 3. MEMORY (Registration — no score, just instruction) ═══ */}
        <div style={{ background:'white',border:`1.5px solid ${MOCA_COLOR}33`,borderRadius:20,padding:'22px 18px',boxShadow:'var(--shadow-sm)',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',left:0,top:14,bottom:14,width:4,borderRadius:'0 3px 3px 0',background:MOCA_COLOR }} />
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
            <div style={{ width:30,height:30,borderRadius:9,background:`${MOCA_COLOR}18`,border:`1.5px solid ${MOCA_COLOR}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:MOCA_COLOR,flexShrink:0 }}>
              📝
            </div>
            <h2 style={{ flex:1,fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>ความจำ (Memory) — ลงทะเบียนคำ</h2>
            <span style={{ fontSize:11,fontWeight:700,color:'var(--mint-muted)',background:'var(--mint-surface2)',border:'1px solid var(--mint-border)',borderRadius:20,padding:'2px 10px' }}>
              ไม่มีคะแนน
            </span>
          </div>
          <div style={{ background:MOCA_BG,border:'1px solid #c4b5fd',borderRadius:14,padding:16,marginBottom:10 }}>
            <p style={{ fontSize:13,color:'var(--mint-text2)',fontStyle:'italic',textAlign:'center',lineHeight:1.7,marginBottom:14 }}>
              "อ่านชุดคำเหล่านี้แล้วให้ผู้ทดสอบพูดตาม ทวนซ้ำ 2 ครั้ง แล้วถามซ้ำอีกครั้งหลัง 5 นาที"
            </p>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6 }}>
              {WORD_SETS[0].map(w => (
                <div key={w} style={{ background:'white',border:'1.5px solid #c4b5fd',borderRadius:10,padding:'10px 4px',textAlign:'center',fontWeight:800,fontSize:13,color:MOCA_COLOR,boxShadow:'var(--shadow-sm)' }}>{w}</div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:11,color:'var(--mint-muted)',textAlign:'center' }}>ส่วนนี้ไม่มีคะแนน — จะทดสอบการจำในหมวด Delayed Recall ด้านล่าง</p>
        </div>

        {/* ═══ 4. ATTENTION (/6) ═══ */}
        <Section num="4" title="ความสนใจ (Attention)" max={6} score={attentionScore} color={MOCA_COLOR}>
          {/* Digit Forward */}
          <SubQ label="4a. ทวนตัวเลขตามลำดับ: 2 1 8 5 4" val={digitForward} onChange={setDigitForward} yL="ถูก (1)" nL="ผิด (0)" />

          {/* Digit Backward */}
          <SubQ label="4b. ทวนตัวเลขย้อนกลับ: 7 4 2" val={digitBackward} onChange={setDigitBackward} yL="ถูก (1)" nL="ผิด (0)" />

          {/* Vigilance / Tapping */}
          <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px',marginBottom:8 }}>
            <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:4 }}>4c. อ่านตัวเลขต่อไปนี้ เคาะโต๊ะเมื่อได้ยินเลข "1"</p>
            <div style={{ padding:'10px 14px',background:MOCA_BG,border:'1px solid #c4b5fd',borderRadius:10,marginBottom:8 }}>
              <p style={{ fontSize:13,color:'#6d28d9',textAlign:'center',fontWeight:600,letterSpacing:'0.15em' }}>
                5 2 1 3 9 4 1 1 8 0 6 2 1 5 1 9 4 5 1 1 1 4 1 9 0 5 1 1 2
              </p>
            </div>
            <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:4 }}>ให้ 1 คะแนน ถ้าผิดไม่เกิน 2 ครั้ง (ไม่เคาะเลข 1 หรือเคาะเลขอื่น)</p>
            <YN val={tapScore} onChange={setTapScore} yL="ผ่าน (1)" nL="ไม่ผ่าน (0)" />
          </div>

          {/* Serial 7 */}
          <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
            <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:4 }}>4d. เริ่มจาก 100 ลบไปเรื่อยๆ ทีละ 7</p>
            <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:8 }}>เฉลย: 93, 86, 79, 72, 65 — ให้คะแนนตามจำนวนคำตอบที่ถูก</p>
            <div style={{ display:'flex',gap:8,marginBottom:6 }}>
              {['93','86','79','72','65'].map((n,i) => (
                <div key={n} style={{ flex:1,textAlign:'center',padding:'8px 4px',background:'white',border:'1px solid var(--mint-border2)',borderRadius:8 }}>
                  <p style={{ fontSize:14,fontWeight:700,color:MOCA_COLOR }}>{n}</p>
                  <p style={{ fontSize:9,color:'var(--mint-muted)' }}>ครั้งที่ {i+1}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize:12,color:'var(--mint-text2)',marginBottom:8,fontWeight:600 }}>ตอบถูกกี่ครั้ง? (4–5 ครั้ง = 3 คะแนน, 2–3 = 2 คะแนน, 1 = 1 คะแนน, 0 = 0)</p>
            <div style={{ display:'flex',gap:6 }}>
              {[0,1,2,3].map(n=>(
                <button key={n} onClick={()=>setSerialScore(n)} style={{
                  flex:1,padding:'12px 4px',borderRadius:10,fontSize:14,fontWeight:700,
                  border:'1.5px solid',cursor:'pointer',transition:'all 0.18s',
                  background:serialScore===n?MOCA_BG:'var(--mint-surface2)',
                  borderColor:serialScore===n?MOCA_COLOR:'var(--mint-border)',
                  color:serialScore===n?MOCA_COLOR:'var(--mint-muted)',
                }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ 5. LANGUAGE (/3) ═══ */}
        <Section num="5" title="ภาษา (Language)" max={3} score={languageScore} color={MOCA_COLOR}>
          <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px',marginBottom:8 }}>
            <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:4 }}>5a. พูดตามประโยคที่ 1</p>
            <div style={{ padding:'10px 14px',background:MOCA_BG,border:'1px solid #c4b5fd',borderRadius:10,marginBottom:8 }}>
              <p style={{ fontSize:13,color:'#6d28d9',fontStyle:'italic',textAlign:'center' }}>"ฉันรู้ว่าจอมเป็นคนเดียวที่มาช่วยงานวันนี้"</p>
            </div>
            <YN val={repeat1} onChange={setRepeat1} yL="ถูก (1)" nL="ผิด (0)" />
          </div>

          <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px',marginBottom:8 }}>
            <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:4 }}>5b. พูดตามประโยคที่ 2</p>
            <div style={{ padding:'10px 14px',background:MOCA_BG,border:'1px solid #c4b5fd',borderRadius:10,marginBottom:8 }}>
              <p style={{ fontSize:13,color:'#6d28d9',fontStyle:'italic',textAlign:'center' }}>"แมวมักซ่อนตัวอยู่หลังเก้าอี้เมื่อมีหมาอยู่ในห้อง"</p>
            </div>
            <YN val={repeat2} onChange={setRepeat2} yL="ถูก (1)" nL="ผิด (0)" />
          </div>

          <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
            <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:4 }}>5c. ความคล่อง — บอกคำที่ขึ้นต้นด้วยตัว "น" ให้มากที่สุดใน 1 นาที</p>
            <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:8 }}>ให้ 1 คะแนน ถ้าบอกได้ ≥ 11 คำ (N ≥ 11)</p>
            <YN val={fluency} onChange={setFluency} yL="≥ 11 คำ (1)" nL="< 11 คำ (0)" />
          </div>
        </Section>

        {/* ═══ 6. ABSTRACTION (/2) ═══ */}
        <Section num="6" title="ความคิดเชิงนามธรรม (Abstraction)" max={2} score={abstractionScore} color={MOCA_COLOR}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:8 }}>บอกความเหมือนระหว่าง 2 สิ่ง เช่น กล้วย-ส้ม = เป็นผลไม้</p>
          <SubQ label="6a. รถไฟ กับ จักรยาน เหมือนกันอย่างไร? (เป็นยานพาหนะ)" val={abstract1} onChange={setAbstract1} yL="ตอบได้" nL="ตอบไม่ได้" />
          <SubQ label="6b. นาฬิกา กับ ไม้บรรทัด เหมือนกันอย่างไร? (เป็นเครื่องมือวัด)" val={abstract2} onChange={setAbstract2} yL="ตอบได้" nL="ตอบไม่ได้" />
        </Section>

        {/* ═══ 7. DELAYED RECALL (/5) ═══ */}
        <Section num="7" title="การระลึก (Delayed Recall)" max={5} score={recallScore} color={MOCA_COLOR}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:8 }}>ให้ทวนชุดคำที่จำจากก่อนหน้า (โดยไม่มีการให้ตัวช่วย)</p>
          <div style={{ display:'flex',gap:6,marginBottom:14,padding:'8px 12px',background:MOCA_BG,border:'1px solid #c4b5fd',borderRadius:10 }}>
            <span style={{ fontSize:11,color:MOCA_COLOR,fontWeight:700 }}>คำเฉลย:</span>
            {WORD_SETS[0].map(w=>(
              <span key={w} style={{ fontSize:11,color:'var(--mint-text)',fontWeight:800 }}>{w}</span>
            ))}
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {WORD_SETS[0].map((word, i) => (
              <div key={word} style={{
                background: recall[i]===1 ? MOCA_BG : recall[i]===0 ? '#fff1f1' : 'var(--mint-surface2)',
                border:`1.5px solid ${recall[i]===1 ? MOCA_COLOR : recall[i]===0 ? '#fca5a5' : 'var(--mint-border2)'}`,
                borderRadius:12, padding:'12px 14px', transition:'all 0.2s',
              }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:10 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{
                      width:28,height:28,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',
                      background:recall[i]===1?MOCA_COLOR:recall[i]===0?'#ef4444':'var(--mint-border2)',
                      fontSize:14,color:'white',fontWeight:700,
                    }}>
                      {recall[i]===1?'✓':recall[i]===0?'✗':<span style={{fontSize:10,color:'var(--mint-muted)'}}>{i+1}</span>}
                    </span>
                    <span style={{ fontSize:15,fontWeight:800,color:recall[i]===1?MOCA_COLOR:recall[i]===0?'#ef4444':'var(--mint-text)' }}>
                      {word}
                    </span>
                  </div>
                  <div style={{ display:'flex',gap:6 }}>
                    <button onClick={()=>setRec(i,1)} style={{
                      padding:'7px 14px',borderRadius:9,fontSize:12,fontWeight:700,
                      border:`1.5px solid ${recall[i]===1?MOCA_COLOR:'var(--mint-border)'}`,
                      background:recall[i]===1?MOCA_COLOR:'white',
                      color:recall[i]===1?'white':'var(--mint-muted)',cursor:'pointer',
                    }}>จำได้</button>
                    <button onClick={()=>setRec(i,0)} style={{
                      padding:'7px 14px',borderRadius:9,fontSize:12,fontWeight:700,
                      border:`1.5px solid ${recall[i]===0?'#fca5a5':'var(--mint-border)'}`,
                      background:recall[i]===0?'#ef4444':'white',
                      color:recall[i]===0?'white':'var(--mint-muted)',cursor:'pointer',
                    }}>ลืม</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12,padding:'10px 14px',background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span style={{ fontSize:13,color:'var(--mint-text2)' }}>ระลึกได้ทั้งหมด</span>
            <span style={{ fontSize:16,fontWeight:800,color:MOCA_COLOR }}>{recallScore}/5 คำ</span>
          </div>
        </Section>

        {/* ═══ 8. ORIENTATION (/6) ═══ */}
        <Section num="8" title="การรับรู้สภาพแวดล้อม (Orientation)" max={6} score={orientationScore} color={MOCA_COLOR}>
          <SubQ label="วันที่ (date)" val={oriDate} onChange={setOriDate} yL="ถูก" nL="ผิด" />
          <SubQ label="เดือน (month)" val={oriMonth} onChange={setOriMonth} yL="ถูก" nL="ผิด" />
          <SubQ label="ปี (year)" val={oriYear} onChange={setOriYear} yL="ถูก" nL="ผิด" />
          <SubQ label="วัน (day of week)" val={oriDay} onChange={setOriDay} yL="ถูก" nL="ผิด" />
          <SubQ label="สถานที่ (place)" val={oriPlace} onChange={setOriPlace} yL="ถูก" nL="ผิด" />
          <SubQ label="จังหวัด (city/province)" val={oriCity} onChange={setOriCity} yL="ถูก" nL="ผิด" />
        </Section>

        {/* ═══ EDUCATION BONUS ═══ */}
        <div style={{ background:'white',border:'1.5px solid #fcd34d',borderRadius:20,padding:'18px 16px',boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:20 }}>📚</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>ระดับการศึกษา ≤ 6 ปี?</p>
              <p style={{ fontSize:11,color:'var(--mint-muted)' }}>เพิ่ม 1 คะแนน (สูงสุดไม่เกิน 30)</p>
            </div>
            <button onClick={()=>setEduBonus(!eduBonus)} style={{
              padding:'10px 18px',borderRadius:10,fontSize:13,fontWeight:700,
              border:`1.5px solid ${eduBonus?'#f59e0b':'var(--mint-border)'}`,
              background:eduBonus?'#fef9c3':'var(--mint-surface2)',
              color:eduBonus?'#92400e':'var(--mint-muted)',
              cursor:'pointer',transition:'all 0.18s',
            }}>
              {eduBonus?'✓ เพิ่มแล้ว (+1)':'ไม่เพิ่ม'}
            </button>
          </div>
        </div>

        {/* ═══ SUBMIT ═══ */}
        <div style={{ background:'white',border:`1.5px solid ${MOCA_COLOR}44`,borderRadius:20,padding:'20px 16px',boxShadow:'var(--shadow-md)' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
            <span style={{ fontSize:15,fontWeight:700,color:'var(--mint-text)' }}>คะแนนรวมทั้งหมด</span>
            <span style={{ fontSize:28,fontWeight:800,color:total>=25?MOCA_COLOR:'var(--mint-warn)' }}>
              {total}<span style={{ fontSize:14,color:'var(--mint-muted)',fontWeight:400 }}>/30</span>
            </span>
          </div>
          <div style={{ height:8,borderRadius:4,background:'var(--mint-border2)',overflow:'hidden',marginBottom:12 }}>
            <div style={{ height:'100%',borderRadius:4,background:`linear-gradient(90deg,${total>=25?'#8b5cf6,#a78bfa':'var(--mint-warn),#fcd34d'})`,width:`${(total/30)*100}%`,transition:'width 0.5s ease' }}/>
          </div>
          <p style={{ fontSize:11,color:'var(--mint-muted)',textAlign:'center',marginBottom:16 }}>
            ค่าปกติ ≥ 25/30 {eduBonus ? '(รวมคะแนนเพิ่มจากการศึกษาแล้ว)' : ''}
          </p>
          <ActionBtn onClick={handleFinish} variant="primary">ดูผลการประเมิน →</ActionBtn>
          <div style={{ height:8 }}/>
          <ActionBtn onClick={onBack} variant="outline">← กลับหน้าหลัก</ActionBtn>
        </div>

        <p style={{ textAlign:'center',fontSize:11,color:'var(--mint-muted)',paddingBottom:20 }}>
          MoCA © Z. Nasreddine MD · www.mocatest.org<br/>
          แปลโดย Solaphat Hemrungrojn MD · Trial version 01
        </p>
      </div>
    </div>
  );
}