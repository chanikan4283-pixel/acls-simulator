# 4.0.0-preview.3-en — 2026-10-18

- English throughout the playable interface, patient histories, examination findings, feedback, hints, guide, ECG explanations and debrief/export event text.
- Home screen shows only Case 1–6, with no diagnosis or rhythm labels. Original clinical cases remain 1–5; the existing ECG exercise is Case 6.
- Briefing headings and the active case header no longer reveal diagnosis labels; case-specific objectives remain in the debrief.
- Includes the preceding visual pass: folded drapes, elbow/knee joint continuity, connected bag-mask equipment and a separate advanced-airway tube display.
- All 18 engine tests pass. Live English Case 4 completion and numbered home screen verified.

# 4.0.0-preview.2 — 2026-10-16

- Larger touch buttons for working-cause selection, explicit confirmation and visible selected state.
- Debrief reflects each case's complete scoring rubric, with item points; timeline returns to debrief; dismissing a final report returns to the practice room.
- Compact monitor fits the 1024×768 landscape browser viewport without scrolling.
- Head proportions adjusted; airway clinician hand targets follow the bag and mask; asset attribution is available inside the guide.
- Fixed a rhythm-check timer reset that wrongly prevented the next shock after an adequate CPR interval.
- Separated bradycardia infusion support from naloxone infusion planning.
- Pending Megacode teaching complications prevent premature completion; repeated advanced-airway commands do not schedule duplicate complications.
- 18 engine regression tests pass. Actual browser completions and remaining verification are recorded in QA-REPORT.md.

This release remains an educational preview. Realistic anatomy/expression work, clinical expert review and physical iPad testing remain unfinished. No research source documents or participant information are included.

## 4.0.0-preview.4-en — 18 October 2026

Renamed ACLS sim. Added 360 orbit/zoom gestures and buttons, duty/action labels, pause-compatible camera inspection, face/neck/cap refinement, subtle facial deformation and team poses, and compressor step/alignment. Shared CPR/BVM choreography now uses 30:2 before advanced airway and continuous compressions with 10 breaths/min afterward; CCF excludes planned ventilation pauses. 21 regression checks passed. English and home Case1–6 retained. Added START-HERE, Claude handoff and academic/animation self-review.

## 4.0.0-preview.5-en — Claude review functional checkpoint

Separated electrical/mechanical capture; fresh rhythm checks for repeat shocks; non-guided interpretation picker and debrief; early opioid-care branch and removal of mandatory arrest naloxone; zero-point comfort/bicarbonate teaching; evidence-based hyperkalemia orders and renal handover; command assessment before temperature questions; glucose/EEG planning; unscored action feedback; per-hint details; shuffled17-strip ECG lab and ROSC capnography cue. Retained100J initial narrow tachycardia cardioversion after checking AHA2025. Animation neck join and pose transitions improved, with two-person BVM illustration and brief equipment placement transitions.45 tests pass. See QA-REPORT.md for unfinished acceptance/art tasks; this is not clinical validation.


## Latest cartoon rebuild
See [CARTOON-REBUILD.md](CARTOON-REBUILD.md) for the current art, character orders, staged airway workflow, 54-test result and exact verification limits. Older scan-head descriptions are historical.
