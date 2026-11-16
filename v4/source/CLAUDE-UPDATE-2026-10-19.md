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

## Pass 13 (2026-11-13) — CPR posture, smoother procedures, individual debrief, calmer type
Built on top of Codex's 2 Nov animation update (synced from the device first).
- **CPR rig (scene.js)**: rescuer stands on a visible two-step stool (0.345 m) with feet under the hips and thighs at the mattress edge; hip hinge so the shoulders sit over the lower half of the sternum; elbows locked; stacked hands at the nipple line (z −0.12). Stroke is driven from the hips: fast downstroke, brief full-depth contact, complete recoil (≈50 % duty) at the selected rate (default 100/min, 100–120 valid) and depth (5–6 cm). Patient chest deforms locally; small impact follow-through on the patient's head/arms, mattress give and rescuer head. Tired rescuer: bent elbows and slump. Floor raised so the bed is at a realistic height; bed rails lowered.
- **Compression sound (app.js)**: one deep thump exactly as the hands reach full depth (phase-locked to the visible stroke) instead of a free-running beep. `teamMotion()` now also returns `strokePhase`.
- **Pads / shock**: gel on both sites, pads rolled on one after the other; on shock a brief muscle jolt and light from the pads, team hands-off pose while clear.
- **Individual debrief (feedback.js, new)**: `personalFeedback(report, goals)` builds a per-learner block at the top of the debrief — headline, six domain bars (CPR quality, rhythm & shock, drugs & access, finding the cause, safety & comfort, after ROSC), "what you did well" from the learner's own numbers, up to four priorities quoting their own errors with counts and timestamps, and one drill for the next attempt. Tests: tests/feedback.test.mjs.
- **Typography / iPad**: Apple system font (`data-font="system"`, SF Pro on iPad), off-white text with softer secondary colour and hairline borders; rhythm-check banner and epinephrine line no longer wrap; dock icons never collide with labels; status chips in one tidy row.
- Tests: 112 pass. Scripted runs of cases 1–5 reach completion (case 5 after the re-narcotisation window).

## Pass 14 (2026-11-13) — case review, ECG accuracy, intubation, ETCO₂, name tags, lock
- **Persona review** (first-timer / intermediate / expert scripts for cases 1–5, qa-tools/personas.mjs). Fixes: a rhythm check slightly before 2 min is no longer punished as "stacked shocks" (needs ≥100 s of CPR, was exactly 120); pressing Shock without charge/pads is a plain prompt, not three stacked errors; antiarrhythmic feedback is now context-specific (SVT with a pulse, <3 shocks, PEA/asystole); removed "scripted/simulated" wording from live messages.
- **ECG**: Wenckebach PR increments now shrink so R-R shortens before the dropped beat; torsades redrawn as a continuous twisting spindle; new atrial flutter 2:1 (300/min sawtooth) and first-degree AV block; clearer names/explanations for VT, SVT, AF, CHB. ECG coach deck = 17 tracings (generic "VF" removed because fine/coarse VF are separate cards); pacing labels are hidden on quiz strips so they do not give away the answer.
- **Intubation**: 8.4 s sequence with a sagittal procedure-cam animation (pre-oxygenate/position → blade from the right, sweep tongue → lift along the handle, cords in view → tube through cords → stylet out, cuff, 22 cm at teeth → connect bag), 3D laryngoscope with blade and lift, mask comes off, tube advances; then the stethoscope check runs.
- **ETCO₂ always expected**: after intubation an amber "Attach ETCO₂ to the tube" quick button appears; reminder at 25 s; scored omission (`etco2-missing`, 3 pts) at 75 s.
- **Name tags**: floating role labels removed (Roles button hidden); each clinician wears a name tag on the scrub top (COMPRESSOR, AIRWAY, VENTILATION, MEDS · DEFIB).
- **Home lock**: the practice room shows "Game not in use" until the passcode is entered (stored per device in localStorage); "🔒 Game not in use · lock" re-locks. Passcode constant `LOCK_CODE` in app.js. This is a classroom gate, not security — the code is readable in the page source.
- Tests: 114 pass.

