# Claude update — 19 October 2026

Taken over from Codex (weekly limit reached). Backup of the files before this pass:
`_backup-before-claude-2026-10-19/`.

## 1. POCUS practice — rebuilt (practice.js, style.css)
- The ultrasound screen now opens as a large "machine screen" over the 3D room; the
  drawer keeps the controls, so the image is big and readable.
- Three windows with one tap each: Heart · subcostal, Right lung · anterior,
  Left lung · anterior.
- Anatomical torso map (clavicles, sternum, xiphoid, costal margins, ribs).
  The active target glows. Tapping near it snaps the probe on; "Guide me"
  slides the probe into place. Arrows and ⟲ ⟳ fine-tune.
- Live window-quality meter (red / amber / green) plus plain-language guidance
  ("slide down ↓, rotate ⟳"). Capture unlocks at 75 %.
- More realistic synthetic images:
  - Subcostal 4-chamber view, with the following.
    - Speckled liver, hepatic veins, bright pericardium and myocardium.
    - Echo-free chambers (RV, LV, RA, LA) and moving AV valves.
    - Motion follows the patient state:
      - normal contraction with a pulse;
      - weak contraction in PEA, or electrical-only pacing capture;
      - fast quivering in VF/pVT;
      - standstill with "smoke" in asystole.
    - Compression artifact during CPR.
  - Lung (linear probe), with the following.
    - Rib shadows ("bat sign"), the pleural line and A-lines.
    - A live M-mode: seashore sign when sliding, barcode sign when not.
    - Sliding needs ventilation, so an apnoeic patient without bag-mask shows
      no sliding. This teaches that absent sliding ≠ pneumothorax.
- Every answer gives feedback: correct / not quite, plus an explanation of
  the finding and what to do.
- Capturing a clip also logs the case's clinical POCUS finding.

## 2. Sound, cycle timer, IV access (app.js, index.html, style.css, clinical.js)
- **Shock sound** rebuilt: a loud thump, an electrical crack and a buzz,
  through a compressor. There is also a white flash over the room and a
  vibration on phones. The charging sweep is louder, and a 3-beep "charged"
  tone plays when the device is ready.
- **2-minute cycle banner**, always visible on the 3D view (the monitor is
  hidden whenever a panel is open):
  - big countdown and progress bar;
  - green → amber at 30 s ("pre-charge, next compressor ready") →
    red pulsing "RHYTHM CHECK DUE +mm:ss";
  - a double beep at 30 s and an alarm at 0;
  - it shows "CPR PAUSED n s" in real seconds (red after 7 s), plus
    the epinephrine "next in mm:ss / repeat due".
  - The monitor's CPR-cycle number changes colour too.
- **Vascular access is now an action with a progress bar**:
  - Insert peripheral IV takes about 30 s (sim) and Insert IO about 15 s.
    The team keeps working meanwhile.
  - A status chip ("IV inserting · 12 s" → "IV access ✓") sits in the top
    strip.
  - With IO-only access, an IV-route order is blocked (0 points) with an
    explanation.
- **Fluid bolus button** (250 / 500 / 1000 mL crystalloid) in Drugs / Access:
  - Case 2: it counts as the fluid objective.
  - Case 5 with a tension pneumothorax: a warning to decompress.
  - Hypotensive patients: a small BP response.
  - Elsewhere: logged as not indicated.

## 3. Logic review — changes (clinical.js)
- **Pause rule fixed to real time.** With the 1.5× clock, "10 s" used to mean
  6.7 real seconds. The limits are now 10 real seconds (15 sim s) for pauses
  and 20 real seconds for the first compressions after collapse. The first
  one has its own key, `cpr-delay` (−3).
  - Before this, the penalty could fire while the player was still doing
    the ≤10 s pulse check.
- **Case 5 collapse** restarts the recognition window and clears the
  "assessed" flag, so the player must re-check the pulse.
- **Case 3 deterioration** now comes 15 s after the failed 12 mg adenosine dose,
  or at 150 s at the latest (was a fixed 75 s). With timed IV access, vagal and
  adenosine were otherwise impossible to reach before she became unstable.
- **Adenosine by IO** is now a 0-point teaching block (was −5). It is not a
  dangerous error, and the message explains the rapid peripheral-IV push.
