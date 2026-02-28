import { useState, useEffect, useRef, useCallback } from "react";

/* Placeholder cartoon character — replace src with your own */
const CHARACTER_IMG = null; // Set to URL string to replace placeholder
function CharacterPlaceholder({ size = 120, style = {} }) {
  if (CHARACTER_IMG) {
    return <img src={CHARACTER_IMG} alt="" style={{ width: size, height: size, objectFit: "contain", ...style }} />;
  }
  // SVG placeholder character silhouette
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 120 140" fill="none" style={style}>
      {/* glow */}
      <defs>
        <radialGradient id="charGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd232" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffd232" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd740" />
          <stop offset="100%" stopColor="#ff8f00" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="70" rx="55" ry="65" fill="url(#charGlow)" />
      {/* body */}
      <ellipse cx="60" cy="95" rx="28" ry="35" fill="url(#bodyGrad)" opacity="0.9" />
      {/* head */}
      <circle cx="60" cy="45" r="24" fill="url(#bodyGrad)" />
      {/* eyes */}
      <ellipse cx="52" cy="42" rx="4" ry="5" fill="#1a0a2e" />
      <ellipse cx="68" cy="42" rx="4" ry="5" fill="#1a0a2e" />
      <ellipse cx="53" cy="40.5" rx="1.5" ry="2" fill="white" />
      <ellipse cx="69" cy="40.5" rx="1.5" ry="2" fill="white" />
      {/* smile */}
      <path d="M50 52 Q60 62 70 52" stroke="#1a0a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* arms */}
      <path d="M32 85 Q20 75 15 65" stroke="url(#bodyGrad)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M88 85 Q100 75 105 65" stroke="url(#bodyGrad)" strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* hand wave */}
      <circle cx="12" cy="62" r="7" fill="#ffd740" />
      <circle cx="108" cy="62" r="7" fill="#ffd740" />
      {/* crown/hat */}
      <path d="M40 25 L45 12 L52 22 L60 8 L68 22 L75 12 L80 25 Z" fill="#ffd232" stroke="#ffab00" strokeWidth="1" />
      <rect x="40" y="24" width="40" height="6" rx="2" fill="#ffab00" />
      {/* belt */}
      <rect x="40" y="100" width="40" height="5" rx="2" fill="#ffab00" opacity="0.7" />
      {/* feet */}
      <ellipse cx="48" cy="128" rx="12" ry="6" fill="#ff8f00" />
      <ellipse cx="72" cy="128" rx="12" ry="6" fill="#ff8f00" />
      {/* sparkle */}
      
      
    </svg>
  );
}

const INITIAL_LEVELS = [
  { id: 6, name: "Next Journey", icon: "crown", r: 255, g: 210, b: 50, accent: "#ffd232", reward: "Unlock New World", rewardShort: "NEW WORLD", task: "Complete All Steps", unlocked: false, complete: false },
  { id: 5, name: "Mega Spin", icon: "deposit", r: 255, g: 160, b: 40, accent: "#ffa028", reward: "Wheel Ticket $50-500", rewardShort: "$50-500", task: "Deposit min $50", unlocked: false, complete: false },
  { id: 4, name: "Telegram Verify", icon: "telegram", r: 0, g: 180, b: 255, accent: "#00b4ff", reward: "+$20 Bonus", rewardShort: "+$20", task: "Join Telegram", unlocked: false, complete: false },
  { id: 3, name: "Phone Verification", icon: "phone", r: 255, g: 50, b: 120, accent: "#ff3278", reward: "100% Cashback", rewardShort: "100% CB", task: "Verify Phone", unlocked: false, complete: false },
  { id: 2, name: "KYC Verification", icon: "kyc", r: 120, g: 200, b: 255, accent: "#78c8ff", reward: "+50 Free Spins", rewardShort: "+50 FS", task: "Verify Identity", unlocked: false, complete: false },
  { id: 1, name: "Welcome Spin", icon: "wheel", r: 255, g: 210, b: 50, accent: "#ffd232", reward: "+50 FS / 150% Dep", rewardShort: "+50FS / 150%", task: "Spin the Wheel", unlocked: true, complete: false },
];

const WHEEL_PRIZES = [
  { label: "150% DEP\n+50 FS", color: "#ffd232", bg1: "#3a2d08", bg2: "#5c4a0a", jackpot: true },
  { label: "20 Free\nSpins", color: "#78c8ff", bg1: "#0d1a2e", bg2: "#142840" },
  { label: "75% DEP\nBonus", color: "#ff3278", bg1: "#2a0c18", bg2: "#3d1225" },
  { label: "10 Free\nSpins", color: "#00e676", bg1: "#0a2a15", bg2: "#103d20" },
];
const JACKPOT_INDEX = 0; // always land here
const SIDES = [0.5, 0.7, 0.3, 0.7, 0.3, 0.5];
const NODE_GAP = 170;
const PAD_TOP = 130;

/* ═══════════════════════════════════════════════════
   CONFETTI CANVAS — timed, self-contained
   ═══════════════════════════════════════════════════ */
function ConfettiCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    c.style.width = W + "px"; c.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ["#ffd232","#ffab00","#ffa028","#ff3278","#b464ff","#00e5ff","#00e676","#fff","#fff8dc"];
    const P = [];

    // confetti burst from center
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 4 + Math.random() * 10;
      P.push({ x: W/2, y: H/2, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 5,
        sz: 4+Math.random()*8, col: colors[~~(Math.random()*colors.length)],
        rot: Math.random()*6.28, rs: (Math.random()-0.5)*0.3, t:"c",
        life: 1, d: 0.008+Math.random()*0.01, sh: Math.random()>0.4?"r":"o" });
    }
    // gold coins from top
    for (let i = 0; i < 15; i++) {
      P.push({ x: Math.random()*W, y: -30-Math.random()*200,
        vx: (Math.random()-0.5)*2, vy: 2+Math.random()*4,
        sz: 8+Math.random()*5, t:"coin", life: 1, d: 0.005+Math.random()*0.006,
        col: "#ffd232", wb: Math.random()*6.28, ws: 0.05+Math.random()*0.08 });
    }

    let raf, frame = 0;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      frame++;
      let alive = 0;
      for (const p of P) {
        if (p.life <= 0) continue;
        alive++;
        p.life -= p.d; p.x += p.vx; p.vy += 0.12; p.y += p.vy; p.vx *= 0.99;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life*1.5));

        if (p.t === "c") {
          p.rot += p.rs;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.col;
          if (p.sh==="r") ctx.fillRect(-p.sz/2,-p.sz/4,p.sz,p.sz/2);
          else { ctx.beginPath(); ctx.arc(0,0,p.sz/2,0,6.28); ctx.fill(); }
          ctx.restore();
        } else if (p.t === "coin") {
          p.wb += p.ws;
          ctx.save();
          ctx.translate(p.x+Math.sin(p.wb)*3, p.y);
          ctx.scale(Math.cos(p.wb*2)*0.3+0.7, 1);
          const cg = ctx.createRadialGradient(0,0,0,0,0,p.sz);
          cg.addColorStop(0,"#fff8dc"); cg.addColorStop(0.3,p.col); cg.addColorStop(1,"#a06800");
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(0,0,p.sz,0,6.28); ctx.fill();
          ctx.fillStyle = "#a06800"; ctx.font = `bold ${p.sz*0.8}px serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("$",0,1);
          ctx.restore();
        } else if (p.t === "s") {
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.sz*p.life,0,6.28); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (frame < 6) { ctx.fillStyle = `rgba(255,210,50,${0.12*(1-frame/6)})`; ctx.fillRect(0,0,W,H); }
      if (alive > 0) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", zIndex:650, pointerEvents:"none" }} />;
}

/* ═══════════════════════════════════════════════════
   WHEEL OF FORTUNE — always lands on jackpot
   ═══════════════════════════════════════════════════ */
function WheelOfFortune({ onClose, onWin }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [phase, setPhase] = useState("spin"); // spin | celebrating | result
  const angleRef = useRef(0);
  const ctxRef = useRef(null);
  const phaseRef = useRef("spin");

  const segments = WHEEL_PRIZES.length;
  const segAngle = (Math.PI * 2) / segments;

  const drawWheel = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const size = 300, cx = size / 2, cy = size / 2, r = 125;
    ctx.clearRect(0, 0, size, size);

    // ── segments ──
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRef.current);
    for (let i = 0; i < segments; i++) {
      const prize = WHEEL_PRIZES[i];
      const sA = i * segAngle, eA = sA + segAngle;

      // fill
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, sA, eA); ctx.closePath();
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, r);
      g.addColorStop(0, prize.bg1);
      g.addColorStop(1, prize.bg2);
      ctx.fillStyle = g;
      ctx.fill();

      // divider line
      ctx.strokeStyle = "rgba(255,210,50,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sA) * r, Math.sin(sA) * r); ctx.stroke();

      // jackpot highlight edge
      if (prize.jackpot) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, sA, eA); ctx.closePath();
        ctx.strokeStyle = "rgba(255,210,50,0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // text — centered in segment, always upright-readable
      ctx.save();
      const midAngle = sA + segAngle / 2;
      ctx.rotate(midAngle);
      ctx.translate(r * 0.62, 0);
      // flip text 180° for bottom-half segments so it's never upside-down
      const absAngle = (midAngle + angleRef.current) % (Math.PI * 2);
      if (absAngle > Math.PI / 2 && absAngle < Math.PI * 1.5) {
        ctx.rotate(Math.PI);
      }
      ctx.fillStyle = prize.color;
      ctx.globalAlpha = prize.jackpot ? 1 : 0.9;
      ctx.font = `bold ${prize.jackpot ? 16 : 14}px 'Orbitron',sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = prize.label.split("\n");
      lines.forEach((ln, li) => ctx.fillText(ln, 0, (li - (lines.length - 1) / 2) * 18));
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    ctx.restore();

    // ── outer ring (single shadowBlur call) ──
    ctx.save();
    ctx.shadowColor = "rgba(255,210,50,0.4)";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255,210,50,0.55)";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.28); ctx.stroke();
    ctx.restore();

    // inner trim
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255,210,50,0.18)";
    ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, 6.28); ctx.stroke();

    // ── rim pegs (no shadowBlur — just solid dots) ──
    const pegCount = 20;
    for (let d = 0; d < pegCount; d++) {
      const da = (d / pegCount) * Math.PI * 2;
      const px = cx + Math.cos(da) * (r + 1);
      const py = cy + Math.sin(da) * (r + 1);
      ctx.fillStyle = "#ffd232";
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 6.28); ctx.fill();
      // bright dot center
      ctx.fillStyle = "#fff8dc";
      ctx.beginPath(); ctx.arc(px, py, 1, 0, 6.28); ctx.fill();
    }

    // ── center hub ──
    ctx.save();
    ctx.shadowColor = "rgba(255,210,50,0.5)";
    ctx.shadowBlur = 16;
    const hg = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 22);
    hg.addColorStop(0, "#fff8dc");
    hg.addColorStop(0.3, "#ffd740");
    hg.addColorStop(0.7, "#c89600");
    hg.addColorStop(1, "#6a4500");
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 6.28); ctx.fill();
    ctx.restore();

    // hub ring
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,210,50,0.5)";
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 6.28); ctx.stroke();

    // hub text
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.font = "bold 11px 'Orbitron',sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);

    // ── pointer ──
    ctx.save();
    ctx.shadowColor = "rgba(255,210,50,0.6)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffd232";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 10);
    ctx.lineTo(cx - 11, cy - r - 14);
    ctx.lineTo(cx + 11, cy - r - 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // pointer border
    ctx.strokeStyle = "#b8960a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 10);
    ctx.lineTo(cx - 11, cy - r - 14);
    ctx.lineTo(cx + 11, cy - r - 14);
    ctx.closePath();
    ctx.stroke();
  }, [segments, segAngle]);

  // render loop — pauses during celebrating phase
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 300;
    c.width = size * dpr; c.height = size * dpr;
    c.style.width = size + "px"; c.style.height = size + "px";
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;

    let raf, running = true;
    const loop = () => {
      if (!running) return;
      // skip rendering during celebration to avoid fighting confetti canvas
      if (phaseRef.current !== "celebrating") {
        drawWheel();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [drawWheel]);

  const doSpin = () => {
    if (spinning || hasSpun) return;
    setSpinning(true);
    setHasSpun(true);

    const jackpotCenter = JACKPOT_INDEX * segAngle + segAngle / 2;
    const jitter = (Math.random() - 0.5) * segAngle * 0.4;
    const fullSpins = 6 + Math.floor(Math.random() * 2);
    const targetAngle = -Math.PI / 2 - jackpotCenter - jitter + fullSpins * Math.PI * 2;

    const startAngle = angleRef.current;
    const delta = targetAngle - startAngle;
    const duration = 5500 + Math.random() * 1000;
    const t0 = performance.now();

    // smooth deceleration — starts fast, slows down gradually, no jumps
    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      angleRef.current = startAngle + delta * ease(p);
      if (p < 1) { requestAnimationFrame(tick); }
      else {
        phaseRef.current = "celebrating";
        setPhase("celebrating");
        setTimeout(() => { phaseRef.current = "result"; setPhase("result"); }, 2500);
      }
    };
    requestAnimationFrame(tick);
  };

  const handleContinue = (registerBonus) => {
    onWin({ ...WHEEL_PRIZES[JACKPOT_INDEX], registerBonus });
  };

  return (
    <>
      {phase === "celebrating" && <ConfettiCanvas />}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 600, background: "rgba(1,0,8,0.92)", backdropFilter: "blur(30px)", animation: "fadeIn 0.2s ease",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          position: "relative",
          width: "min(92vw, 380px)", maxHeight: "92vh", overflow: "hidden", borderRadius: 24,
          background: "linear-gradient(170deg, rgba(28,22,52,0.98), rgba(8,4,20,0.99))",
          boxShadow: "0 0 0 1px rgba(255,210,50,0.1), 0 0 120px rgba(255,210,50,0.08), 0 50px 100px rgba(0,0,0,0.5)",
          animation: "modalPop 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}>
          <div style={{ height: 2, background: "linear-gradient(90deg, transparent 10%, rgba(255,210,50,0.5) 50%, transparent 90%)" }} />

          {phase !== "result" ? (
            <>
              <div style={{ textAlign: "center", padding: "28px 24px 8px" }}>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "0.03em",
                  background: "linear-gradient(135deg,#ffd740,#ffab00,#ffd740,#fff3b0)",
                  backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  animation: "shimmer 3s linear infinite",
                }}>WHEEL OF FORTUNE</div>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.25em", marginTop: 8, fontWeight: 600 }}>SPIN TO START YOUR JOURNEY</div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                <canvas ref={canvasRef} />
              </div>

              {/* JACKPOT overlay — appears on top of wheel during celebration */}
              {phase === "celebrating" && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: "rgba(1,0,8,0.6)", borderRadius: 24, zIndex: 2,
                  animation: "fadeIn 0.3s ease",
                }}>
                  <div style={{ fontSize: 48, marginBottom: 8, animation: "dotPulse 1s ease-in-out infinite" }}>🎉</div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 26, fontWeight: 900, color: "#ffd232", textShadow: "0 0 24px rgba(255,210,50,0.5)", letterSpacing: "0.05em" }}>MAX WIN!</div>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6, letterSpacing: "0.15em", fontWeight: 600 }}>PREPARING YOUR PRIZE...</div>
                </div>
              )}

              <div style={{ padding: "0 20px 20px" }}>
                <button onClick={doSpin} disabled={spinning || hasSpun} style={{
                  width: "100%", padding: 16, borderRadius: 16, border: "none",
                  fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.15em",
                  cursor: (spinning || hasSpun) ? "not-allowed" : "pointer",
                  background: (spinning || hasSpun) ? "rgba(255,210,50,0.06)" : "linear-gradient(135deg,#ffd232,#ffab00)",
                  color: (spinning || hasSpun) ? "rgba(255,210,50,0.4)" : "rgba(0,0,0,0.85)",
                  boxShadow: (spinning || hasSpun) ? "none" : "0 10px 40px rgba(255,210,50,0.3), 0 2px 0 rgba(255,255,255,0.2) inset",
                  transition: "all 0.3s ease",
                }}>{spinning ? "SPINNING..." : "SPIN THE WHEEL"}</button>
                <button onClick={onClose} style={{
                  width: "100%", marginTop: 8, padding: 12, borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.04)", background: "transparent",
                  fontFamily: "'Exo 2',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", cursor: "pointer", letterSpacing: "0.1em", fontWeight: 600,
                  opacity: spinning ? 0.3 : 1, pointerEvents: spinning ? "none" : "auto",
                  transition: "opacity 0.3s ease",
                }}>CLOSE</button>
              </div>
            </>
          ) : (
            <>
              {/* ── MISSION CLEARED header ── */}
              <div style={{ textAlign: "center", padding: "18px 20px 0" }}>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>STAGE 1 CLEARED</div>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: "0.04em",
                  background: "linear-gradient(135deg,#ffd740,#ffab00,#fff3b0)",
                  backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  animation: "shimmer 2.5s linear infinite", lineHeight: 1.2,
                }}>MISSION SUCCEED!</div>
              </div>

              {/* ── prizes side by side ── */}
              <div style={{ display: "flex", gap: 10, margin: "14px 16px 0" }}>
                <div style={{ flex: 1, padding: "14px 8px", borderRadius: 16, textAlign: "center",
                  background: "linear-gradient(145deg,rgba(255,210,50,0.1),rgba(255,160,40,0.03))",
                  border: "1.5px solid rgba(255,210,50,0.2)",
                }}>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 26, fontWeight: 900, color: "#ffd232", textShadow: "0 0 20px rgba(255,210,50,0.5)", lineHeight: 1.1 }}>150%</div>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, fontWeight: 700, color: "rgba(255,210,50,0.55)", letterSpacing: "0.15em", marginTop: 4, textTransform: "uppercase" }}>Deposit Bonus</div>
                </div>
                <div style={{ flex: 1, padding: "14px 8px", borderRadius: 16, textAlign: "center",
                  background: "linear-gradient(145deg,rgba(0,229,255,0.08),rgba(0,180,255,0.02))",
                  border: "1.5px solid rgba(0,229,255,0.2)",
                }}>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 26, fontWeight: 900, color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.4)", lineHeight: 1.1 }}>+50 FS</div>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, fontWeight: 700, color: "rgba(0,229,255,0.45)", letterSpacing: "0.15em", marginTop: 4, textTransform: "uppercase" }}>Free Spins</div>
                </div>
              </div>

              {/* ── no strings badge ── */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "12px 12px 0" }}>
                {["NO DEPOSIT", "NO WAGER", "NO STRINGS"].map((t, i) => (
                  <span key={i} style={{
                    padding: "5px 10px", borderRadius: 8, whiteSpace: "nowrap",
                    background: "rgba(0,230,118,0.08)", border: "1.5px solid rgba(0,230,118,0.2)",
                    fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800, color: "#00e676",
                    letterSpacing: "0.06em",
                  }}>{t}</span>
                ))}
              </div>

              {/* ── NEXT STEP — emphasized ── */}
              <div style={{
                margin: "14px 16px 0", padding: "14px 16px", borderRadius: 16,
                background: "linear-gradient(135deg, rgba(0,229,255,0.1), rgba(120,200,255,0.04))",
                border: "1.5px solid rgba(0,229,255,0.3)",
                boxShadow: "0 0 24px rgba(0,229,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 8.5, fontWeight: 800,
                  color: "rgba(0,229,255,0.5)", letterSpacing: "0.25em", marginBottom: 8,
                }}>NEXT STEP</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(120,200,255,0.05))",
                    border: "1.5px solid rgba(0,229,255,0.25)",
                  }}>
                    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                      <rect x="8" y="6" width="24" height="28" rx="3" stroke="#00e5ff" strokeWidth="2.5" fill="none" />
                      <circle cx="20" cy="17" r="5" stroke="#00e5ff" strokeWidth="2" fill="none" />
                      <path d="M12 30 Q20 24 28 30" stroke="#00e5ff" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>KYC VERIFICATION</div>
                    <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>
                      Unlock <span style={{ color: "#00e5ff", fontWeight: 700 }}>+50 extra Free Spins</span>
                    </div>
                  </div>
                  <div style={{
                    padding: "6px 10px", borderRadius: 10,
                    background: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.25)",
                  }}>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, color: "#00e5ff", textShadow: "0 0 10px rgba(0,229,255,0.3)", whiteSpace: "nowrap" }}>+50 FS</div>
                  </div>
                </div>
              </div>

              {/* ── $500 guaranteed banner ── */}
              <div style={{
                margin: "8px 16px 0", padding: "10px 14px", borderRadius: 14,
                background: "linear-gradient(135deg,rgba(0,230,118,0.06),rgba(0,180,255,0.02))",
                border: "1.5px solid rgba(0,230,118,0.15)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, color: "#00e676", textShadow: "0 0 14px rgba(0,230,118,0.3)", lineHeight: 1, whiteSpace: "nowrap" }}>$500</div>
                <div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800, color: "#00e676", letterSpacing: "0.12em" }}>GUARANTEED CASH PRIZE</div>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, color: "rgba(255,255,255,0.22)", marginTop: 2, letterSpacing: "0.04em" }}>Complete all steps to claim</div>
                </div>
              </div>

              {/* ── CTA ── */}
              <div style={{ padding: "12px 16px 18px" }}>
                <button onClick={() => handleContinue(true)} style={{
                  width: "100%", padding: 16, borderRadius: 16, border: "none",
                  fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: "0.12em",
                  cursor: "pointer", background: "linear-gradient(135deg,#ffd232,#ffab00)", color: "rgba(0,0,0,0.85)",
                  boxShadow: "0 8px 30px rgba(255,210,50,0.3), 0 2px 0 rgba(255,255,255,0.2) inset",
                }}>REGISTER NOW</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   FULL SCENE CANVAS — renders everything
   ═══════════════════════════════════════════════════ */
