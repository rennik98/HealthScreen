import { useSyncExternalStore, useCallback } from 'react';

/**
 * ติดตาม media query จาก JS — จำเป็นเพราะทั้งแอปจัดสไตล์ด้วย inline style
 * ซึ่งเขียน @media ไม่ได้ ใช้กับการสลับเลย์เอาต์ (เช่น แท็บบนจอใหญ่ vs แถบล่างบนมือถือ)
 *
 * ใช้ useSyncExternalStore เพราะ matchMedia เป็นสถานะนอก React
 * (เขียนแบบ useState + useEffect จะได้เฟรมแรกที่ค่าผิดก่อนแล้วค่อยรีเรนเดอร์)
 */
export function useMediaQuery(query) {
  const subscribe = useCallback((onChange) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,          // ค่าฝั่งเซิร์ฟเวอร์: ถือว่าไม่ใช่จอเล็ก
  );
}

/** จอเล็กกว่านี้ถือว่าใช้นิ้วกด — วางเมนูไว้ล่างให้นิ้วโป้งถึง */
export const useIsCompact = () => useMediaQuery('(max-width: 767px)');