- **Guided hints** are now specific to each case and stage. Examples: vagal →
  IV → adenosine 6 → 12 in Case 3; atropine → pads → pacing → "electrical
  capture is not perfusion" → expert in Case 4.
- **Verified unchanged against AHA 2025:**
  - epinephrine 1 mg every 3–5 min, given after the 2nd shock in VF/pVT;
  - amiodarone 300/150 or lidocaine 1–1.5/0.5–0.75 after the 3rd shock;
  - adenosine 6/12;
  - atropine 1 mg, max 3 mg;
  - dopamine 5–20 mcg/kg/min, epinephrine 2–10 mcg/min;
  - synchronised 100 J for narrow-complex tachycardia, 200 J biphasic for VF;
  - post-arrest SpO₂ 90–98 %, MAP ≥65, PaCO₂ 35–45, 32–37.5 °C
    (AHA 2025 PCAC algorithm).

## Tests
- `npm test`: 82 pass. New tests cover:
  - IV/IO timing and route;
  - fluid bolus;
  - the real-time pause windows;
  - Case 3 deterioration timing;
  - Case 5 collapse reassessment;
  - case-specific hints;
  - POCUS findings and guidance.
- Browser play-through of Cases 1–5 to handover, done on play.html.

## Pass 2 (19 Oct, evening)
- **Case 1 ROSC logic.** Calcium gluconate / chloride or insulin-dextrose, given after any
  supporting evidence (history, labs or 12-lead), now counts as identifying and treating the
  cause (+10, and the cause dropdown is no longer required). Without evidence the team asks
  "Why this drug? Ask the history, review labs or a 12-lead first".
  ROSC = ≥3 shocks + epinephrine 1 mg + amiodarone or lidocaine + hyperkalemia treated
  (or cause recorded) + ≥45 s CPR. Bicarbonate alone does not count.
- **Case 2.** Dextrose for documented hypoglycemia also counts as identifying the cause.
- **"Why no ROSC?" coaching.** From 200 s of arrest, every rhythm check in Cases 1, 2 and 5
  lists exactly what is still missing (Guided). Independent mode gives a generic Hs & Ts prompt.
- **CPR rhythm game rebuilt.** A big round PUSH pad (tap, click or Space) and a pulsing ring
  at 110/min with a metronome click. The rate is a rolling average of the last 4 taps, so one
  uneven tap no longer fails you. There is a 60–160 gauge with a green 100–120 zone, a "Faster
  / Slower" cue and an automatic 30:2 cycle with a 4 s breath pause (continuous once
  intubated). Cycle score: % on rhythm, ★ at ≥80 %. It works whether or not team CPR is
  running and is unscored. Team rate and depth sliders are folded below, with a one-tap
  "Set ideal 110/min · 5.5 cm".
- Tests: 84 pass, including the exact sequence of 3 shocks + calcium gluconate (after
  history) + amiodarone 300 mg. It reports "Still needed: epinephrine 1 mg", then gives ROSC
  8 s after the epinephrine.

## Pass 3 (20 Oct): Praew's review comments
- Home screen: removed the "iPad ready layout" tag; tile 06 is renamed **ECG coach**.
- **Right-side HUD**: the cycle banner is now translucent (blurred glass). Under it sit two
  big buttons, **▶ START / RESUME CPR** (red and pulsing when the patient is pulseless and
  CPR is stopped) and **⏸ Pause & check rhythm**. They moved there from the small top strip.
- The duplicate team buttons (Compressions / Airway / Medications / Family) were removed.
  The same actions stay in the bottom dock, and you can still tap team members in 3D.
- **Labs are chosen by the player**: DTX (15 s bedside), ABG + lactate (60 s POC),
  electrolytes, BUN/Cr, CBC and troponin T (90 s lab). Each case has its own values and
  results list in Investigate.
  - Case 2 glucose treatment needs a DTX.
  - Case 1 calcium evidence = history, K⁺ (electrolytes / ABG), 12-lead or a recorded cause.
- **Temperature check** button added in Assess and Investigate. Case 2 = 38.9 °C; the others
  are normal.
