import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
  { id: 6, name: "Next Journey", icon: "crown", r: 255, g: 210, b: 50, accent: "#ffd232", reward: "Unlock New World", rewardShort: "NEW WORLD", task: "Complete All Steps", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 5, name: "Mega Spin", icon: "deposit", r: 255, g: 160, b: 40, accent: "#ffa028", reward: "Wheel Ticket $50-500", rewardShort: "$50-500", task: "Deposit min $50", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 4, name: "Telegram Verify", icon: "telegram", r: 0, g: 180, b: 255, accent: "#00b4ff", reward: "+$20 Bonus", rewardShort: "+$20", task: "Join Telegram", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 3, name: "Phone Verification", icon: "phone", r: 255, g: 50, b: 120, accent: "#ff3278", reward: "100% Cashback", rewardShort: "100% CB", task: "Verify Phone", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: true },
  { id: 2, name: "KYC Verification", icon: "kyc", r: 120, g: 200, b: 255, accent: "#78c8ff", reward: "+50 Free Spins", rewardShort: "+50 FS", task: "Verify Identity", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 1, name: "Welcome Spin", icon: "wheel", r: 255, g: 210, b: 50, accent: "#ffd232", reward: "+50 FS / 150% Dep", rewardShort: "+50FS / 150%", task: "Spin the Wheel", unlocked: true, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
];

// Stage complete modal config per level
const STAGE_COMPLETE_DATA = {
  1: { // Welcome Spin
    title: "Stage 1 Complete", subtitle: "Rewards Unlocked!",
    prize: "150% DEP +50 FS", prizeNote: "Unlocks after registration & KYC",
    secondaryCta: null,
  },
  2: { // KYC
    title: "Stage 2 Complete", subtitle: "Rewards Unlocked!",
    prize: "150% + 100 FS", prizeNote: "Activated — deposit to use bonus",
    secondaryCta: "USE NOW 100 FREESPINS",
  },
  3: { // Phone
    title: "Stage 3 Complete", subtitle: "Reward Claimed!",
    prize: "100% Cashback", prizeNote: "Applied to your next deposit",
    secondaryCta: null,
  },
  4: { // Telegram
    title: "Stage 4 Complete", subtitle: "Reward Claimed!",
    prize: "+$20 Bonus", prizeNote: "Added to your balance",
    primaryCta: "CONTINUE TO MEGA SPIN",
    secondaryCta: null,
  },
  5: { // Mega Spin
    title: "Stage 5 Complete", subtitle: "Jackpot!",
    prize: null, // dynamic from wheel
    prizeNote: "10x wager required in slots",
    primaryCta: "UNLOCK NEXT JOURNEY",
    secondaryCta: null,
  },
};

const ALL_STEPS = [
  { id: 1, name: "Register", reward: "150% + 50 FS" },
  { id: 2, name: "KYC Verification", reward: "+50 FS" },
  { id: 3, name: "Phone Verify", reward: "100% CB" },
  { id: 4, name: "Telegram", reward: "+$20" },
  { id: 5, name: "Mega Spin", reward: "$50–$500" },
];

const WHEEL_PRIZES = [
  { label: "150% DEP\n+50 FS", color: "#ffe8a0", bg1: "#7a3500", bg2: "#c45800", jackpot: true },
  { label: "20 Free\nSpins", color: "#c8e8ff", bg1: "#0a1848", bg2: "#1a3070" },
  { label: "75% DEP\nBonus", color: "#ffc8c8", bg1: "#6a0828", bg2: "#a01040" },
  { label: "10 Free\nSpins", color: "#c8e8ff", bg1: "#0a1848", bg2: "#1a3070" },
];
const JACKPOT_INDEX = 0; // always land here

const MEGA_WHEEL_PRIZES = [
  { label: "$100\nCash", color: "#c8e8ff", bg1: "#0a1848", bg2: "#1a3070", jackpot: true },
  { label: "$200\nBonus", color: "#ffc8c8", bg1: "#6a0828", bg2: "#a01040" },
  { label: "$500\nJackpot", color: "#ffe8a0", bg1: "#7a3500", bg2: "#c45800" },
  { label: "$50\nBonus", color: "#d4ffc8", bg1: "#0a4020", bg2: "#1a6838" },
];

// ── CHAPTER 2: Road to VIP Level 2 ──
const INITIAL_LEVELS_CH2 = [
  { id: 6, name: "VIP Level 2", icon: "crown", r: 220, g: 180, b: 255, accent: "#dcb4ff", reward: "VIP Status Unlocked", rewardShort: "VIP LV2", task: "Complete All Steps", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 5, name: "VIP Spin", icon: "deposit", r: 255, g: 190, b: 210, accent: "#ffbed2", reward: "Wheel Ticket $100-1000", rewardShort: "$100-1K", task: "Exclusive VIP Wheel", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 4, name: "Weekly Challenge", icon: "trophy", r: 255, g: 210, b: 170, accent: "#ffd2aa", reward: "200% Reload Bonus", rewardShort: "200% RLD", task: "Complete Mission", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 3, name: "Refer a Friend", icon: "refer", r: 180, g: 220, b: 255, accent: "#b4dcff", reward: "+$50 Each", rewardShort: "+$50", task: "Share Referral Link", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 2, name: "Play 50 Rounds", icon: "play", r: 255, g: 170, b: 190, accent: "#ffaabe", reward: "+100 Free Spins", rewardShort: "+100 FS", task: "Play 50 Slot Rounds", unlocked: false, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
  { id: 1, name: "First Deposit", icon: "wallet", r: 240, g: 200, b: 230, accent: "#f0c8e6", reward: "200% + 100 FS", rewardShort: "200%+100FS", task: "Make Your First Deposit", unlocked: true, complete: false, completing: false, bonusState: "none", lockedButCompleted: false },
];

const STAGE_COMPLETE_DATA_CH2 = {
  1: { title: "Stage 1 Complete", subtitle: "Deposit Activated!", prize: "200% + 100 FS", prizeNote: "Applied to your first deposit", secondaryCta: null },
  2: { title: "Stage 2 Complete", subtitle: "Challenge Cleared!", prize: "+100 Free Spins", prizeNote: "Added to your account", secondaryCta: "PLAY NOW 100 FS" },
  3: { title: "Stage 3 Complete", subtitle: "Referral Sent!", prize: "+$50 Bonus", prizeNote: "Credited when friend signs up", secondaryCta: null },
  4: { title: "Stage 4 Complete", subtitle: "Mission Complete!", prize: "200% Reload", prizeNote: "Use on your next deposit", primaryCta: "CONTINUE TO VIP SPIN", secondaryCta: null },
  5: { title: "Stage 5 Complete", subtitle: "VIP Jackpot!", prize: null, prizeNote: "10x wager required in slots", primaryCta: "UNLOCK VIP LEVEL 2", secondaryCta: null },
};

const ALL_STEPS_CH2 = [
  { id: 1, name: "First Deposit", reward: "200% + 100 FS" },
  { id: 2, name: "Play 50 Rounds", reward: "+100 FS" },
  { id: 3, name: "Refer a Friend", reward: "+$50" },
  { id: 4, name: "Weekly Challenge", reward: "200% RLD" },
  { id: 5, name: "VIP Spin", reward: "$100–$1K" },
];

const VIP_WHEEL_PRIZES = [
  { label: "$250\nCash", color: "#e0c8ff", bg1: "#2a0848", bg2: "#4a1870", jackpot: true },
  { label: "$500\nBonus", color: "#ffc8c8", bg1: "#6a0828", bg2: "#a01040" },
  { label: "$1000\nJackpot", color: "#ffe8a0", bg1: "#7a3500", bg2: "#c45800" },
  { label: "$100\nBonus", color: "#d4ffc8", bg1: "#0a4020", bg2: "#1a6838" },
];

const SIDES = [0.5, 0.7, 0.3, 0.7, 0.3, 0.7];
const NODE_GAP = 170;
const PAD_TOP = 200;

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
function WheelOfFortune({ onClose, onWin, prizes = WHEEL_PRIZES, title = "WHEEL OF FORTUNE", countdownStr = "23:59:59", spring = false }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [phase, setPhase] = useState("spin"); // spin | celebrating | register | result
  const angleRef = useRef(0);
  const ctxRef = useRef(null);
  const phaseRef = useRef("spin");

  const segments = prizes.length;
  const segAngle = (Math.PI * 2) / segments;

  const drawWheel = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const size = 300, cx = size / 2, cy = size / 2, r = 120;
    ctx.clearRect(0, 0, size, size);

    // ── outer metallic ring (layered for depth) ──
    // dark base ring
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#1a1408";
    ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, 6.28); ctx.stroke();
    // gold mid ring
    const ringG = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringG.addColorStop(0, "#c8a020");
    ringG.addColorStop(0.3, "#ffd740");
    ringG.addColorStop(0.5, "#e8b810");
    ringG.addColorStop(0.7, "#ffd740");
    ringG.addColorStop(1, "#a07808");
    ctx.lineWidth = 10;
    ctx.strokeStyle = ringG;
    ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, 6.28); ctx.stroke();
    // highlight edge
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,248,220,0.35)";
    ctx.beginPath(); ctx.arc(cx, cy, r + 9, 0, Math.PI); ctx.stroke();

    // ── LED rim pegs ──
    const pegCount = 24;
    const t = performance.now() / 1000;
    for (let d = 0; d < pegCount; d++) {
      const da = (d / pegCount) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(da) * (r + 4);
      const py = cy + Math.sin(da) * (r + 4);
      const lit = (Math.floor(t * 3) + d) % 3 === 0;
      // outer glow for lit pegs
      if (lit) {
        ctx.fillStyle = "rgba(255,230,120,0.3)";
        ctx.beginPath(); ctx.arc(px, py, 5, 0, 6.28); ctx.fill();
      }
      // peg body
      ctx.fillStyle = lit ? "#ffe878" : "#8a7020";
      ctx.beginPath(); ctx.arc(px, py, 2.8, 0, 6.28); ctx.fill();
      // peg highlight
      ctx.fillStyle = lit ? "#fffde0" : "#b89828";
      ctx.beginPath(); ctx.arc(px - 0.5, py - 0.5, 1.2, 0, 6.28); ctx.fill();
    }

    // ── segments ──
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRef.current);
    for (let i = 0; i < segments; i++) {
      const prize = prizes[i];
      const sA = i * segAngle, eA = sA + segAngle;

      // segment fill — rich gradient from center outward
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 1, sA, eA); ctx.closePath();
      const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
      g.addColorStop(0, prize.bg2);
      g.addColorStop(0.6, prize.bg2);
      g.addColorStop(1, prize.bg1);
      ctx.fillStyle = g;
      ctx.fill();

      // outer edge highlight — light catching the rim
      ctx.beginPath(); ctx.arc(0, 0, r - 3, sA + 0.06, eA - 0.06);
      ctx.strokeStyle = "rgba(255,240,200,0.06)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // subtle top sheen (upper half of segment)
      const sheenMid = sA + segAngle / 2;
      const sheenX = Math.cos(sheenMid) * r * 0.5;
      const sheenY = Math.sin(sheenMid) * r * 0.5;
      const sg = ctx.createRadialGradient(sheenX, sheenY, 0, sheenX, sheenY, r * 0.4);
      sg.addColorStop(0, "rgba(255,255,255,0.035)");
      sg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 1, sA, eA); ctx.closePath();
      ctx.fillStyle = sg;
      ctx.fill();

      // divider lines — thin gold
      ctx.strokeStyle = "rgba(180,150,60,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sA) * (r - 1), Math.sin(sA) * (r - 1)); ctx.stroke();

      // jackpot segment — subtle warm inner glow
      if (prize.jackpot) {
        const jg = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 0.8);
        jg.addColorStop(0, "rgba(255,200,50,0.05)");
        jg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 1, sA, eA); ctx.closePath();
        ctx.fillStyle = jg;
        ctx.fill();
      }

      // ── text — positioned along radius, always horizontal ──
      ctx.save();
      const midAngle = sA + segAngle / 2;
      const textR = r * 0.58;
      const textX = Math.cos(midAngle) * textR;
      const textY = Math.sin(midAngle) * textR;
      ctx.translate(textX, textY);
      // counter-rotate to keep text horizontal despite wheel rotation
      ctx.rotate(-angleRef.current);
      ctx.fillStyle = prize.color;
      ctx.globalAlpha = 0.9;
      ctx.font = "bold 13px 'Orbitron',sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = prize.label.split("\n");
      lines.forEach((line, li) => ctx.fillText(line, 0, (li - (lines.length - 1) / 2) * 16));
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    ctx.restore();

    // inner trim ring
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(200,170,50,0.25)";
    ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, 6.28); ctx.stroke();

    // ── center hub (layered metallic) ──
    // shadow ring
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.arc(cx, cy + 1, 26, 0, 6.28); ctx.fill();
    // dark outer hub
    const hgOuter = ctx.createRadialGradient(cx, cy, 16, cx, cy, 26);
    hgOuter.addColorStop(0, "#4a3800");
    hgOuter.addColorStop(1, "#1a1000");
    ctx.fillStyle = hgOuter;
    ctx.beginPath(); ctx.arc(cx, cy, 26, 0, 6.28); ctx.fill();
    // gold hub ring
    ctx.lineWidth = 2.5;
    const hubRingG = ctx.createLinearGradient(cx - 24, cy - 24, cx + 24, cy + 24);
    hubRingG.addColorStop(0, "#c8a020");
    hubRingG.addColorStop(0.5, "#ffd740");
    hubRingG.addColorStop(1, "#a08010");
    ctx.strokeStyle = hubRingG;
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 6.28); ctx.stroke();
    // inner gold hub
    const hg = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, 20);
    hg.addColorStop(0, "#fff0c0");
    hg.addColorStop(0.25, "#ffd740");
    hg.addColorStop(0.6, "#c89600");
    hg.addColorStop(1, "#7a5800");
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 6.28); ctx.fill();
    // hub highlight arc
    ctx.strokeStyle = "rgba(255,248,220,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 16, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke();
    // hub text
    ctx.fillStyle = "rgba(30,20,0,0.8)";
    ctx.font = "bold 11px 'Orbitron',sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);

    // ── pointer (top, premium look) ──
    ctx.save();
    // pointer shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 14);
    ctx.lineTo(cx - 10, cy - r - 12);
    ctx.lineTo(cx + 10, cy - r - 12);
    ctx.closePath();
    ctx.fill();
    // pointer body — gold gradient
    const pG = ctx.createLinearGradient(cx, cy - r - 14, cx, cy - r + 12);
    pG.addColorStop(0, "#ffd740");
    pG.addColorStop(0.4, "#ffe880");
    pG.addColorStop(1, "#c89600");
    ctx.fillStyle = pG;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 12);
    ctx.lineTo(cx - 10, cy - r - 14);
    ctx.lineTo(cx + 10, cy - r - 14);
    ctx.closePath();
    ctx.fill();
    // pointer edge
    ctx.strokeStyle = "#a07808";
    ctx.lineWidth = 1;
    ctx.stroke();
    // pointer highlight
    ctx.strokeStyle = "rgba(255,248,220,0.5)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 10);
    ctx.lineTo(cx - 7, cy - r - 10);
    ctx.stroke();
    ctx.restore();
  }, [segments, segAngle, prizes]);

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
    onWin({ ...prizes[JACKPOT_INDEX], registerBonus });
  };

  return (
    <>
      {phase === "celebrating" && <ConfettiCanvas />}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 600,
        background: spring ? "rgba(60,40,90,0.88)" : "rgba(1,0,8,0.92)",
        backdropFilter: "blur(30px)", animation: "fadeIn 0.2s ease",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          position: "relative",
          width: "min(92vw, 380px)", maxHeight: "92vh", overflow: "hidden", borderRadius: 24,
          background: spring
            ? "linear-gradient(170deg, rgba(55,35,85,0.98), rgba(35,20,60,0.99))"
            : "linear-gradient(170deg, rgba(28,22,52,0.98), rgba(8,4,20,0.99))",
          boxShadow: phase === "result" ? "0 0 0 1px rgba(0,230,118,0.1), 0 0 120px rgba(0,230,118,0.08), 0 50px 100px rgba(0,0,0,0.5)" : "0 0 0 1px rgba(255,210,50,0.1), 0 0 120px rgba(255,210,50,0.08), 0 50px 100px rgba(0,0,0,0.5)",
          animation: "modalPop 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}>
          <div style={{ height: 2, background: phase === "result" ? "linear-gradient(90deg, transparent 10%, rgba(0,230,118,0.5) 50%, transparent 90%)" : "linear-gradient(90deg, transparent 10%, rgba(255,210,50,0.5) 50%, transparent 90%)" }} />

          {(phase === "spin" || phase === "celebrating") ? (
            <>
              <div style={{ textAlign: "center", padding: "28px 24px 8px" }}>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "0.03em",
                  background: "linear-gradient(135deg,#ffd740,#ffab00,#ffd740,#fff3b0)",
                  backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  animation: "shimmer 3s linear infinite",
                }}>{title}</div>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.25em", marginTop: 8, fontWeight: 600 }}>SPIN TO START YOUR JOURNEY</div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                <canvas ref={canvasRef} />
              </div>

              {/* JACKPOT overlay — appears on top of wheel during celebration */}
              {phase === "celebrating" && title !== "MEGA SPIN" && title !== "VIP SPIN" && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: spring ? "rgba(60,40,90,0.6)" : "rgba(1,0,8,0.6)", borderRadius: 24, zIndex: 2,
                  animation: "fadeIn 0.3s ease",
                }}>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 26, fontWeight: 900, color: "#ffd232", textShadow: "0 0 24px rgba(255,210,50,0.5)", letterSpacing: "0.05em", marginBottom: 4 }}>MAX WIN!</div>
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
                  fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.2)", cursor: "pointer", letterSpacing: "0.1em", fontWeight: 600,
                  opacity: spinning ? 0.3 : 1, pointerEvents: spinning ? "none" : "auto",
                  transition: "opacity 0.3s ease",
                }}>CLOSE</button>
              </div>
            </>
          ) : (
            <>
              {/* ── MISSION CLEARED header ── */}
              <div style={{ textAlign: "center", padding: "22px 20px 0" }}>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>
                  {title === "MEGA SPIN" ? "MEGA SPIN COMPLETE" : title === "VIP SPIN" ? "VIP SPIN COMPLETE" : "You Won a Bonus!"}
                </div>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: "0.04em",
                  color: "#ffffff", lineHeight: 1.2,
                }}>{(title === "MEGA SPIN" || title === "VIP SPIN") ? "Stage 5 Complete" : "Stage 1 Complete"}</div>
              </div>

              {(title === "MEGA SPIN" || title === "VIP SPIN") ? (
                <>
                  {/* ── Mega Spin prize display ── */}
                  <div style={{ display: "flex", justifyContent: "center", margin: "20px 16px 0" }}>
                    <div style={{ padding: "20px 32px", borderRadius: 20, textAlign: "center",
                      background: "linear-gradient(145deg,rgba(255,210,50,0.12),rgba(255,160,40,0.04))",
                      border: "2px solid rgba(255,210,50,0.3)",
                    }}>
                      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 36, fontWeight: 900, color: "#ffd232", lineHeight: 1.1 }}>
                        {prizes[JACKPOT_INDEX].label.replace("\n", " ")}
                      </div>
                      <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,210,50,0.55)", letterSpacing: "0.2em", marginTop: 8, textTransform: "uppercase" }}>YOUR PRIZE</div>
                      <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>10x wager required in slots</div>
                    </div>
                  </div>

                  {/* ── CTA ── */}
                  <div style={{ padding: "20px 16px 18px" }}>
                    <button onClick={() => handleContinue(false)} style={{
                      width: "100%", padding: 16, borderRadius: 16, border: "none",
                      fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: "0.12em",
                      cursor: "pointer", background: "linear-gradient(135deg,#ffd232,#ffab00)", color: "rgba(0,0,0,0.85)",
                      boxShadow: "0 8px 30px rgba(255,210,50,0.3), 0 2px 0 rgba(255,255,255,0.2) inset",
                    }}>CLAIM PRIZE</button>
                  </div>
                </>
              ) : (
                <>
                  {/* ── Single clean content flow ── */}
                  <div style={{ padding: "0 20px" }}>
                    {/* Prize hero container */}
                    <div style={{
                      textAlign: "center", margin: "18px 0 10px", padding: "16px 20px",
                      borderRadius: 14, background: "rgba(0,230,118,0.04)", border: "1px solid rgba(0,230,118,0.12)",
                    }}>
                      <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "baseline" }}>
                        <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 30, fontWeight: 900, color: "#00e676" }}>150%</span>
                        <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 15, color: "rgba(0,230,118,0.3)" }}>+</span>
                        <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 30, fontWeight: 900, color: "#00e676" }}>100 FS</span>
                      </div>
                      <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 6, letterSpacing: "0.08em" }}>Unlocks after registration & KYC</div>
                    </div>

                    {/* Claim timer */}
                    <div style={{ textAlign: "center", fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 18px" }}>
                      Reserved for <span style={{ color: "#ffa028", fontWeight: 700 }}>{countdownStr}</span> — create an account to claim
                    </div>

                    {/* Timeline */}
                    <div style={{ position: "relative", paddingLeft: 34 }}>
                      {/* Vertical line — animated grow, starts at first dot center */}
                      <div style={{ position: "absolute", left: 10, top: 28, bottom: 18, width: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, transformOrigin: "top", animation: "tlLineGrow 0.8s ease-out forwards" }} />
                      {/* Gold segment — covers stage 1 steps */}
                      <div style={{ position: "absolute", left: 10, top: 28, height: 56, width: 2, background: "linear-gradient(180deg, #ffd232, rgba(255,210,50,0.3))", borderRadius: 1, transformOrigin: "top", animation: "tlLineGrow 0.5s ease-out 0.3s both" }} />

                      {/* Stage 1 label */}
                      <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,210,50,0.35)", letterSpacing: "0.15em", padding: "2px 0 0", animation: "tlSlideIn 0.4s ease-out 0.2s both" }}>STAGE 1</div>

                      {/* Stage 1 steps: Register + KYC */}
                      {[
                        { name: "Register", reward: "150% + 50 FS", next: true },
                        { name: "KYC Verification", reward: "+50 FS" },
                      ].map((r, idx) => (
                        <div key={`s1-${idx}`} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", position: "relative",
                          animation: `tlSlideIn 0.4s ease-out ${0.25 + idx * 0.12}s both`,
                        }}>
                          <div style={{
                            position: "absolute", left: -31, top: "50%", transform: "translateY(-50%)",
                            width: 16, height: 16, borderRadius: "50%",
                            background: "#ffd232",
                            border: "2px solid rgba(255,210,50,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 0 10px rgba(255,210,50,0.5), 0 0 20px rgba(255,210,50,0.15)",
                            animation: "tlBeepGold 1.5s ease-in-out infinite",
                          }} />
                          <div>
                            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                              {r.name}
                              {r.next && <span style={{ fontSize: 12, color: "rgba(255,210,50,0.6)", marginLeft: 6 }}>next</span>}
                            </div>
                          </div>
                          <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{r.reward}</span>
                        </div>
                      ))}

                      {/* Separator between stages */}
                      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />

                      {/* ── Remaining steps ── */}
                      {[
                        { name: "Phone Verify", reward: "100% CB" },
                        { name: "Telegram", reward: "+$20" },
                        { name: "Mega Spin", reward: "$50–$500" },
                      ].map((r, idx) => (
                        <div key={idx} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", position: "relative",
                          animation: `tlSlideIn 0.4s ease-out ${0.44 + idx * 0.12}s both`,
                        }}>
                          <div style={{
                            position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)",
                            width: 10, height: 10, borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)",
                          }} />
                          <div>
                            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.35)" }}>
                              {r.name}
                            </div>
                          </div>
                          <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>{r.reward}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── CTA ── */}
                  <div style={{ padding: "16px 20px 18px" }}>
                    <button onClick={() => handleContinue(true)} style={{
                      width: "100%", padding: 15, borderRadius: 14, border: "none",
                      fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em",
                      cursor: "pointer", background: "linear-gradient(135deg,#ffd232,#ffab00)", color: "rgba(0,0,0,0.85)",
                      boxShadow: "0 6px 24px rgba(255,210,50,0.25), 0 2px 0 rgba(255,255,255,0.2) inset",
                      position: "relative", overflow: "hidden",
                    }}>
                      CREATE ACCOUNT
                      <div style={{
                        position: "absolute", top: 0, width: "40%", height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                        animation: "ctaShine 2.5s ease-in-out infinite",
                        pointerEvents: "none",
                      }} />
                    </button>
                  </div>
                </>
              )}
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
const islandImgNames = ["Islandio", "IS-CYAN", "IS-PURPLE", "IS-GREEN", "IS-RED", "KYC", "SP-1", "SP-2", "SP-3", "SP-4", "SP-5", "SP-6"];
let allIslandsReady = false;
let islandsLoadedCount = 0;
for (const name of islandImgNames) {
  const img = new Image();
  img.src = new URL(`./${name}.png`, import.meta.url).href;
  img.onload = () => { islandsLoadedCount++; if (islandsLoadedCount === islandImgNames.length) allIslandsReady = true; };
  islandImages[name] = img;
}
// Map level id → island image name (Chapter 1)
const ISLAND_MAP = { 1: "Islandio", 2: "IS-CYAN", 3: "IS-RED", 4: "IS-PURPLE", 5: "IS-RED", 6: "IS-CYAN" };
// Map level id → spring island image name (Chapter 2)
const ISLAND_MAP_CH2 = { 1: "SP-1", 2: "SP-2", 3: "SP-3", 4: "SP-4", 5: "SP-5", 6: "SP-6" };