/* ── Preload island PNGs ── */
const islandImages = {};
const islandImgNames = ["Islandio", "IS-CYAN", "IS-PURPLE", "IS-GREEN", "IS-RED"];
let allIslandsReady = false;
let islandsLoadedCount = 0;
for (const name of islandImgNames) {
  const img = new Image();
  img.src = new URL(`./${name}.png`, import.meta.url).href;
  img.onload = () => { islandsLoadedCount++; if (islandsLoadedCount === islandImgNames.length) allIslandsReady = true; };
  islandImages[name] = img;
}
// Map level id → island image name
const ISLAND_MAP = { 1: "Islandio", 2: "IS-CYAN", 3: "IS-RED", 4: "IS-CYAN", 5: "Islandio", 6: "Islandio" };

function SceneCanvas({ scrollElRef, width, height, onNodePositions, levels, islandElsRef }) {
  const ref = useRef(null);
  const state = useRef({ stars: null, dust: null, t: 0, imgReady: false });
  const propsRef = useRef({ width, height, levels });
  propsRef.current = { width, height, levels };

  useEffect(() => {
    // init stars
    state.current.stars = Array.from({ length: 300 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.2,
      a: 0.1 + Math.random() * 0.5,
      p: Math.random() * 6.28,
      s: 0.003 + Math.random() * 0.01,
    }));
    state.current.dust = Array.from({ length: 60 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 1 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.00008,
      vy: (Math.random() - 0.5) * 0.00006,
      a: 0.04 + Math.random() * 0.08,
      p: Math.random() * 6.28,
      col: INITIAL_LEVELS[Math.floor(Math.random() * INITIAL_LEVELS.length)],
    }));
    // Check if all island images are already loaded
    if (allIslandsReady) state.current.imgReady = true;
    else {
      const check = setInterval(() => { if (allIslandsReady) { state.current.imgReady = true; clearInterval(check); } }, 50);
    }
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c || !state.current.stars) return;
    const ctx = c.getContext("2d");
    let raf;
    const draw = () => {
      const { width, height, levels } = propsRef.current;
      const scrollY = scrollElRef.current ? scrollElRef.current.scrollTop : 0;
      const dpr = window.devicePixelRatio || 1;
      if (c.width !== width * dpr || c.height !== height * dpr) {
        c.width = width * dpr;
        c.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const totalH = levels.length * NODE_GAP + PAD_TOP + 180;
      state.current.t += 0.014;
      const t = state.current.t;
      ctx.clearRect(0, 0, width, height);

      // ─── BACKGROUND GRADIENT ───
      const bg = ctx.createRadialGradient(width * 0.5, height * 0.25, 0, width * 0.5, height * 0.5, height * 0.9);
      bg.addColorStop(0, "#140838");
      bg.addColorStop(0.35, "#0b0525");
      bg.addColorStop(0.65, "#06031a");
      bg.addColorStop(1, "#010010");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // ─── NEBULA BLOBS (parallax) ───
      const nebOff = scrollY * 0.03;
      const drawNeb = (fx, fy, fr, cr, cg, cb, ca) => {
        const nx = width * fx, ny = height * fy - nebOff;
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, fr * Math.min(width, height));
        ng.addColorStop(0, `rgba(${cr},${cg},${cb},${ca})`);
        ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng;
        ctx.fillRect(nx - fr * width, ny - fr * height, fr * width * 2, fr * height * 2);
      };
      drawNeb(0.25, 0.2, 0.35, 60, 20, 140, 0.08);
      drawNeb(0.78, 0.6, 0.28, 0, 60, 150, 0.06);
      drawNeb(0.5, 0.85, 0.25, 150, 15, 60, 0.04);
      drawNeb(0.8, 0.15, 0.2, 120, 100, 10, 0.03);

      // ─── STARS ───
      for (const s of state.current.stars) {
        s.p += s.s;
        const sx = s.x * width, sy = s.y * height;
        const al = s.a * (0.35 + 0.65 * Math.sin(s.p));
        ctx.fillStyle = `rgba(190,200,255,${al})`;
        ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, 6.28); ctx.fill();
      }

      // ─── DUST PARTICLES (parallax) ───
      for (const d of state.current.dust) {
        d.x += d.vx; d.y += d.vy; d.p += 0.008;
        if (d.x < -0.05) d.x = 1.05; if (d.x > 1.05) d.x = -0.05;
        if (d.y < -0.05) d.y = 1.05; if (d.y > 1.05) d.y = -0.05;
        const dx = d.x * width, dy = d.y * height - scrollY * 0.015;
        const da = d.a * (0.4 + 0.6 * Math.sin(d.p));
        ctx.fillStyle = `rgba(${d.col.r},${d.col.g},${d.col.b},${da})`;
        ctx.beginPath(); ctx.arc(dx, dy, d.r, 0, 6.28); ctx.fill();
        ctx.fillStyle = `rgba(${d.col.r},${d.col.g},${d.col.b},${da * 0.15})`;
        ctx.beginPath(); ctx.arc(dx, dy, d.r * 4, 0, 6.28); ctx.fill();
      }

      // ─── PERSPECTIVE GRID ───
      ctx.save();
      const gridY = height - scrollY * 0.02;
      ctx.globalAlpha = 0.03;
      const gridSpacing = 45;
      const vanishY = height * 0.45;
      for (let i = 0; i < 20; i++) {
        const yy = vanishY + (gridY - vanishY) * (i / 20);
        const spread = ((yy - vanishY) / (gridY - vanishY)) * width * 0.8;
        ctx.strokeStyle = "#00b0ff";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - spread, yy);
        ctx.lineTo(width * 0.5 + spread, yy);
        ctx.stroke();
      }
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(width * 0.5, vanishY);
        ctx.lineTo(width * 0.5 + i * gridSpacing * 2.5, gridY);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ─── ENERGY BEAMS between nodes ───
      const nodeScreenPos = [];
      for (let i = 0; i < levels.length; i++) {
        const nx = SIDES[i] * width;
        const ny = PAD_TOP + i * NODE_GAP - scrollY + 100;
        nodeScreenPos.push({ x: nx, y: ny });
      }

      for (let i = 0; i < levels.length - 1; i++) {
        const a = nodeScreenPos[i], b = nodeScreenPos[i + 1];
        let lv = levels[i];
        if (lv.complete) { lv = { ...lv, r: 0, g: 200, b: 80 }; }
        const mx = (a.x + b.x) / 2 + (a.x < b.x ? -50 : 50);
        const my = (a.y + b.y) / 2;

        // soft glow (no filter blur — use thicker low-alpha stroke instead)
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = `rgb(${lv.r},${lv.g},${lv.b})`;
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y + 55); ctx.quadraticCurveTo(mx, my, b.x, b.y - 25);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // dashed beam — negative offset for bottom-to-top flow
        ctx.setLineDash([5, 6]);
        ctx.lineDashOffset = -t * 40;
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},0.25)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y + 55); ctx.quadraticCurveTo(mx, my, b.x, b.y - 25);
        ctx.stroke();
        ctx.setLineDash([]);

        // white core — negative offset
        ctx.setLineDash([2, 12]);
        ctx.lineDashOffset = -t * 35;
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y + 55); ctx.quadraticCurveTo(mx, my, b.x, b.y - 25);
        ctx.stroke();
        ctx.setLineDash([]);

        // traveling orb — bottom to top (b → a)
        const prog = ((t * 0.15 + i * 0.25) % 1);
        const ot = 1 - prog;
        const ox = (1 - ot) * (1 - ot) * a.x + 2 * (1 - ot) * ot * mx + ot * ot * b.x;
        const oy = (1 - ot) * (1 - ot) * (a.y + 55) + 2 * (1 - ot) * ot * my + ot * ot * (b.y - 25);
        const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 10);
        og.addColorStop(0, `rgba(${lv.r},${lv.g},${lv.b},0.45)`);
        og.addColorStop(1, "transparent");
        ctx.fillStyle = og;
        ctx.fillRect(ox - 10, oy - 10, 20, 20);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath(); ctx.arc(ox, oy, 1.8, 0, 6.28); ctx.fill();
      }

      // ─── HELPER: simple hash for procedural variation ───
      const hash = (a, b) => { let h = (a * 2654435761 + b * 40503) & 0xFFFF; return (h / 0xFFFF); };

      // ─── HELPER: jagged island outline ───
      const jaggedEllipse = (cx2, cy2, rx, ry, seed2, jaggedness, pts2) => {
        const result = [];
        for (let p = 0; p < pts2; p++) {
          const a = (p / pts2) * Math.PI * 2;
          const noise = hash(seed2, p) * jaggedness - jaggedness * 0.5;
          const nx = cx2 + Math.cos(a) * (rx + noise * rx);
          const ny = cy2 + Math.sin(a) * (ry + noise * ry);
          result.push([nx, ny]);
        }
        return result;
      };

      // ─── NODES: ROCK + PORTAL ───
      const labelPos = [];
      for (let i = 0; i < levels.length; i++) {
        let lv = levels[i];
        // Override color to green when stage is complete
        if (lv.complete) { lv = { ...lv, r: 0, g: 200, b: 80 }; }
        const cx = nodeScreenPos[i].x;
        // subtle levitation — each island has its own phase
        const levitate = Math.sin(t * 1.5 + i * 1.7) * 4.5;
        const cy = nodeScreenPos[i].y + levitate;
        // sync HTML overlay element with same levitation
        if (islandElsRef?.current?.[i]) {
          islandElsRef.current[i].style.transform = `translateY(${levitate}px)`;
        }
        const jp = lv.id === 6;
        const sc = jp ? 1.25 : 1.0;
        const locked = !lv.unlocked;
        const seed = lv.id;

        ctx.save();
        if (locked) ctx.globalAlpha = 0.35;

        // ── AMBIENT GLOW ──
        const ambG = ctx.createRadialGradient(cx, cy + 10, 0, cx, cy + 10, 140 * sc);
        ambG.addColorStop(0, `rgba(${lv.r},${lv.g},${lv.b},0.09)`);
        ambG.addColorStop(0.35, `rgba(${lv.r},${lv.g},${lv.b},0.03)`);
        ambG.addColorStop(1, "transparent");
        ctx.fillStyle = ambG;
        ctx.beginPath(); ctx.arc(cx, cy + 10, 140 * sc, 0, 6.28); ctx.fill();

        // ═══════════════════
        // ═══ ROCK ISLAND ═══  (PNG image)
        // ═══════════════════
        const rw = 95 * sc, rh = 36 * sc;
        const depth = 50 * sc;
        const ry = cy + 28 * sc;

        // ── ground shadow ──
        ctx.save();
        const shG = ctx.createRadialGradient(cx, ry + depth + 16, 0, cx, ry + depth + 16, rw * 1.3);
        shG.addColorStop(0, `rgba(${lv.r * 0.1 | 0},${lv.g * 0.1 | 0},${lv.b * 0.1 | 0},0.35)`);
        shG.addColorStop(0.4, "rgba(0,0,0,0.15)");
        shG.addColorStop(1, "transparent");
        ctx.fillStyle = shG;
        ctx.beginPath(); ctx.ellipse(cx, ry + depth + 16, rw, 18 * sc, 0, 0, 6.28); ctx.fill();
        ctx.restore();

        // ── draw island PNG (color-matched or green if complete) ──
        if (state.current.imgReady) {
          const imgKey = lv.complete ? "IS-GREEN" : (ISLAND_MAP[lv.id] || "Islandio");
          const img = islandImages[imgKey];
          if (img && img.complete) {
            const imgW = 220 * sc;
            const imgH = imgW * (img.naturalHeight / img.naturalWidth);
            const imgX = cx - imgW / 2;
            const imgY = ry - imgH * 0.45;
            ctx.drawImage(img, imgX, imgY, imgW, imgH);
          }
        }

        // ── CRYSTAL FORMATIONS growing from rock edges ──
        const crystals = [
          { a: -0.6, h: 18, w: 4, off: 0 },
          { a: -0.3, h: 24, w: 5, off: 1 },
          { a: 0.5, h: 20, w: 4.5, off: 2 },
          { a: 0.8, h: 14, w: 3.5, off: 3 },
          { a: 2.4, h: 16, w: 3.5, off: 4 },
        ];
        for (const cr of crystals) {
          const baseX = cx + Math.cos(cr.a) * rw * 0.85;
          const baseY = ry + Math.sin(cr.a) * rh * 0.85;
          const ch = cr.h * sc;
          const cw2 = cr.w * sc;
          const sway = Math.sin(t * 0.6 + cr.off * 1.5) * 1.5;

          // crystal body
          ctx.beginPath();
          ctx.moveTo(baseX - cw2, baseY);
          ctx.lineTo(baseX + sway, baseY - ch);
          ctx.lineTo(baseX + cw2, baseY);
          ctx.closePath();
          const crG = ctx.createLinearGradient(baseX, baseY, baseX, baseY - ch);
          crG.addColorStop(0, `rgba(${lv.r * 0.3 | 0},${lv.g * 0.3 | 0},${lv.b * 0.3 | 0},0.5)`);
          crG.addColorStop(0.5, `rgba(${lv.r},${lv.g},${lv.b},0.3)`);
          crG.addColorStop(1, `rgba(${Math.min(255, lv.r + 80)},${Math.min(255, lv.g + 80)},${Math.min(255, lv.b + 80)},0.45)`);
          ctx.fillStyle = crG;
          ctx.fill();

          // crystal edge highlight
          ctx.strokeStyle = `rgba(${Math.min(255, lv.r + 100)},${Math.min(255, lv.g + 100)},${Math.min(255, lv.b + 100)},0.15)`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(baseX - cw2, baseY); ctx.lineTo(baseX + sway, baseY - ch); ctx.stroke();

          // crystal glow
          const cgG = ctx.createRadialGradient(baseX, baseY - ch * 0.5, 0, baseX, baseY - ch * 0.5, ch * 0.7);
          cgG.addColorStop(0, `rgba(${lv.r},${lv.g},${lv.b},${0.06 + 0.03 * Math.sin(t * 2 + cr.off)})`);
          cgG.addColorStop(1, "transparent");
          ctx.fillStyle = cgG;
          ctx.beginPath(); ctx.arc(baseX, baseY - ch * 0.5, ch * 0.7, 0, 6.28); ctx.fill();
        }

        // ── DEBRIS (varied + crystal shards) ──
        const drawDebris = (dx, dy, sz, rot, isGem) => {
          const floatY = Math.sin(t * 0.6 + dx * 0.3 + dy * 0.2) * 5;
          const floatX = Math.cos(t * 0.4 + dy * 0.5) * 2;
          ctx.save();
          ctx.translate(cx + (dx + floatX) * sc, ry + (dy + floatY) * sc);
          ctx.rotate(rot + t * 0.12);
          if (isGem) {
            ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},0.3)`;
            ctx.beginPath();
            ctx.moveTo(0, -sz); ctx.lineTo(sz * 0.6, 0); ctx.lineTo(0, sz * 0.7); ctx.lineTo(-sz * 0.6, 0);
            ctx.closePath(); ctx.fill();
            const dg = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 3);
            dg.addColorStop(0, `rgba(${lv.r},${lv.g},${lv.b},0.1)`);
            dg.addColorStop(1, "transparent");
            ctx.fillStyle = dg;
            ctx.fillRect(-sz * 3, -sz * 3, sz * 6, sz * 6);
          } else {
            ctx.fillStyle = `rgba(${35 + seed * 3},${30 + seed * 2},${55 + seed * 3},0.5)`;
            ctx.beginPath();
            ctx.moveTo(-sz * 0.5, -sz * 0.7); ctx.lineTo(sz * 0.6, -sz * 0.4);
            ctx.lineTo(sz * 0.4, sz * 0.6); ctx.lineTo(-sz * 0.4, sz * 0.5);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "rgba(160,150,200,0.06)";
            ctx.lineWidth = 0.4;
            ctx.beginPath(); ctx.moveTo(-sz * 0.5, -sz * 0.7); ctx.lineTo(sz * 0.6, -sz * 0.4); ctx.stroke();
          }
          ctx.restore();
        };
        drawDebris(-rw / sc - 14, 8, 6, 0.4, false);
        drawDebris(rw / sc + 11, 6, 5.5, -0.3, false);
        drawDebris(-rw / sc - 5, 32, 4.5, 0.9, true);
        drawDebris(rw / sc + 5, 28, 4, -0.7, true);
        drawDebris(-rw / sc + 6, depth / sc + 4, 3.5, 1.2, false);
        drawDebris(rw / sc - 5, depth / sc + 7, 3, -1.0, false);
        drawDebris(-rw / sc - 18, 20, 3, 2.1, true);
        drawDebris(rw / sc + 16, 18, 3.5, -1.8, false);

        // ── FOG/MIST around island base ──
        for (let fog = 0; fog < 4; fog++) {
          const fAngle = (fog / 4) * 6.28 + t * 0.08 + seed;
          const fDist = rw * (0.7 + 0.25 * Math.sin(t * 0.3 + fog * 2));
          const fx = cx + Math.cos(fAngle) * fDist;
          const fy = ry + depth * 0.6 + Math.sin(fAngle) * rh * 0.4;
          const fSize = (25 + 12 * Math.sin(t * 0.5 + fog)) * sc;
          const fA = 0.015 + 0.01 * Math.sin(t * 0.6 + fog * 1.5);
          const fogG = ctx.createRadialGradient(fx, fy, 0, fx, fy, fSize);
          fogG.addColorStop(0, `rgba(${lv.r * 0.3 + 40 | 0},${lv.g * 0.3 + 40 | 0},${lv.b * 0.3 + 40 | 0},${fA})`);
          fogG.addColorStop(1, "transparent");
          ctx.fillStyle = fogG;
          ctx.beginPath(); ctx.arc(fx, fy, fSize, 0, 6.28); ctx.fill();
        }

        // ═══════════════
        // ═══ PORTAL ═══
        // ═══════════════
        const portalY = cy - 28 * sc;
        const portalRx = 52 * sc;
        const portalRy = 28 * sc;

        // ── outer volumetric bloom ──
        for (let bl = 0; bl < 4; bl++) {
          const bsc = 1.5 + bl * 0.4;
          const ba = (0.07 - bl * 0.012) * (0.7 + 0.3 * Math.sin(t * 1.3 + bl * 0.5));
          const bG = ctx.createRadialGradient(cx, portalY, portalRx * 0.2, cx, portalY, portalRx * bsc);
          bG.addColorStop(0, `rgba(${lv.r},${lv.g},${lv.b},${ba})`);
          bG.addColorStop(1, "transparent");
          ctx.fillStyle = bG;
          ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * bsc, portalRy * bsc, 0, 0, 6.28); ctx.fill();
        }

        // ── accretion disk (concentric glowing rings inside) ──
        for (let ring = 0; ring < 6; ring++) {
          const ringR = portalRx * (0.4 + ring * 0.1);
          const ringRy = portalRy * (0.4 + ring * 0.1);
          const ringA = (0.06 - ring * 0.008) * (0.6 + 0.4 * Math.sin(t * 1.5 + ring * 0.8));
          ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${ringA})`;
          ctx.lineWidth = 1.5 - ring * 0.15;
          ctx.beginPath(); ctx.ellipse(cx, portalY, ringR, ringRy, 0, 0, 6.28); ctx.stroke();
        }

        // ── vortex swirl arms ──
        for (let layer = 0; layer < 5; layer++) {
          const arms = 4 + layer * 2;
          const maxDist = portalRx * (0.92 - layer * 0.08);
          const spin = t * (1.2 + layer * 0.35) * (layer % 2 === 0 ? 1 : -1);
          const alp = (0.2 - layer * 0.025) * (0.5 + 0.5 * Math.sin(t * 0.8 + layer * 0.7));

          ctx.save();
          ctx.translate(cx, portalY);
          ctx.rotate(spin);
          for (let a = 0; a < arms; a++) {
            const angle = (a / arms) * Math.PI * 2;
            ctx.save(); ctx.rotate(angle);
            ctx.beginPath();
            for (let s = 0; s < 40; s++) {
              const frac = s / 40;
              const dist = frac * maxDist;
              const twist = frac * 3 + Math.sin(frac * 4.5 + t * 1.6) * 0.35;
              const px = Math.cos(twist) * dist;
              const py = Math.sin(twist) * dist * (portalRy / portalRx);
              if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${alp})`;
            ctx.lineWidth = (2 - layer * 0.2) * sc;
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
        }

        // ── dark vortex core (event horizon) ──
        const coreG = ctx.createRadialGradient(cx, portalY, 0, cx, portalY, portalRx * 0.48);
        coreG.addColorStop(0, `rgba(${lv.r * 0.15 | 0},${lv.g * 0.15 | 0},${lv.b * 0.15 | 0},0.85)`);
        coreG.addColorStop(0.3, `rgba(${lv.r * 0.25 | 0},${lv.g * 0.25 | 0},${lv.b * 0.25 | 0},0.6)`);
        coreG.addColorStop(0.6, `rgba(${lv.r * 0.2 | 0},${lv.g * 0.2 | 0},${lv.b * 0.2 | 0},0.3)`);
        coreG.addColorStop(1, "transparent");
        ctx.fillStyle = coreG;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * 0.48, portalRy * 0.48, 0, 0, 6.28); ctx.fill();

        // ── distortion ripple around event horizon ──
        const ripR = portalRx * (0.52 + 0.03 * Math.sin(t * 3));
        const ripRy = portalRy * (0.52 + 0.03 * Math.sin(t * 3));
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${0.15 + 0.08 * Math.sin(t * 2.5)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cx, portalY, ripR, ripRy, 0, 0, 6.28); ctx.stroke();

        // ── inner glow pulse ──
        for (let ig = 0; ig < 2; ig++) {
          const pulseF = (0.22 + ig * 0.1) + (0.05 + ig * 0.03) * Math.sin(t * (2 + ig));
          const igG = ctx.createRadialGradient(cx, portalY, 0, cx, portalY, portalRx * pulseF);
          igG.addColorStop(0, `rgba(${lv.r},${lv.g},${lv.b},${0.4 - ig * 0.18})`);
          igG.addColorStop(0.5, `rgba(${lv.r},${lv.g},${lv.b},${0.08 - ig * 0.04})`);
          igG.addColorStop(1, "transparent");
          ctx.fillStyle = igG;
          ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * pulseF, portalRy * pulseF, 0, 0, 6.28); ctx.fill();
        }

        // ── TORUS RING ──
        // soft shadow under ring
        ctx.lineWidth = 6 * sc;
        ctx.strokeStyle = `rgba(${lv.r * 0.12 | 0},${lv.g * 0.12 | 0},${lv.b * 0.12 | 0},0.25)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY + 2.5, portalRx, portalRy, 0, 0, 6.28); ctx.stroke();
        // outer edge
        ctx.lineWidth = 5.5 * sc;
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},0.9)`;
        ctx.shadowColor = `rgba(${lv.r},${lv.g},${lv.b},0.7)`;
        ctx.shadowBlur = 25;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx, portalRy, 0, 0, 6.28); ctx.stroke();
        ctx.shadowBlur = 0;
        // bright inner edge
        ctx.lineWidth = 1.8 * sc;
        ctx.strokeStyle = `rgba(${Math.min(255, lv.r + 70)},${Math.min(255, lv.g + 70)},${Math.min(255, lv.b + 70)},0.35)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx - 3 * sc, portalRy - 2 * sc, 0, 0, 6.28); ctx.stroke();
        // dim outer outer edge
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},0.15)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx + 3 * sc, portalRy + 2 * sc, 0, 0, 6.28); ctx.stroke();

        // 3D highlight arcs
        const hlBase = t * 0.3;
        ctx.lineWidth = 3.5 * sc;
        ctx.strokeStyle = `rgba(255,255,255,${0.28 + 0.1 * Math.sin(t * 0.5)})`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx, portalRy, 0, hlBase - 0.6, hlBase + 0.7); ctx.stroke();
        ctx.lineWidth = 1.5 * sc;
        ctx.strokeStyle = `rgba(255,255,255,${0.08 + 0.04 * Math.sin(t * 0.7 + 1.2)})`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx, portalRy, 0, hlBase + 2.8, hlBase + 3.3); ctx.stroke();
        ctx.lineWidth = 3.5 * sc;
        ctx.strokeStyle = `rgba(0,0,0,${0.12 + 0.04 * Math.sin(t * 0.4)})`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx, portalRy, 0, hlBase + Math.PI - 0.4, hlBase + Math.PI + 0.7); ctx.stroke();

        // ── inner dashed rings ──
        ctx.setLineDash([6 * sc, 8 * sc]);
        ctx.lineDashOffset = -t * 30;
        ctx.lineWidth = 1.3 * sc;
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},0.2)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * 0.7, portalRy * 0.7, 0, 0, 6.28); ctx.stroke();
        ctx.setLineDash([3 * sc, 14 * sc]);
        ctx.lineDashOffset = t * 22;
        ctx.lineWidth = 0.6 * sc;
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},0.1)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * 0.52, portalRy * 0.52, 0, 0, 6.28); ctx.stroke();
        ctx.setLineDash([]);

        // ── orbiting particles with trails ──
        const orbCount = jp ? 10 : 6;
        for (let o = 0; o < orbCount; o++) {
          const oa = t * (0.55 + o * 0.09) + (o / orbCount) * 6.28;
          const ox = cx + Math.cos(oa) * portalRx;
          const oy = portalY + Math.sin(oa) * portalRy;
          const opulse = 0.3 + 0.7 * Math.sin(t * 2.2 + o * 1.1);
          for (let tr = 1; tr <= 4; tr++) {
            const ta = oa - tr * 0.1;
            const tx = cx + Math.cos(ta) * portalRx;
            const ty = portalY + Math.sin(ta) * portalRy;
            ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},${0.06 * opulse / tr})`;
            ctx.beginPath(); ctx.arc(tx, ty, 2 - tr * 0.35, 0, 6.28); ctx.fill();
          }
          const opG = ctx.createRadialGradient(ox, oy, 0, ox, oy, 14);
          opG.addColorStop(0, `rgba(${lv.r},${lv.g},${lv.b},${0.4 * opulse})`);
          opG.addColorStop(1, "transparent");
          ctx.fillStyle = opG;
          ctx.fillRect(ox - 14, oy - 14, 28, 28);
          ctx.fillStyle = `rgba(255,255,255,${0.8 * opulse})`;
          ctx.beginPath(); ctx.arc(ox, oy, 2, 0, 6.28); ctx.fill();
        }

        // ── jackpot effects ──
        if (jp) {
          for (let r2 = 0; r2 < 32; r2++) {
            const ra = (r2 / 32) * 6.28 + t * 0.2;
            const ral = 0.03 + 0.09 * Math.sin(t * 1.8 + r2 * 0.4);
            ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${ral})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ra) * portalRx * 1.05, portalY + Math.sin(ra) * portalRy * 1.05);
            ctx.lineTo(cx + Math.cos(ra) * portalRx * 1.45, portalY + Math.sin(ra) * portalRy * 1.45);
            ctx.stroke();
          }
          const jpP = 1.2 + 0.08 * Math.sin(t * 1.8);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${0.06 + 0.05 * Math.sin(t * 1.8)})`;
          ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * jpP, portalRy * jpP, 0, 0, 6.28); ctx.stroke();
        }

        // ── light cone portal → rock ──
        const lcG = ctx.createLinearGradient(cx, portalY + portalRy, cx, ry - rh * 0.2);
        lcG.addColorStop(0, `rgba(${lv.r},${lv.g},${lv.b},0.08)`);
        lcG.addColorStop(0.5, `rgba(${lv.r},${lv.g},${lv.b},0.02)`);
        lcG.addColorStop(1, "transparent");
        ctx.fillStyle = lcG;
        ctx.beginPath();
        ctx.moveTo(cx - portalRx * 0.3, portalY + portalRy);
        ctx.lineTo(cx + portalRx * 0.3, portalY + portalRy);
        ctx.lineTo(cx + portalRx * 0.8, ry - rh * 0.2);
        ctx.lineTo(cx - portalRx * 0.8, ry - rh * 0.2);
        ctx.closePath(); ctx.fill();

        // ── ambient floating particles ──
        for (let ap = 0; ap < 8; ap++) {
          const aAngle = t * (0.25 + ap * 0.06) + (ap / 8) * 6.28;
          const aRad = (65 + 35 * Math.sin(t * 0.4 + ap * 1.5)) * sc;
          const ax = cx + Math.cos(aAngle) * aRad;
          const ay = cy + Math.sin(aAngle * 0.6 + ap) * aRad * 0.35;
          const aa = 0.06 + 0.05 * Math.sin(t * 1.8 + ap);
          ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},${aa})`;
          ctx.beginPath(); ctx.arc(ax, ay, 1.2, 0, 6.28); ctx.fill();
        }

        ctx.restore();
        labelPos.push({ x: cx, y: ry + depth + 22 * sc, id: lv.id });
      }

      // ─── METEORS ───
      for (let m = 0; m < 3; m++) {
        const phase = (t * 0.08 + m * 0.35) % 1;
        if (phase > 0.02 && phase < 0.85) {
          const mx2 = width * 1.1 - phase * width * 1.4;
          const my2 = height * (0.08 + m * 0.28) + phase * height * 0.2;
          const mLen = 60 + m * 25;
          const angle = -0.45;
          ctx.save();
          ctx.translate(mx2, my2);
          ctx.rotate(angle);
          const mG = ctx.createLinearGradient(-mLen, 0, 10, 0);
          mG.addColorStop(0, "transparent");
          mG.addColorStop(0.4, `rgba(160,200,255,${0.15 + m * 0.05})`);
          mG.addColorStop(0.8, "rgba(255,255,255,0.6)");
          mG.addColorStop(1, "transparent");
          ctx.strokeStyle = mG;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(-mLen, 0); ctx.lineTo(10, 0); ctx.stroke();
          ctx.restore();
        }
      }

      onNodePositions(labelPos);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ position: "sticky", top: 0, left: 0, width, height, zIndex: 1, display: "block" }} />;
}

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
export default function CosmicCasino() {
  const [levels, setLevels] = useState(INITIAL_LEVELS);
  const [freeSpins, setFreeSpins] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showWheel, setShowWheel] = useState(false);
  const [dim, setDim] = useState({ w: 400, h: 700 });
  const labelsRef = useRef([]);
  const islandElsRef = useRef([]);
  const [introPlayed, setIntroPlayed] = useState(false);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  // auto-scroll intro: start at top, smoothly reveal level 1 at bottom
  useEffect(() => {
    if (introPlayed) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    const timer = setTimeout(() => {
      const totalH = INITIAL_LEVELS.length * NODE_GAP + PAD_TOP + 180;
      const maxScroll = Math.max(0, totalH - (containerRef.current?.clientHeight || 700));
      const duration = 2200;
      const t0 = performance.now();
      const ease = (t) => t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
      const animate = (now) => {
        const p = Math.min(1, (now-t0)/duration);
        el.scrollTop = ease(p) * maxScroll;
        if (p < 1) requestAnimationFrame(animate);
        else setIntroPlayed(true);
      };
      requestAnimationFrame(animate);
    }, 600);
    return () => clearTimeout(timer);
  }, [introPlayed]);

  // handle clicking a level
  const handleLevelClick = useCallback((lv) => {
    if (lv.id === 1 && !lv.complete) {
      setShowWheel(true);
    } else {
      setSelected(lv);
    }
  }, []);

  // handle wheel win
  const handleWheelWin = useCallback((prize) => {
    setShowWheel(false);
    setFreeSpins(prev => prev + 50);
    setLevels(prev => prev.map(l =>
      l.id === 1 ? { ...l, complete: true, reward: prize.label.replace("\n", " "), rewardShort: prize.label.replace("\n", " ") }
      : l.id === 2 ? { ...l, unlocked: true }
      : l
    ));
  }, []);

  // complete a level and unlock next
  const handleComplete = useCallback((lvId) => {
    if (lvId === 2) setFreeSpins(prev => prev + 50);
    setLevels(prev => prev.map(l =>
      l.id === lvId ? { ...l, complete: true }
      : l.id === lvId + 1 ? { ...l, unlocked: true }
      : l
    ));
    setSelected(null);
  }, []);

  // keep selected synced with levels state
  useEffect(() => {
    if (selected) {
      const fresh = levels.find(l => l.id === selected.id);
      if (fresh && (fresh.complete !== selected.complete || fresh.unlocked !== selected.unlocked)) {
        setSelected(fresh);
      }
    }
  }, [levels]);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDim({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);


  const onNodePositions = useCallback((pos) => {
    labelsRef.current = pos;
  }, []);

  const totalH = levels.length * NODE_GAP + PAD_TOP + 180;

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh", background: "#010010", overflow: "hidden", position: "relative", fontFamily: "'Exo 2', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@200;300;400;500;600;700;800;900&display=swap');
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes modalPop { 0%{transform:scale(0.7) translateY(50px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes slideDown { from{transform:translateY(-16px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.15);opacity:0} 100%{transform:scale(1);opacity:0} }
        @keyframes prizeOverlayIn { 0%{opacity:0} 100%{opacity:1} }
        @keyframes prizeOverlayOut { 0%{opacity:1} 100%{opacity:0} }
        @keyframes prizeCardIn { 0%{transform:scale(0.3) rotateX(40deg);opacity:0;filter:blur(10px)} 50%{transform:scale(1.08) rotateX(-2deg);opacity:1;filter:blur(0)} 70%{transform:scale(0.97) rotateX(1deg);opacity:1} 100%{transform:scale(1) rotateX(0deg);opacity:1} }
        @keyframes prizeShine { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes prizePulse { 0%,100%{box-shadow:0 0 40px rgba(255,210,50,0.2), 0 0 80px rgba(255,210,50,0.08)} 50%{box-shadow:0 0 60px rgba(255,210,50,0.35), 0 0 120px rgba(255,210,50,0.15)} }
        @keyframes prizeStarBurst { 0%{transform:scale(0) rotate(0deg);opacity:0} 40%{transform:scale(1.2) rotate(180deg);opacity:0.6} 100%{transform:scale(2) rotate(360deg);opacity:0} }
        @keyframes prizeRing { 0%{transform:translate(-50%,-50%) scale(0.2);opacity:0.8;border-width:6px} 100%{transform:translate(-50%,-50%) scale(2.5);opacity:0;border-width:1px} }
        @keyframes prizeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes prizeTextPop { 0%{transform:scale(0) translateY(20px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes prizeGlowLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes dotPulse { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        .hideScroll::-webkit-scrollbar{width:0} .hideScroll{scrollbar-width:none}
      `}</style>

      {/* Single scroll container — canvas (sticky) + labels scroll together */}
      <div ref={scrollRef} className="hideScroll" style={{
        position: "absolute", inset: 0, zIndex: 20, overflowY: "auto", overflowX: "hidden",
      }}>
        {/* Canvas stays in viewport via sticky, negative margin so it doesn't push labels */}
        <SceneCanvas scrollElRef={scrollRef} width={dim.w} height={dim.h} onNodePositions={onNodePositions} levels={levels} islandElsRef={islandElsRef} />
        <div style={{ height: totalH, position: "relative", marginTop: -dim.h }}>
          {levels.map((lv, i) => {
            const sx = SIDES[i] * dim.w;
            const sy = PAD_TOP + i * NODE_GAP;
            const jp = lv.id === 6;
            const locked = !lv.unlocked;
            const iconColor = lv.complete ? "#00e676" : lv.accent;
            const iconR = lv.complete ? 0 : lv.r, iconG = lv.complete ? 200 : lv.g, iconB = lv.complete ? 80 : lv.b;
            return (
              <div key={lv.id} ref={el => { islandElsRef.current[i] = el; }} style={{
                position: "absolute", top: sy - 55, left: sx - (jp ? 130 : 110), width: jp ? 260 : 220, height: jp ? 240 : 200,
                cursor: "pointer", zIndex: 25, willChange: "transform",
              }} onClick={() => handleLevelClick(lv)}>
                {/* icon above portal — tight to portal */}
                <div style={{
                  position: "absolute", top: jp ? 39 : 65, left: "50%", transform: "translateX(-50%)",
                  zIndex: 30,
                  filter: locked
                    ? "grayscale(1) brightness(0.3)"
                    : `drop-shadow(0 0 14px rgba(${iconR},${iconG},${iconB},0.9)) drop-shadow(0 2px 6px rgba(0,0,0,0.7))`,
                  transition: "filter 0.3s",
                }}>
                  <svg width={jp ? 40 : 28} height={jp ? 40 : 28} viewBox="0 0 40 40" fill="none">
                    {lv.icon === "wheel" && <>
                      <circle cx="20" cy="20" r="16" stroke={iconColor} strokeWidth="3" fill="none" />
                      <circle cx="20" cy="20" r="4" fill={iconColor} />
                      {[0,45,90,135,180,225,270,315].map(a => <line key={a} x1="20" y1="20" x2={20+Math.cos(a*Math.PI/180)*14} y2={20+Math.sin(a*Math.PI/180)*14} stroke={iconColor} strokeWidth="1.5" />)}
                    </>}
                    {lv.icon === "kyc" && <>
                      <rect x="8" y="6" width="24" height="28" rx="3" stroke={iconColor} strokeWidth="2.5" fill="none" />
                      <circle cx="20" cy="17" r="5" stroke={iconColor} strokeWidth="2" fill="none" />
                      <path d="M12 30 Q20 24 28 30" stroke={iconColor} strokeWidth="2" fill="none" />
                    </>}
                    {lv.icon === "email" && <>
                      <rect x="5" y="10" width="30" height="20" rx="3" stroke={iconColor} strokeWidth="2.5" fill="none" />
                      <path d="M5 12 L20 23 L35 12" stroke={iconColor} strokeWidth="2.5" fill="none" />
                    </>}
                    {lv.icon === "phone" && <>
                      <rect x="12" y="4" width="16" height="32" rx="4" stroke={iconColor} strokeWidth="2.5" fill="none" />
                      <line x1="17" y1="30" x2="23" y2="30" stroke={iconColor} strokeWidth="2" />
                      <circle cx="20" cy="30" r="1.5" fill={iconColor} />
                    </>}
                    {lv.icon === "telegram" && <>
                      <path d="M5 20 L35 8 L28 34 L19 23 Z" stroke={iconColor} strokeWidth="2" fill="none" />
                      <line x1="35" y1="8" x2="19" y2="23" stroke={iconColor} strokeWidth="2" />
                    </>}
                    {lv.icon === "deposit" && <>
                      <polygon points="20,4 26,16 38,16 28,24 32,36 20,28 8,36 12,24 2,16 14,16" stroke={iconColor} strokeWidth="2" fill="none" />
                    </>}
                    {lv.icon === "crown" && <>
                      <path d="M6 30 L6 16 L14 24 L20 10 L26 24 L34 16 L34 30 Z" stroke={iconColor} strokeWidth="2.5" fill={`${iconColor}33`} />
                      <line x1="6" y1="30" x2="34" y2="30" stroke={iconColor} strokeWidth="2.5" />
                    </>}
                  </svg>
                </div>

                {/* label card below island */}
                <div style={{
                  position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)",
                  textAlign: "center", whiteSpace: "nowrap",
                  padding: "10px 16px 9px", borderRadius: 14,
                  background: lv.complete
                    ? "rgba(0,20,10,0.75)"
                    : locked ? "rgba(5,3,15,0.65)" : "rgba(5,3,15,0.75)",
                  backdropFilter: "blur(8px)",
                  border: lv.complete
                    ? "1px solid rgba(0,230,118,0.2)"
                    : locked ? "1px solid rgba(255,255,255,0.04)" : `1px solid rgba(${lv.r},${lv.g},${lv.b},0.2)`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}>
                  {/* level name */}
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 14, fontWeight: 900,
                    color: locked ? "rgba(255,255,255,0.25)" : lv.complete ? "#fff" : "#fff",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                  }}>{lv.name}</div>

                  {/* status row */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 7,
                  }}>
                    {lv.complete ? (
                      <>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "5px 14px", borderRadius: 10,
                          background: "linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,200,80,0.08))",
                          border: "1px solid rgba(0,230,118,0.3)",
                        }}>
                          <span style={{ color: "#00e676", fontSize: 13, lineHeight: 1 }}>&#10003;</span>
                          <span style={{
                            fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800,
                            color: "#00e676", letterSpacing: "0.1em",
                          }}>COMPLETED</span>
                        </span>
                      </>
                    ) : locked ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 14px", borderRadius: 10,
                        background: `rgba(${lv.r},${lv.g},${lv.b},0.06)`,
                        border: `1px solid rgba(${lv.r},${lv.g},${lv.b},0.12)`,
                      }}>
                        <span style={{
                          fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800,
                          color: `rgba(${lv.r},${lv.g},${lv.b},0.5)`, letterSpacing: "0.05em",
                        }}>{lv.rewardShort}</span>
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 14px", borderRadius: 10,
                        background: `rgba(${lv.r},${lv.g},${lv.b},0.1)`,
                        border: `1px solid rgba(${lv.r},${lv.g},${lv.b},0.2)`,
                      }}>
                        <span style={{
                          fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800,
                          color: lv.accent, letterSpacing: "0.05em",
                          textShadow: `0 0 10px rgba(${lv.r},${lv.g},${lv.b},0.5)`,
                        }}>{lv.rewardShort}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HUD ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 100, animation: "slideDown 0.5s ease-out",
        background: "linear-gradient(to bottom, rgba(1,0,14,0.98) 0%, rgba(1,0,14,0.85) 50%, rgba(1,0,14,0.6) 75%, rgba(1,0,14,0.2) 90%, transparent 100%)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        padding: "12px 16px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <svg width="120" height="32" viewBox="0 0 103 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="58.2705" height="26.22" rx="5" fill="#FBCE04"/>
              <path d="M21.718 8.21L19.996 18.01H17.504L18.428 12.718L15.362 16.666H15.11L13.444 12.648L12.506 18.01H10L11.722 8.21H14.228L15.824 12.438L19.058 8.21H21.718Z" fill="#000514"/>
              <path d="M31.3387 8.21L27.2087 13.74L26.4527 18.01H23.9467L24.7027 13.74L22.5047 8.21H25.1647L26.2147 11.36L28.3707 8.21H31.3387Z" fill="#000514"/>
              <path d="M38.7008 11.094C38.5514 11.934 38.1314 12.5733 37.4408 13.012C38.1314 13.5347 38.4114 14.2767 38.2808 15.238C38.1688 16.0687 37.7768 16.7407 37.1048 17.254C36.4421 17.758 35.5554 18.01 34.4448 18.01H30.3848L32.1068 8.21H35.8308C36.8014 8.21 37.5574 8.48067 38.0988 9.022C38.6401 9.56333 38.8408 10.254 38.7008 11.094ZM35.4668 10.45H34.2208L33.9548 11.99H35.1868C35.4388 11.99 35.6534 11.9247 35.8308 11.794C36.0174 11.654 36.1294 11.4627 36.1668 11.22C36.2041 10.9867 36.1574 10.8 36.0268 10.66C35.9054 10.52 35.7188 10.45 35.4668 10.45ZM35.8308 14.944C35.8774 14.692 35.8354 14.4913 35.7048 14.342C35.5834 14.1927 35.3828 14.118 35.1028 14.118H33.5768L33.2828 15.77H34.7948C35.0654 15.77 35.2941 15.6953 35.4808 15.546C35.6674 15.3873 35.7841 15.1867 35.8308 14.944Z" fill="#000514"/>
              <path d="M43.6103 18.22C42.1076 18.22 40.9409 17.716 40.1103 16.708C39.2889 15.7 38.9996 14.454 39.2423 12.97C39.4756 11.5233 40.1336 10.3333 41.2163 9.4C42.3083 8.46667 43.5776 8 45.0243 8C45.9856 8 46.8023 8.21 47.4743 8.63C48.1556 9.04067 48.6736 9.61 49.0283 10.338L46.7323 11.556C46.3589 10.8187 45.7103 10.45 44.7863 10.45C44.0209 10.45 43.3536 10.6973 42.7843 11.192C42.2243 11.6773 41.8743 12.3167 41.7343 13.11C41.6036 13.8847 41.7249 14.524 42.0983 15.028C42.4716 15.5227 43.0316 15.77 43.7783 15.77C44.7209 15.77 45.4863 15.378 46.0743 14.594L48.1323 15.924C47.6096 16.652 46.9516 17.2167 46.1583 17.618C45.3743 18.0193 44.5249 18.22 43.6103 18.22Z" fill="#000514"/>
              <path d="M74.3915 12.5497V13.3897C74.3915 14.855 73.9342 16.0263 73.0195 16.9037C72.1142 17.7717 70.9615 18.2057 69.5615 18.2057C68.0402 18.2057 66.7755 17.7157 65.7675 16.7357C64.7689 15.7557 64.2695 14.5517 64.2695 13.1237C64.2695 11.6957 64.7642 10.487 65.7535 9.49767C66.7522 8.50834 67.9702 8.01367 69.4075 8.01367C70.3222 8.01367 71.1575 8.21901 71.9135 8.62967C72.6789 9.04034 73.2715 9.58167 73.6915 10.2537L71.7875 11.3457C71.5729 11.0097 71.2509 10.7343 70.8215 10.5197C70.4015 10.305 69.9255 10.1977 69.3935 10.1977C68.5629 10.1977 67.8722 10.473 67.3215 11.0237C66.7802 11.5743 66.5095 12.279 66.5095 13.1377C66.5095 13.987 66.7895 14.6823 67.3495 15.2237C67.9095 15.7557 68.6562 16.0217 69.5895 16.0217C70.8869 16.0217 71.7222 15.5177 72.0955 14.5097H69.4775V12.5497H74.3915Z" fill="white"/>
              <path d="M81.5289 18.0097L81.0389 16.4697H77.3989L76.9089 18.0097H74.4589L77.7909 8.20967H80.6469L83.9789 18.0097H81.5289ZM78.0709 14.3697H80.3669L79.2189 10.7717L78.0709 14.3697Z" fill="white"/>
              <path d="M94.6145 8.20967V18.0097H92.3745V12.3117L89.8405 16.4697H89.5885L87.0545 12.3117V18.0097H84.8145V8.20967H87.0545L89.7145 12.5637L92.3745 8.20967H94.6145Z" fill="white"/>
              <path d="M98.5389 15.8537H102.459V18.0097H96.2989V8.20967H102.389V10.3657H98.5389V11.9897H102.039V14.1177H98.5389V15.8537Z" fill="white"/>
            </svg>
          </div>
          {/* coin display */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 26,
            background: "linear-gradient(135deg, rgba(255,215,64,0.06), rgba(255,180,0,0.02))",
            border: "1px solid rgba(255,215,64,0.12)",
            boxShadow: "0 0 28px rgba(255,215,64,0.04), inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.1)",
            backdropFilter: "blur(12px)",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #ffd740, #ffab00)",
              boxShadow: "0 0 12px rgba(255,215,64,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
              fontSize: 11, fontWeight: 900, color: "rgba(0,0,0,0.7)",
              fontFamily: "'Orbitron', sans-serif",
            }}>&#x25CF;</div>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 17, fontWeight: 800, color: "#ffd740", textShadow: "0 0 14px rgba(255,215,64,0.25)" }}>{freeSpins} FS</span>
          </div>
        </div>

        {/* ── QUEST PROGRESS TRACK ── */}
        {(() => {
          const sorted = [...levels].sort((a, b) => a.id - b.id);
          return (
            <div style={{
              padding: "10px 22px 0",
            }}>
              {/* 3-row grid: top labels, nodes+lines, bottom labels */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {sorted.map((lv, i) => {
                  const done = lv.complete;
                  const active = lv.unlocked && !done;
                  const prevDone = i > 0 && sorted[i-1].complete;
                  const labelAbove = i % 2 === 1;

                  const isFirst = i === 0;
                  const isLast = i === sorted.length - 1;
                  const label = (
                    <div style={{
                      fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 800,
                      color: done ? "#00e676" : active ? "#fff" : "rgba(255,255,255,0.2)",
                      whiteSpace: "nowrap",
                      textAlign: isFirst ? "left" : isLast ? "right" : "center",
                      justifyContent: isFirst ? "flex-start" : isLast ? "flex-end" : "center",
                      textShadow: done ? "0 0 6px rgba(0,230,118,0.5)" : "none",
                      height: 22, display: "flex", alignItems: "center",
                    }}>{lv.rewardShort}</div>
                  );

                  return (
                    <div key={lv.id} style={{ display: "contents" }}>
                      {i > 0 && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch", minWidth: 4 }}>
                          <div style={{ height: 22 }} />
                          <div style={{ display: "flex", alignItems: "center", height: 34 }}>
                            <div style={{
                              flex: 1, height: 3, borderRadius: 2,
                              background: prevDone ? "#00e676" : "rgba(255,255,255,0.06)",
                              boxShadow: prevDone ? "0 0 8px rgba(0,230,118,0.5)" : "none",
                            }} />
                          </div>
                          <div style={{ height: 22 }} />
                        </div>
                      )}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        flexShrink: 0, width: 34,
                      }}>
                        {/* top label or spacer */}
                        {labelAbove ? label : <div style={{ height: 22 }} />}
                        {/* node */}
                        <div style={{
                          width: 34, height: 34, borderRadius: 10, position: "relative",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: done
                            ? "linear-gradient(145deg, #00e676, #00c853)"
                            : active
                              ? `linear-gradient(145deg, rgba(${lv.r},${lv.g},${lv.b},0.3), rgba(${lv.r},${lv.g},${lv.b},0.12))`
                              : "rgba(255,255,255,0.03)",
                          border: done ? "2px solid #00e676"
                            : active ? `2px solid ${lv.accent}` : "1.5px solid rgba(255,255,255,0.08)",
                          boxShadow: done
                            ? "0 0 14px rgba(0,230,118,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
                            : active ? `0 0 10px rgba(${lv.r},${lv.g},${lv.b},0.25)` : "none",
                        }}>
                          {done ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13L9.5 17.5L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span style={{
                              fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900,
                              color: active ? "#fff" : "rgba(255,255,255,0.12)",
                              textShadow: active ? `0 0 8px rgba(${lv.r},${lv.g},${lv.b},0.7)` : "none",
                            }}>{lv.id}</span>
                          )}
                          {active && <div style={{
                            position: "absolute", inset: -4, borderRadius: 14,
                            border: `2px solid ${lv.accent}`, opacity: 0.4,
                            animation: "pulseRing 2s ease-in-out infinite",
                          }} />}
                        </div>
                        {/* bottom label or spacer */}
                        {!labelAbove ? label : <div style={{ height: 22 }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        zIndex: 100, padding: "0 14px 14px",
        background: "linear-gradient(to top, rgba(1,0,14,0.99) 0%, rgba(1,0,14,0.7) 40%, rgba(1,0,14,0.2) 75%, transparent 100%)",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-around", padding: "12px 8px 10px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.018), rgba(255,255,255,0.008))",
          border: "1px solid rgba(255,255,255,0.035)",
          borderRadius: 22, backdropFilter: "blur(16px)",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.025)",
        }}>
          {[
            { icon: "MAP", label: "Map", active: true },
            { icon: "GIFT", label: "Rewards" },
            { icon: "TOP", label: "Ranks" },
            { icon: "SET", label: "Settings" },
          ].map((n, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer",
              opacity: n.active ? 1 : 0.22, transition: "opacity 0.3s", padding: "4px 16px",
              position: "relative",
            }}>
              {n.active && <div style={{
                position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                width: 30, height: 2, borderRadius: 2,
                background: "linear-gradient(90deg, transparent, #ffd740, transparent)",
              }} />}
              <span style={{ fontSize: 14, fontFamily: "'Orbitron', sans-serif", fontWeight: 900, color: n.active ? "#ffd740" : "rgba(255,255,255,0.3)", filter: n.active ? "drop-shadow(0 0 8px rgba(255,215,64,0.35))" : "none" }}>{n.icon}</span>
              <span style={{
                fontFamily: "'Exo 2', sans-serif", fontSize: 9, fontWeight: 700,
                color: n.active ? "#ffd740" : "rgba(255,255,255,0.3)",
                letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 4,
                textShadow: n.active ? "0 0 10px rgba(255,215,64,0.3)" : "none",
              }}>{n.label}</span>
              {n.active && <div style={{ width: 5, height: 5, borderRadius: "50%", marginTop: 4, background: "#ffd740", boxShadow: "0 0 10px #ffd740, 0 0 20px rgba(255,215,64,0.2)", animation: "dotPulse 2s ease-in-out infinite" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 500, background: "rgba(1,0,8,0.9)", backdropFilter: "blur(28px)", animation: "fadeIn 0.2s ease",
        }} onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: "min(92vw, 380px)", borderRadius: 24, overflow: "hidden",
            background: "linear-gradient(170deg, rgba(24,20,48,0.98) 0%, rgba(8,4,20,0.99) 100%)",
            boxShadow: `
              0 0 0 1px rgba(${selected.r},${selected.g},${selected.b},0.1),
              0 0 80px rgba(${selected.r},${selected.g},${selected.b},0.12),
              0 30px 60px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.04)
            `,
            animation: "modalPop 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}>
            {/* top accent line */}
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent 10%, ${selected.accent}80 50%, transparent 90%)` }} />

            {/* compact header: icon + title inline */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px 10px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `radial-gradient(circle, rgba(${selected.r},${selected.g},${selected.b},0.12), transparent 70%)`,
                border: `2px solid rgba(${selected.r},${selected.g},${selected.b},0.2)`,
                boxShadow: `0 0 24px rgba(${selected.r},${selected.g},${selected.b},0.15)`,
              }}>
                <svg width={26} height={26} viewBox="0 0 40 40" fill="none" style={{ filter: `drop-shadow(0 0 8px ${selected.accent})` }}>
                  {selected.icon === "wheel" && <>
                    <circle cx="20" cy="20" r="16" stroke={selected.accent} strokeWidth="2.5" fill="none" />
                    <circle cx="20" cy="20" r="4" fill={selected.accent} />
                    {[0,45,90,135,180,225,270,315].map(a => <line key={a} x1="20" y1="20" x2={20+Math.cos(a*Math.PI/180)*14} y2={20+Math.sin(a*Math.PI/180)*14} stroke={selected.accent} strokeWidth="1.5" />)}
                  </>}
                  {selected.icon === "kyc" && <>
                    <rect x="8" y="6" width="24" height="28" rx="3" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <circle cx="20" cy="17" r="5" stroke={selected.accent} strokeWidth="1.5" fill="none" />
                    <path d="M12 30 Q20 24 28 30" stroke={selected.accent} strokeWidth="1.5" fill="none" />
                  </>}
                  {selected.icon === "email" && <>
                    <rect x="5" y="10" width="30" height="20" rx="3" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <path d="M5 12 L20 23 L35 12" stroke={selected.accent} strokeWidth="2" fill="none" />
                  </>}
                  {selected.icon === "phone" && <>
                    <rect x="12" y="4" width="16" height="32" rx="4" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <circle cx="20" cy="30" r="1.5" fill={selected.accent} />
                  </>}
                  {selected.icon === "telegram" && <>
                    <path d="M5 20 L35 8 L28 34 L19 23 Z" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <line x1="35" y1="8" x2="19" y2="23" stroke={selected.accent} strokeWidth="2" />
                  </>}
                  {selected.icon === "deposit" && <>
                    <polygon points="20,4 26,16 38,16 28,24 32,36 20,28 8,36 12,24 2,16 14,16" stroke={selected.accent} strokeWidth="2" fill="none" />
                  </>}
                  {selected.icon === "crown" && <>
                    <path d="M6 30 L6 16 L14 24 L20 10 L26 24 L34 16 L34 30 Z" stroke={selected.accent} strokeWidth="2" fill={`${selected.accent}33`} />
                    <line x1="6" y1="30" x2="34" y2="30" stroke={selected.accent} strokeWidth="2" />
                  </>}
                </svg>
              </div>
              <div>
                <span style={{
                  display: "inline-block", padding: "2px 10px", borderRadius: 8, marginBottom: 4,
                  background: `rgba(${selected.r},${selected.g},${selected.b},0.08)`,
                  border: `1px solid rgba(${selected.r},${selected.g},${selected.b},0.12)`,
                  fontFamily: "'Exo 2', sans-serif", fontSize: 9, fontWeight: 700,
                  color: `rgba(${selected.r},${selected.g},${selected.b},0.6)`,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                }}>STEP {selected.id} / {INITIAL_LEVELS.length}</span>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900,
                  color: selected.accent,
                  textShadow: `0 0 20px rgba(${selected.r},${selected.g},${selected.b},0.4)`,
                  letterSpacing: "0.03em",
                }}>{selected.name}</div>
              </div>
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              {/* reward card — compact */}
              <div style={{
                padding: "14px", borderRadius: 16, textAlign: "center", marginBottom: 14,
                background: selected.complete
                  ? "rgba(0,230,118,0.04)"
                  : `linear-gradient(135deg, rgba(${selected.r},${selected.g},${selected.b},0.08), rgba(${selected.r},${selected.g},${selected.b},0.02))`,
                border: `1.5px solid ${selected.complete ? "rgba(0,230,118,0.15)" : `rgba(${selected.r},${selected.g},${selected.b},0.15)`}`,
              }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 6, fontFamily: "'Exo 2', sans-serif", fontWeight: 700 }}>
                  {selected.complete ? "REWARD CLAIMED" : !selected.unlocked ? "REWARD · LOCKED" : "REWARD"}
                </div>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900,
                  color: selected.complete ? "#00e676" : !selected.unlocked ? "rgba(255,255,255,0.2)" : selected.accent,
                  textShadow: selected.complete ? "0 0 16px rgba(0,230,118,0.4)" : !selected.unlocked ? "none" : `0 0 16px rgba(${selected.r},${selected.g},${selected.b},0.5)`,
                  lineHeight: 1.2,
                }}>{selected.reward}</div>
              </div>

              {/* status row */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1, padding: "10px", borderRadius: 12, textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, color: "#fff" }}>{selected.id} / {INITIAL_LEVELS.length}</div>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 3, fontWeight: 600 }}>Step</div>
                </div>
                <div style={{ flex: 1, padding: "10px", borderRadius: 12, textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, color: "#fff" }}>{selected.complete ? "Done" : selected.unlocked ? "Active" : "Locked"}</div>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 3, fontWeight: 600 }}>Status</div>
                </div>
              </div>

              <button onClick={() => { if (selected.unlocked && !selected.complete) handleComplete(selected.id); }} style={{
                width: "100%", padding: 16, borderRadius: 16, border: "none",
                fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em",
                cursor: (!selected.unlocked || selected.complete) ? "not-allowed" : "pointer",
                background: !selected.unlocked ? "rgba(255,255,255,0.02)" : selected.complete ? "rgba(0,230,118,0.08)" : `linear-gradient(135deg, ${selected.accent}, ${selected.accent}88)`,
                color: !selected.unlocked ? "rgba(255,255,255,0.12)" : selected.complete ? "#00e676" : "rgba(0,0,0,0.85)",
                boxShadow: !selected.unlocked ? "none" : selected.complete ? "0 0 16px rgba(0,230,118,0.1)" : `0 8px 30px rgba(${selected.r},${selected.g},${selected.b},0.3), 0 2px 0 rgba(255,255,255,0.2) inset`,
              }}>{!selected.unlocked ? `UNLOCK AT STEP ${selected.id}` : selected.complete ? "COMPLETED" : `${selected.task.toUpperCase()}`}</button>

              <button onClick={() => setSelected(null)} style={{
                width: "100%", marginTop: 8, padding: 12, borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.04)", background: "transparent",
                fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", cursor: "pointer", letterSpacing: "0.1em", fontWeight: 600,
              }}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHEEL MODAL ── */}
      {showWheel && (
        <WheelOfFortune
          onClose={() => setShowWheel(false)}
          onWin={handleWheelWin}
        />
      )}

    </div>
  );
}