- **5 Hs / 5 Ts update themselves from findings** (the learner can still change any entry):
  - hypovolemia → Less likely after IV + fluid bolus;
  - hypoxia → Less likely after intubation;
  - H⁺ and K⁺ from the blood gas / electrolytes;
  - hypothermia from the temperature check;
  - tension pneumothorax from lung POCUS (Evidence supports if sliding is absent);
  - tamponade → Less likely after cardiac POCUS;
  - toxins → Evidence supports when the patch is found;
  - coronary thrombosis (Case 4) from the 12-lead or troponin.
- **CPR quality / compressor fatigue**: after 2 min of continuous CPR without a compressor
  switch or a ≥80 % cycle in the CPR rhythm game, rate and depth drop (≈96/min, 4.3 cm).
  ETCO₂ falls and an alert says "CPR quality falling … switch compressor or coach with the
  CPR rhythm game". The debrief shows "CPR in target rate/depth %".
- **Post-ROSC targets**: wrong answers no longer block the handover.
  - The case finishes and the debrief opens with a ✓/✗ table of each answer vs. AHA 2025.
  - It explains every wrong item and the 2025 changes (temperature 32–37.5 °C for ≥36 h,
    was 32–36 °C ≥24 h; SpO₂ 90–98 %, was 92–98 %).
  - Handover points are given only when all targets are correct.
- Tests: 86 pass. Browser play-through of Cases 1–5 to handover: all complete.

## Pass 4 (20 Oct): review comments + fun & sound
- **Clock now runs in real time (1×).** One CPR cycle = 2 real minutes; pause limits 10 s / 20 s.
- **ETCO₂**:
  - New "Attach ETCO₂" button (Assess, Resuscitate, Airway); tapping the ETCO₂ tile also works.
    It connects to the bag-mask or tube.
  - Poor or tired CPR reads ≈5 mmHg ("LOW — IMPROVE CPR <10"); good CPR reads 12–18 ("≥10").
  - Paused ≈3; ROSC rises abruptly to 38. Opioid hypoventilation (Case 5) reads 52.
  - Fixed: the monitor used to show 38 by mistake.
- **Lab alert**: a purple drop-down banner, a chime, a short voice call-out and a flashing
  lab chip whenever a result returns.
- **Drugs**:
  - Sodium bicarbonate added (mEq or mEq/kg, 1 mEq/kg ≈ 50 mEq). It is refused as routine
    (AHA 2025) unless there is evidence of hyperkalemia.
  - The calcium buttons now show doses: gluconate 10% 20 mL, chloride 10% 10 mL;
    insulin 10 U + 50% dextrose 50 mL.
- **Voice**:
  - Short call-outs with no role names: "Epinephrine 1 mg IV. Done.", "Charged.",
    "Shock delivered. Resume CPR.", "We have a pulse!".
  - It uses the best available English voice.
- **Rhythm check**:
  - A separate **PEA** answer is added (the "organized rhythm" answer is also accepted
    for PEA).
  - After answering, an **ACLS next-steps panel** opens for the chosen branch.
  - Asystole → flat-line protocol (check leads, gain, second lead) → resume CPR →
    epinephrine. No shock.
  - PEA, bradycardia and tachycardia have their own panels, with one-tap buttons
    (e.g. pre-filled epinephrine 1 mg).
- **PEA trace** is now a slow, wide idioventricular complex, so it no longer looks like a
  near-flat line on the short monitor strip.
- **Hs & Ts**: **Hypoglycemia** added (auto-set from DTX). "Hypoglycemia" is also an accepted
  cause in Case 2.
- **ROSC alert**:
  - A full-screen beating heart and "PULSE IS BACK — ROSC" with a fanfare.
  - Case 3: "SINUS RHYTHM RESTORED". Case 4: "MECHANICAL CAPTURE" / "PERFUSION IMPROVED".
  - The CPR button then shows "♥ Pulse present — no CPR".
- **Fun / sound effects**:
  - A live **★ score chip** and a floating **+points** pop with a coin sound whenever an
    objective is achieved.
  - Sounds for: monitor attach, pads, CPR start, IV/IO, drug push, bag-mask, intubation,
    temperature probe, correct / wrong rhythm answer, lab result, alarms (fatigue,
    deterioration, collapse, pneumothorax, relapse) and the ROSC fanfare.
  - Pulse-oximeter beeps follow the heart rate, and their pitch follows SpO₂.
- Tests: 88 pass. Browser play-through of all five cases completes.

