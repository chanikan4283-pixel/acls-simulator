# Gameplay and practice update — 19 October 2026

Build: b6163ce98a235f71b5109d9faa731f727e0bc9ad533a0e4fbbd042c0ed397ab6

## Changes
- Second and subsequent shocks retain the 120-second CPR-cycle gate and require a rhythm check after the previous shock. Removed the arbitrary 15-second expiry; a changed rhythm invalidates the prior check. Electrical has a direct check-and-interpret action. The scene ECG button now explicitly pauses CPR and records the same check. Resume CPR promptly.
- Clock runs at 1.5x: 120 simulated seconds = 80 real seconds. Labs take 90 simulated seconds = 60 real seconds; duplicate orders do not reset the wait. These timing conversions are simulation design choices, not clinical laboratory turnaround standards.
- POCUS practice: move probe by touch or arrow buttons, adjust angle, capture an adequate synthetic window, then interpret. Cardiac and right anterior lung views; capture retains the finding. No automatic CPR pause. This simplified illustration does not teach real diagnostic image acquisition.
- CPR practice: adjust rate/depth and hold 100–120/min and 5–6 cm for 10 simulated seconds. Settings affect the existing simulated ETCO2 feedback; waveform capnography must be established to display it. ETCO2 alone does not validate CPR or guarantee ROSC. Practice results are unscored event records.
- Treatment drawer occupies its own column in landscape and sits below the scene in portrait, with scrolling. Calcium gluconate is at the top of Medications; indication safeguards retained.
- Required player name/study alias; named debrief; name and clock speed in JSON and CSV exports. Use study aliases where required by the research protocol.

## Verification
65 automated tests pass. Actual browser targeted Case1 replay on preceding candidate a8b0c4c0eb07 confirmed first and second delivered shocks, labs pending then ready, poor-position capture rejection, adequate capture, wrong/correct POCUS feedback, CPR rate160 ->110 and completed hold, and 'Well done, QA Learner!'. No artificial time/state injection. The unattended first part of that session is not a timing/performance benchmark.
Final build smoke: named start, medication placement, 1024x768 and768x1024 visual layout. No horizontal page overflow in portrait; drawer below scene. Final source changes after replay unified the scene ECG button with the tested analyze handler, retained captured POCUS findings, corrected right-lung target laterality, and added export metadata. Full Case1–5 browser replays were not repeated this pass. Physical iPad, expert clinical validation, and research acceptance remain pending.

## References
AHA2025 adult cardiac arrest algorithm: https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-ACLS-CA-Circular-250620.pdf

## Claude review focus
Review practice.js and tests/practice.test.mjs, clinical.js rhythm-check/shock/labs, app.js analyze/report/frame, and layout rules at end of style.css. Current POCUS is deliberately synthetic and CPR controls are team instructions, not measured psychomotor skills. No push or publication.