## Pass 15 (2026-11-15) — clearer flow, click-to-work, pressure, cutscene
- **Defib panel rebuilt as numbered steps**: 1 Pads → 2 shock type (two plain-language cards: "Defibrillation — NO pulse" / "Synchronized cardioversion — pulse PRESENT") → 3 energy chips (defaults 200 J / 100 J) → 4 CHARGE · CLEAR · SHOCK. The SYNC/UNSYNC toggle is gone. Pacing and "More" (flat-line check, sedation) are collapsible; pacing opens by itself for a slow rhythm with a pulse.
- **CPR & Airway / Assess panels regrouped** with section headings and ✓ states that refresh after each order. Rate/depth inputs moved under "Compression targets (advanced)".
- **CPR tap game is now discoverable and meaningful**: HUD button "🎯 Coach CPR quality · tap game" while CPR runs (turns amber when quality drops); a good set of 30 (≥80 % on the beat) restores rate/depth, also during continuous compressions. Copy no longer says it does not affect the case.
- **Intubation**: no procedure animation (3 s, camera glance only). The player must **check the tube position** (interactive stethoscope: tap epigastrium + both lungs) and **attach ETCO₂**; both have HUD buttons, a reminder at 25 s and scored omissions at 75 s (`tube-check-missing`, `etco2-missing`).
- **Click-to-work**: pads are placed by tapping the two correct sites on a chest diagram (wrong sites explain why); chest/tube check is tap-driven; patch hunt and CPR tap game as before. `window.autoProcedures=true` bypasses these for scripted QA.
- **Camera**: brief automatic zoom on the action being performed (pads, charge, shock, airway, IV/IO, history, CPR start, switch), then back to the player's chosen view.
- **Idle nudges**: after ~20 s without an order (8 s if nobody is compressing) one small generic question appears ("Does the team have IV / IO access?", "Think Hs & Ts…"); tapping it opens the right panel. Never names the diagnosis.
- **Pressure**: last 10 s before a rhythm check — red vignette, ticking, "Ten seconds to rhythm check"; one-minute timekeeper call; family member speaks at 0:40, 2:50 and 5:30 of arrest; vignette also when compressions are stopped > 6 s.
- **Cutscene**: short letterboxed brief (camera moves + two lines from the case brief + "You are the team leader.") before the clock starts; Skip button; `skipCutscene()` for QA.
- **Other**: generic drug-push animation no longer raises the limb (adenosine only); case 5 exam no longer points to the skin/back; naloxone infusion alone now treats recurrent respiratory depression in case 5.
- Tests: 114 pass; personas (qa-tools/personas.mjs) and scripted cases 1–4 at 100.

## Pass 16 (2026-11-16) — simpler panels, typed doses, asystole case, score game
- **Med cart**: "Given so far" strip (time · drug · dose · route, incl. fluids) at the top; three steps (Access → Drug → Fluid bolus chips). The order sheet is a sticky bottom card and the **dose is typed by the player** (number field + fixed unit); no preset dose chips. Enter gives. `medLog` in app.js.
- **Investigate**: "Findings so far" (history, exam, temperature, 12-lead, ultrasound, skin) and lab results at the top; lab tests are tap-to-select chips; consults folded under "Consult · definitive care".
- **Removed**: stethoscope tube/chest check (buttons, HUD, penalty) and the pad-placement mini-step; pads now appear at once. After intubation only **ETCO₂** is required (reminder 20 s, `etco2-missing` at 60 s).
- **Case 2 is now asystole from the start** ("Look beyond the flat line"); the flat-line protocol (`flatline`, 5 pts, taken from CPR 20→15) is part of the rubric. Tests updated.
- **POCUS → Hs & Ts**: after interpreting a clip a button opens the Hs & Ts board with tension pneumothorax / tamponade row highlighted (auto-marked as before).
- **Funny team bubbles** (speech bubble pinned to the 3D clinician) when nobody is ventilating (0:35, 1:15, 2:05 of arrest), slow breathing without bag-mask, long bag-mask without a tube, tube without capnography. Tap opens CPR & Airway.
- **CPR tap game**: score (10/15 per good/perfect tap × combo up to ×5), combo meter, set bonus +200, pop-ups, personal best (localStorage `acls-cpr-best`).
- **Sound**: richer success/error/ROSC/alarm, case-start sting, heartbeat in the last 10 s, panel whoosh, combo jingle.
- Tests: 115 pass; scripted cases 1–4 at 100, personas for 5.

## Pass 17 — 16 Nov 2026 (Claude)

Praew: *"add detail on flat line protocol, when intubate the team say ventilate every 6 second, and
cpr minigame when player reach target make the etco2 improve and 5h5t not sync to the action, and
there's time space there's nothing to do, make some minigame such as flatline protocol game like in
the real defibillation, in hx if there's no use of opiod there's no need to mention about patch or
opiod, the post ROSC game make a short simple minigame easy (if wrong go on with the debrief)"*