## Pass 5 (20 Oct): vagal maneuvers + double-syringe adenosine
- **Vagal maneuver is now its own action**, separate from cardioversion.
  - It sits in Resuscitate → "Vagal maneuver" and in the tachycardia next-steps panel.
  - The tachycardia panel has separate buttons for vagal, adenosine and synchronized
    cardioversion.
  - The player chooses **Modified Valsalva — syringe (REVERT)** or **Carotid sinus
    massage**. Each card lists its technique and contraindications.
- **Procedure cam** (new `procedure-anim.js`): an animated close-up over the 3D room, with
  step captions, a progress bar, a live rhythm strip and a Skip button.
  - **Modified Valsalva:** the patient sits at 45° and blows into a 10 mL syringe (the plunger
    moves, the gauge reaches ≈40 mmHg, 15 s countdown). She then lies flat with her legs
    raised 45° for 15 s, then sits up.
  - **Carotid sinus massage:** a lateral neck view with a pulsing carotid at the angle of the
    jaw. The stethoscope listens for a bruit first, then two fingers massage in circles on one
    side for 5–10 s.
  - **Adenosine (double syringe):** both syringes sit on a 3-way stopcock at an antecubital
    IV. Adenosine is pushed rapidly, the stopcock turns, a 20 mL saline flush follows at once
    and the arm is raised.
- The real monitor shows a **transient pause / AV block** about 6–10 s after each adenosine
  dose, then SVT returns (scripted no-response case).
- 3D team: the nurse reaches for the IV during adenosine; the patient turns her head for
  carotid massage and strains for Valsalva.
- Clinical log records the vagal type. Tests: 89 pass.

## Pass 6 (20 Oct, evening): case logic revision + visibility
- **ROSC is never announced mid-cycle (Cases 1, 2, 5).**
  - Once the conditions are met, the heart restarts silently. ETCO₂ jumps to about 40 if
    capnography is attached, but there is no pulse message.
  - The pulse is found only when CPR is paused for the rhythm / pulse check at the end of
    the cycle. Then "ROSC confirmed" appears with the heartbeat alert.
- **Case 4 (inferior STEMI + complete heart block) rebuilt.** No CPR is needed.
  - Atropine #1 → "No response". Atropine #2 → big amber **COMPLETE HEART BLOCK** alert →
    pace (or use an infusion).
  - New pacing panel: rate ±10, output ±5/±10 mA, and a live defibrillator ECG strip that
    shows **pacing spikes** (yellow, labelled CAPTURE / NO CAPTURE).
    - Below 60 mA: spikes without capture.
    - 60–69 mA: electrical capture only (pulse still 32).
    - ≥70 mA: mechanical capture, confirmed by a pulse check.
  - The player must then **add 10 % (≥77 mA)**.
  - When pacing is complete, a green alert and a **"Call cath lab & hand over"** button
    finish the case.
  - **12-lead ECG** opens a realistic synthetic 12-lead: ST elevation in II, III and aVF
    (III > II), reciprocal ST depression in I and aVL, and P waves marching through a slow
    narrow escape rhythm.
  - Other cases have their own 12-leads. The interpretation is shown in Guided mode and
    is hidden behind a button in Independent mode.
- **Case 5 revised.**
  - Naloxone is now **required** for ROSC.
  - The intubation → tension-pneumothorax complication is removed, along with the
    decompression and drain buttons.
  - Pacing is allowed before the arrest.
  - Collapse → big red **UNRESPONSIVE — NO PULSE · START CPR NOW** alert.
  - **Inspect the back** plays a procedure-cam animation: log-roll, two fentanyl patches
    found, gloved hand peels them off.
- **Deterioration is now obvious.**
  - Full-screen red / amber alerts with a siren and a pulsing red frame for: Case 3
    deterioration, BP drops of ≥20 mmHg, collapse, flat line, falling perfusion, slowing
    breathing.
  - Vital tiles flash red when BP <90, SpO₂ <90 % or HR <40 / >150, and an alarm chip
    appears in the top strip.
- **SYNC button**: UNSYNC / SYNC ● toggle. With SYNC on, ▼ sync markers appear on every
  R wave.
- Tests: 91 pass. Browser play-through of all five cases completes.

