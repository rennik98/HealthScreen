import React, { useRef, useCallback, useEffect } from 'react';

const CONFIRMED_COLOR = '#0d9488';

export default function DrawingCanvas({ height = 400, onScoreSelect }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const drawing      = useRef(false);
  const strokesRef   = useRef([]);
  const currentRef   = useRef([]);
  const [confirmed, setConfirmed] = React.useState(false);
  const [isEmpty,   setIsEmpty]   = React.useState(true);

  const initSize = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    canvas.width  = container.clientWidth;
    canvas.height = height;
    redrawAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => {
    initSize();
    window.addEventListener('resize', initSize);
    return () => window.removeEventListener('resize', initSize);
  }, [initSize]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0f2b28';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    for (const stroke of strokesRef.current) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }, []);

  const getPos = (e, canvas) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    if (confirmed) return;
    e.preventDefault();
    drawing.current = true;
    currentRef.current = [];
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    currentRef.current.push(pos);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f2b28'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!drawing.current || confirmed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    currentRef.current.push(pos);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
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
    redrawAll();
    setIsEmpty(strokesRef.current.length === 0);
  };

  const handleClear = () => {
    strokesRef.current = [];
    currentRef.current = [];
    redrawAll();
    setIsEmpty(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div ref={containerRef} style={{ width: '100%', height, flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block', width: '100%', height: '100%',
            border: confirmed ? `2px solid ${CONFIRMED_COLOR}` : '2px dashed var(--mint-border)',
            borderRadius: 20, cursor: confirmed ? 'default' : 'crosshair',
            background: 'white', touchAction: 'none', opacity: confirmed ? 0.92 : 1,
            transition: 'border-color 0.2s, opacity 0.2s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
          }}
          onMouseDown={!confirmed ? startDraw : undefined}
          onMouseMove={!confirmed ? draw     : undefined}
          onMouseUp={!confirmed   ? stopDraw : undefined}
          onMouseLeave={!confirmed ? stopDraw : undefined}
          onTouchStart={!confirmed ? startDraw : undefined}
          onTouchMove={!confirmed  ? draw      : undefined}
          onTouchEnd={!confirmed   ? stopDraw  : undefined}
        />
      </div>

      {!confirmed ? (
        <div style={{ display: 'flex', gap: 12, marginTop: 4, flexShrink: 0 }}>
          <button onClick={handleUndo} disabled={isEmpty} style={{ flex: 1, padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 700, background: isEmpty ? '#f1f5f9' : 'white', border: '2px solid #e2e8f0', color: isEmpty ? '#94a3b8' : '#334155', cursor: isEmpty ? 'not-allowed' : 'pointer', transition: 'all 0.18s' }}>↩ ย้อนกลับ</button>
          <button onClick={handleClear} disabled={isEmpty} style={{ flex: 1, padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 700, background: isEmpty ? '#f1f5f9' : 'white', border: '2px solid #e2e8f0', color: isEmpty ? '#94a3b8' : '#334155', cursor: isEmpty ? 'not-allowed' : 'pointer', transition: 'all 0.18s' }}>🗑️ ล้างใหม่</button>
          <button onClick={() => setConfirmed(true)} disabled={isEmpty} style={{ flex: 2, padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 700, background: isEmpty ? '#94a3b8' : '#0f766e', color: 'white', border: 'none', cursor: isEmpty ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: isEmpty ? 'none' : '0 4px 12px rgba(15,118,110,0.3)' }}>ยืนยันผล ✓</button>
        </div>
      ) : (
        <div style={{ background: 'white', padding: '16px', borderRadius: 20, border: `1px solid ${CONFIRMED_COLOR}44`, flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-text)', marginBottom: 12, textAlign: 'center' }}>ให้คะแนนผลงานนี้</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {[0, 1].map(n => (
              <button key={n} onClick={() => onScoreSelect(n)} style={{
                flex: 1, padding: '16px 8px', borderRadius: 16, fontSize: 18, fontWeight: 800,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: n === 1 ? '#f0fdfa' : '#fff1f1',
                border: `2px solid ${n === 1 ? CONFIRMED_COLOR : '#fca5a5'}`,
                color: n === 1 ? CONFIRMED_COLOR : '#dc2626',
                cursor: 'pointer', transition: 'all 0.18s',
              }}>
                <span style={{ fontSize: 28 }}>{n === 1 ? '✓' : '✗'}</span>
                <span>{n} คะแนน</span>
                <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>{n === 1 ? 'ทำได้ถูกต้อง' : 'ไม่ถูกต้อง'}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setConfirmed(false)} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--mint-surface2)', border: '1px solid var(--mint-border)', color: 'var(--mint-text2)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← แก้ไขผลงาน</button>
        </div>
      )}
    </div>
  );
}
