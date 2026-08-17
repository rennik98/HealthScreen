import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CategoryIcon } from './shared/icons';
import { text, radius, shadow, ui, palette } from './shared/theme';
import { useIsCompact } from './shared/useMediaQuery';

/*
 * แท็บ "เกณฑ์" — เดิมเป็นหน้ายาวหน้าเดียวไล่ 14 หัวข้อรวด บนมือถือต้องเลื่อนนานมาก
 * กว่าจะถึงเกณฑ์ที่ต้องการ รอบนี้แบ่งเป็นกลุ่มพับเก็บได้ พร้อมแถบชิปกระโดดข้ามกลุ่ม
 * เนื้อหาเกณฑ์ทั้งหมดยกมาจากเดิมทั้งชุด ไม่ได้แก้ตัวเลขหรือข้อความใด ๆ
 */

const CriteriaBlock = ({ title, color, children }) => (
  <div style={{ background: 'white', border: `1px solid ${color}2e`, borderRadius: radius.lg, padding: '18px 16px', boxShadow: shadow.sm, marginBottom: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 4, height: 22, borderRadius: 2, background: color, flexShrink: 0 }} />
      <h3 style={{ ...text.h3, color }}>{title}</h3>
    </div>
    {children}
  </div>
);

const ScoreRow = ({ label, val, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '11px 14px', background: ui.surface2, border: `1px solid ${ui.border2}`, borderRadius: radius.sm }}>
    <span style={{ ...text.small, color: ui.text2 }}>{label}</span>
    <span style={{ ...text.small, fontWeight: 800, color, textAlign: 'right' }}>{val}</span>
  </div>
);

const WarnBadge = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '11px 14px', background: ui.warnBg, border: '1px solid #f3d19a', borderRadius: radius.sm, marginTop: 12 }}>
    <span style={{ fontSize: 15, lineHeight: 1.4 }}>⚠️</span>
    <p style={{ ...text.small, color: ui.warn }}>{children}</p>
  </div>
);

const GROUPS = [
  {
    id: 'cog', short: 'สมรรถภาพสมอง', title: 'สมรรถภาพสมอง (Cognitive Function)', pal: palette.teal,
    body: (
      <>
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
      </>
    ),
  },
  {
    id: 'nut', short: 'โภชนาการ', title: 'โภชนาการและมวลกล้ามเนื้อ', pal: palette.amber,
    body: (
      <>
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

            <CriteriaBlock title="มวลกล้ามเนื้อ (Modified MSRA-5)" color="#d97706">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                ประเมินความเสี่ยงมวลกล้ามเนื้อ (Sarcopenia) จำนวน 5 ข้อ (ตอบ "ไม่ใช่" = 1 คะแนน, ตอบ "ใช่" = 0 คะแนน)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="4 - 5 คะแนน" val="มวลกล้ามเนื้อปกติ" color="#d97706" />
                <ScoreRow label="≤ 3 คะแนน" val="เสี่ยงภาวะมวลกล้ามเนื้อน้อย" color="#dc2626" />
              </div>
            </CriteriaBlock>
      </>
    ),
  },
  {
    id: 'fun', short: 'สมรรถนะการดูแล', title: 'สมรรถนะผู้สูงอายุเพื่อการดูแล', pal: palette.indigo,
    body: (
      <>
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

            <CriteriaBlock title="ภาวะพึ่งพิง (TAI: Typology of Aged with Illustration)" color="#4f46e5">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 8 }}>
                ประเมินความสามารถในการทำกิจกรรม 4 ด้าน ได้แก่ <strong>การเคลื่อนที่ (Motility), สุขภาพจิตและสติปัญญา (Mental), การกินอาหาร (Feeding)</strong> และ <strong>การใช้ห้องน้ำ (Toilet)</strong> แต่ละด้านแบ่งเป็น 6 ระดับ (0 = ทำได้น้อยที่สุด ถึง 5 = ทำได้มากที่สุด) <strong>คะแนนรวม 0 - 20 คะแนน</strong>
              </p>
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.7, marginBottom: 14 }}>
                การแปลผล<strong>ไม่ได้ใช้คะแนนรวม</strong> แต่ใช้การจัดกลุ่มเป็น 3 กลุ่มใหญ่ 9 กลุ่มย่อย ดังนี้
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 14 }}>
                <ScoreRow label="B5 (เคลื่อนที่ได้ ไม่สับสน)" val="มีความผิดปกติน้อยมากหรือปกติ" color="#4f46e5" />
                <ScoreRow label="B4 (เคลื่อนที่ได้ ไม่สับสน)" val="มีปัญหาการกินและการขับถ่ายเล็กน้อย" color="#4f46e5" />
                <ScoreRow label="B3 (เคลื่อนที่ได้ ไม่สับสน)" val="มีปัญหาการกินและการขับถ่ายอย่างมาก" color="#b45309" />
                <ScoreRow label="C4 (เคลื่อนที่ได้ แต่สับสน)" val="มีปัญหาสุขภาพจิต การกินและการขับถ่ายเล็กน้อย" color="#b45309" />
                <ScoreRow label="C3 (เคลื่อนที่ได้ แต่สับสน)" val="มีปัญหาสุขภาพจิต การกิน และการขับถ่าย" color="#dc2626" />
                <ScoreRow label="C2 (เคลื่อนที่ได้ แต่สับสน)" val="มีปัญหาสุขภาพจิต การกิน และการขับถ่าย อย่างมาก" color="#dc2626" />
                <ScoreRow label="I3 (ติดเตียง)" val="มีปัญหาการเคลื่อนที่" color="#b45309" />
                <ScoreRow label="I2 (ติดเตียง)" val="มีปัญหาการเคลื่อนที่และการกินอาหาร" color="#dc2626" />
                <ScoreRow label="I1 (ติดเตียง)" val="มีปัญหาการเคลื่อนที่และการกินอาหารอย่างมาก" color="#991b1b" />
              </div>
              <WarnBadge>กลุ่มภาวะพึ่งพิง สปสช.: B3 = กลุ่ม 1 · C2 - C4 = กลุ่ม 2 · I3 = กลุ่ม 3 · I1 - I2 = กลุ่ม 4 (B4 - B5 ไม่เข้าเกณฑ์ภาวะพึ่งพิง)</WarnBadge>
            </CriteriaBlock>
      </>
    ),
  },
  {
    id: 'gen', short: 'สุขภาพทั่วไป', title: 'สุขภาพทั่วไป และ กลุ่มอาการผู้สูงอายุ', pal: palette.cyan,
    body: (
      <>
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
      </>
    ),
  },
  {
    id: 'men', short: 'สุขภาพจิต', title: 'สุขภาพจิต (Mental Health)', pal: palette.rose,
    body: (
      <>
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
      </>
    ),
  },
];


