# ACLS 3D Simulator

An interactive **Advanced Cardiovascular Life Support (ACLS)** training simulator
that runs entirely in the browser. Built as a single self-contained HTML file with
[Three.js](https://threejs.org/) for the 3D resuscitation scene and the Canvas/Web
Audio APIs for the live ECG monitor and defibrillator sounds — no build step, no
dependencies to install.

> ⚠️ **Training tool only — not for clinical use.** Always follow your local
> protocols and current AHA guidelines.

## Features

- **3D code scene** — patient, CPR/airway/IV team, crash cart, and family member you can click and orbit around.
- **Live ECG monitor** with rhythm-specific waveforms (NSR, brady/tachy, SVT, AFib, CHB, STEMI, VT, Torsades, VF, fine VF, PEA, asystole, paced).
- **CPR quality feedback** — rate and depth bars with target zones and an audible metronome.
- **Defibrillator workflow** — energy selection, charge → all-clear → shock, plus synchronized cardioversion.
- **Transcutaneous pacer (TCP)** — find the capture threshold and verify a safety margin and mechanical capture.
- **Medications** with dose validation (epinephrine, amiodarone, atropine, adenosine, calcium, dextrose, and more).
- **Labs & differential** — order STAT diagnostics and work the H's & T's.
- **Scoring & debrief** — penalties for protocol errors, rewards for correct steps, and an end-of-case report card.

## Scenarios

1. **ECG Rhythm Trainer** — identify critical rhythms with guided feedback.
2. **Pulseless VT (Hyperkalemia)** — ESRD patient, missed dialysis.
3. **Asystole (Hypoglycemia)** — diabetic patient, insulin without a meal.
4. **SVT (Stable → Unstable)** — vagal → adenosine → synchronized cardioversion.
5. **Unstable Bradycardia (STEMI / Pacing)** — atropine → TCP.
6. **MEGACODE** — AMI → complete heart block → PEA → pulseless VT → VF → ROSC.

## Running it

It's a single static file. Either:

- **Open directly** — double-click `index.html` (needs internet access for the Three.js CDN scripts), or
- **Serve locally** (recommended):

  ```bash
  # Python
  python -m http.server 8000
  # then open http://localhost:8000

  # or Node
  npx serve .
  ```

## Deploying with GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set the source to the `main` branch (root).
3. Your sim will be live at `https://<username>.github.io/acls-simulator/`.

## Tech

- Three.js r128 (3D scene + OrbitControls) via CDN
- HTML5 Canvas (ECG and rhythm-trainer waveforms)
- Web Audio API (metronome, charge, shock) + SpeechSynthesis (voice prompts)
- Vanilla JavaScript — no framework, no bundler

## License

MIT
