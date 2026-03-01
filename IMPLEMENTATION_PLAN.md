# MYBC Game — Full Implementation Plan

## Current State Analysis
- 6 islands, only island 1 (Welcome Spin) starts unlocked
- Clicking island 1 opens wheel → always lands on jackpot (150% DEP + 50 FS)
- After wheel win: island 1 completes, island 2 unlocks, +50 FS added
- handleComplete(id) marks level done and unlocks next — generic for all levels
- No bonus state tracking, no real external triggers, no desktop layout
- Completion only turns portal green — no celebration animation per island

---

## PHASE 1: State Architecture & Bonus System

### 1A. Refactor Level State Model
Each level needs richer state beyond `unlocked` and `complete`:

```
level.state = "locked" | "active" | "completing" | "complete"
level.bonusState = "none" | "pending" | "active" | "claimed"
level.lockedButCompleted = false  // For levels 3,4 (completed task externally but level not yet reached)
```

**Changes:**
- Add `bonusState` field to each level in INITIAL_LEVELS
- Add `completing` transient state that triggers the success animation before settling to `complete`
- Islands 3 and 4 need `lockedButCompleted` support (user verified phone/telegram before reaching that step)

### 1B. Free Spins & Bonus Tracking
- `freeSpins` state already exists (0 → +50 on wheel → +50 on KYC)
- Add `bonuses` state: `{ depositBonus: null, cashback: null, telegramBonus: null, megaSpinTicket: null }`
- Each level completion populates its bonus
- HUD or bonus panel shows active bonuses

---

## PHASE 2: Per-Island Functionality

### Island 1 — Welcome Spin (id: 1)
**States:** Active → Success (with bonus)
**Trigger:** Should trigger REGISTRATION flow
**Changes:**
- On click when active: show registration modal (not wheel directly)
- After registration succeeds: THEN show wheel of fortune
- After wheel win: mark complete, show celebration, unlock island 2
- Bonus: 150% deposit bonus + 50 FS become "pending" until first deposit
- Add `onRegister` callback prop or simulated registration modal

### Island 2 — KYC Verification (id: 2)
**States:** Locked → Active → Success (with bonus)
**Trigger:** Should trigger KYC verification flow
**Changes:**
- On click when active: show KYC modal (new component)
- KYC modal: explain what's needed, has "Start KYC" button
- After KYC success: +50 FS, mark complete, celebration animation, unlock island 3
- Bonus state: +50 FS marked as "active" (immediately usable)

### Island 3 — Phone Verification (id: 3)
**States:** Locked → Locked-But-Completed → Active → Success (with bonus)
**Trigger:** Phone verification flow
**Changes:**
- Can be completed while locked (user verified phone during registration)
- If completed while locked: show green tint but still locked position in progression
- On click when active: show phone verification modal
- Phone modal: input field for phone number, verify button, OTP step
- After success: 100% cashback bonus activated, celebration, unlock island 4
- Bonus: "100% Cashback" status shown

### Island 4 — Telegram Verify (id: 4)
**States:** Locked → Locked-But-Completed → Active → Success (with bonus)
**Trigger:** Generate and show promocode for Telegram activation
**Changes:**
- New Telegram verification modal (the missing modal mentioned)
- Modal shows: generated promo code, "Copy" button, Telegram bot link
- Steps: 1) Generate code 2) User copies 3) Opens Telegram bot 4) Pastes code
- Confirmation: "I've sent the code" button → marks complete
- After success: +$20 bonus activated, celebration, unlock island 5
- Can also be completed while locked (user already on Telegram)

### Island 5 — Mega Spin (id: 5)
**States:** Locked → Active → Success (with bonus)
**Trigger:** Requires deposit, then wheel spin
**Changes:**
- Needs its OWN wheel spin (separate from Welcome Spin wheel)
- On click when active: show deposit prompt first
- After deposit confirmed: show Mega Wheel (bigger prizes: $50-$500 range)
- Mega Wheel has different prizes than Welcome Wheel
- After spin: mark complete, celebration, unlock island 6
- Bonus: whatever the wheel lands on

### Island 6 — Next Journey (id: 6)
**States:** Locked → Active → Success
**Trigger:** All previous steps complete
**Changes:**
- Final celebration — biggest animation
- Scene ending sequence (new)
- "Journey Complete" overlay with total rewards summary
- Teaser for next world/chapter

---

## PHASE 3: Island Success Animation System

### Per-Island Completion Animation (NEW)
When a level transitions from active → completing → complete:

1. **Portal Burst** (canvas):
   - Portal rapidly expands with bright flash
   - Color shifts from level color → green over 1.5s
   - Particles explode outward from portal center
   - Shockwave ring expands outward

2. **Island Glow Up** (canvas):
   - Island image gets bright white overlay that fades
   - Levitation amplitude increases momentarily (bounce)
   - Green sparkles emit from island

3. **Screen Flash** (HTML overlay):
   - Brief white flash (0.15s)
   - Then confetti burst (reuse ConfettiCanvas but triggered per-island)

4. **Reward Pop** (HTML overlay):
   - Reward text flies up from island position
   - "+50 FS" or "100% CB" large text that scales up and fades
   - Similar to damage numbers in games

5. **Connection Beam Ignite** (canvas):
   - Beam to next island lights up bright
   - Energy pulse travels along beam to next island
   - Next island's portal activates (color appears)