## Pass 7 (20 Oct, night): med cart, novice play-through, interaction
- **Med cart**
  - A red crash cart in the 3D room (click it). The Drugs dock button is now "Med cart".
  - Drug cards in four groups:
    - arrest: epinephrine, amiodarone, lidocaine;
    - brady / tachy: atropine, adenosine, diltiazem, metoprolol, dopamine and epinephrine
      drips;
    - electrolytes / antidotes: calcium gluconate and chloride, regular insulin, 50 %
      dextrose, sodium bicarbonate, naloxone, naloxone drip;
    - comfort: analgesia / sedation.
  - Picking a card opens an order sheet with **dose chips** (correct dose plus plausible
    distractors) and an "other" field, plus route chips. The game checks the indication
    and dose and explains only when the choice is wrong.
  - The nurse turns and pushes the drug in 3D.
- **Cause-directed box revised.** All drugs moved into the med cart. Investigate keeps
  history / exam / temperature / POCUS / back, labs, the **Hs & Ts board** (now its own
  window over the room, colour-coded) and consults (cardiology, nephrology, repeat K⁺).
- **Access**: IV 20 s, IO 10 s. With IO-only access every drug, including epinephrine, goes
  via IO automatically; adenosine still needs a peripheral IV.
- **Inspect the back** in other cases → "Back and skin inspected: normal".
- **Pain**: synchronized shock or pacing in a conscious, unsedated patient makes her
  grimace, flinch and cry out (voice). It is logged at 0 points; sedation stops it.
- **Tired compressor**: after 2 min without a switch they slump, the head drops, they
  breathe hard, compress slower and shallower, and the label says "Tired — slower,
  shallower!".
- **History is read aloud** by the family member.
- **Case 3**: BP drops 10 s after the 12 mg adenosine. Synchronized cardioversion is also
  allowed in a stable patient once adenosine has failed. Diltiazem / metoprolol are allowed
  when stable and harmful when unstable.
- **Case 5**: no "breathing slowing" alarm if intubated (the opioid relapse still needs a
  naloxone drip). Handover messages say exactly what is still needed.
- **Less hand-holding in Independent mode**: no step lists in the next-steps panel and
  neutral cycle-banner text. "What's still missing" coaching appears at rhythm checks after
  ~2 min of arrest (Guided specific, Independent generic).
- **Pads now show the rhythm** on the defibrillator (no separate monitor needed to see it).
- **New `tests/novice.test.mjs`**: 9 novice play-throughs with typical mistakes (late CPR,
  SYNC on VF, early epi or amiodarone, shocking PEA, atropine in PEA, dextrose before DTX,
  CPR on a conscious patient, adenosine 12 first, IO adenosine, unsynchronized shock,
  epinephrine bolus in bradycardia, pacing without pads, naloxone before ventilation).
  Each gets feedback and still reaches ROSC / completion. 103 tests pass.

## Pass 8 (21 Oct): layout + realism tweaks
- Access box no longer says "keep CPR going".
- **Assess** now holds only Pulse & breathing, Attach monitor, and 12-lead (shown only when
  the patient has a pulse; refused during arrest — "record it after ROSC").
- Examination, history and temperature live in **Investigate**.
- **Flat-line check** moved to the defibrillator panel.
- **Tap the family member** in the 3D room to take the history (read aloud).
- **ETCO₂** is attached from the airway panels and only after intubation. Intubation no
  longer attaches capnography automatically.
- **Case 3 cardioversion**: the first synchronized shock fails; the player must check the
  pulse/rhythm and escalate the energy for a second synchronized shock, which converts to
  sinus. The conversion ("Sinus rhythm restored") is confirmed only by the pulse check after
  the shock.
- **Case 4 pacing**: capture at ≥60 mA now raises BP to 100/64 (stable). Confirm with a
  pulse check, then add 10 % (≥66 mA).
- The defibrillator panel's live screen (ECG with pacing spikes + HR / NIBP / SpO₂) stays
  pinned at the top while scrolling the pacing controls.
- **Case 5 skin check is interactive**: log-roll, find and tap four fentanyl patches
  (different strengths and dates, including flank and axilla). Feedback: "chronic fentanyl
  use, extra patches added last night". The history text is updated to match.
- **Medication animation**: every bolus plays a small "MED" cam (read-back → push through
  the port → 20 mL flush → raise limb). The nurse turns and pushes in 3D.
- Tests: 103 pass.