### 1. Flat-line protocol is now a game (`app.js` `flatlineGame()`, `clinical.js` `flatline-step`)
A defibrillator front panel over the room, running in **real time** — compressions carry on while
the player works, which is the whole point of the protocol.
1. **Patient cable & electrodes** — one of RA / LA / LL is flashing (picked at random each run);
   tap the flashing one to re-seat it. Tapping a good one says so and costs nothing.
2. **Gain** — ×1 → ×2 (20 mm/mV). The strip really is redrawn at the new gain (`Trace.gain`).
3. **Second lead** — II → I or III. `Trace.lead` now drives the on-screen lead label.
Then a verdict card, which depends on the rhythm actually on the monitor: *true asystole · do not
shock*, *not a flat line · shockable*, or *complexes present · this is PEA*. The card's buttons go
straight to Resume CPR, epinephrine, the defibrillator or the Hs & Ts board.
- Engine: `s.flatlineSteps{cable,gain,lead}`, action `flatline-step`, and `finishFlatline()` which
  awards the 5-point `flatline` objective once all three are done. `sim.action('flatline')` still
  completes all three in one call, so older scripts and tests are unaffected.
- Entry points: the asystole protocol card (now with the full AHA wording), the defibrillator
  panel's *More* drawer, a new amber quick-action button (`#flatline-qa`, shown for a flat or
  organised non-shockable rhythm that has not been checked), and an idle hint.

### 2. Ventilation after the tube
When the tube goes in the team now says, in the caption and in a speech bubble: *one breath every
6 seconds — 10 a minute — and nobody stops compressions*. The compression cue in the HUD reads
**CPR ACTIVE · 1 BREATH / 6 s** while intubated, the award text carries the same instruction, and a
later bubble repeats it at 70 s.

### 3. The CPR game drives ETCO₂
`cpr-coached` (a set of 30 with ≥80 % on the beat) now always resets the team to 110/min and 5.5 cm
**and** sets `s.cprBoostUntil = t + 90 s`. While that boost runs, good compressions give an ETCO₂ of
~20 mmHg instead of ~14. The game shows ETCO₂ as a fourth score chip with a ↑ while boosted, the set
bonus pops as **SET BONUS +200 ★ ETCO₂ ↑**, and a new bubble asks for coaching when ETCO₂ sits
below 10 after 2½ minutes.

### 4. Hs & Ts board synced to the player's actions
`autoReview` was rewritten: it now computes **one deterministic verdict per row per tick** (later
rules win), so rows can no longer flap or spam the log. Coverage added: PaO₂/PaCO₂ → hypoxia,
lactate alongside pH, missed dialysis in case 1 → potassium, treatment given (hyperkalaemia,
dextrose, naloxone, patch removal, decompression) → evidence supports, troponin, POCUS cardiac →
tamponade *and* pulmonary thrombosis, and history + examination → toxins.
Each row now shows **the reason underneath it** (`↳ DTX 26 mg/dL`), the board opens with an
**Evidence so far:** line at the top, it refreshes itself when opened, and it scrolls on short
screens. Changing a row by hand still overrides everything.

### 5. Case 2 history
*"…with no opioid use"* is gone — the history no longer raises opioids in a case that has nothing to
do with them. It now reads: *She continued her usual insulin despite eating almost nothing. She has
had high fever, thirst and increasing fatigue.*

### 6. Post-ROSC bundle is a quick tap quiz
The number fields are gone. The handover panel is now **Step 1 · is she still with you** (pulse,
reassess, verbal commands) and **Step 2 · post-arrest bundle, one tap each**: SpO₂ 88/94/100,
MAP 45/55/65, PaCO₂ 28/40/55, and — once the commands check shows she is unresponsive —
temperature 30/36/38.5 °C and 12/24/36 h. Everything else moved into a *More ongoing care* drawer.
A wrong tap (or no tap) still hands over and opens the debrief, where the existing table marks each
target ✓ / ✗ against AHA 2025.

### Verified
`npm test` 115 pass. Scripted run (`qa/ui17.py`): the flat-line game completes and awards, the board
shows five synced reasons with the evidence summary, the HUD cue switches to 1 breath / 6 s, the
game's ETCO₂ chip reads 21 ↑ after coaching, and the post quiz writes all five targets and completes
the case with no wrong targets. No page errors.
Not checked: a real iPad, and audio.

### Pass 17b — case 2 is PEA again (16 Nov 2026)

Praew: *"in the real case it's still PEA"* — correct, and the pass-16 change had made the case
clinically wrong. A septic, hypoglycaemic 68-year-old arrests in **PEA**, not asystole.