6. **Timing:**
   - 0ms: Portal burst + screen flash
   - 200ms: Island glow + reward pop
   - 800ms: Beam ignite to next island
   - 1500ms: Next island portal activates
   - 2000ms: Settle to complete state

---

## PHASE 4: Welcome Bonus Modal Redesign

### Current Post-Win Modal Issues:
- Shows after wheel only
- "REGISTER NOW" button but no registration flow
- Static layout, not exciting enough

### Redesigned Welcome Bonus Modal:
- Triggered after Island 1 completion (post-registration + wheel)
- Animated entrance: cards flip in one by one
- Shows ALL unlockable rewards across the journey:
  - Current: 150% Deposit Bonus + 50 FS
  - Next: +50 FS (KYC)
  - Then: 100% Cashback (Phone)
  - Then: +$20 (Telegram)
  - Then: $50-500 (Mega Spin)
  - Final: $500 Guaranteed Cash Prize
- Progress visualization: which rewards are unlocked vs locked
- Main CTA: "Continue Journey" (not "Register Now" since already registered)
- Countdown urgency: "Complete all steps within 24h for bonus multiplier"

---

## PHASE 5: Telegram Verification Modal (NEW)

### Modal Design:
```
┌─────────────────────────────────────┐
│     📱 TELEGRAM VERIFICATION        │
│                                     │
│  Step 1: Copy your promo code       │
│  ┌───────────────────────────────┐  │
│  │  MYBC-XXXX-YYYY              │  │
│  │                    [COPY] 📋  │  │
│  └───────────────────────────────┘  │
│                                     │
│  Step 2: Open our Telegram bot      │
│  [Open @MYBCGameBot →]              │
│                                     │
│  Step 3: Send the code to the bot   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   ✓ I've sent the code      │    │
│  └─────────────────────────────┘    │
│                                     │
│  Reward: +$20 Bonus 🎁             │
└─────────────────────────────────────┘
```

- Generate random promo code on modal open
- Copy button with "Copied!" feedback
- Telegram deep link to bot
- Confirmation button triggers completion

---

## PHASE 6: Desktop Version

### Current: Mobile-only (single column, canvas fills viewport)
### Target: Responsive desktop layout

**Breakpoint: 768px**

**Desktop Layout:**
- Max-width container: 1200px centered
- Side panel (left, 300px): Level progress list, bonus tracker
- Main area (center): Canvas with islands + portals
- Side panel (right, 280px): Current rewards, active bonuses
- HUD spans full width at top
- Bottom nav hidden on desktop (replaced by side panels)

**Mobile Layout (unchanged):**
- Full viewport canvas
- Fixed HUD top + bottom nav
- Modals as overlays

**Implementation:**
- Add `useMediaQuery` or check `dim.w > 768`
- Conditionally render desktop vs mobile layout
- Canvas adjusts aspect ratio for wider viewport
- Island positions recalculated for wider canvas
- Modals: centered on desktop (not full-width)

---

## PHASE 7: Scene Ending

### When All 6 Islands Complete:
1. **Final celebration** — biggest confetti + fireworks
2. **Camera zoom out** — scroll auto-zooms to show all islands
3. **All portals pulse** — synchronized green pulse wave
4. **Reward summary overlay:**
   - Total free spins earned
   - All bonuses activated
   - "$500 Guaranteed Prize" unlocked badge
5. **"New World" teaser** — mysterious portal appears above island 6
6. **CTA:** "Claim Your $500" or "Enter New World"

---

## PHASE 8: Illustrations Per Island

### Each Island Gets Unique Themed Image:
Current: 5 PNG images mapped by ISLAND_MAP
Need: Ensure each island has a distinct, thematic illustration

**Mapping:**
- Island 1 (Welcome Spin): Wheel/fortune theme → Islandio.png (gold)
- Island 2 (KYC): ID/document theme → IS-CYAN.png
- Island 3 (Phone): Communication theme → IS-RED.png (pink/red)
- Island 4 (Telegram): Messenger theme → IS-CYAN.png (different variant needed)
- Island 5 (Mega Spin): Treasure/jackpot theme → Islandio.png (needs unique)
- Island 6 (Next Journey): Crown/portal theme → Islandio.png (needs unique)

**Action Items:**
- Islands 4, 5, 6 currently share images — need unique PNGs
- Consider adding icon overlays on canvas (drawn on top of island image)
- Or: request new island PNGs from designer

---

## Implementation Priority Order

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 P0 | Island success animation system | Large | High — core game feel |
| 🔴 P0 | Bonus state tracking | Medium | High — required for all islands |
| 🟡 P1 | Registration trigger (Island 1) | Medium | High — actual product flow |
| 🟡 P1 | Telegram verification modal | Medium | High — missing feature |
| 🟡 P1 | Mega Spin wheel (Island 5) | Medium | High — missing feature |
| 🟡 P1 | Locked-but-completed state | Small | Medium — edge case UX |
| 🟢 P2 | Welcome bonus modal redesign | Medium | Medium — polish |
| 🟢 P2 | Desktop version | Large | Medium — expands audience |
| 🟢 P2 | Scene ending sequence | Medium | Medium — completion reward |
| 🔵 P3 | Unique illustrations per island | External | Low — visual polish |
