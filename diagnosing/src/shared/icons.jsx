/**
 * ไอคอนของหมวดหมู่และแบบทดสอบ
 *
 * เดิมใช้ emoji ซึ่งเรนเดอร์ไม่เหมือนกันข้ามเครื่อง (Android/iOS/Windows คนละชุด)
 * ปรับสีตามธีมไม่ได้ และดูไม่เข้ากับเครื่องมือทางคลินิก
 * เปลี่ยนเป็น lucide เพื่อให้เส้น น้ำหนัก และขนาดเท่ากันหมดทุกตัว
 */
import {
  Brain, Salad, Dumbbell, BedDouble, Leaf, Stethoscope, Smile, Eye, Bone,
  PersonStanding, HeartPulse, LifeBuoy, Accessibility, Zap, Puzzle, ClipboardList,
  Footprints, Activity,
} from 'lucide-react';

/** หมวดหมู่ 6 หมวดในหน้าแรก */
const CATEGORY_ICONS = {
  cog: Brain,
  nut: Salad,
  fun: BedDouble,
  gen: Stethoscope,
  syn: Footprints,
  men: HeartPulse,
};

/** แบบทดสอบรายชุด — key ตรงกับ quiz key ที่ใช้ route */
const TEST_ICONS = {
  minicog: Zap,
  tmse:    Brain,
  mmse:    Puzzle,
  moca:    ClipboardList,
  mna:     Salad,
  msra:    Dumbbell,
  adl:     BedDouble,
  frail:   Leaf,
  oral:    Smile,
  eye:     Eye,
  osta:    Bone,
  frax:    Bone,
  knee:    PersonStanding,
  fall:    Footprints,
  depress: HeartPulse,
  suicide: LifeBuoy,
  tai:     Accessibility,
};

/** ใช้เมื่อ key ไม่ตรงกับที่รู้จัก — ดีกว่าปล่อยให้ว่าง */
const FallbackIcon = Activity;

export function CategoryIcon({ id, ...props }) {
  const Icon = CATEGORY_ICONS[id] ?? FallbackIcon;
  return <Icon {...props} />;
}

export function TestIcon({ testKey, ...props }) {
  const Icon = TEST_ICONS[testKey] ?? FallbackIcon;
  return <Icon {...props} />;
}
