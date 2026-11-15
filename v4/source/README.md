# ACLS sim — ACLS V4

Current interface: English, preview.5-en. See PLAYER-GUIDE-EN.md. Home selection uses only Case1–6: clinical scenarios1–5 and the existing ECG lab as6, without diagnostic labels.

Separate educational preview rebuilt for touch-first use. Original V3 is not modified.

## Open

- On the desktop: open **play.html** in a modern browser. It is a self-contained build (including the 3D library, model and textures); no install needed.
- Recommended development preview: run `python -m http.server 8765 --bind 127.0.0.1` in this folder, then open http://127.0.0.1:8765/ .
- On iPad: serve this folder from an HTTPS static host and open its URL in Safari. The computer's `127.0.0.1` URL does not work on a separate iPad. This release has not yet been published or tested on physical iPad hardware.

## Included

- ECG Rhythm Lab with 17 teaching patterns, calibration/time marks, and explanations.
- Five preserved scenario slots: shockable hyperkalemia; non-shockable metabolic illness; SVT; bradycardia/pacing; opioid-associated megacode.
- New 3D resuscitation room, articulated figures, breathing/CPR/BVM animations, detailed head scan, facial deformation, hand-to-chest positioning, camera presets and a skippable opening camera sequence.
- Responsive landscape/portrait layouts, a single defib workflow panel, keyboard focus, reduced camera motion, three render-quality settings, captions and optional tones.
- Independent clinical state, clocks, guideline-based action checks, cause-directed team actions, scenario-specific learning rubrics, local debrief and JSON/CSV export.
- Pause on backgrounding and long stalls; reference modal pauses recorded separately from clinical actions. No real participant names are requested. No analytics backend or remote log transmission.

## Clinical scope

AHA 2025 is the rule-source year. URLs are in clinical.js and available from the in-app manual. The selected biphasic defibrillator is a simulation of a 200 J device; this is not a universal specification for every defibrillator.

Drug orders with numerical dose validation: epinephrine arrest bolus, amiodarone, lidocaine, atropine, adenosine, dopamine infusion and epinephrine infusion. Other cause-directed treatments are delegated team-care abstractions, not complete prescribing simulations. Glucose/fluids, airway insertion, naloxone and decompression require further clinical-detail review before research release.

ROSC and deterioration are scripted teaching outcomes, not validated physiological predictions. Hyperkalemia treatments with uncertain intra-arrest evidence are not mandatory magic cures. Standard care and allowed alternatives are separated from uncertain interventions. Persistent VF/pVT in this script requires CPR between shocks. The model does not cover every emergency, drug interaction, all differential diagnoses or all guideline branches.

## Scene mapping decision

The inspected local V3 index.html is the source for Case 2 (PEA/sepsis/metabolic) and Case 5 (opioid/pacing/PEA/recurrent toxicity). Its README described different older scenarios. This mapping is documented rather than silently claiming the versions matched. The research PI should confirm the desired canonical narrative before release. The original V3 remains available.

## Validation status

See QA-REPORT.md. Engine tests are executable with `node --test tests/clinical.test.mjs`. Build the single-file edition with `node build.mjs` after any source change.

This is an educational development build, not a certified ACLS instructor, validated assessment, or approved research intervention. Do not treat browser viewport tests as physical iPad tests. The research protocol, expert validation and final device requirements still need their real reviewers.

## Assets and attribution

- Three.js r128 and its GLTFLoader: MIT. See vendor/THREE-LICENSE.txt. Downloaded from the official Three.js distribution via cdnjs/jsDelivr.
- “Infinite, 3D Head Scan” by **Lee Perry-Smith**, based on work at **www.triplegangers.com**, CC BY 3.0 Unported. See assets/HEAD-LICENSE.txt. Model/textures obtained from the official Three.js example repository: https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/LeePerrySmith . Modifications: cropped shoulder geometry, scale/placement, material setup, procedural facial deformation and added headwear. The scan is an art asset, not a depiction of a real case or endorsement.
- Ward, bed, equipment, body geometry, UI and procedural animations are original project code. No Full Code assets were copied.

## Files

`clinical.js` rules/state; `scene.js` art/animation; `ecg.js` traces; `app.js` interaction; `style.css` layout; `index.html` modular app; `play.html` generated standalone app. Keep private research source documents and participant data outside this folder.

