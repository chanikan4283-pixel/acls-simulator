# Codex handoff: what Claude did, and where everything is (26 Oct 2026)

Claude (Anthropic) took over while Codex was out of weekly quota, from 19 to 26 Oct 2026. It edited this project directly. This file explains how the project is set up, what changed, and what is still open. **Read this first, then `CLAUDE-UPDATE-2026-10-19.md`** (the detailed per-pass change log, passes 1–10).

Project owner: Praew. She reviews by pinning comments on `play.html`. Reply to her in Thai when she writes Thai. Everything inside the game stays in English.

---

## 1. Where the files are

| What | Location |
|---|---|
| **Live working copy (use this)** | `C:\Users\chanikan\Documents\Codex\2026-10-14\https-chanikan4283-pixel-github-io-acls\outputs\acls-v4\` |
| Playable build (self-contained, offline) | `outputs\acls-v4\play.html` |
| Detailed change log, passes 1–10 | `outputs\acls-v4\CLAUDE-UPDATE-2026-10-19.md` |
| Backup taken before Claude's edits | `outputs\acls-v4\_backup-before-claude-2026-10-19\` |
| Presentation video for the professors (compressed copy) | `outputs\acls-v4\presentation\ACLS-sim-presentation-compact.mp4` |
| Video production pipeline | `outputs\acls-v4\video-tools\` (see §5) |
| Playwright QA scripts | `outputs\acls-v4\qa-tools\` (see §4) |
| **Stale old copy, do not use** | `C:\Users\chanikan\OneDrive\Desktop\claude\acls-simulator\v4\` (12 Oct version, before every Claude pass) |
| Parent original `index.html` (repo root) | **Do not edit.** Praew asked for this. |
| "How to Play" slide deck (Claude artifact) | https://claude.ai/artifact/BQ7sfqdMK8jZg1LiyHzzor (37 slides; **out of date** after passes 6–10) |

The full-quality 50 MB video went to Praew in the chat. It is not in the folder because the transfer tool caps files at 30 MB, so the folder has a compressed copy instead.

## 2. Build and test

```bash
cd outputs/acls-v4
node build.mjs     # bundles all modules into play.html (single script scope!)
npm test           # node --test tests/*.test.mjs  → 106 pass, 0 fail at handoff
```

- **Single script scope.** `build.mjs` concatenates every ES module into one inline script. Top-level names must not collide across files. New files use unique prefixes, for example `PA_`, `tl…`, `TL_`.
- The stack is Three.js r128 (`vendor/three.min.js`). There is no bundler beyond `build.mjs`.
- The project has not been pushed or published to GitHub. **Ask Praew before any push or deploy.**

## 3. Architecture cheat-sheet

- **`clinical.js`**: the engine, `class Simulation`.
  - Actions go through `action(a,data)`, `med(name,dose,unit,route)` and `targeted(a)`.
  - Scoring uses `error(key,text,pts)` and `award(key,pts,text)` with `RUBRICS` per case. Timers use `later()` and `tick(dt)`.
  - ROSC logic: `roscBlockers()` leads to `resolve()`, which leads to `s.roscReady`. `revealRosc()` fires only at a rhythm check, or at a pulse check with CPR paused. **A pulse never appears mid-cycle.** That was Praew's explicit rule.
  - Constants: `PAUSE_LIMIT=10`, `ACCESS_SECS={IV:20,IO:10}`, `FATIGUE_SECS=120`, pacing capture at 60 mA electrical and ≥66 mA mechanical.
- **`app.js`**: all UI.
  - Panels and orders: `openPanel(name)`, `orderAction(action)`, `teamOrder()`.
  - Med cart: `MED_CART` and `selectDrug()`, which writes an order sheet to the hidden `#drug/#dose/#unit/#route/#give-med` fields.
  - Alerts: `critAlert()` with the `CRIT` map.
  - Other windows: `openHT()` (Hs & Ts window), `showTwelveLead()`, `showReport()` (debrief).
  - Sound: `SFX` and `EVENT_SFX` (WebAudio synth).
- **`scene.js`**: the 3D ward (`class Ward`); picking via `userData.pick`.
- **`procedure-anim.js`**: canvas "procedure cam" animations: valsalva, carotid, push, patch, adenosine and auscultate. It also holds `playPatchHunt`.
- **`ecg.js`**: rhythm synthesis plus `Trace` (sync markers, pacing spikes).
- **`twelve-lead.js`**: synthetic 12-lead profiles (case 4 is inferior STEMI with CHB).
- **`style.css`**: blocks appended per pass. The "liquid glass" UI is the last big block: `body.lg`, plus refraction via SVG filter `#lg-refract` when `body.lg-refract-on`.

### Cases (all AHA 2025 adult ACLS)
1. **Pulseless VT with hyperkalemia.** ROSC needs:
   - 3 shocks, epinephrine and amiodarone (or lidocaine);
   - treatment of the cause (calcium, or recording hyperK in Hs & Ts);
   - at least 45 s of CPR.
2. **PEA/asystole from hypoglycemia.** ROSC needs epinephrine, a DTX followed by dextrose, a fluid bolus and at least 45 s of CPR.
3. **SVT, stable then unstable.**
   - Vagal maneuvers and adenosine 6 then 12 mg.
   - Once unstable: **two synchronized shocks, the second at a higher energy, with a pulse check after each.**