- Case 2 opens in **PEA at 30/min** again (`Look beyond the rhythm` · *PEA → Asystole · Metabolic
  causes*). Objective: *confirm the non-shockable rhythm • early epinephrine • find and treat the
  cause without interrupting CPR*.
- The original deterioration rule does the teaching instead: **without epinephrine, the complexes
  disappear at 2½ minutes and the rhythm goes flat**, and the log then tells the player to run the
  flat-line protocol before believing the flat line. The flat-line quick-action button and the idle
  hint appear at that moment, so the pass-17 game keeps its place in the case — now at the point
  where it is actually indicated.
- Scoring stays fair at 100 either way: the 5-point `flatline` objective is renamed *Confirm the
  non-shockable rhythm (flat-line protocol)* and is awarded for **either** a correct rhythm call on
  the strip (PEA / organised, or asystole once it is flat) **or** running the flat-line protocol.
  A player who gives epinephrine early and never sees a flat line can still reach 100.
- The PEA protocol card gained the reasoning (*the electricity works, the pump does not*) and a
  flat-line protocol button.
- Tests updated: case 2 opens in PEA and scores the rhythm call; a separate case runs 160 s without
  epinephrine, checks the rhythm has gone flat, and checks that the three protocol steps award the
  objective only when all three are done. 115 pass.

### Pass 17c — rhythm changes only at a check, male voice, room sound (16 Nov 2026)

Praew: *"there's should not change the rhythm between cycle make it asystole at 2nd cycle please
review again make it logical make the voice over male version, less AI, more sound effect"*

**1. The rhythm never changes mid-cycle.** `s.cycleNo` counts completed cycles, incremented at each
rhythm check during arrest. Case 2's PEA → asystole now happens **inside the rhythm-check handler**,
at the check that closes the second cycle (`cycleNo >= 2`, arrest ≥ 200 s, no epinephrine yet), so
the player always discovers it by looking, never by watching it change under the compressions. The
old `t >= 150` tick rule is gone. The arrest-time gate also stops a player from pulling the flat
line forward by spamming early rhythm checks (four checks in the first 80 s leave it in PEA; it goes
flat at the next real check at 3½ minutes).
Verified end to end: check 1 → PEA, check 2 → flat line with the protocol prompt, and both the early
epinephrine path and the late path still reach ROSC and 100 points.

**2. Male voice, and less synthetic.** The team voice is now chosen from a male list, with neural
voices first because they are the ones that do not sound like a machine: *Guy / Ryan / Brian
(Natural)* on Windows, *Daniel / Alex / Aaron* on Apple and iPad, *Google UK English Male* on
Chrome, then any male English voice. The patient and the family get a **different** voice (female
list) so the room is not one person talking to himself. Delivery: rate 1.02 (1.10 for urgent
call-outs such as *clear* / *shock*), pitch 0.92, and a small per-line variation so the cadence is
not identical every time.
The wording is spoken aloud as a person would say it, which is most of the robot gone: role prefixes
are dropped, and `1 mg IV/IO`, `ETCO₂`, `SpO₂`, `PEA`, `200 J` become *one milligram I V or I O*,
*end tidal CO2*, *sats*, *P E A*, *two hundred joules*, with contractions (*don't stop
compressions*). Singular and plural are handled (1 milligram, 300 milligrams).

**3. More sound.** A new `roomSound()` runs every frame, all of it deliberately quiet:
- the monitor **beeps on every QRS**, at the real rate, dropping in pitch when sats are low — so you
  *hear* electrical activity in PEA and hear it vanish when the rhythm goes flat (no beep in VF);
- a soft **thump on every compression**, at the team's actual rate;
- a **flat-line reminder tone** every 5 s in asystole;
- a **ventilation hiss every 6 seconds** once the tube is in — the audible version of the 10/min rule;
- **pacer clicks** at the set rate, with a capture beep when the pacer captures;
- **countdown ticks** in the last 5 s before the 2-minute rhythm check.
Event sounds added for CLEAR, the flat-line protocol and each of its steps, rhythm and pulse checks,
and the CPR coaching bonus; warning events now get their own soft two-note chirp instead of silence.

### Verified
`npm test` 115 pass · scripted runs of cases 1–5 all score 100 with no errors · the eleven persona
runs are unchanged except case 2 expert, now 100 because the correct PEA call scores the rhythm
objective. Voice selection checked against simulated macOS, iPad, Windows, Chrome and
single-voice device lists. Not checked: a real iPad, and audio itself.

## Pass 18 — 16 Nov 2026 evening (Claude)

