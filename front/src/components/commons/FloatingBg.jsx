import { useEffect, useMemo, useRef } from "react";

export default function FloatingBg({
    images = [],
    count = 1,
    unique = false,
    speedMin = 6,
    speedMax = 15,
    scaleMin = 0.5,
    scaleMax = 1,
    opacity = 0.5,
    zIndex = -1,
    blurByDepth = true,
    distribute = "grid",
    margin = 130,
    outwardBias = 0.3,
    itemWidth = 90,
    itemHeight = 90,
    subtle = true,
}) {
  const wrapRef = useRef(null);
  const itemsRef = useRef([]);
  const stateRef = useRef([]);
  const effectiveCount = unique ? Math.min(count, images.length) : count;

  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || images.length === 0) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const cx = w / 2, cy = h / 2;

    // grid 배치 + 랜덤 지터
    const positions = (() => {
      if (distribute === "random") {
        return seeds.map(() => ({
          x: margin + Math.random() * Math.max(0, w - margin * 4),
          y: margin + Math.random() * Math.max(0, h - margin * 4),
        }));
      }
      // grid 배치
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const cellW = Math.max(1, (w - margin * 2) / cols);
      const cellH = Math.max(1, (h - margin * 2) / rows);

      return seeds.map((i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const jitterX = (Math.random() - 0.5) * cellW * 0.4; // ±20%
        const jitterY = (Math.random() - 0.5) * cellH * 0.4; // ±20%
        const x = margin + col * cellW + cellW / 2 + jitterX;
        const y = margin + row * cellH + cellH / 2 + jitterY;
        return { x, y };
      });
    })();

    // 초기 상태
    stateRef.current = seeds.map((i) => {
      const imgIdx = unique ? i : Math.floor(Math.random() * images.length);
      const s = scaleMin + Math.random() * (scaleMax - scaleMin);

      // 무작위 방향
      const randAngle = Math.random() * Math.PI * 2;
      let rvx = Math.cos(randAngle);
      let rvy = Math.sin(randAngle);

      // 바깥쪽(센터 → 위치) 방향
      const dx = positions[i].x - cx;
      const dy = positions[i].y - cy;
      const dn = Math.hypot(dx, dy) || 1;
      const ovx = dx / dn;
      const ovy = dy / dn;

      // 혼합(무작위:바깥 = 1-outwardBias : outwardBias)
      const mix = outwardBias;
      let vxDir = (1 - mix) * rvx + mix * ovx;
      let vyDir = (1 - mix) * rvy + mix * ovy;
      const n = Math.hypot(vxDir, vyDir) || 1;
      vxDir /= n; vyDir /= n;

      const v = speedMin + Math.random() * (speedMax - speedMin);

      return {
        imgIdx,
        x: positions[i].x,
        y: positions[i].y,
        vx: vxDir * v,
        vy: vyDir * v,
        s,
        r: (Math.random() * 2 - 1) * 10, // 회전 속도(도/초)
        rot: Math.random() * 360,
        depth: s,
      };
    });

    // 리사이즈
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let rafId;
    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      stateRef.current.forEach((o, i) => {
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        o.rot += o.r * dt;

        // 화면 래핑(사방으로 퍼지며 순환)
        const pad = 100;
        if (o.x < -pad) o.x = w + pad;
        if (o.x > w + pad) o.x = -pad;
        if (o.y < -pad) o.y = h + pad;
        if (o.y > h + pad) o.y = -pad;

        const el = itemsRef.current[i];
        if (!el) return;
        el.style.transform = `translate3d(${o.x}px, ${o.y}px, 0) rotate(${o.rot}deg) scale(${o.s})`;
        if (blurByDepth) el.style.filter = `blur(${(1.4 - o.depth) * 2}px)`;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [
    images,
    seeds,
    scaleMin,
    scaleMax,
    speedMin,
    speedMax,
    blurByDepth,
    distribute,
    margin,
    outwardBias,
    itemWidth,
    itemHeight,
  ]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex,
        pointerEvents: "none",
        background:
          "radial-gradient(1200px 600px at 70% -10%, rgba(255,90,90,.06), transparent 60%)",
      }}
    >
      {seeds.map((i) => (
        <img
          key={i}
          ref={(el) => (itemsRef.current[i] = el)}
          src={images[i % images.length]}
          alt=""
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: itemWidth,
            height: itemHeight,
            objectFit: "contain",
            opacity,
            transform: "translate3d(-9999px,-9999px,0)",
            willChange: "transform",
            mixBlendMode: "normal",
          }}
        />
      ))}
    </div>
  );
}