4. **Inferior STEMI with CHB.**
   - Atropine 1–2 times, after which a CHB alert appears; then pacing. No CPR in this case.
   - The case is complete when there is a pulse check and output ≥66 mA.
5. **Megacode.** Pacing, then arrest. Hidden fentanyl patches (4) must be removed. **No ROSC without naloxone.** Re-narcotization happens about 35 s after ROSC.
6. **ECG coach** (rhythm trainer).

## 4. QA

- `qa-tools/pw.py` and `qa-tools/full.py`: Playwright scripted runs of cases 1–5 (`python3 full.py 1 2 3 4 5`).
  - Launch flags: swiftshader GL.
  - Paths inside point to `/home/claude/v4/play.html` (Claude's cloud container). Change `URL` to your local path.
  - Known harness artifacts, which are not game bugs:
    - Real-time lag in headless runs gives spurious `long-pause` penalties in case 1.
    - Case 5 shows "mega-incomplete" because the script hands over before the 35 s re-narcotization window.
- `tests/novice.test.mjs` is the novice matrix: every wrong path gets feedback and still reaches ROSC or completion.
- `tests/pass10.test.mjs`: auscultation results, and epinephrine due at 3 min / overdue at 5 min.

## 5. Presentation video (made 24 Oct)

- 2:56, 1080p30. No narration; SFX and English subtitles. The style is Apple-keynote / futuristic.
- Sections:
  1. Intro.
  2. "Play anywhere" (iPad, Mac, phone).
  3. **Case 1 played for real in the game.**
  4. Montage of cases 2–5 and the ECG coach.
  5. Future: **Live mode**, an instructor console driving learner screens.
  6. "Every patient": hologram pediatrics, trauma, pregnancy and toxicology.
  7. Outro.
- How it is made (`video-tools/`):
  - `vclock.js` is an init script that virtualizes time: performance.now, Date, rAF and timers. `rec.py` steps `__vstep(1000/30)` per frame, freezes CSS animations to virtual time, captures with CDP `Page.captureScreenshot`, and draws subtitle and tap-ripple overlays. Recording is frame-exact, so headless slowness does not matter.
  - **Do not use Playwright's `page.clock`.** Screenshots hang with it.
  - Remove `lg-refract-on` while recording. The refraction filter makes each frame about 2× slower.
  - `case1.py` and `others.py` are the gameplay shot lists (taps on real DOM selectors). `mg/*.html` hold the motion graphics, each exposing `render(t)`; `mgrec.py` renders them. `audio/sfx.py` synthesizes all SFX and the music bed. `assemble.py` builds the segments, the cue-based audio mix and the final mp4.
  - Absolute paths (`/home/claude/...`) need adapting.

## 6. Things Praew asked for that are done (summary; details in the change log)

- **Passes 1–5.** Logic rewrite and review comments:
  - Case 1 ROSC logic; labs picker with alerts.
  - Hs & Ts in its own window with auto "less likely" marks.
  - ETCO₂ only after intubation; PEA/asystole flatline protocol.
  - 1× timer; louder shock sound; clear 2-min cycle banner; IV/IO buttons.
  - POCUS game and CPR rhythm game made easier.
  - Post-ROSC debrief with the AHA 2025 changes.
- **Pass 6.** Medical-student playthrough of every path; button revision; less guidance (feedback only when the player is wrong).
- **Pass 7.**
  - Investigate panel; flatline check moved to the defibrillator; 12-lead only with a pulse; tap the family for history.
  - Patch hunt; med-push mini animation; monitor stays visible while pacing.
- **Pass 8.** Vagal maneuver types with animation; double-syringe adenosine; case 4/5 revisions.
- **Pass 9.** "Liquid glass" UI, built natively. The liquid-glass-js library was deliberately not bundled: it breaks the live 3D, offline use and WebGL limits.
- **Pass 10 (24 Oct):**
  - 3D pads in the AHA anterolateral position; ETT now exits the mouth.
  - **Stethoscope breath-sound check**: auto after intubation, plus a "🩺 Listen" button.
  - ECG aliasing fix: R waves no longer bob up and down.
  - **Epinephrine cycle alerts**: amber at 3 min, red at 5 min, pulsing LAST EPINEPHRINE tile.

## 7. Open items / suggestions for Codex

- The "How to Play" slide deck is outdated. It still says intubation turns on capnography, and it still mentions the "Reassess breathing" button and the old dock labels.
- Live mode and new patient types (pediatrics, trauma, OB, toxicology) are only shown as **concepts** in the video. Nothing is implemented yet.
- The home screen at 1600×900 leaves empty dark space on the right and bottom. That is a layout polish candidate.
- Subtitles and overlays cannot appear above `<dialog>` modals (they render in the top layer). Keep that in mind for any future recording.

## 8. Standing rules from Praew

- Never click Codex "Reset usage" or "Upgrade" (paid).
- Don't edit the parent original `index.html`.
- Don't push or publish to GitHub without her approval.
- Keep `npm test` green; add tests for new logic.
- Every decision in the game must be logical and lead to ROSC or completion. Guide only when the player is wrong. The goal is learning the ACLS 2025 flow, dosing and team dynamics.