export default function CriteriaPage() {
  const isCompact = useIsCompact();
  // บนมือถือเปิดกลุ่มแรกไว้กลุ่มเดียว จอใหญ่พื้นที่พอ เปิดทั้งหมดเลย
  const [open, setOpen] = useState(() => (isCompact ? { cog: true } : Object.fromEntries(GROUPS.map(g => [g.id, true]))));
  const toggle = (id) => setOpen(o => ({ ...o, [id]: !o[id] }));

  const jump = (id) => {
    setOpen(o => ({ ...o, [id]: true }));
    requestAnimationFrame(() => document.getElementById(`crit-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }} className="fade-up">
      <div style={{ marginBottom: 16, textAlign: isCompact ? 'left' : 'center' }}>
        <h2 style={{ ...text.h1, color: ui.text }}>เกณฑ์การประเมินและแปลผล</h2>
        <p style={{ ...text.small, color: ui.muted, marginTop: 6 }}>
          อ้างอิงคู่มือการคัดกรองและประเมินสุขภาพผู้สูงอายุ พ.ศ. 2564 · กรมการแพทย์ กระทรวงสาธารณสุข
        </p>
      </div>

      {/* แถบชิปกระโดดข้ามกลุ่ม — เลื่อนแนวนอนได้บนจอแคบ */}
      <div className="no-print" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 6, WebkitOverflowScrolling: 'touch' }}>
        {GROUPS.map(g => (
          <button key={g.id} onClick={() => jump(g.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '8px 13px', borderRadius: radius.pill, cursor: 'pointer',
            background: g.pal.tint, border: `1px solid ${g.pal.line}`, color: g.pal.deep,
            ...text.small, fontWeight: 700, minHeight: 40,
          }}>
            <CategoryIcon id={g.id} size={16} strokeWidth={2} />{g.short}
          </button>
        ))}
      </div>

      {GROUPS.map(g => (
        <section key={g.id} id={`crit-${g.id}`} style={{ marginBottom: 14, scrollMarginTop: 72 }}>
          <button onClick={() => toggle(g.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            background: g.pal.tint, border: `1px solid ${g.pal.line}`, borderRadius: radius.lg,
            padding: '14px 16px', marginBottom: open[g.id] ? 12 : 0, textAlign: 'left', minHeight: 56,
          }}>
            <CategoryIcon id={g.id} size={22} strokeWidth={1.9} style={{ color: g.pal.base, flexShrink: 0 }} />
            <h3 style={{ ...text.h3, color: g.pal.deep, flex: 1, minWidth: 0 }}>{g.title}</h3>
            <ChevronDown size={20} strokeWidth={2.2} style={{ color: g.pal.base, flexShrink: 0, transition: 'transform 0.2s', transform: open[g.id] ? 'rotate(180deg)' : 'none' }} />
          </button>
          {open[g.id] && g.body}
        </section>
      ))}
    </div>
  );
}