Praew's list: case 3 unstable signs + sinus/BP after the 2nd sync shock; case 4 12-lead incomplete,
assess instability, capture on every beat; labs one tap; expert consult easy to find; pick the
cause (H or T) before handover; case 5 patch removal bug + sound; CPR coaching after ~4 good taps.

- **Stability check** (`clinical.js` action `stability`, button in Assess step 3, pulse cases only):
  reports each unstable sign — hypotension, altered consciousness, ischaemic chest pain, shock,
  heart failure — as present/absent and the consequence (*STABLE* / *UNSTABLE → synchronized
  cardioversion* / *→ atropine, then pacing*). Awards `assess`, and `reassess` in case 3 once she
  has deteriorated. Refused in cardiac arrest.
- **Case 3**: the second synchronized shock now restores sinus 84/min **and** BP 108/68, SpO₂,
  consciousness at once (before, BP only recovered at the pulse check).
- **12-lead** (`twelve-lead.js`): in slow rhythms each column restarts on the beat, so every lead
  shows two whole complexes (case 4's STEMI was being cut mid-beat at 32/min). Paced 12-lead: the
  spike window was narrower than the sampling step, so some beats lost their spike — now every beat
  has spike + capture.
- **Labs**: each test is a chip; one tap sends it. Chip turns amber with a countdown, green when back.
  No Send button.
- **Expert consult**: visible as step 4 "Call an expert" in Investigate and as its own section in
  Handover (no longer inside a collapsed drawer).
- **Cause before handover** (cases 1, 2, 4, 5): ten H/T chips in the Handover panel. Handover is
  refused until one is picked; a wrong pick gives feedback and can be changed, or handed over as is.
  `cause` now accepts a 12-lead, POCUS, temperature or the patches as supporting findings.
- **Patch hunt** (case 5): the bug was that removal only counted after pressing a "Done" button, and
  closing with ✕ after peeling all four recorded "not finished". Now it completes by itself 1.6 s
  after the last patch (✕ also counts once all are off), taps are accepted after 0.6 s instead of
  1.2 s, the hit area is larger, the panel no longer shifts as the message changes, and every peel
  has a rip sound + toast ("Patch 2 of 4 removed"), with a chime on the last.
- **CPR coaching**: 4 taps in a row at 100–120/min now coaches the team (was a full set of 30 at
  80 %). Chime, "TEAM COACHED ✓" pop, the compressor answers aloud, a toast and a green badge in the
  game say what changed (110/min · 5.5 cm).

Verified: `npm test` 118 pass (3 new). Scripted cases 1–4 score 100; case 5 scores 100 in the two
deterministic engine persona runs, while the browser script again stopped at the re-narcotisation
wait (87, not handed over) — the same timing flake as earlier today. UI run `qa/ui20.py`, `qa/t5.py`.
Not checked: real iPad, audio.

## Pass 19 — 16 Nov 2026 night (Claude): full review, debug, design, new guide

- **Debug sweep.** `qa/fuzz.mjs`: 2,000 random engine runs (160 random actions/drugs each, all five
  cases) checking for exceptions, NaN, score out of range and impossible states (CPR with a pulse,
  conscious in arrest, sinus without a pulse…) — clean. `qa/monkey.py`: 10 browser runs clicking
  random visible buttons in every panel — no page errors.
  Bugs found and fixed: `stabilityChecked` was falsy when checked at t=0; `openModal` threw if a
  modal was already open; the flat-line quick button's label was clipped and it appeared in PEA
  (now only once a rhythm check has actually shown asystole); the debrief said "Well done, you
  completed" for an unfinished attempt; the case-5 QA script stopped CPR at 40 s (ROSC needs 45 s),
  which was the "flake" reported in passes 17b/18 — the game was right, the script was wrong.
- **Hints** now name the panel ("Assess → Check for unstable signs", "Defib / Pacer → Defibrillation,
  200 J…", "give dextrose 50 % (Med cart)") and start cases 3 and 4 with the stability check.
- **Guide rewritten** (`manual()`, `GUIDE`): "A case in 6 moves", the six dock buttons, the 2-minute
  clock, things to do during CPR, score and help — as cards, with an **English / ไทย** switch
  (remembered). Game text itself stays English.
- **Look**: HUD corner brackets on the scene, glow on vitals and the clock, case cards with a
  coloured light edge and hover slide, gradient headline, lit active dock button. Borders and
  text-shadow only — no per-frame cost.

Verified: `npm test` 118 pass · scripted cases 1–5 all 100, no errors.
