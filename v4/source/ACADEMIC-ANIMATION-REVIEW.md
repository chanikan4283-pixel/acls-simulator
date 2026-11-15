# Academic and animation self-review — 18 October 2026

Scope: implementation self-review, not independent clinical validation. Sources are AHA 2025; no clinical credential or sign-off is implied.

## Source-linked decisions

- [Adult cardiac arrest algorithm, 2025](https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-ACLS-CA-Circular-250620.pdf): compressions 100–120/min, full recoil, minimized interruptions; 30:2 before an advanced airway, continuous compressions with one breath every six seconds after it. The shared motion clock now separates compression and ventilation phases. Four seconds for two breaths is a simulation choreography choice.
- [Adult BLS, 2025](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support): breath animation rises over approximately one second, followed by expiration. This is not a measured tidal volume or mask-seal assessment.
- [Adult ALS, 2025](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support/): retained shockable/nonshockable pathways, reassessment and medication checks. Existing regression tests exercise representative branches, not every possible clinical sequence.
- [Special circumstances, 2025](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-and-pediatric-special-circumstances-of-resuscitation/): effectiveness of calcium, bicarbonate and insulin/glucose during hyperkalemic arrest is uncertain. Current cases do not make calcium or bicarbonate a universal hidden success requirement.
- [Post-arrest care, 2025](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/post-cardiac-arrest-care/): retained target validation and rejection of outdated 24-hour temperature-control selection; requires separate instructor review in the context of the scenario.

## Changes and evidence

- Renamed game ACLS sim. English case selection remains Case 1–6.
- Added unconstrained horizontal orbit, bounded elevation/zoom, touch drag/pinch handling and button alternatives. Pause freezes clinical time while allowing camera inspection.
- Added role/action billboards for compressions, airway, medications/defib and family/history. They hide outside play and can be toggled.
- Repaired scan neck fragments and cap height; added subtle concern/speaking deformation, head poses and a compressor step. Bodies remain procedural.
- CPR/BVM phases share one clock with ECG artifact, metronome and CCF. Ventilation pauses are excluded from measured simulated compression time. Advanced airway uses continuous compressions and 10 breaths/min.
- 21 automated tests pass, including cycle boundaries, two inspirations, airway transition behavior, clearance, subdivision invariance, pause and previous clinical regressions.

## Unresolved limitations

- Faces reuse one licensed scan. Eye opening/blinking and patient-specific identities are not complete; procedural emotion is subtle rather than cinematic facial animation.
- Clinical actions such as IV placement and intubation still abstract procedure detail. Visual positioning is not a hands-on skills validator.
- Outcomes/timings are scripted. Exact four-second ventilation windows and success thresholds are game design, not medical predictions.
- No physical iPad/Safari, clinician, PI or research-instrument validation has occurred. Earlier browser case completions do not prove every branch.
- Local file tab could not be inspected by the browser tool; HTTP preview and file hashes are distinct evidence.

Next work: differentiated face rig/eyes; integrated anatomical character meshes; procedure transitions; original-scene/rubric review; physical-device acceptance and publication of the separate V4 app.