function SceneCanvas({ scrollElRef, width, height, onNodePositions, levels, islandElsRef, completingId, completingStartRef, allComplete, currentChapter }) {
  const ref = useRef(null);
  const state = useRef({ stars: null, dust: null, t: 0, imgReady: false, dpr: 1, bgCache: null, bgW: 0, bgH: 0, bgChapter: 0 });
  const propsRef = useRef({ width, height, levels, completingId, allComplete, currentChapter });
  propsRef.current = { width, height, levels, completingId, allComplete, currentChapter };
  // smooth color/opacity transitions for each island
  const animColors = useRef(levels.map(lv => ({
    r: lv.r, g: lv.g, b: lv.b,
    alpha: lv.unlocked ? 1 : 0.35,
  })));

  useEffect(() => {
    state.current.dpr = window.devicePixelRatio || 1;
    // init stars — reduced count for performance
    const starCount = 120;
    state.current.stars = Array.from({ length: starCount }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.2,
      a: 0.1 + Math.random() * 0.5,
      p: Math.random() * 6.28,
      s: 0.003 + Math.random() * 0.01,
    }));
    state.current.dust = Array.from({ length: 20 }, () => ({
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
      const check = setInterval(() => { if (allIslandsReady) { state.current.imgReady = true; clearInterval(check); } }, 100);
    }
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c || !state.current.stars) return;
    const ctx = c.getContext("2d");
    let raf;
    // cache scrollY via passive listener to avoid forced reflow in rAF
    let cachedScrollY = scrollElRef.current ? scrollElRef.current.scrollTop : 0;
    const onScroll = () => { cachedScrollY = scrollElRef.current ? scrollElRef.current.scrollTop : 0; };
    const scrollEl = scrollElRef.current;
    if (scrollEl) scrollEl.addEventListener("scroll", onScroll, { passive: true });
    const draw = () => {
      const { width, height, levels, completingId: cId, allComplete: allDone, currentChapter: chap } = propsRef.current;
      const isCh2 = chap === 2;
      const cStart = completingStartRef?.current;
      const cElapsed = cId != null && cStart ? (performance.now() - cStart) / 1000 : 0;
      const scrollY = cachedScrollY;
      const dpr = state.current.dpr;
      const newW = width * dpr, newH = height * dpr;
      if (c.width !== newW || c.height !== newH) {
        c.width = newW; c.height = newH;
        state.current.bgCache = null; // invalidate cached bg
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.current.t += 0.014;
      const t = state.current.t;

      // ─── SMOOTH COLOR/OPACITY LERP per island ───
      const lerpSpeed = 0.04; // ~0.8s transition at 60fps
      for (let i = 0; i < levels.length; i++) {
        const lv = levels[i];
        const ac = animColors.current[i];
        const tR = lv.r;
        const tG = lv.g;
        const tB = lv.b;
        const tA = lv.unlocked ? 1 : 0.35;
        ac.r += (tR - ac.r) * lerpSpeed;
        ac.g += (tG - ac.g) * lerpSpeed;
        ac.b += (tB - ac.b) * lerpSpeed;
        ac.alpha += (tA - ac.alpha) * lerpSpeed;
      }

      ctx.clearRect(0, 0, width, height);

      // ─── BACKGROUND GRADIENT (cached) ───
      if (!state.current.bgCache || state.current.bgW !== width || state.current.bgH !== height || state.current.bgChapter !== (isCh2 ? 2 : 1)) {
        if (isCh2) {
          const bg = ctx.createLinearGradient(0, 0, 0, height);
          bg.addColorStop(0, "#c8b8e8");    // soft lavender top
          bg.addColorStop(0.25, "#b8c0e8"); // light periwinkle
          bg.addColorStop(0.5, "#c0c8f0");  // pale blue-lavender
          bg.addColorStop(0.75, "#d0c0e8"); // light purple
          bg.addColorStop(1, "#e0c8e8");    // soft pink-lavender bottom
          state.current.bgCache = bg;
        } else {
          const bg = ctx.createRadialGradient(width * 0.5, height * 0.25, 0, width * 0.5, height * 0.5, height * 0.9);
          bg.addColorStop(0, "#140838"); bg.addColorStop(0.35, "#0b0525");
          bg.addColorStop(0.65, "#06031a"); bg.addColorStop(1, "#010010");
          state.current.bgCache = bg;
        }
        state.current.bgW = width; state.current.bgH = height;
        state.current.bgChapter = isCh2 ? 2 : 1;
      }
      ctx.fillStyle = state.current.bgCache;
      ctx.fillRect(0, 0, width, height);

      if (isCh2) {
        // ─── SOFT CLOUDS for spring sky ───
        const cloudOff = scrollY * 0.02;
        const drawCloud = (fx, fy, fr, alpha) => {
          const cx2 = width * fx, cy2 = height * fy - cloudOff;
          const cr = fr * Math.min(width, height);
          const cg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, cr);
          cg.addColorStop(0, `rgba(255,255,255,${alpha})`);
          cg.addColorStop(0.5, `rgba(255,255,255,${alpha * 0.3})`);
          cg.addColorStop(1, "transparent");
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(cx2, cy2, cr, 0, 6.28); ctx.fill();
        };
        drawCloud(0.15, 0.1, 0.2, 0.15);
        drawCloud(0.8, 0.25, 0.18, 0.12);
        drawCloud(0.5, 0.5, 0.22, 0.1);
        drawCloud(0.2, 0.7, 0.15, 0.12);
        drawCloud(0.85, 0.8, 0.2, 0.1);

        // ─── SAKURA PETALS (floating particles) ───
        for (const d of state.current.dust) {
          d.x += d.vx; d.y += d.vy; d.p += 0.012;
          if (d.x < -0.05) d.x = 1.05; if (d.x > 1.05) d.x = -0.05;
          if (d.y > 1.05) d.y = -0.05; if (d.y < -0.05) d.y = 1.05;
          const dx = d.x * width, dy = d.y * height - scrollY * 0.015;
          const da = (d.a * 2) * (0.4 + 0.6 * Math.sin(d.p));
          // Pink/white sakura petals
          const petalColors = ["rgba(255,182,193,", "rgba(255,200,210,", "rgba(255,220,230,", "rgba(255,255,255,"];
          const pc = petalColors[Math.floor(d.r) % petalColors.length];
          ctx.fillStyle = pc + da + ")";
          ctx.beginPath(); ctx.arc(dx, dy, d.r * 1.2, 0, 6.28); ctx.fill();
        }
      } else {
        // ─── NEBULA BLOBS (simplified — 2 instead of 4) ───
        const nebOff = scrollY * 0.03;
        const drawNeb = (fx, fy, fr, cr, cg, cb, ca) => {
          const nx = width * fx, ny = height * fy - nebOff;
          const nr = fr * Math.min(width, height);
          const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
          ng.addColorStop(0, `rgba(${cr},${cg},${cb},${ca})`); ng.addColorStop(1, "transparent");
          ctx.fillStyle = ng;
          ctx.beginPath(); ctx.arc(nx, ny, nr, 0, 6.28); ctx.fill();
        };
        drawNeb(0.25, 0.2, 0.35, 60, 20, 140, 0.08);
        drawNeb(0.78, 0.6, 0.28, 0, 60, 150, 0.06);

        // ─── STARS ───
        for (const s of state.current.stars) {
          s.p += s.s;
          const sx = s.x * width, sy = s.y * height;
          const al = s.a * (0.35 + 0.65 * Math.sin(s.p));
          ctx.fillStyle = `rgba(190,200,255,${al})`;
          ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, 6.28); ctx.fill();
        }

        // ─── DUST PARTICLES (parallax, no glow halo) ───
        for (const d of state.current.dust) {
          d.x += d.vx; d.y += d.vy; d.p += 0.008;
          if (d.x < -0.05) d.x = 1.05; if (d.x > 1.05) d.x = -0.05;
          if (d.y < -0.05) d.y = 1.05; if (d.y > 1.05) d.y = -0.05;
          const dx = d.x * width, dy = d.y * height - scrollY * 0.015;
          const da = d.a * (0.4 + 0.6 * Math.sin(d.p));
          ctx.fillStyle = `rgba(${d.col.r},${d.col.g},${d.col.b},${da})`;
          ctx.beginPath(); ctx.arc(dx, dy, d.r, 0, 6.28); ctx.fill();
        }
      }

      // ─── ENERGY BEAMS between nodes ───
      const nodeScreenPos = [];
      for (let i = 0; i < levels.length; i++) {
        const nx = SIDES[i] * width;
        const ny = PAD_TOP + i * NODE_GAP - scrollY + 100;
        nodeScreenPos.push({ x: nx, y: ny });
      }

      for (let i = 0; i < levels.length - 1; i++) {
        const a = nodeScreenPos[i], b = nodeScreenPos[i + 1];
        // skip beams entirely off-screen
        const beamTop = Math.min(a.y, b.y) - 30, beamBot = Math.max(a.y, b.y) + 60;
        if (beamBot < 0 || beamTop > height) continue;
        const ac = animColors.current[i];
        const lr = Math.round(ac.r), lg = Math.round(ac.g), lb = Math.round(ac.b);
        const mx = (a.x + b.x) / 2 + (a.x < b.x ? -50 : 50);
        const my = (a.y + b.y) / 2;

        if (isCh2) {
          // Spring: glowing white/cyan path with sparkles
          ctx.setLineDash([]);
          // outer glow
          ctx.strokeStyle = "rgba(180,220,255,0.15)";
          ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y + 55); ctx.quadraticCurveTo(mx, my, b.x, b.y - 25);
          ctx.stroke();
          // core white beam
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(a.x, a.y + 55); ctx.quadraticCurveTo(mx, my, b.x, b.y - 25);
          ctx.stroke();
          // sparkle traveling orb
          const prog = ((t * 0.12 + i * 0.25) % 1);
          const ot = 1 - prog;
          const ox = (1 - ot) * (1 - ot) * a.x + 2 * (1 - ot) * ot * mx + ot * ot * b.x;
          const oy = (1 - ot) * (1 - ot) * (a.y + 55) + 2 * (1 - ot) * ot * my + ot * ot * (b.y - 25);
          ctx.fillStyle = "rgba(180,220,255,0.5)";
          ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 6.28); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, 6.28); ctx.fill();
        } else {
          // dashed beam
          ctx.setLineDash([5, 6]);
          ctx.lineDashOffset = -t * 40;
          ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.25)`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(a.x, a.y + 55); ctx.quadraticCurveTo(mx, my, b.x, b.y - 25);
          ctx.stroke();
          ctx.setLineDash([]);

          // traveling orb (simple circle, no gradient)
          const prog = ((t * 0.15 + i * 0.25) % 1);
          const ot = 1 - prog;
          const ox = (1 - ot) * (1 - ot) * a.x + 2 * (1 - ot) * ot * mx + ot * ot * b.x;
          const oy = (1 - ot) * (1 - ot) * (a.y + 55) + 2 * (1 - ot) * ot * my + ot * ot * (b.y - 25);
          ctx.fillStyle = `rgba(${lr},${lg},${lb},0.45)`;
          ctx.beginPath(); ctx.arc(ox, oy, 4, 0, 6.28); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.beginPath(); ctx.arc(ox, oy, 1.8, 0, 6.28); ctx.fill();
        }
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
        const ac = animColors.current[i];
        const lv = { ...levels[i], r: Math.round(ac.r), g: Math.round(ac.g), b: Math.round(ac.b) };
        const cx = nodeScreenPos[i].x;
        // subtle levitation — each island has its own phase, boosted during completion
        const baseLevitate = Math.sin(t * 1.5 + i * 1.7) * 4.5;
        const completeBounce = (cId === lv.id && cElapsed > 0 && cElapsed < 2) ? Math.sin(cElapsed * 8) * (1 - cElapsed / 2) * 12 : 0;
        const levitate = baseLevitate + completeBounce;
        const cy = nodeScreenPos[i].y + levitate;
        // sync HTML overlay element with same levitation
        if (islandElsRef?.current?.[i]) {
          islandElsRef.current[i].style.transform = `translateY(${levitate}px)`;
        }
        const jp = lv.id === 6;
        const sc = jp ? 1.25 : 1.0;
        const seed = lv.id;

        // ── VIEWPORT CULLING — skip islands entirely off-screen ──
        const margin = 200 * sc;
        const isOnScreen = cy > -margin && cy < height + margin;

        ctx.save();
        ctx.globalAlpha = ac.alpha;

        if (!isOnScreen) {
          // still need labelPos for HTML overlay positioning
          const rw = 95 * sc, depth = 50 * sc, ry = cy + 28 * sc;
          ctx.restore();
          labelPos.push({ x: cx, y: ry + depth + 22 * sc, id: lv.id });
          continue;
        }

        // ── AMBIENT GLOW (simplified — single color fill instead of gradient) ──
        if (isCh2) {
          // soft white glow for spring
          ctx.fillStyle = "rgba(255,255,255,0.06)";
        } else {
          ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},0.04)`;
        }
        ctx.beginPath(); ctx.arc(cx, cy + 10, 100 * sc, 0, 6.28); ctx.fill();

        // ═══════════════════
        // ═══ ROCK ISLAND ═══  (PNG image)
        // ═══════════════════
        const rw = 95 * sc, rh = 36 * sc;
        const depth = 50 * sc;
        const ry = cy + 28 * sc;

        // ── ground shadow (simple ellipse) ──
        if (isCh2) {
          ctx.fillStyle = "rgba(0,0,0,0.08)";
        } else {
          ctx.fillStyle = "rgba(0,0,0,0.15)";
        }
        ctx.beginPath(); ctx.ellipse(cx, ry + depth + 16, rw * 0.9, 14 * sc, 0, 0, 6.28); ctx.fill();

        // ── draw island PNG (color-matched or green if complete) ──
        if (state.current.imgReady) {
          const imgKey = isCh2 ? (ISLAND_MAP_CH2[lv.id] || "SP-1") : (ISLAND_MAP[lv.id] || "Islandio");
          const img = islandImages[imgKey];
          if (img && img.complete) {
            const imgW = isCh2 ? 200 * sc : 220 * sc;
            const imgH = imgW * (img.naturalHeight / img.naturalWidth);
            const imgX = cx - imgW / 2;
            const imgY = isCh2 ? (ry - imgH * 0.5) : (ry - imgH * 0.45);
            ctx.drawImage(img, imgX, imgY, imgW, imgH);
            // ── white glow-up overlay during completion (200ms offset per plan) ──
            if (cId === lv.id && cElapsed > 0.2 && cElapsed < 1.7) {
              const ge = cElapsed - 0.2; // offset elapsed
              const glowA = ge < 0.3 ? ge / 0.3 : (1 - (ge - 0.3) / 1.2);
              ctx.globalCompositeOperation = "lighter";
              ctx.globalAlpha = glowA * 0.5;
              ctx.drawImage(img, imgX, imgY, imgW, imgH);
              ctx.globalCompositeOperation = "source-over";
              ctx.globalAlpha = ac.alpha;
            }

            // ── themed icon overlay on island image (Ch1 only — Ch2 images have baked-in icons) ──
            if (!isCh2) {
            const iconSz = 28 * sc;
            const iconCx = cx;
            const iconCy = ry - imgH * 0.12;
            ctx.save();
            ctx.globalAlpha = ac.alpha * 0.85;
            ctx.strokeStyle = lv.accent || "#fff";
            ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},0.12)`;
            ctx.lineWidth = 2 * sc;
            ctx.lineCap = "round"; ctx.lineJoin = "round";

            if (lv.icon === "wheel") {
              // wheel/fortune icon
              ctx.beginPath(); ctx.arc(iconCx, iconCy, iconSz * 0.5, 0, Math.PI * 2); ctx.stroke(); ctx.fill();
              ctx.beginPath(); ctx.arc(iconCx, iconCy, iconSz * 0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
              for (let a = 0; a < 8; a++) {
                const angle = a * Math.PI / 4 + t * 0.5;
                ctx.beginPath();
                ctx.moveTo(iconCx + Math.cos(angle) * iconSz * 0.15, iconCy + Math.sin(angle) * iconSz * 0.15);
                ctx.lineTo(iconCx + Math.cos(angle) * iconSz * 0.42, iconCy + Math.sin(angle) * iconSz * 0.42);
                ctx.stroke();
              }
            } else if (lv.icon === "kyc") {
              // KYC png icon
              const kycImg = islandImages["KYC"];
              if (kycImg && kycImg.complete) {
                const kycSz = iconSz * 1.82;
                ctx.drawImage(kycImg, iconCx - kycSz / 2, iconCy - kycSz / 2, kycSz, kycSz);
              }
            } else if (lv.icon === "phone") {
              // phone icon
              const pw = iconSz * 0.4, ph = iconSz * 0.7;
              ctx.beginPath();
              ctx.roundRect(iconCx - pw / 2, iconCy - ph / 2, pw, ph, 4 * sc);
              ctx.stroke(); ctx.fill();
              ctx.beginPath(); ctx.arc(iconCx, iconCy + ph * 0.32, iconSz * 0.06, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (lv.icon === "telegram") {
              // paper plane icon
              ctx.beginPath();
              ctx.moveTo(iconCx - iconSz * 0.45, iconCy);
              ctx.lineTo(iconCx + iconSz * 0.45, iconCy - iconSz * 0.35);
              ctx.lineTo(iconCx + iconSz * 0.15, iconCy + iconSz * 0.4);
              ctx.lineTo(iconCx - iconSz * 0.05, iconCy + iconSz * 0.05);
              ctx.closePath();
              ctx.stroke(); ctx.fill();
              ctx.beginPath();
              ctx.moveTo(iconCx + iconSz * 0.45, iconCy - iconSz * 0.35);
              ctx.lineTo(iconCx - iconSz * 0.05, iconCy + iconSz * 0.05);
              ctx.stroke();
            } else if (lv.icon === "deposit") {
              // star icon
              const pts = 5, outerR = iconSz * 0.45, innerR = iconSz * 0.2;
              ctx.beginPath();
              for (let p = 0; p < pts * 2; p++) {
                const a = (p * Math.PI / pts) - Math.PI / 2;
                const r = p % 2 === 0 ? outerR : innerR;
                if (p === 0) ctx.moveTo(iconCx + Math.cos(a) * r, iconCy + Math.sin(a) * r);
                else ctx.lineTo(iconCx + Math.cos(a) * r, iconCy + Math.sin(a) * r);
              }
              ctx.closePath(); ctx.stroke(); ctx.fill();
            } else if (lv.icon === "crown") {
              // crown icon
              const crW = iconSz * 0.7, crH = iconSz * 0.45;
              ctx.beginPath();
              ctx.moveTo(iconCx - crW / 2, iconCy + crH * 0.3);
              ctx.lineTo(iconCx - crW / 2, iconCy - crH * 0.2);
              ctx.lineTo(iconCx - crW * 0.15, iconCy + crH * 0.1);
              ctx.lineTo(iconCx, iconCy - crH * 0.5);
              ctx.lineTo(iconCx + crW * 0.15, iconCy + crH * 0.1);
              ctx.lineTo(iconCx + crW / 2, iconCy - crH * 0.2);
              ctx.lineTo(iconCx + crW / 2, iconCy + crH * 0.3);
              ctx.closePath(); ctx.stroke(); ctx.fill();
            }
            ctx.restore();
            ctx.globalAlpha = ac.alpha;
            } // end !isCh2 icon overlay
          }
        }

        // portal position vars (needed by completion animation)
        const portalY = cy - 28 * sc;
        const portalRx = 52 * sc;
        const portalRy = 28 * sc;

        // ── PORTAL & EFFECTS ──
        {
        // ── CRYSTAL FORMATIONS (reduced to 2) ──
        const crystals = [
          { a: -0.5, h: 22, w: 4.5, off: 0 },
          { a: 0.6, h: 18, w: 4, off: 2 },
        ];
        for (const cr of crystals) {
          const baseX = cx + Math.cos(cr.a) * rw * 0.85;
          const baseY = ry + Math.sin(cr.a) * rh * 0.85;
          const ch = cr.h * sc;
          const cw2 = cr.w * sc;
          const sway = Math.sin(t * 0.6 + cr.off * 1.5) * 1.5;
          ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},0.3)`;
          ctx.beginPath();
          ctx.moveTo(baseX - cw2, baseY);
          ctx.lineTo(baseX + sway, baseY - ch);
          ctx.lineTo(baseX + cw2, baseY);
          ctx.closePath(); ctx.fill();
        }

        // ── DEBRIS (reduced to 3, no gradient glow) ──
        const drawDebris = (dx, dy, sz, rot) => {
          const floatY = Math.sin(t * 0.6 + dx * 0.3) * 4;
          ctx.save();
          ctx.translate(cx + (dx) * sc, ry + (dy + floatY) * sc);
          ctx.rotate(rot + t * 0.12);
          ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},0.25)`;
          ctx.beginPath();
          ctx.moveTo(0, -sz); ctx.lineTo(sz * 0.6, 0); ctx.lineTo(0, sz * 0.7); ctx.lineTo(-sz * 0.6, 0);
          ctx.closePath(); ctx.fill();
          ctx.restore();
        };
        drawDebris(-rw / sc - 10, 10, 5, 0.4);
        drawDebris(rw / sc + 8, 8, 4.5, -0.3);
        drawDebris(-rw / sc - 3, 30, 4, 0.9);

        // ── FOG/MIST (reduced to 2, simple fill) ──
        for (let fog = 0; fog < 2; fog++) {
          const fAngle = (fog / 2) * 6.28 + t * 0.08 + seed;
          const fDist = rw * (0.7 + 0.25 * Math.sin(t * 0.3 + fog * 2));
          const fx = cx + Math.cos(fAngle) * fDist;
          const fy = ry + depth * 0.6 + Math.sin(fAngle) * rh * 0.4;
          const fSize = 25 * sc;
          ctx.fillStyle = `rgba(${lv.r * 0.3 + 40 | 0},${lv.g * 0.3 + 40 | 0},${lv.b * 0.3 + 40 | 0},0.02)`;
          ctx.beginPath(); ctx.arc(fx, fy, fSize, 0, 6.28); ctx.fill();
        }

        // ═══════════════
        // ═══ PORTAL ═══
        // ═══════════════

        // ── outer bloom (reduced: 2 layers, simple fill) ──
        for (let bl = 0; bl < 2; bl++) {
          const bsc = 1.5 + bl * 0.6;
          const ba = (0.06 - bl * 0.02) * (0.7 + 0.3 * Math.sin(t * 1.3 + bl));
          ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},${ba})`;
          ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * bsc, portalRy * bsc, 0, 0, 6.28); ctx.fill();
        }

        // ── accretion rings (reduced: 3) ──
        for (let ring = 0; ring < 3; ring++) {
          const ringR = portalRx * (0.4 + ring * 0.2);
          const ringRy = portalRy * (0.4 + ring * 0.2);
          const ringA = (0.05 - ring * 0.012) * (0.6 + 0.4 * Math.sin(t * 1.5 + ring * 1.2));
          ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${ringA})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.ellipse(cx, portalY, ringR, ringRy, 0, 0, 6.28); ctx.stroke();
        }

        // ── vortex swirl arms (reduced: 2 layers, 20 segments) ──
        for (let layer = 0; layer < 2; layer++) {
          const arms = 4 + layer * 2;
          const maxDist = portalRx * (0.9 - layer * 0.12);
          const spin = t * (1.2 + layer * 0.5) * (layer % 2 === 0 ? 1 : -1);
          const alp = (0.18 - layer * 0.04) * (0.5 + 0.5 * Math.sin(t * 0.8 + layer));
          ctx.save();
          ctx.translate(cx, portalY);
          ctx.rotate(spin);
          for (let a = 0; a < arms; a++) {
            const angle = (a / arms) * Math.PI * 2;
            ctx.save(); ctx.rotate(angle);
            ctx.beginPath();
            for (let s = 0; s < 20; s++) {
              const frac = s / 20;
              const dist = frac * maxDist;
              const twist = frac * 3 + Math.sin(frac * 4.5 + t * 1.6) * 0.35;
              const px = Math.cos(twist) * dist;
              const py = Math.sin(twist) * dist * (portalRy / portalRx);
              if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${alp})`;
            ctx.lineWidth = (2 - layer * 0.3) * sc;
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
        }

        // ── dark vortex core (simple fill) ──
        ctx.fillStyle = `rgba(${lv.r * 0.15 | 0},${lv.g * 0.15 | 0},${lv.b * 0.15 | 0},0.7)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * 0.45, portalRy * 0.45, 0, 0, 6.28); ctx.fill();

        // ── distortion ripple ──
        const ripR = portalRx * (0.52 + 0.03 * Math.sin(t * 3));
        const ripRy = portalRy * (0.52 + 0.03 * Math.sin(t * 3));
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${0.15 + 0.08 * Math.sin(t * 2.5)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cx, portalY, ripR, ripRy, 0, 0, 6.28); ctx.stroke();

        // ── inner glow pulse (1 layer, simple fill) ──
        const pulseF = 0.25 + 0.05 * Math.sin(t * 2);
        ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},0.3)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * pulseF, portalRy * pulseF, 0, 0, 6.28); ctx.fill();

        // ── TORUS RING (no shadowBlur, reduced strokes) ──
        ctx.lineWidth = 5 * sc;
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},0.9)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx, portalRy, 0, 0, 6.28); ctx.stroke();
        // bright inner edge
        ctx.lineWidth = 1.5 * sc;
        ctx.strokeStyle = `rgba(${Math.min(255, lv.r + 70)},${Math.min(255, lv.g + 70)},${Math.min(255, lv.b + 70)},0.3)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx - 3 * sc, portalRy - 2 * sc, 0, 0, 6.28); ctx.stroke();

        // highlight arc (1 instead of 3)
        const hlBase = t * 0.3;
        ctx.lineWidth = 3 * sc;
        ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.1 * Math.sin(t * 0.5)})`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx, portalRy, 0, hlBase - 0.6, hlBase + 0.7); ctx.stroke();

        // ── inner dashed ring (1 instead of 2) ──
        ctx.setLineDash([6 * sc, 8 * sc]);
        ctx.lineDashOffset = -t * 30;
        ctx.lineWidth = 1 * sc;
        ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},0.18)`;
        ctx.beginPath(); ctx.ellipse(cx, portalY, portalRx * 0.65, portalRy * 0.65, 0, 0, 6.28); ctx.stroke();
        ctx.setLineDash([]);

        // ── orbiting particles (reduced: 3, no trails, no gradients) ──
        const orbCount = jp ? 5 : 3;
        for (let o = 0; o < orbCount; o++) {
          const oa = t * (0.55 + o * 0.15) + (o / orbCount) * 6.28;
          const ox = cx + Math.cos(oa) * portalRx;
          const oy = portalY + Math.sin(oa) * portalRy;
          const opulse = 0.4 + 0.6 * Math.sin(t * 2.2 + o * 1.5);
          ctx.fillStyle = `rgba(255,255,255,${0.7 * opulse})`;
          ctx.beginPath(); ctx.arc(ox, oy, 2, 0, 6.28); ctx.fill();
        }

        // ── jackpot effects (reduced: 12 rays) ──
        if (jp) {
          for (let r2 = 0; r2 < 12; r2++) {
            const ra = (r2 / 12) * 6.28 + t * 0.2;
            const ral = 0.04 + 0.08 * Math.sin(t * 1.8 + r2 * 0.8);
            ctx.strokeStyle = `rgba(${lv.r},${lv.g},${lv.b},${ral})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ra) * portalRx * 1.05, portalY + Math.sin(ra) * portalRy * 1.05);
            ctx.lineTo(cx + Math.cos(ra) * portalRx * 1.4, portalY + Math.sin(ra) * portalRy * 1.4);
            ctx.stroke();
          }
        }

        // ── light cone (simple fill, no gradient) ──
        ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},0.04)`;
        ctx.beginPath();
        ctx.moveTo(cx - portalRx * 0.3, portalY + portalRy);
        ctx.lineTo(cx + portalRx * 0.3, portalY + portalRy);
        ctx.lineTo(cx + portalRx * 0.8, ry - rh * 0.2);
        ctx.lineTo(cx - portalRx * 0.8, ry - rh * 0.2);
        ctx.closePath(); ctx.fill();

        // ── ambient floating particles (reduced: 3) ──
        for (let ap = 0; ap < 3; ap++) {
          const aAngle = t * (0.25 + ap * 0.12) + (ap / 3) * 6.28;
          const aRad = (65 + 35 * Math.sin(t * 0.4 + ap * 2)) * sc;
          const ax = cx + Math.cos(aAngle) * aRad;
          const ay = cy + Math.sin(aAngle * 0.6 + ap) * aRad * 0.35;
          ctx.fillStyle = `rgba(${lv.r},${lv.g},${lv.b},0.08)`;
          ctx.beginPath(); ctx.arc(ax, ay, 1.2, 0, 6.28); ctx.fill();
        }
        } // end portal & effects

        // ── COMPLETION ANIMATION ──
        if (cId === lv.id && cElapsed > 0 && cElapsed < 2.5) {
          const ce = cElapsed;

          // 1. Portal burst — shockwave ring
          if (ce < 1.2) {
            const burstP = ce / 1.2;
            const burstR = portalRx * (1 + burstP * 4);
            ctx.strokeStyle = `rgba(0,230,118,${(1 - burstP) * 0.6})`;
            ctx.lineWidth = 3 * (1 - burstP) + 0.5;
            ctx.beginPath(); ctx.arc(cx, portalY, burstR, 0, 6.28); ctx.stroke();
            // inner flash (simple fill, no gradient)
            if (ce < 0.3) {
              ctx.fillStyle = `rgba(255,255,255,${(1 - ce / 0.3) * 0.3})`;
              ctx.beginPath(); ctx.arc(cx, portalY, portalRx * 1.5, 0, 6.28); ctx.fill();
            }
          }

          // 2. Explosion particles (reduced: 10)
          if (ce < 1.8) {
            for (let ep = 0; ep < 10; ep++) {
              const eAngle = (ep / 10) * 6.28 + lv.id * 1.3;
              const eP = Math.min(1, ce / 1.5);
              const eDist = (60 + 40 * Math.sin(ep * 2.7)) * eP * (1 - eP * 0.4);
              const ex = cx + Math.cos(eAngle) * eDist;
              const ey = portalY + Math.sin(eAngle) * eDist * 0.6;
              ctx.fillStyle = ep % 3 === 0 ? `rgba(255,255,255,${(1 - eP) * 0.8})` : `rgba(0,230,118,${(1 - eP) * 0.8})`;
              ctx.beginPath(); ctx.arc(ex, ey, (1 - eP) * 3 + 0.5, 0, 6.28); ctx.fill();
            }
          }

          // 3. Green sparkles (reduced: 6)
          if (ce > 0.2 && ce < 2.0) {
            const sparkP = (ce - 0.2) / 1.8;
            for (let sp = 0; sp < 6; sp++) {
              const sAngle = sp * 1.05 + ce * 2;
              const sRise = sparkP * 80 * (0.5 + 0.5 * Math.sin(sp * 1.7));
              ctx.fillStyle = `rgba(0,230,118,${(1 - sparkP) * 0.7})`;
              ctx.beginPath(); ctx.arc(cx + Math.sin(sAngle) * (15 + sp * 5), cy - sRise, 1.5, 0, 6.28); ctx.fill();
            }
          }

          // 4. Beam ignite to next island (simple fill, no gradient)
          if (ce > 0.8 && ce < 2.0 && i < levels.length - 1) {
            const bP = Math.min(1, (ce - 0.8) / 0.8);
            const next = nodeScreenPos[i + 1];
            if (next) {
              const bx = nodeScreenPos[i].x;
              const by = nodeScreenPos[i].y + 55;
              const nx2 = next.x;
              const ny2 = next.y - 25;
              const bmx = (bx + nx2) / 2 + (bx < nx2 ? -50 : 50);
              const bmy = (by + ny2) / 2;
              const pt = bP;
              const px2 = (1-pt)*(1-pt)*bx + 2*(1-pt)*pt*bmx + pt*pt*nx2;
              const py2 = (1-pt)*(1-pt)*by + 2*(1-pt)*pt*bmy + pt*pt*ny2;
              ctx.fillStyle = `rgba(0,230,118,${0.6 * (1 - bP * 0.5)})`;
              ctx.beginPath(); ctx.arc(px2, py2, 8, 0, 6.28); ctx.fill();
              ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - bP * 0.3)})`;
              ctx.beginPath(); ctx.arc(px2, py2, 3, 0, 6.28); ctx.fill();
            }
          }
        }

        ctx.restore();
        labelPos.push({ x: cx, y: ry + depth + 22 * sc, id: lv.id });
      }

      // ─── METEORS (simple stroke, no gradient) ───
      for (let m = 0; m < 3; m++) {
        const phase = (t * 0.08 + m * 0.35) % 1;
        if (phase > 0.02 && phase < 0.85) {
          const mx2 = width * 1.1 - phase * width * 1.4;
          const my2 = height * (0.08 + m * 0.28) + phase * height * 0.2;
          const mLen = 60 + m * 25;
          ctx.save();
          ctx.translate(mx2, my2);
          ctx.rotate(-0.45);
          ctx.strokeStyle = `rgba(200,220,255,${0.2 + m * 0.05})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(-mLen, 0); ctx.lineTo(10, 0); ctx.stroke();
          ctx.restore();
        }
      }

      // ─── ALL COMPLETE: pulse wave + teaser (simplified) ───
      if (allDone && nodeScreenPos.length > 0) {
        for (let i = 0; i < nodeScreenPos.length; i++) {
          const np = nodeScreenPos[i];
          const waveP = (Math.sin(t * 2 - i * 0.15) + 1) / 2;
          const pulseR = 30 + waveP * 25;
          ctx.strokeStyle = `rgba(0,230,118,${0.1 + waveP * 0.15})`;
          ctx.lineWidth = 2 * (1 - waveP) + 0.5;
          ctx.beginPath(); ctx.arc(np.x, np.y, pulseR, 0, 6.28); ctx.stroke();
          ctx.fillStyle = `rgba(0,230,118,${(0.1 + waveP * 0.15) * 0.2})`;
          ctx.beginPath(); ctx.arc(np.x, np.y, pulseR, 0, 6.28); ctx.fill();
        }

        // "New World" teaser (simplified, no gradient)
        const topNode = nodeScreenPos[0];
        const portalX = topNode.x;
        const portalY2 = topNode.y - 100;
        const teaserPulse = (Math.sin(t * 1.5) + 1) / 2;
        const teaserR = 20 + teaserPulse * 8;
        ctx.strokeStyle = `rgba(180,120,255,${0.3 + teaserPulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(portalX, portalY2, teaserR, 0, 6.28); ctx.stroke();
        ctx.fillStyle = `rgba(140,80,220,${0.15 + teaserPulse * 0.1})`;
        ctx.beginPath(); ctx.arc(portalX, portalY2, teaserR, 0, 6.28); ctx.fill();
        // 3 particles instead of 6
        for (let tp = 0; tp < 3; tp++) {
          const tAngle = t * 1.2 + (tp / 3) * 6.28;
          const tDist = teaserR + 8 + Math.sin(t * 2 + tp) * 4;
          ctx.fillStyle = `rgba(180,120,255,${0.4 + teaserPulse * 0.3})`;
          ctx.beginPath(); ctx.arc(portalX + Math.cos(tAngle) * tDist, portalY2 + Math.sin(tAngle) * tDist * 0.6, 1.5, 0, 6.28); ctx.fill();
        }
        ctx.fillStyle = `rgba(200,160,255,${0.5 + teaserPulse * 0.3})`;
        ctx.font = "bold 16px 'Orbitron',sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("?", portalX, portalY2);
      }

      onNodePositions(labelPos);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); if (scrollEl) scrollEl.removeEventListener("scroll", onScroll); };
  }, []);

  return <canvas ref={ref} style={{ position: "sticky", top: 0, left: 0, width, height, zIndex: 1, display: "block", willChange: "transform" }} />;
}

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
export default function CosmicCasino() {
  const [currentChapter, setCurrentChapter] = useState(2);
  const [levels, setLevels] = useState(INITIAL_LEVELS_CH2);
  const [freeSpins, setFreeSpins] = useState(0);
  // Chapter-aware data selectors
  const chapterStageData = currentChapter === 1 ? STAGE_COMPLETE_DATA : STAGE_COMPLETE_DATA_CH2;
  const chapterSteps = currentChapter === 1 ? ALL_STEPS : ALL_STEPS_CH2;
  const chapterTitle = currentChapter === 1 ? "CHAPTER 1" : "ROAD TO VIP LEVEL 2";
  // Spring theme helpers for Ch2
  const isSpr = currentChapter === 2;
  const sprOverlay = isSpr ? "rgba(60,40,90,0.88)" : "rgba(1,0,8,0.92)";
  const sprOverlayLight = isSpr ? "rgba(60,40,90,0.82)" : "rgba(0,0,10,0.85)";
  const sprCard = isSpr
    ? "linear-gradient(170deg, rgba(55,35,85,0.98), rgba(35,20,60,0.99))"
    : "linear-gradient(170deg, rgba(28,22,52,0.98), rgba(8,4,20,0.99))";
  const sprCardAlt = (mid) => isSpr
    ? "linear-gradient(165deg, rgba(45,28,75,0.97) 0%, rgba(55,35,85,0.98) 50%, rgba(45,28,75,0.97) 100%)"
    : `linear-gradient(165deg, #0a0a1a 0%, ${mid} 50%, #0a0a1a 100%)`;
  const sprText = isSpr ? "#2a1850" : "#fff";
  const sprTextSub = isSpr ? "rgba(42,24,80,0.6)" : "rgba(255,255,255,0.5)";
  const sprBorder = (r,g,b) => isSpr ? "1px solid rgba(180,160,220,0.3)" : `1px solid rgba(${r},${g},${b},0.1)`;
  const sprShadow = (r,g,b) => isSpr
    ? "0 20px 60px rgba(80,40,120,0.15), 0 0 0 1px rgba(180,160,220,0.2)"
    : `0 0 0 1px rgba(${r},${g},${b},0.1), 0 0 80px rgba(${r},${g},${b},0.12)`;
  const [selected, setSelected] = useState(null);
  const [showWheel, setShowWheel] = useState(false);
  const [showMegaWheel, setShowMegaWheel] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showFinalCeremony, setShowFinalCeremony] = useState(false);
  const [showJourneyComplete, setShowJourneyComplete] = useState(false);
  const [showCompletionConfetti, setShowCompletionConfetti] = useState(false);
  const [showStageComplete, setShowStageComplete] = useState(null); // null or { stage: 1, ... }
  const [dim, setDim] = useState({ w: 400, h: 700 });
  const labelsRef = useRef([]);
  const islandElsRef = useRef([]);
  const [introPlayed, setIntroPlayed] = useState(false);
  // telegram promo code — stable across re-renders
  const [telegramCode] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  });
  // phone modal state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState(0); // 0=phone, 1=otp
  const otpRefs = useRef([]);
  // deposit amount selection
  const [depositAmount, setDepositAmount] = useState("$50");
  // 24h countdown
  const [countdownEnd] = useState(() => Date.now() + 24 * 60 * 60 * 1000);
  const [countdownStr, setCountdownStr] = useState("23:59:59");
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  // completion animation state
  const [completingId, setCompletingId] = useState(null);
  const completingStartRef = useRef(null);
  // reward pop overlay
  const [rewardPop, setRewardPop] = useState(null); // { text, x, y }
  // bonus tracking
  const [bonuses, setBonuses] = useState({
    depositBonus: null,   // "150%" after island 1
    freeSpins: 0,         // cumulative FS
    cashback: null,       // "100%" after island 3
    telegramBonus: null,  // "+$20" after island 4
    megaSpinPrize: null,  // prize from island 5
  });

  // 24h countdown timer
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, countdownEnd - Date.now());
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setCountdownStr(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [countdownEnd]);

  // simulate external verification check (phone/telegram pre-completed)
  // In production: replace with API call. Use ?preVerified=3,4 in URL to test.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preVerified = (params.get("preVerified") || "").split(",").map(Number).filter(Boolean);
    if (preVerified.length > 0) {
      setLevels(prev => prev.map(l =>
        preVerified.includes(l.id) && !l.unlocked ? { ...l, lockedButCompleted: true } : l
      ));
    }
  }, []);

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

  // trigger the completing animation, then finalize after delay
  const triggerComplete = useCallback((lvId, extraUpdates = {}) => {
    setCompletingId(lvId);
    completingStartRef.current = performance.now();
    // show reward pop text
    const idx = levels.findIndex(l => l.id === lvId);
    const lv = levels[idx];
    if (lv && labelsRef.current[idx]) {
      setRewardPop({ text: lv.rewardShort, x: labelsRef.current[idx].x, y: labelsRef.current[idx].y });
      setTimeout(() => setRewardPop(null), 2000);
    }
    // apply bonus per level (chapter-specific)
    if (currentChapter === 1) {
      if (lvId === 1) {
        setFreeSpins(prev => prev + 50);
        setBonuses(prev => ({ ...prev, depositBonus: "150%", freeSpins: prev.freeSpins + 50 }));
        extraUpdates = { ...extraUpdates, bonusState: "pending" };
      } else if (lvId === 2) {
        setFreeSpins(prev => prev + 50);
        setBonuses(prev => ({ ...prev, freeSpins: prev.freeSpins + 50 }));
      } else if (lvId === 3) {
        setBonuses(prev => ({ ...prev, cashback: "100%" }));
      } else if (lvId === 4) {
        setBonuses(prev => ({ ...prev, telegramBonus: "+$20" }));
      }
    } else {
      if (lvId === 1) {
        setFreeSpins(prev => prev + 100);
        setBonuses(prev => ({ ...prev, depositBonus: "200%", freeSpins: prev.freeSpins + 100 }));
      } else if (lvId === 2) {
        setFreeSpins(prev => prev + 100);
        setBonuses(prev => ({ ...prev, freeSpins: prev.freeSpins + 100 }));
      } else if (lvId === 3) {
        setBonuses(prev => ({ ...prev, referralBonus: "+$50" }));
      } else if (lvId === 4) {
        setBonuses(prev => ({ ...prev, reloadBonus: "200%" }));
      }
    }
    // fire confetti on every island completion
    setShowCompletionConfetti(true);
    setTimeout(() => setShowCompletionConfetti(false), 3000);
    // after animation duration: finalize completion
    setTimeout(() => {
      setCompletingId(null);
      setLevels(prev => {
        const next = prev.map(l =>
          l.id === lvId ? { ...l, complete: true, completing: false, bonusState: "active", ...extraUpdates }
          : l.id === lvId + 1 ? { ...l, unlocked: true }
          : l
        );
        // auto-complete next island if it was lockedButCompleted (pre-verified externally)
        const nextLv = next.find(l => l.id === lvId + 1);
        if (nextLv && nextLv.lockedButCompleted && nextLv.unlocked && !nextLv.complete) {
          setTimeout(() => triggerComplete(nextLv.id), 2500);
        }
        // check if all islands are complete → camera zoom-out + journey complete
        if (next.every(l => l.complete)) {
          // smooth scroll to top to reveal all islands
          const el = scrollRef.current;
          if (el && el.scrollTop > 0) {
            const startScroll = el.scrollTop;
            const duration = 1800;
            const t0 = performance.now();
            const ease = (t) => t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
            const animateScroll = (now) => {
              const p = Math.min(1, (now - t0) / duration);
              el.scrollTop = startScroll * (1 - ease(p));
              if (p < 1) requestAnimationFrame(animateScroll);
              else setTimeout(() => setShowJourneyComplete(true), 600);
            };
            requestAnimationFrame(animateScroll);
          } else {
            setTimeout(() => setShowJourneyComplete(true), 500);
          }
        }
        return next;
      });
    }, 2000);
    // immediately set completing flag on level
    setLevels(prev => prev.map(l =>
      l.id === lvId ? { ...l, completing: true } : l
    ));
  }, [levels, currentChapter]);

  // handle clicking a level
  const handleLevelClick = useCallback((lv) => {
    if (lv.complete || lv.completing) return;
    if (!lv.unlocked) { setSelected(lv); return; }
    if (currentChapter === 1) {
      if (lv.id === 1) setShowWheel(true);
      else if (lv.id === 2) setShowKYC(true);
      else if (lv.id === 3) { setPhoneStep(0); setPhoneNumber(""); setPhoneOtp(""); setShowPhone(true); }
      else if (lv.id === 4) setShowTelegram(true);
      else if (lv.id === 5) { setDepositAmount("$50"); setShowDeposit(true); }
      else if (lv.id === 6) setShowFinalCeremony(true);
      else setSelected(lv);
    } else {
      // Chapter 2 interactions — simple click-to-complete for demo
      if (lv.id === 1) { setShowDeposit(true); } // First Deposit
      else if (lv.id === 5) { setShowMegaWheel(true); } // VIP Spin
      else { triggerComplete(lv.id); setTimeout(() => setShowStageComplete({ levelId: lv.id }), 2200); }
    }
  }, [triggerComplete, currentChapter]);


  // handle wheel win (Welcome Spin)
  const handleWheelWin = useCallback((prize) => {
    setShowWheel(false);
    triggerComplete(1, { reward: prize.label.replace("\n", " "), rewardShort: prize.label.replace("\n", " ") });
  }, [triggerComplete]);

  // handle KYC verification done (Island 2)
  const handleKYCDone = useCallback(() => {
    setShowKYC(false);
    triggerComplete(2);
    setTimeout(() => setShowStageComplete({ levelId: 2 }), 2200);
  }, [triggerComplete]);

  // handle Phone verification done (Island 3)
  const handlePhoneDone = useCallback(() => {
    setShowPhone(false);
    triggerComplete(3);
    setTimeout(() => setShowStageComplete({ levelId: 3 }), 2200);
  }, [triggerComplete]);

  // handle telegram verification done (Island 4)
  const handleTelegramDone = useCallback(() => {
    setShowTelegram(false);
    triggerComplete(4);
    setTimeout(() => setShowStageComplete({ levelId: 4 }), 2200);
  }, [triggerComplete]);

  // handle deposit confirmed → show mega wheel (Ch1) or complete level 1 (Ch2)
  const handleDepositDone = useCallback(() => {
    setShowDeposit(false);
    if (currentChapter === 1) {
      setShowMegaWheel(true);
    } else {
      // Chapter 2: First Deposit completes level 1
      triggerComplete(1);
      setTimeout(() => setShowStageComplete({ levelId: 1 }), 2200);
    }
  }, [currentChapter, triggerComplete]);

  // handle mega wheel win (Island 5 — both chapters)
  const handleMegaWheelWin = useCallback((prize) => {
    setShowMegaWheel(false);
    const prizeText = prize.label.replace("\n", " ");
    setBonuses(prev => ({ ...prev, megaSpinPrize: prizeText }));
    triggerComplete(5, { reward: prizeText, rewardShort: prizeText });
    // After island 5 completes, also mark island 6 done and show Journey Complete
    setTimeout(() => {
      setLevels(prev => prev.map(l => l.id === 6 ? { ...l, complete: true, unlocked: true } : l));
      setShowJourneyComplete(true);
    }, 2400);
  }, [triggerComplete]);

  // complete a level from detail modal
  const handleComplete = useCallback((lvId) => {
    setSelected(null);
    triggerComplete(lvId);
  }, [triggerComplete]);

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
  const isDesktop = dim.w > 768;
  const allComplete = useMemo(() => levels.every(l => l.complete), [levels]);
  const sortedLevels = useMemo(() => [...levels].sort((a, b) => a.id - b.id), [levels]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh", background: currentChapter === 2 ? "#b0a8d0" : "#010010", overflow: "hidden", position: "relative", fontFamily: "'Exo 2', sans-serif" }}>
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
        @keyframes prizePulse { 0%,100%{box-shadow:0 0 40px rgba(0,230,118,0.2), 0 0 80px rgba(0,230,118,0.08)} 50%{box-shadow:0 0 60px rgba(0,230,118,0.35), 0 0 120px rgba(0,230,118,0.15)} }
        @keyframes prizeStarBurst { 0%{transform:scale(0) rotate(0deg);opacity:0} 40%{transform:scale(1.2) rotate(180deg);opacity:0.6} 100%{transform:scale(2) rotate(360deg);opacity:0} }
        @keyframes prizeRing { 0%{transform:translate(-50%,-50%) scale(0.2);opacity:0.8;border-width:6px} 100%{transform:translate(-50%,-50%) scale(2.5);opacity:0;border-width:1px} }
        @keyframes prizeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes prizeTextPop { 0%{transform:scale(0) translateY(20px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes prizeGlowLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes dotPulse { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes pulse { 0%,100%{transform:translateY(-50%) scale(1);opacity:0.4} 50%{transform:translateY(-50%) scale(1.5);opacity:0} }
        @keyframes rewardFloat { 0%{transform:translate(-50%,-50%) scale(0.5);opacity:0} 15%{transform:translate(-50%,-80%) scale(1.2);opacity:1} 60%{transform:translate(-50%,-180%) scale(1);opacity:1} 100%{transform:translate(-50%,-260%) scale(0.8);opacity:0} }
        @keyframes completionFlash { 0%{opacity:1} 100%{opacity:0} }
        @keyframes tlSlideIn { 0%{transform:translateX(-12px);opacity:0} 100%{transform:translateX(0);opacity:1} }
        @keyframes tlLineGrow { 0%{transform:scaleY(0)} 100%{transform:scaleY(1)} }
        @keyframes tlDotPop { 0%{transform:translateY(-50%) scale(0)} 60%{transform:translateY(-50%) scale(1.3)} 100%{transform:translateY(-50%) scale(1)} }
        @keyframes tlBeepGold { 0%,100%{transform:translateY(-50%) scale(1);box-shadow:0 0 6px rgba(255,210,50,0.2), 0 0 12px rgba(255,210,50,0.08)} 50%{transform:translateY(-50%) scale(1.12);box-shadow:0 0 12px rgba(255,210,50,0.5), 0 0 24px rgba(255,210,50,0.2)} }
        @keyframes ctaShine { 0%{left:-100%} 100%{left:200%} }
        .hideScroll::-webkit-scrollbar{width:0} .hideScroll{scrollbar-width:none}
        @media(min-width:769px){
          .mobileOnly{display:none!important}
          .desktopOnly{display:flex!important}
        }
        @media(max-width:768px){
          .desktopOnly{display:none!important}
          .mobileOnly{display:flex!important}
        }
      `}</style>

      {/* ═══ DESKTOP LEFT PANEL ═══ */}
      <div className="desktopOnly" style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 280, zIndex: 80,
        flexDirection: "column", padding: "20px 16px",
        background: currentChapter === 2
          ? "linear-gradient(180deg, rgba(35,18,60,0.97) 0%, rgba(45,25,75,0.95) 100%)"
          : "linear-gradient(180deg, rgba(5,2,18,0.97) 0%, rgba(8,4,24,0.95) 100%)",
        borderRight: currentChapter === 2 ? "1px solid rgba(180,120,255,0.08)" : "1px solid rgba(255,255,255,0.04)",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 24, paddingTop: 8 }}>
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

        {/* Chapter Title */}
        <div style={{
          fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 900, letterSpacing: "0.15em",
          color: currentChapter === 1 ? "#ffd232" : "#b478ff", marginBottom: 16,
          padding: "8px 12px", borderRadius: 10,
          background: currentChapter === 1 ? "rgba(255,210,50,0.06)" : "rgba(180,120,255,0.06)",
          border: currentChapter === 1 ? "1px solid rgba(255,210,50,0.12)" : "1px solid rgba(180,120,255,0.12)",
        }}>{chapterTitle}</div>

        {/* Level Progress List */}
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginBottom: 12, textTransform: "uppercase" }}>Quest Progress</div>
        {sortedLevels.map((lv, i) => {
          const done = lv.complete;
          const active = lv.unlocked && !done;
          const locked = !lv.unlocked;
          return (
            <div key={lv.id} onClick={() => handleLevelClick(lv)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, marginBottom: 6,
              cursor: "pointer",
              background: active ? `rgba(${lv.r},${lv.g},${lv.b},0.08)` : done ? "rgba(0,230,118,0.04)" : "rgba(255,255,255,0.01)",
              border: active ? `1px solid rgba(${lv.r},${lv.g},${lv.b},0.15)` : done ? "1px solid rgba(0,230,118,0.1)" : "1px solid rgba(255,255,255,0.03)",
              transition: "all 0.3s ease",
            }}>
              {/* Step number / check */}
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "linear-gradient(135deg, #00e676, #00c853)" : active ? `rgba(${lv.r},${lv.g},${lv.b},0.15)` : "rgba(255,255,255,0.03)",
                border: done ? "none" : active ? `1.5px solid ${lv.accent}` : "1px solid rgba(255,255,255,0.06)",
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13L9.5 17.5L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 900, color: active ? lv.accent : "rgba(255,255,255,0.12)" }}>{lv.id}</span>
                )}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 800,
                  color: done ? "#00e676" : active ? "#fff" : "rgba(255,255,255,0.2)",
                  marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{lv.name}</div>
                <div style={{
                  fontFamily: "'Exo 2',sans-serif", fontSize: 9, fontWeight: 600,
                  color: done ? "rgba(0,230,118,0.5)" : active ? `rgba(${lv.r},${lv.g},${lv.b},0.6)` : "rgba(255,255,255,0.12)",
                }}>{done ? "Completed" : locked ? "Locked" : lv.task}</div>
              </div>
              {/* Reward badge */}
              <div style={{
                padding: "3px 8px", borderRadius: 6, flexShrink: 0,
                background: done ? "rgba(0,230,118,0.08)" : `rgba(${lv.r},${lv.g},${lv.b},0.06)`,
                border: done ? "1px solid rgba(0,230,118,0.15)" : `1px solid rgba(${lv.r},${lv.g},${lv.b},0.1)`,
              }}>
                <span style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800,
                  color: done ? "#00e676" : active ? lv.accent : "rgba(255,255,255,0.15)",
                }}>{lv.rewardShort}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ DESKTOP RIGHT PANEL ═══ */}
      <div className="desktopOnly" style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 260, zIndex: 80,
        flexDirection: "column", padding: "20px 16px",
        background: currentChapter === 2
          ? "linear-gradient(180deg, rgba(35,18,60,0.97) 0%, rgba(45,25,75,0.95) 100%)"
          : "linear-gradient(180deg, rgba(5,2,18,0.97) 0%, rgba(8,4,24,0.95) 100%)",
        borderLeft: currentChapter === 2 ? "1px solid rgba(180,120,255,0.08)" : "1px solid rgba(255,255,255,0.04)",
        overflowY: "auto",
      }}>
        {/* Free Spins counter */}
        <div style={{
          padding: "20px 16px", borderRadius: 16, marginBottom: 20, textAlign: "center",
          background: "linear-gradient(135deg, rgba(255,215,64,0.08), rgba(255,180,0,0.03))",
          border: "1px solid rgba(255,215,64,0.15)",
        }}>
          <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginBottom: 10, textTransform: "uppercase" }}>Free Spins Balance</div>
          <div style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: 36, fontWeight: 900, color: "#ffd740",
            textShadow: "0 0 24px rgba(255,215,64,0.3)",
            lineHeight: 1,
          }}>{freeSpins}</div>
          <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "rgba(255,215,64,0.3)", marginTop: 6 }}>spins available</div>
        </div>

        {/* Active Bonuses */}
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginBottom: 12, textTransform: "uppercase" }}>Active Bonuses</div>
        {[
          bonuses.depositBonus && { label: "Deposit Bonus", value: bonuses.depositBonus, color: "#ffd232", rgb: "255,210,50" },
          bonuses.cashback && { label: "Cashback", value: bonuses.cashback, color: "#ff3278", rgb: "255,50,120" },
          bonuses.telegramBonus && { label: "Telegram Bonus", value: bonuses.telegramBonus, color: "#00b4ff", rgb: "0,180,255" },
          bonuses.megaSpinPrize && { label: "Mega Spin Prize", value: bonuses.megaSpinPrize, color: "#ffa028", rgb: "255,160,40" },
          bonuses.referralBonus && { label: "Referral Bonus", value: bonuses.referralBonus, color: "#00c896", rgb: "0,200,150" },
          bonuses.reloadBonus && { label: "Reload Bonus", value: bonuses.reloadBonus, color: "#ffb432", rgb: "255,180,50" },
        ].filter(Boolean).map((b, idx) => (
          <div key={idx} style={{
            padding: "10px 12px", borderRadius: 10, marginBottom: 6,
            background: `rgba(${b.rgb},0.05)`,
            border: `1px solid rgba(${b.rgb},0.1)`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>{b.label}</span>
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, color: b.color }}>{b.value}</span>
          </div>
        ))}
        {!(bonuses.depositBonus || bonuses.cashback || bonuses.telegramBonus || bonuses.megaSpinPrize) && (
          <div style={{
            padding: "20px 14px", borderRadius: 12, textAlign: "center",
            background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)",
          }}>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.15)", lineHeight: 1.5 }}>Complete quests to earn bonuses</div>
          </div>
        )}

        {/* Journey Rewards — timeline style */}
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginTop: 24, marginBottom: 14, textTransform: "uppercase" }}>Journey Rewards</div>
        <div style={{ position: "relative", paddingLeft: 22 }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 1.5, borderRadius: 1, background: "rgba(255,255,255,0.04)" }} />
          {/* Green progress line */}
          {(() => {
            const completedCount = sortedLevels.filter(l => l.complete).length;
            if (completedCount === 0) return null;
            const h = Math.min(100, (completedCount / sortedLevels.length) * 100);
            return <div style={{ position: "absolute", left: 6, top: 8, width: 1.5, borderRadius: 1, background: "linear-gradient(180deg, #00e676, rgba(0,230,118,0.3))", height: `calc(${h}% - 16px)` }} />;
          })()}
          {sortedLevels.map((lv, idx) => {
            const done = lv.complete;
            const active = lv.unlocked && !done;
            return (
              <div key={lv.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "6px 0", position: "relative",
              }}>
                {/* Dot */}
                <div style={{
                  position: "absolute", left: done ? -19 : -18, top: "50%", transform: "translateY(-50%)",
                  width: done ? 10 : 8, height: done ? 10 : 8, borderRadius: "50%",
                  background: done ? "#00e676" : active ? lv.accent : "rgba(255,255,255,0.08)",
                  boxShadow: done ? "0 0 6px rgba(0,230,118,0.4)" : active ? `0 0 6px ${lv.accent}40` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {done && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                {/* Name + reward */}
                <span style={{
                  fontFamily: "'Exo 2',sans-serif", fontSize: 11, fontWeight: done ? 700 : 500,
                  color: done ? "rgba(0,230,118,0.6)" : active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)",
                  flex: 1,
                }}>{lv.name}</span>
                <span style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800,
                  color: done ? "rgba(0,230,118,0.5)" : active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                }}>{lv.rewardShort}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Single scroll container — canvas (sticky) + labels scroll together */}
      <div ref={scrollRef} className="hideScroll" style={{
        position: "absolute", inset: 0, zIndex: 20, overflowY: "auto", overflowX: "hidden",
        WebkitOverflowScrolling: "touch", willChange: "scroll-position",
        ...(isDesktop ? { left: 280, right: 260 } : {}),
      }}>
        {/* Canvas stays in viewport via sticky, negative margin so it doesn't push labels */}
        <SceneCanvas scrollElRef={scrollRef} width={isDesktop ? dim.w - 540 : dim.w} height={dim.h} onNodePositions={onNodePositions} levels={levels} islandElsRef={islandElsRef} completingId={completingId} completingStartRef={completingStartRef} allComplete={allComplete} currentChapter={currentChapter} />
        <div style={{ height: totalH, position: "relative", marginTop: -dim.h }}>
          {levels.map((lv, i) => {
            const canvasW = isDesktop ? dim.w - 540 : dim.w;
            const sx = SIDES[i] * canvasW;
            const sy = PAD_TOP + i * NODE_GAP;
            const jp = lv.id === 6;
            const locked = !lv.unlocked;
            const iconColor = lv.accent;

            return (
              <div key={lv.id} ref={el => { islandElsRef.current[i] = el; }} style={{
                position: "absolute", top: sy - 55, left: sx - (jp ? 130 : 110), width: jp ? 260 : 220, height: jp ? 240 : 200,
                cursor: "pointer", zIndex: 25, willChange: "transform",
              }} onClick={() => handleLevelClick(lv)}>
                {/* icon above portal */}
                <div style={{
                  position: "absolute",
                  top: jp ? 39 : 65,
                  left: "50%", transform: "translateX(-50%)",
                  zIndex: 30,
                  opacity: locked ? 0.3 : 1,
                  transition: "opacity 0.8s ease",
                }}>
                  <svg width={jp ? 40 : 28} height={jp ? 40 : 28} viewBox="0 0 40 40" fill="none">
                    {lv.icon === "kyc" && <>
                      <rect x="8" y="6" width="24" height="28" rx="3" stroke={iconColor} strokeWidth="2.5" fill="none" />
                      <circle cx="20" cy="17" r="5" stroke={iconColor} strokeWidth="2" fill="none" />
                      <path d="M12 30 Q20 24 28 30" stroke={iconColor} strokeWidth="2" fill="none" />
                    </>}
                    {lv.icon === "wheel" && <>
                      <circle cx="20" cy="20" r="16" stroke={iconColor} strokeWidth="3" fill="none" />
                      <circle cx="20" cy="20" r="4" fill={iconColor} />
                      {[0,45,90,135,180,225,270,315].map(a => <line key={a} x1="20" y1="20" x2={20+Math.cos(a*Math.PI/180)*14} y2={20+Math.sin(a*Math.PI/180)*14} stroke={iconColor} strokeWidth="1.5" />)}
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
                    {lv.icon === "wallet" && <>
                      <rect x="6" y="10" width="28" height="20" rx="3" stroke={iconColor} strokeWidth="2.5" fill="none" />
                      <path d="M6 16 L34 16" stroke={iconColor} strokeWidth="2" />
                      <circle cx="28" cy="22" r="2.5" fill={iconColor} />
                    </>}
                    {lv.icon === "play" && <>
                      <circle cx="20" cy="20" r="15" stroke={iconColor} strokeWidth="2.5" fill="none" />
                      <polygon points="16,12 30,20 16,28" fill={iconColor} />
                    </>}
                    {lv.icon === "refer" && <>
                      <circle cx="15" cy="14" r="6" stroke={iconColor} strokeWidth="2" fill="none" />
                      <circle cx="28" cy="14" r="4" stroke={iconColor} strokeWidth="2" fill="none" />
                      <path d="M5 32 Q15 22 25 32" stroke={iconColor} strokeWidth="2" fill="none" />
                      <path d="M22 30 Q28 24 34 30" stroke={iconColor} strokeWidth="2" fill="none" />
                    </>}
                    {lv.icon === "trophy" && <>
                      <path d="M12 8 L28 8 L26 20 Q20 26 14 20 Z" stroke={iconColor} strokeWidth="2.5" fill="none" />
                      <path d="M12 10 Q6 10 6 16 Q6 20 12 18" stroke={iconColor} strokeWidth="2" fill="none" />
                      <path d="M28 10 Q34 10 34 16 Q34 20 28 18" stroke={iconColor} strokeWidth="2" fill="none" />
                      <line x1="20" y1="24" x2="20" y2="30" stroke={iconColor} strokeWidth="2" />
                      <line x1="14" y1="30" x2="26" y2="30" stroke={iconColor} strokeWidth="2.5" />
                    </>}
                  </svg>
                </div>

                {/* Prize bubble — shown when completed */}
                {lv.complete && (
                  <div style={{
                    position: "absolute",
                    top: currentChapter === 2 ? "58%" : (jp ? 85 : 100),
                    left: currentChapter === 2 ? "46%" : "50%",
                    transform: currentChapter === 2 ? "translate(-50%, -50%)" : "translateX(-50%)",
                    zIndex: 31, pointerEvents: "none",
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 20,
                    background: "linear-gradient(135deg, rgba(0,230,118,0.35), rgba(0,200,83,0.25))",
                    border: "1.5px solid rgba(0,230,118,0.7)",
                    boxShadow: "0 0 16px rgba(0,230,118,0.4), 0 0 6px rgba(0,230,118,0.2) inset",
                    backdropFilter: "blur(6px)",
                    whiteSpace: "nowrap",
                    animation: "fadeIn 0.5s ease-out",
                  }}>
                    {/* Reward icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      {(lv.rewardShort.includes("FS") || lv.rewardShort.includes("Spin")) ? (
                        /* Free Spins — slot machine / spinning circle */
                        <>
                          <circle cx="12" cy="12" r="9" stroke="#00e676" strokeWidth="2" fill="none" />
                          <path d="M12 3 C12 3 16 8 16 12 C16 16 12 21 12 21" stroke="#00e676" strokeWidth="1.5" fill="none" />
                          <path d="M12 3 C12 3 8 8 8 12 C8 16 12 21 12 21" stroke="#00e676" strokeWidth="1.5" fill="none" />
                          <line x1="3" y1="12" x2="21" y2="12" stroke="#00e676" strokeWidth="1.5" />
                        </>
                      ) : lv.rewardShort.includes("CB") || lv.rewardShort.includes("%") ? (
                        /* Cashback / Percentage — percentage symbol */
                        <>
                          <circle cx="8" cy="8" r="3" stroke="#00e676" strokeWidth="2" fill="none" />
                          <circle cx="16" cy="16" r="3" stroke="#00e676" strokeWidth="2" fill="none" />
                          <line x1="18" y1="6" x2="6" y2="18" stroke="#00e676" strokeWidth="2" strokeLinecap="round" />
                        </>
                      ) : lv.rewardShort.includes("$") ? (
                        /* Cash — dollar sign */
                        <>
                          <circle cx="12" cy="12" r="9" stroke="#00e676" strokeWidth="2" fill="none" />
                          <path d="M12 6 L12 18 M9 9 C9 7.5 15 7.5 15 9.5 C15 11.5 9 11.5 9 14 C9 16 15 16.5 15 15" stroke="#00e676" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                        </>
                      ) : (
                        /* Default — star / trophy */
                        <>
                          <polygon points="12,3 14.5,9 21,9 16,13.5 18,20 12,16 6,20 8,13.5 3,9 9.5,9" stroke="#00e676" strokeWidth="1.5" fill="rgba(0,230,118,0.15)" />
                        </>
                      )}
                    </svg>
                    <span style={{
                      fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 900,
                      color: "#fff", letterSpacing: "0.05em",
                      textShadow: "0 0 8px rgba(0,230,118,0.8), 0 1px 2px rgba(0,0,0,0.5)",
                    }}>{lv.rewardShort}</span>
                  </div>
                )}

                {/* label card — spring glass for Ch2, dark card for Ch1 */}
                {currentChapter === 2 ? (
                <div style={{
                  position: "absolute", top: "72%", left: "42%", transform: "translate(-50%, -50%)",
                  textAlign: "center", whiteSpace: "nowrap",
                  padding: locked ? "8px 18px" : "10px 20px 12px", borderRadius: 18,
                  background: locked
                    ? "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))",
                  border: locked
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(255,255,255,0.35)",
                  boxShadow: locked
                    ? "none"
                    : "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(80,40,120,0.06), inset 0 1px 0 rgba(255,255,255,0.4)",
                  opacity: locked ? 0.45 : 1,
                  transition: "all 0.8s ease",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                }}>
                  {/* level name */}
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: locked ? "rgba(255,255,255,0.3)" : "#fff",
                    textShadow: locked ? "none" : "0 1px 4px rgba(0,0,0,0.4)",
                  }}>{lv.name}</div>

                  {/* reward pill */}
                  <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
                    {lv.complete ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "4px 12px", borderRadius: 20,
                        background: "linear-gradient(135deg, rgba(0,200,100,0.25), rgba(0,180,80,0.15))",
                        border: "1px solid rgba(0,200,100,0.4)",
                      }}>
                        <span style={{ color: "#00a854", fontSize: 11, lineHeight: 1 }}>&#10003;</span>
                        <span style={{
                          fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800,
                          color: "#00a854", letterSpacing: "0.05em",
                        }}>DONE</span>
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "4px 12px", borderRadius: 20,
                        background: locked
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.15)",
                        border: locked
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "1px solid rgba(255,255,255,0.3)",
                      }}>
                        <span style={{
                          fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800,
                          color: locked ? "rgba(255,255,255,0.25)" : "#fff",
                          letterSpacing: "0.04em",
                        }}>{lv.rewardShort}</span>
                      </span>
                    )}
                  </div>
                </div>
                ) : (
                <div style={{
                  position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)",
                  textAlign: "center", whiteSpace: "nowrap",
                  padding: "10px 16px 9px", borderRadius: 14,
                  background: locked ? "rgba(5,3,15,0.65)" : "rgba(5,3,15,0.75)",
                  border: locked ? "1px solid rgba(255,255,255,0.04)" : `1px solid rgba(${lv.r},${lv.g},${lv.b},0.2)`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  opacity: locked ? 0.5 : 1,
                  transition: "opacity 0.8s ease",
                }}>
                  {/* level name */}
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 14, fontWeight: 900,
                    color: locked ? "rgba(255,255,255,0.25)" : "#fff",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                    transition: "color 0.8s ease, text-shadow 0.8s ease",
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
                            color: "#00e676", letterSpacing: "0.05em",
                          }}>COMPLETED</span>
                        </span>
                      </>
                    ) : locked && lv.lockedButCompleted ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 14px", borderRadius: 10,
                        background: "rgba(0,230,118,0.08)",
                        border: "1px solid rgba(0,230,118,0.2)",
                      }}>
                        <span style={{ color: "rgba(0,230,118,0.6)", fontSize: 13, lineHeight: 1 }}>&#10003;</span>
                        <span style={{
                          fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800,
                          color: "rgba(0,230,118,0.5)", letterSpacing: "0.05em",
                        }}>CLEAR PREVIOUS STAGE</span>
                      </span>
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP HUD (top bar spanning between panels) ── */}
      <div className="desktopOnly" style={{
        position: "absolute", top: 0, left: 280, right: 260, zIndex: 90,
        padding: "14px 28px", animation: "slideDown 0.5s ease-out",
        background: currentChapter === 2
          ? "linear-gradient(to bottom, rgba(40,20,70,0.95) 0%, rgba(40,20,70,0.8) 50%, rgba(40,20,70,0.4) 80%, transparent 100%)"
          : "linear-gradient(to bottom, rgba(1,0,14,0.97) 0%, rgba(1,0,14,0.8) 50%, rgba(1,0,14,0.4) 80%, transparent 100%)",
        alignItems: "center", justifyContent: "center", gap: 24,
      }}>
        {/* progress dots with reward labels */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          {sortedLevels.map((lv, i) => {
            const done = lv.complete;
            const active = lv.unlocked && !done;
            return (
              <div key={lv.id} style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                {i > 0 && <div style={{ width: 24, height: 2, borderRadius: 1, marginTop: 15, background: levels.find(l => l.id === lv.id - 1)?.complete ? "#00e676" : "rgba(255,255,255,0.06)" }} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 32 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "linear-gradient(135deg,#00e676,#00c853)" : active ? `rgba(${lv.r},${lv.g},${lv.b},0.15)` : "rgba(255,255,255,0.03)",
                    border: done ? "none" : active ? `1.5px solid ${lv.accent}` : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: done ? "0 0 12px rgba(0,230,118,0.3)" : active ? `0 0 8px rgba(${lv.r},${lv.g},${lv.b},0.2)` : "none",
                  }}>
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13L9.5 17.5L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                      <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 900, color: active ? "#fff" : "rgba(255,255,255,0.12)" }}>{lv.id}</span>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Exo 2',sans-serif", fontSize: 8, fontWeight: 700,
                    color: done ? "rgba(0,230,118,0.5)" : active ? `rgba(${lv.r},${lv.g},${lv.b},0.6)` : "rgba(255,255,255,0.1)",
                    whiteSpace: "nowrap",
                  }}>{done ? "Completed" : lv.rewardShort}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* FS counter */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20,
          background: "rgba(255,215,64,0.06)", border: "1px solid rgba(255,215,64,0.12)",
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,#ffd740,#ffab00)", fontSize: 8, fontWeight: 900, color: "rgba(0,0,0,0.7)",
            fontFamily: "'Orbitron',sans-serif",
          }}>&#x25CF;</div>
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 800, color: "#ffd740" }}>{freeSpins} FS</span>
        </div>
        {/* countdown */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 16,
          background: "rgba(255,160,40,0.04)", border: "1px solid rgba(255,160,40,0.1)",
        }}>
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 900, color: "#ffa028" }}>{countdownStr}</span>
          <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 8, color: "rgba(255,160,40,0.5)", letterSpacing: "0.06em" }}>REMAINING</span>
        </div>
      </div>

      {/* ── MOBILE HUD ── */}
      <div className="mobileOnly" style={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 100, animation: "slideDown 0.5s ease-out",
        background: currentChapter === 2
          ? "linear-gradient(to bottom, rgba(40,20,70,0.95) 0%, rgba(40,20,70,0.85) 50%, rgba(40,20,70,0.5) 75%, rgba(40,20,70,0.15) 90%, transparent 100%)"
          : "linear-gradient(to bottom, rgba(1,0,14,0.98) 0%, rgba(1,0,14,0.85) 50%, rgba(1,0,14,0.6) 75%, rgba(1,0,14,0.2) 90%, transparent 100%)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        padding: "12px 16px 16px",
        flexDirection: "column",
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

        {/* ── ACTIVE BONUSES ── */}
        {(bonuses.depositBonus || bonuses.cashback || bonuses.telegramBonus || bonuses.megaSpinPrize) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "6px 22px 0", justifyContent: "center" }}>
            {bonuses.depositBonus && (
              <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(255,210,50,0.08)", border: "1px solid rgba(255,210,50,0.15)", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800, color: "#ffd232" }}>
                {bonuses.depositBonus} DEP
              </span>
            )}
            {bonuses.cashback && (
              <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(255,50,120,0.08)", border: "1px solid rgba(255,50,120,0.15)", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800, color: "#ff3278" }}>
                {bonuses.cashback} CB
              </span>
            )}
            {bonuses.telegramBonus && (
              <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(0,180,255,0.08)", border: "1px solid rgba(0,180,255,0.15)", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800, color: "#00b4ff" }}>
                {bonuses.telegramBonus}
              </span>
            )}
            {bonuses.megaSpinPrize && (
              <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(255,160,40,0.08)", border: "1px solid rgba(255,160,40,0.15)", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800, color: "#ffa028" }}>
                {bonuses.megaSpinPrize}
              </span>
            )}
          </div>
        )}

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
                    }}>{done ? "Completed" : lv.rewardShort}</div>
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


      {/* ── MODAL ── */}
      {selected && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 500, background: sprOverlay, backdropFilter: "blur(28px)", animation: "fadeIn 0.2s ease",
        }} onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: "min(92vw, 380px)", borderRadius: 24, overflow: "hidden",
            background: sprCard,
            boxShadow: isSpr
              ? "0 20px 60px rgba(80,40,120,0.15), 0 0 0 1px rgba(180,160,220,0.2)"
              : `0 0 0 1px rgba(${selected.r},${selected.g},${selected.b},0.1), 0 0 80px rgba(${selected.r},${selected.g},${selected.b},0.12),
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
                  {selected.icon === "wallet" && <>
                    <rect x="6" y="10" width="28" height="20" rx="3" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <path d="M6 16 L34 16" stroke={selected.accent} strokeWidth="1.5" />
                    <circle cx="28" cy="22" r="2.5" fill={selected.accent} />
                  </>}
                  {selected.icon === "play" && <>
                    <circle cx="20" cy="20" r="15" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <polygon points="16,12 30,20 16,28" fill={selected.accent} />
                  </>}
                  {selected.icon === "refer" && <>
                    <circle cx="15" cy="14" r="6" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <circle cx="28" cy="14" r="4" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <path d="M5 32 Q15 22 25 32" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <path d="M22 30 Q28 24 34 30" stroke={selected.accent} strokeWidth="2" fill="none" />
                  </>}
                  {selected.icon === "trophy" && <>
                    <path d="M12 8 L28 8 L26 20 Q20 26 14 20 Z" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <path d="M12 10 Q6 10 6 16 Q6 20 12 18" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <path d="M28 10 Q34 10 34 16 Q34 20 28 18" stroke={selected.accent} strokeWidth="2" fill="none" />
                    <line x1="20" y1="24" x2="20" y2="30" stroke={selected.accent} strokeWidth="2" />
                    <line x1="14" y1="30" x2="26" y2="30" stroke={selected.accent} strokeWidth="2" />
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
                }}>STEP {selected.id} / {levels.length}</span>
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
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, color: "#fff" }}>{selected.id} / {levels.length}</div>
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
          countdownStr={countdownStr}
          spring={isSpr}
        />
      )}

      {/* ── MEGA WHEEL MODAL (Island 5) ── */}
      {showMegaWheel && (
        <WheelOfFortune
          onClose={() => setShowMegaWheel(false)}
          onWin={handleMegaWheelWin}
          prizes={currentChapter === 1 ? MEGA_WHEEL_PRIZES : VIP_WHEEL_PRIZES}
          title={currentChapter === 1 ? "MEGA SPIN" : "VIP SPIN"}
          spring={isSpr}
        />
      )}


      {/* ── TELEGRAM VERIFICATION MODAL (Island 4) ── */}
      {showTelegram && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 550,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: sprOverlayLight, backdropFilter: "blur(12px)",
            animation: "fadeIn 0.3s ease-out",
          }}>
            <div style={{
              width: "min(92vw, 380px)", borderRadius: 24, overflow: "hidden",
              background: sprCardAlt("#061520"),
              border: "1px solid rgba(0,180,255,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,180,255,0.05)",
              animation: "modalPop 0.4s ease-out",
            }}>
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent 10%, #00b4ff 50%, transparent 90%)" }} />
              <div style={{ padding: "30px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 18, fontWeight: 900, color: "#fff",
                  marginBottom: 20,
                }}>TELEGRAM VERIFY</div>

                {/* Step 1 */}
                <div style={{
                  padding: "14px 16px", borderRadius: 14, marginBottom: 12, textAlign: "left",
                  background: "rgba(0,180,255,0.05)", border: "1px solid rgba(0,180,255,0.1)",
                }}>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 6 }}>STEP 1 — COPY YOUR CODE</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      flex: 1, padding: "10px 14px", borderRadius: 10,
                      background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,180,255,0.15)",
                      fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 800, color: "#00b4ff",
                      letterSpacing: "0.08em",
                    }}>{telegramCode}</div>
                    <button onClick={(e) => { navigator.clipboard.writeText(telegramCode); e.target.textContent = "COPIED!"; setTimeout(() => { if (e.target) e.target.textContent = "COPY"; }, 1500); }} style={{
                      padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(0,180,255,0.3)",
                      background: "rgba(0,180,255,0.1)", cursor: "pointer",
                      fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 800, color: "#00b4ff",
                    }}>COPY</button>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{
                  padding: "14px 16px", borderRadius: 14, marginBottom: 12, textAlign: "left",
                  background: "rgba(0,180,255,0.03)", border: "1px solid rgba(0,180,255,0.06)",
                }}>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 6 }}>STEP 2 — OPEN TELEGRAM BOT</div>
                  <button onClick={() => window.open("https://t.me/MYBCGameBot", "_blank")} style={{
                    width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(0,180,255,0.2)",
                    background: "rgba(0,180,255,0.08)", cursor: "pointer",
                    fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 800, color: "#00b4ff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <span>OPEN @MYBCGameBot</span>
                    <span style={{ fontSize: 14 }}>→</span>
                  </button>
                </div>

                {/* Step 3 */}
                <div style={{
                  padding: "14px 16px", borderRadius: 14, marginBottom: 20, textAlign: "left",
                  background: "rgba(0,180,255,0.03)", border: "1px solid rgba(0,180,255,0.06)",
                }}>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>STEP 3 — SEND THE CODE TO THE BOT</div>
                </div>

                {/* Reward preview */}
                <div style={{
                  padding: "10px", borderRadius: 12, marginBottom: 16,
                  background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>🎁</span>
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 800, color: "#00e676" }}>REWARD: +$20 BONUS</span>
                </div>

                <button onClick={handleTelegramDone} style={{
                  width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: "pointer",
                  fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.08em",
                  color: "#fff",
                  background: "linear-gradient(135deg, #0088cc, #00b4ff)",
                  boxShadow: "0 8px 30px rgba(0,180,255,0.25), 0 2px 0 rgba(255,255,255,0.1) inset",
                }}>I'VE SENT THE CODE</button>

                <button onClick={() => setShowTelegram(false)} style={{
                  width: "100%", padding: "12px", marginTop: 10, borderRadius: 12, border: "none",
                  cursor: "pointer", background: "transparent",
                  fontFamily: "'Exo 2',sans-serif", fontSize: 12, fontWeight: 600,
                  color: "rgba(255,255,255,0.2)",
                }}>Close</button>
              </div>
            </div>
          </div>
      )}

      {/* ── KYC VERIFICATION MODAL (Island 2) ── */}
      {showKYC && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 550,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: sprOverlayLight, backdropFilter: "blur(12px)",
          animation: "fadeIn 0.3s ease-out",
        }}>
          <div style={{
            width: "min(92vw, 380px)", borderRadius: 24, overflow: "hidden",
            background: sprCardAlt("#060d20"),
            border: "1px solid rgba(120,200,255,0.15)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(120,200,255,0.05)",
            animation: "modalPop 0.4s ease-out",
          }}>
            <div style={{ height: 2, background: "linear-gradient(90deg, transparent 10%, #78c8ff 50%, transparent 90%)" }} />
            <div style={{ padding: "30px 24px", textAlign: "center" }}>
              <div style={{ marginBottom: 16 }}>
                <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
                  <rect x="8" y="6" width="24" height="28" rx="3" stroke="#78c8ff" strokeWidth="2" fill="none" />
                  <circle cx="20" cy="17" r="5" stroke="#78c8ff" strokeWidth="1.5" fill="none" />
                  <path d="M12 30 Q20 24 28 30" stroke="#78c8ff" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 900, color: "#fff",
                marginBottom: 8,
              }}>KYC VERIFICATION</div>
              <div style={{
                fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)",
                marginBottom: 24, lineHeight: 1.5,
              }}>Verify your identity to unlock +50 Free Spins and continue your journey.</div>

              <div style={{
                padding: "16px", borderRadius: 16, marginBottom: 12, textAlign: "left",
                background: "rgba(120,200,255,0.04)", border: "1px solid rgba(120,200,255,0.1)",
              }}>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 10 }}>WHY DO WE NEED IT</div>
                {["Faster & guaranteed withdrawals", "Exclusive no-wagering bonuses", "Higher deposit & withdrawal limits"].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(120,200,255,0.1)", border: "1px solid rgba(120,200,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800, color: "#78c8ff" }}>{idx + 1}</span>
                    </div>
                    <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: "10px", borderRadius: 12, marginBottom: 16,
                background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 800, color: "#00e676" }}>REWARD: +50 FREE SPINS</span>
              </div>

              <button onClick={handleKYCDone} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: "pointer",
                fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.08em",
                color: "rgba(0,0,0,0.85)",
                background: "linear-gradient(135deg, #78c8ff, #4da6ff)",
                boxShadow: "0 8px 30px rgba(120,200,255,0.25), 0 2px 0 rgba(255,255,255,0.2) inset",
              }}>START KYC VERIFICATION</button>

              <button onClick={() => setShowKYC(false)} style={{
                width: "100%", padding: "12px", marginTop: 10, borderRadius: 12, border: "none",
                cursor: "pointer", background: "transparent",
                fontFamily: "'Exo 2',sans-serif", fontSize: 12, fontWeight: 600,
                color: "rgba(255,255,255,0.2)",
              }}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE COMPLETE MODAL (dynamic per level) ── */}
      {showStageComplete && (() => {
        const lvId = showStageComplete.levelId;
        const sd = chapterStageData[lvId];
        if (!sd) return null;
        const prizeText = showStageComplete.prize || sd.prize;
        // Build timeline: mark steps up to lvId as complete, next one as "next", rest dim
        const completedIds = chapterSteps.filter(s => s.id <= lvId).map(s => s.id);
        const nextStep = chapterSteps.find(s => s.id > lvId);
        // Count how many completed steps for green line height
        const completedCount = completedIds.length;
        const greenLineH = Math.max(0, (completedCount - 1) * 40 + 20);

        return (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 600, background: sprOverlay, backdropFilter: "blur(30px)", animation: "fadeIn 0.2s ease",
        }}>
          <ConfettiCanvas />
          <div onClick={e => e.stopPropagation()} style={{
            position: "relative",
            width: "min(92vw, 380px)", maxHeight: "92vh", overflow: "hidden auto", borderRadius: 24,
            background: sprCard,
            boxShadow: isSpr
              ? "0 20px 60px rgba(80,40,120,0.2), 0 0 0 1px rgba(180,160,220,0.2)"
              : "0 0 0 1px rgba(0,230,118,0.1), 0 0 120px rgba(0,230,118,0.08), 0 50px 100px rgba(0,0,0,0.5)",
            animation: "modalPop 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}>
            <div style={{ height: 2, background: "linear-gradient(90deg, transparent 10%, rgba(0,230,118,0.5) 50%, transparent 90%)" }} />

            {/* Header */}
            <div style={{ textAlign: "center", padding: "22px 20px 0" }}>
              <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>
                {sd.subtitle}
              </div>
              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: "0.04em",
                color: "#ffffff", lineHeight: 1.2,
              }}>{sd.title}</div>
            </div>

            {/* Prize hero */}
            <div style={{ padding: "0 20px" }}>
              <div style={{
                textAlign: "center", margin: "18px 0 10px", padding: "16px 20px",
                borderRadius: 14, background: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.15)",
              }}>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 28, fontWeight: 900, color: "#00e676", lineHeight: 1.2 }}>
                  {prizeText}
                </div>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(0,230,118,0.5)", marginTop: 6, letterSpacing: "0.08em" }}>{sd.prizeNote}</div>
              </div>

              {/* Timeline */}
              <div style={{ position: "relative", paddingLeft: 34, margin: "16px 0" }}>
                {/* Vertical dim line */}
                <div style={{ position: "absolute", left: 10, top: 14, bottom: 18, width: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, transformOrigin: "top", animation: "tlLineGrow 0.8s ease-out forwards" }} />
                {/* Green segment for completed steps */}
                {greenLineH > 0 && <div style={{ position: "absolute", left: 10, top: 14, height: greenLineH, width: 2, background: "linear-gradient(180deg, #00e676, rgba(0,230,118,0.3))", borderRadius: 1, transformOrigin: "top", animation: "tlLineGrow 0.5s ease-out 0.3s both" }} />}

                {chapterSteps.map((step, idx) => {
                  const isDone = completedIds.includes(step.id);
                  const isNext = nextStep && step.id === nextStep.id;
                  const isFuture = !isDone && !isNext;
                  return (
                    <div key={step.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", position: "relative",
                      animation: `tlSlideIn 0.4s ease-out ${0.2 + idx * 0.1}s both`,
                    }}>
                      {/* Dot */}
                      <div style={{
                        position: "absolute", left: isDone || isNext ? -31 : -28, top: "50%", transform: "translateY(-50%)",
                        width: isDone || isNext ? 16 : 10, height: isDone || isNext ? 16 : 10, borderRadius: "50%",
                        background: isDone ? "#00e676" : isNext ? "#ffd232" : "rgba(255,255,255,0.1)",
                        border: isDone ? "2px solid rgba(0,230,118,0.3)" : isNext ? "2px solid rgba(255,210,50,0.3)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: isDone ? "0 0 10px rgba(0,230,118,0.4)" : isNext ? "0 0 10px rgba(255,210,50,0.5), 0 0 20px rgba(255,210,50,0.15)" : "none",
                        animation: isNext ? "tlBeepGold 1.5s ease-in-out infinite" : "none",
                      }}>
                        {isDone && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      {/* Name */}
                      <div>
                        <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 16, fontWeight: isDone || isNext ? 600 : 400, color: isDone ? "rgba(255,255,255,0.9)" : isNext ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}>
                          {step.name}
                          {isDone && <span style={{ fontSize: 11, color: "rgba(0,230,118,0.5)", marginLeft: 6 }}>done</span>}
                          {isNext && <span style={{ fontSize: 12, color: "rgba(255,210,50,0.6)", marginLeft: 6 }}>next</span>}
                        </div>
                      </div>
                      {/* Reward */}
                      <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 15, fontWeight: 600, color: isDone ? "rgba(0,230,118,0.7)" : isNext ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>{step.reward}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div style={{ padding: "16px 20px 18px" }}>
              <button onClick={() => setShowStageComplete(null)} style={{
                width: "100%", padding: 15, borderRadius: 14, border: "none",
                fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em",
                cursor: "pointer", background: "linear-gradient(135deg,#ffd232,#ffab00)", color: "rgba(0,0,0,0.85)",
                boxShadow: "0 6px 24px rgba(255,210,50,0.25), 0 2px 0 rgba(255,255,255,0.2) inset",
                position: "relative", overflow: "hidden",
              }}>
                {sd.primaryCta || "CONTINUE JOURNEY"}
                <div style={{
                  position: "absolute", top: 0, width: "40%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  animation: "ctaShine 2.5s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
              </button>
              {sd.secondaryCta && (
                <button onClick={() => setShowStageComplete(null)} style={{
                  width: "100%", marginTop: 8, padding: 15, borderRadius: 14, border: "none",
                  fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em",
                  cursor: "pointer", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)",
                }}>{sd.secondaryCta}</button>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── PHONE VERIFICATION MODAL (Island 3) ── */}
      {showPhone && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 550,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: sprOverlayLight, backdropFilter: "blur(12px)",
            animation: "fadeIn 0.3s ease-out",
          }}>
            <div style={{
              width: "min(92vw, 380px)", borderRadius: 24, overflow: "hidden",
              background: sprCardAlt("#200818"),
              border: "1px solid rgba(255,50,120,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,50,120,0.05)",
              animation: "modalPop 0.4s ease-out",
            }}>
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent 10%, #ff3278 50%, transparent 90%)" }} />
              <div style={{ padding: "30px 24px", textAlign: "center" }}>
                <div style={{ marginBottom: 16 }}>
                  <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
                    <rect x="12" y="4" width="16" height="32" rx="4" stroke="#ff3278" strokeWidth="2" fill="none" />
                    <line x1="17" y1="30" x2="23" y2="30" stroke="#ff3278" strokeWidth="1.5" />
                    <circle cx="20" cy="30" r="1.5" fill="#ff3278" />
                  </svg>
                </div>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 900, color: "#fff",
                  marginBottom: 8,
                }}>PHONE VERIFICATION</div>
                <div style={{
                  fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)",
                  marginBottom: 24, lineHeight: 1.5,
                }}>{phoneStep === 0 ? "Enter your phone number to receive a verification code." : "Enter the 6-digit code sent to your phone."}</div>

                {phoneStep === 0 ? (
                  <>
                    {/* Phone input */}
                    <div style={{
                      padding: "14px 16px", borderRadius: 14, marginBottom: 16, textAlign: "left",
                      background: "rgba(255,50,120,0.04)", border: "1px solid rgba(255,50,120,0.1)",
                    }}>
                      <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 8 }}>ENTER PHONE NUMBER</div>
                      <input type="tel" placeholder="+1 (555) 123-4567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={{
                        width: "100%", padding: "12px 14px", borderRadius: 10, boxSizing: "border-box",
                        background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,50,120,0.2)",
                        fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 700, color: "#ff3278",
                        outline: "none", letterSpacing: "0.05em",
                      }} />
                    </div>

                    <button onClick={() => { if (phoneNumber.length >= 6) setPhoneStep(1); }} style={{
                      width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: phoneNumber.length >= 6 ? "pointer" : "not-allowed",
                      fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.08em",
                      color: "#fff", opacity: phoneNumber.length >= 6 ? 1 : 0.4,
                      background: "linear-gradient(135deg, #ff3278, #ff5e9e)",
                      boxShadow: "0 8px 30px rgba(255,50,120,0.25), 0 2px 0 rgba(255,255,255,0.1) inset",
                    }}>SEND CODE</button>
                  </>
                ) : (
                  <>
                    {/* OTP input */}
                    <div style={{
                      padding: "14px 16px", borderRadius: 14, marginBottom: 12, textAlign: "left",
                      background: "rgba(255,50,120,0.04)", border: "1px solid rgba(255,50,120,0.1)",
                    }}>
                      <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 8 }}>VERIFICATION CODE</div>
                      <input type="text" inputMode="numeric" maxLength="6" placeholder="Enter 6-digit code"
                        value={phoneOtp}
                        onChange={e => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        style={{
                          width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box",
                          background: "rgba(0,0,0,0.3)", border: phoneOtp.length > 0 ? "1.5px solid rgba(255,50,120,0.5)" : "1px solid rgba(255,50,120,0.2)",
                          fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 800, color: "#ff3278",
                          outline: "none", transition: "border 0.2s ease", letterSpacing: "0.15em", textAlign: "center",
                        }} />
                    </div>

                    <div style={{
                      padding: "10px", borderRadius: 12, marginBottom: 16,
                      background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                      <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 800, color: "#00e676" }}>REWARD: 100% CASHBACK</span>
                    </div>

                    <button onClick={() => { if (phoneOtp.length === 6) handlePhoneDone(); }} style={{
                      width: "100%", padding: "16px", borderRadius: 16, border: "none",
                      cursor: phoneOtp.length === 6 ? "pointer" : "not-allowed",
                      fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.08em",
                      color: "#fff", opacity: phoneOtp.length === 6 ? 1 : 0.4,
                      background: "linear-gradient(135deg, #ff3278, #ff5e9e)",
                      boxShadow: "0 8px 30px rgba(255,50,120,0.25), 0 2px 0 rgba(255,255,255,0.1) inset",
                    }}>VERIFY PHONE</button>
                  </>
                )}

                <button onClick={() => setShowPhone(false)} style={{
                  width: "100%", padding: "12px", marginTop: 10, borderRadius: 12, border: "none",
                  cursor: "pointer", background: "transparent",
                  fontFamily: "'Exo 2',sans-serif", fontSize: 12, fontWeight: 600,
                  color: "rgba(255,255,255,0.2)",
                }}>Close</button>
              </div>
            </div>
          </div>
      )}

      {/* ── DEPOSIT PROMPT MODAL (Island 5 — before Mega Wheel) ── */}
      {showDeposit && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 550,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: sprOverlayLight, backdropFilter: "blur(12px)",
          animation: "fadeIn 0.3s ease-out",
        }}>
          <div style={{
            width: "min(92vw, 380px)", borderRadius: 24, overflow: "hidden",
            background: sprCardAlt("#1a0d08"),
            border: "1px solid rgba(255,160,40,0.15)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,160,40,0.05)",
            animation: "modalPop 0.4s ease-out",
          }}>
            <div style={{ height: 2, background: "linear-gradient(90deg, transparent 10%, #ffa028 50%, transparent 90%)" }} />
            <div style={{ padding: "30px 24px", textAlign: "center" }}>
              {/* Star icon */}
              <div style={{ marginBottom: 16 }}>
                <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
                  <polygon points="20,4 26,16 38,16 28,24 32,36 20,28 8,36 12,24 2,16 14,16" stroke="#ffa028" strokeWidth="1.8" fill="rgba(255,160,40,0.1)" />
                </svg>
              </div>

              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 900, color: "#fff",
                marginBottom: 6,
              }}>UNLOCK MEGA SPIN</div>

              <div style={{
                fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)",
                marginBottom: 24, lineHeight: 1.6,
              }}>Deposit minimum <span style={{ color: "#ffd232", fontWeight: 700 }}>$50</span> and unlock the Mega Spin wheel with a chance to win <span style={{ color: "#ffa028", fontWeight: 700 }}>$50 to $500</span> cash prize!</div>

              {/* Prize range highlight */}
              <div style={{
                padding: "16px", borderRadius: 16, marginBottom: 20,
                background: "rgba(255,210,50,0.05)", border: "1px solid rgba(255,210,50,0.12)",
              }}>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 28, fontWeight: 900, color: "#ffd232", marginBottom: 4 }}>$50 — $500</div>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, color: "rgba(255,210,50,0.4)", letterSpacing: "0.15em" }}>CASH PRIZE RANGE</div>
              </div>

              {/* Minimum deposit note */}
              <div style={{
                padding: "12px 16px", borderRadius: 12, marginBottom: 20,
                background: "rgba(255,160,40,0.06)", border: "1px solid rgba(255,160,40,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,160,40,0.5)" strokeWidth="2"/><path d="M12 8v5" stroke="rgba(255,160,40,0.6)" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="rgba(255,160,40,0.6)"/></svg>
                <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>Minimum deposit: <span style={{ color: "#ffa028", fontWeight: 800 }}>$50</span></span>
              </div>

              <button onClick={handleDepositDone} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: "pointer",
                fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.08em",
                color: "rgba(0,0,0,0.85)",
                background: "linear-gradient(135deg, #ffa028, #ffd232)",
                boxShadow: "0 8px 30px rgba(255,160,40,0.25), 0 2px 0 rgba(255,255,255,0.2) inset",
                position: "relative", overflow: "hidden",
              }}>
                DEPOSIT & SPIN
                <div style={{
                  position: "absolute", top: 0, width: "40%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "ctaShine 2.5s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
              </button>

              <button onClick={() => setShowDeposit(false)} style={{
                width: "100%", padding: "12px", marginTop: 10, borderRadius: 12, border: "none",
                cursor: "pointer", background: "transparent",
                fontFamily: "'Exo 2',sans-serif", fontSize: 12, fontWeight: 600,
                color: "rgba(255,255,255,0.2)",
              }}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ISLAND 6 FINAL CEREMONY MODAL ── */}
      {showFinalCeremony && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 550,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: sprOverlayLight, backdropFilter: "blur(12px)",
          animation: "fadeIn 0.3s ease-out",
        }}>
          <div style={{
            width: "min(92vw, 400px)", borderRadius: 28, overflow: "hidden",
            background: sprCardAlt("#1a0d08"),
            border: "2px solid rgba(0,230,118,0.25)",
            boxShadow: "0 0 60px rgba(0,230,118,0.1), 0 30px 80px rgba(0,0,0,0.5)",
            animation: "modalPop 0.5s ease-out",
          }}>
            <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #00e676 30%, #00c853 50%, #00e676 70%, transparent 95%)" }} />
            <div style={{ padding: "30px 24px", textAlign: "center" }}>
              {/* Crown icon — SVG instead of emoji */}
              <div style={{ marginBottom: 16 }}>
                <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
                  <path d="M6 30 L6 16 L14 24 L20 10 L26 24 L34 16 L34 30 Z" stroke="#ffd232" strokeWidth="2.5" fill="rgba(255,210,50,0.15)" />
                  <line x1="6" y1="30" x2="34" y2="30" stroke="#ffd232" strokeWidth="2.5" />
                </svg>
              </div>
              <div style={{
                fontFamily: "'Exo 2',sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6,
              }}>Chapter 1</div>
              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900,
                background: "linear-gradient(135deg,#ffd740,#ffa028,#ffd740)",
                backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite", marginBottom: 8,
              }}>UNLOCK NEXT JOURNEY</div>
              <div style={{
                fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)",
                marginBottom: 24, lineHeight: 1.6,
              }}>You've completed all challenges! Complete Chapter 1 to unlock the next world.</div>

              {/* Timeline — all steps complete */}
              <div style={{ position: "relative", paddingLeft: 34, margin: "0 0 20px", textAlign: "left" }}>
                {/* Vertical green line */}
                <div style={{ position: "absolute", left: 10, top: 14, bottom: 18, width: 2, background: "linear-gradient(180deg, #00e676, rgba(0,230,118,0.3))", borderRadius: 1, transformOrigin: "top", animation: "tlLineGrow 0.8s ease-out forwards" }} />

                {chapterSteps.map((step, idx) => (
                  <div key={step.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", position: "relative",
                    animation: `tlSlideIn 0.4s ease-out ${0.2 + idx * 0.1}s both`,
                  }}>
                    <div style={{
                      position: "absolute", left: -31, top: "50%", transform: "translateY(-50%)",
                      width: 16, height: 16, borderRadius: "50%",
                      background: "#00e676", border: "2px solid rgba(0,230,118,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 10px rgba(0,230,118,0.4)",
                    }}>
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                        {step.name}
                        <span style={{ fontSize: 11, color: "rgba(0,230,118,0.5)", marginLeft: 6 }}>done</span>
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 15, fontWeight: 600, color: "rgba(0,230,118,0.7)" }}>{step.reward}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => { setShowFinalCeremony(false); triggerComplete(6); }} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: "pointer",
                fontFamily: "'Orbitron',sans-serif", fontSize: 15, fontWeight: 900, letterSpacing: "0.1em",
                color: "rgba(0,0,0,0.85)",
                background: "linear-gradient(135deg, #ffd740, #ffab00)",
                boxShadow: "0 8px 30px rgba(255,210,50,0.3), 0 2px 0 rgba(255,255,255,0.2) inset",
              }}>COMPLETE CHAPTER 1</button>

              <button onClick={() => setShowFinalCeremony(false)} style={{
                width: "100%", padding: "12px", marginTop: 10, borderRadius: 12, border: "none",
                cursor: "pointer", background: "transparent",
                fontFamily: "'Exo 2',sans-serif", fontSize: 12, fontWeight: 600,
                color: "rgba(255,255,255,0.2)",
              }}>Not yet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── JOURNEY COMPLETE OVERLAY (All 6 islands done) ── */}
      {showJourneyComplete && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: sprOverlay, backdropFilter: "blur(20px)",
          animation: "fadeIn 0.5s ease-out",
        }}>
          <ConfettiCanvas />
          <div style={{
            width: "min(92vw, 400px)", borderRadius: 28, overflow: "hidden",
            background: sprCardAlt("#0a0a1a"),
            border: isSpr ? "2px solid rgba(180,160,220,0.3)" : "2px solid rgba(0,230,118,0.3)",
            boxShadow: isSpr
              ? "0 20px 60px rgba(80,40,120,0.2), 0 0 0 1px rgba(180,160,220,0.2)"
              : "0 0 80px rgba(0,230,118,0.15), 0 30px 80px rgba(0,0,0,0.5)",
            animation: "modalPop 0.5s ease-out",
            position: "relative", zIndex: 701,
          }}>
            <div style={{ height: 3, background: "linear-gradient(90deg, transparent 5%, #00e676 30%, #ffd232 50%, #00e676 70%, transparent 95%)" }} />
            <div style={{ padding: "30px 24px", textAlign: "center" }}>
              <div style={{ marginBottom: 12 }}>
                <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
                  <path d="M12 8 L28 8 L26 20 Q20 26 14 20 Z" stroke="#ffd232" strokeWidth="2.5" fill="rgba(255,210,50,0.15)" />
                  <path d="M12 10 Q6 10 6 16 Q6 20 12 18" stroke="#ffd232" strokeWidth="2" fill="none" />
                  <path d="M28 10 Q34 10 34 16 Q34 20 28 18" stroke="#ffd232" strokeWidth="2" fill="none" />
                  <line x1="20" y1="24" x2="20" y2="30" stroke="#ffd232" strokeWidth="2" />
                  <line x1="14" y1="30" x2="26" y2="30" stroke="#ffd232" strokeWidth="2.5" />
                </svg>
              </div>
              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontSize: 24, fontWeight: 900,
                background: currentChapter === 1 ? "linear-gradient(135deg,#ffd740,#00e676,#ffd740)" : "linear-gradient(135deg,#b478ff,#00e676,#b478ff)",
                backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite", marginBottom: 6,
              }}>{currentChapter === 1 ? "JOURNEY COMPLETE!" : "VIP LEVEL 2 UNLOCKED!"}</div>
              <div style={{
                fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.2em", marginBottom: 24,
              }}>{currentChapter === 1 ? "READY FOR NEXT JOURNEY?" : "CONGRATULATIONS, VIP!"}</div>

              {/* Timeline — all steps complete */}
              <div style={{ position: "relative", paddingLeft: 34, margin: "0 0 20px", textAlign: "left" }}>
                <div style={{ position: "absolute", left: 10, top: 14, bottom: 18, width: 2, background: "linear-gradient(180deg, #00e676, rgba(0,230,118,0.3))", borderRadius: 1, transformOrigin: "top", animation: "tlLineGrow 0.8s ease-out forwards" }} />
                {chapterSteps.map((step, idx) => (
                  <div key={step.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", position: "relative",
                    animation: `tlSlideIn 0.4s ease-out ${0.2 + idx * 0.1}s both`,
                  }}>
                    <div style={{
                      position: "absolute", left: -31, top: "50%", transform: "translateY(-50%)",
                      width: 16, height: 16, borderRadius: "50%",
                      background: "#00e676", border: "2px solid rgba(0,230,118,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 10px rgba(0,230,118,0.4)",
                    }}>
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                        {step.name}
                        <span style={{ fontSize: 11, color: "rgba(0,230,118,0.5)", marginLeft: 6 }}>done</span>
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 15, fontWeight: 600, color: "rgba(0,230,118,0.7)" }}>{step.reward}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => {
                setShowJourneyComplete(false);
                if (currentChapter === 1) {
                  // Transition to Chapter 2
                  setCurrentChapter(2);
                  setLevels(INITIAL_LEVELS_CH2);
                  setIntroPlayed(false);
                  setSelected(null);
                  setShowStageComplete(null);
                  setShowFinalCeremony(false);
                }
              }} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: "pointer",
                fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.1em",
                color: "rgba(0,0,0,0.85)",
                background: "linear-gradient(135deg, #ffd740, #ffab00)",
                boxShadow: "0 8px 30px rgba(255,210,50,0.3), 0 2px 0 rgba(255,255,255,0.2) inset",
                position: "relative", overflow: "hidden",
              }}>
                {currentChapter === 1 ? "UNLOCK NEXT JOURNEY" : "COMING SOON"}
                <div style={{
                  position: "absolute", top: 0, width: "40%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  animation: "ctaShine 2.5s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLETION CONFETTI ── */}
      {showCompletionConfetti && <ConfettiCanvas />}

      {/* ── REWARD POP OVERLAY ── */}
      {rewardPop && (
        <div style={{
          position: "fixed", left: 0, right: 0, top: 0, bottom: 0,
          zIndex: 200, pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute",
            left: rewardPop.x, top: rewardPop.y,
            transform: "translate(-50%, -50%)",
            fontFamily: "'Orbitron',sans-serif", fontSize: 28, fontWeight: 900,
            color: "#00e676",
            textShadow: "0 0 20px rgba(0,230,118,0.8), 0 0 40px rgba(0,230,118,0.4), 0 2px 4px rgba(0,0,0,0.8)",
            animation: "rewardFloat 2s ease-out forwards",
            whiteSpace: "nowrap",
          }}>{rewardPop.text}</div>
        </div>
      )}

      {/* ── COMPLETION FLASH OVERLAY ── */}
      {completingId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 150, pointerEvents: "none",
          background: "rgba(255,255,255,0.15)",
          animation: "completionFlash 0.4s ease-out forwards",
        }} />
      )}

    </div>
  );
}
