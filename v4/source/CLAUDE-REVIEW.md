# Claude review handoff — ACLS sim

Version 4.0.0-preview.5-en. Please inspect current files and compare hashes before editing: Codex continuation may also be active. Do not overwrite concurrent changes. Do not edit the original parent index.html. Do not upload private research documents.

## Source map

- clinical.js: case data, timing, medication/action rules, simulated outcomes, scores and reports.
- team-motion.js: shared CPR/ventilation timing used by visual scene, monitor and CCF accounting.
- scene.js: Three.js room, characters, face deformation, role labels, camera orbit and procedural actions.
- app.js: UI, actions, tutorials, ECG practice, pause, debrief and local export.
- ecg.js: educational waveforms.
- index.html / style.css: editable UI and responsive layout.
- build.mjs: packs source, library and assets into play.html. Do not edit play.html directly.
- tests/: clinical regression and motion-timing checks.
- assets/HEAD-LICENSE.txt and vendor/: asset/library attribution.

From this directory run `node --test tests/*.test.mjs`, then `node build.mjs`. For source preview, run `python -m http.server 8765 --bind 127.0.0.1` only if that port is not already serving this app. Existing live preview may serve the Documents sandbox, not this Desktop copy.

## Review priorities

1. Independently audit clinical rules against AHA 2025, particularly hyperkalemic arrest uncertainty, rhythm reassessment, timing/doses, cardioversion/pacing and post-arrest care.
2. Outcomes are scripted, not a physiological prediction. Rubrics and game points require PI validation. Confirm original-scene mapping before research use.
3. Verify 30:2 choreography and actual compression-time accounting at cycle boundaries, pauses and advanced-airway transitions. Four seconds for two breaths is an animation choice, not a prescribed clinical pause.
4. Check face/neck joins, repeated identities, eyelid motion, hand placement, BVM seal and pad/airway procedural detail. The current scan is not a full expressive rig. Inspect all camera angles.
5. Test physical iPads/Safari: oldest supported model, portrait/landscape, pinch/drag/tap separation, split view, temperature/performance over a full case, audio and offline loading.
6. Keep all game text English and home cases numbered 1–6 with no rhythm spoilers. Preserve the five clinical scenarios plus ECG trainer.

No clinical certification, expert sign-off, physical-device benchmark, GitHub publication or file:// browser verification is claimed.


## Latest cartoon rebuild
See [CARTOON-REBUILD.md](CARTOON-REBUILD.md) for the current art, character orders, staged airway workflow, 54-test result and exact verification limits. Older scan-head descriptions are historical.


## Gameplay clarity update
See GAMEPLAY-CLARITY.md for compact translucent controls, ECG interpretation, shock count, team readback/Voice toggle and neutral 5H/5T evidence review.