## Pass 9 (24 Oct): Liquid Glass UI
- Look inspired by Apple's Liquid Glass and github.com/dashersw/liquid-glass-js (MIT). The library itself
  is NOT bundled: it takes one static html2canvas snapshot of the page and opens one WebGL context per
  element. Over our live WebGL room that refracts a frozen (blank) image, needs a CDN script (breaks
  offline play.html) and would exceed the browser's WebGL-context limit with dozens of buttons.
- Implemented natively instead:
  - **Frosted glass** for: panels, HUD, chips, caption, toasts, alerts, modals, the Hs & Ts
    window and procedure cams (backdrop blur + saturation, a diagonal sheen, a bright top rim
    and an inner glow).
  - **Real refraction** of the 3D room through an SVG displacement filter (`#lg-refract`) on
    Chromium browsers (Chrome / Edge).
  - Glass tiles for drawer buttons, drug cards and chips, with hover / press feedback; mint
    glass primary buttons; dock glass pills.
- **Panels now float over the room** (landscape) as a rounded glass sheet, and the patient
  monitor stays visible while a panel is open.
- Settings → Graphics "Performance" turns the blur and refraction off for slower iPads.
  Reduced-transparency mode is respected.

## Pass 10 (2026-10-24) — review comments: pads, tube, stethoscope, ECG, epinephrine
- **Defib pads (3D)**: moved to the AHA anterolateral position — right infraclavicular/parasternal and left mid-axillary at the apex, sized ~11×13 cm, tilted to sit on the chest wall; the left arm abducts slightly when pads are on; cable starts at the lateral pad.
- **Endotracheal tube (3D)**: path now starts inside the lips (mouth ≈ y 1.451, z −0.459), rises vertically and curves to the bag; added a black depth mark and a white tube tie.
- **Breath-sound check**: new `auscultate` action + procedure-cam animation (stethoscope epigastrium → left → right, chest rise, bag squeeze, breath "whoosh" sounds, placement checklist) and a 3D stethoscope on the chest. Runs automatically when intubation completes and from the Airway / CPR panels ("🩺 Listen: breath sounds"). Variants for bag-mask, spontaneous breathing and apnoea. The completion line no longer claims capnography is attached.
- **ECG "bobbing" fix**: `Trace.draw` now samples at ≤2 ms per point (sub-pixel), so narrow R waves are no longer aliased into varying heights on narrow canvases (the review strip). Procedure-cam strip sampled at ¼ px.
- **Epinephrine cycle alert**: amber full-screen alert + alarm at 3 min ("EPINEPHRINE DUE"), red at 5 min ("OVERDUE"); LAST EPINEPHRINE tile pulses amber/red with "DUE"/"NOW"; cycle banner shows DUE/OVERDUE. Only during arrest.
- Tests: tests/pass10.test.mjs (auscultation results, epi due/overdue). 106 pass.

## Pass 11 (2026-10-27) — readability and tap targets
- All small type scaled up in style.css (6–16 px → 10–18 px); drawer buttons ≥48 px tall, action cards ≥60 px, dock buttons ≥64 px, camera-nav 46 px.
- Liquid-glass panels made more opaque (drawer ~90 %), so text stays readable over the 3D scene; lighter secondary text.
- Drawer wider (min(430px,62%)); right HUD and status chips reposition while a panel is open; Sound/Voice/Shock chips hide while a panel is open; on ≤1300 px wide (iPad) the team caption hides under an open panel and dock sub-labels hide.
- 3D role labels larger (150×34 px boxes) with darker backgrounds.
- Monitor footer (Hint / Timeline / Finish) is sticky so it never scrolls out of view.
- Tests unchanged: 106 pass.

## Pass 12 (2026-10-28) — Apple-style polish
- Only tappable menus are solid (drawer, buttons, dock); information overlays (status pills, team caption, rhythm-check banner, toasts, lab alert) are translucent frosted glass again.
- 3D role labels: translucent rounded pills with a hairline edge and sentence-case white text ("Compressions", "Meds / Defib"); they now pack to the left of the right-hand HUD so they are never hidden behind it.
- System font stack (-apple-system / SF Pro, Inter fallback); pill chips; 14–26 px radii; filled primary actions (teal give/pacer, yellow charge, red shock); press-scale feedback; quieter section labels.
- Tests unchanged: 106 pass.
