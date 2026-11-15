# Preview.5 review status / PI-REVIEW

Preview.5 functional release checkpoint. See PREVIEW5-REPLAY.md for dated browser evidence and the exact scope of each run. Art production, clinical approval and device acceptance remain separate outstanding work.

PI-REVIEW decisions:
- Electrical/mechanical pacing thresholds 60/80 mA are fictional case parameters. Real thresholds vary; verify perfusion rather than memorize output.
- Repeat-shock rhythm-check freshness window is 15 seconds for this teaching model, not a guideline-mandated timeout.
- Early opioid care delays the preserved megacode arrest from90 to180seconds, with a warning of coexisting conduction disease at135seconds. This scripted complication and the alternative of allowing prevention of arrest need PI approval.
- Rhythm identification and hints are recorded separately; no change to the100point rubric. Comfort reminders and low-pH bicarbonate teaching carry zero penalty.
- Repeat potassium and nephrology/dialysis planning are scenario-specific handover requirements, not universal AHA post-arrest rules.

Implemented: review items1–9 (item9 already had a stop route, now explicitly labeled termination discussion); item10 command assessment gates temperature fields; items11–12 scoring feedback/hint detail; item13 randomization and expansion to17 synthetic teaching strips; item14 ROSC cue/reassessment. Item5 intentionally retains100J initial narrow-complex cardioversion because the official2025 Electrical Cardioversion Algorithm specifies100J. Energy menu now exposes50/100/120/150/200J. Do not adopt the review's unverified50–100J suggestion.

Animation: removed scan shoulder fragments; replaced bulb-like disconnected neck with a tapered overlapping bridge; shortened neck/head position after visual inspection. Added frame-rate-independent body/head/limb pose transitions, with immediate safety-clear behavior. Two-person BVM roles and brief nonblocking pad/IV/airway placement transitions are implemented. Distinct face identities, integrated eyelids and medical review of technique remain outstanding.

Remaining beyond this local functional checkpoint:
- New ECG patterns are implemented and numerically tested; expert review of educational morphology remains outstanding.
- Glucose and seizure/EEG planning now follow the2025 post-arrest algorithm; no additional rubric points.
- Browser replay evidence is recorded in PREVIEW5-REPLAY.md; it distinguishes the Case1 pre-final-visual bundle from the rebuilt bundle. This is mixed-path functional coverage, not exhaustive branch coverage or clinical performance validation.
- Further all-angle anatomy/hand seal/pad review; distinct facial identities and eyelids. Placement transitions are implemented; procedural technique remains illustrative.
- Separate local app/source package is outputs/acls-v4, mirrored into Desktop v4 after verification. No push or publication in this pass.
- Physical iPad/Safari and independent clinical/PI validation remain unperformed.

Sources: AHA2025 Part9 Adult Advanced Life Support, Part10 Opioid Overdose/Hyperkalemia, Part11 Post-Cardiac Arrest Care; links in clinical.js and ACADEMIC-ANIMATION-REVIEW.md.

---
# QA report — 2026-10-16

## English update — 2026-10-18

Preview.3-en translates the full playable interface and case text. Source/bundle scan found no Thai characters in index.html, app.js, clinical.js, scene.js, ecg.js, manifest or play.html. Home selection was verified as only Case1–6; no rhythm/diagnosis labels. Case4 briefing, live completion/debrief and Case6 answer explanation were inspected in English. All18 engine tests pass; the clinical logic is unchanged by translation. Case6 is the existing ECG exercise, not an invented additional clinical scenario.

Status: functional educational preview; further visual/clinical/device validation remains.

## Confirmed

- All 18 engine tests pass in Node: clean initialization, no score farming, non-shockable shock prevention, dose/interval validation, shock interlocks, both arrest scenarios, 2025 post-ROSC targets, SVT conversion, bradycardia pacing/infusion alternatives, megacode/recurrent toxicity, pause/restart, CCF denominator, loss of pacing capture, persistent penalties, proper rhythm-check/shock sequence, separation of bradycardia versus naloxone infusion states, and no premature handover or repeated-airway complication scheduling.
- `node --check` passed for app.js, clinical.js and scene.js.
- Local browser loaded index.html with no captured error/warning logs in the inspected run.
- Live UI: Case 1 pulse→monitor→CPR; 3D room, facial model and chest-contact animation inspected.
- Live UI: Case 4 pads→pacing at 70 mA→pulse verification→expert/coronary care→handover successfully displayed completed debrief.
- Live UI: JSON export downloaded, then read from disk: scenario 4, completed true, 11 recorded events, version 4.0.0-preview.1.
- Live UI: ECG lab NSR answer produced correct explanation and enabled Next.
- Live UI: Case 2 completed at 01:04 (95 points, 97% simulated CCF), including labs and cause-directed treatment, then AHA 2025 post-care fields. An early glucose attempt before lab availability was rejected and later accepted.
- Live UI: Case 3 completed at 02:06 (100 points): assessment, vagal maneuver, adenosine, reassessment after deterioration, synchronized 100 J cardioversion, handover. Native drug/energy/sync dropdowns worked.
- New large cause buttons, timeline return to debrief, report close-to-home, and reloaded latest report with every rubric item and its points verified through UI.
- Live UI: Case 5 completed at 03:32 (87 points, 62% CCF): pacing, PEA, CPR/epinephrine, ROSC, recurrent toxicity, intubation-related scripted pneumothorax, decompression/drainage, naloxone/infusion and post-care. Early CPR/epinephrine while pulse was present were correctly rejected; delay after arrest was reflected in errors and CCF. This was a mixed valid/invalid action-path test, not a model clinical performance demonstration.
- Compact landscape monitor measured clientHeight=scrollHeight=592 at 1024×768; footer no longer requires scrolling in that viewport.
- Live UI: Case 1 completed at04:50,100 points,98% simulated CCF,first shock00:10,first epinephrine02:21. Three shocks separated by actual CPR intervals; explicit rhythm checks before shocks2/3 did not block indicated shocks. No time acceleration was used.
- Latest preview.2 visual check: revised head scale and bag-mask hand targets inspected; portrait monitor clientHeight=scrollHeight=270 at768×1024. Compact toolbar touch targets enlarged to44 CSS pixels. No captured browser error/warning logs in the final inspected run. Screenshots: ../acls-v4-preview2-landscape.jpg and ../acls-v4-preview2-portrait.jpg.
- Layout inspected at browser viewports 1024×768 landscape and 768×1024 portrait. Portrait monitor height adjusted after inspection. These are viewport checks, not iPad Safari/device performance tests.
- Original Desktop index.html is not edited by this build workflow. V4 is copied into a separate v4/ directory.

## Known limitations / remaining work

1. All five cases have at least one recorded browser completion across development builds. This is not exhaustive branch coverage: alternate clinical paths, research session standardization and regression playtests after future changes remain necessary.
2. Physical iPad Safari testing across old/new hardware and 60-minute heat/memory/performance tests are not performed.
3. The room and bodies are procedural. Detailed head scans are adapted CC BY assets. Full expressive facial rig, differentiated patient identities, continuous limb anatomy and all procedure animations still need production-art polish and medical review.
4. Some team-care actions are abstractions; airway/procedural steps and all cause-specific medication dosing are not fully simulated. This must be addressed in the intended learning blueprint before research use.
5. Individual clinical rules, scenario narrative mapping and the scoring rubric need expert/PI sign-off. No certification or research approval is claimed.
6. No remote research database, participant enrollment or follow-up scheduling is implemented. Local exports are intentionally separate from private research source documents.
7. V4 has not been deployed to GitHub Pages or another remote host yet. Localhost is only a computer preview.

## How to reproduce

Run `node --test tests/clinical.test.mjs`. Start the static server from README. For Case 4, assess pulse and attach monitor; attach pads in Electrical; set pacing output 90 mA/rate 70 (fictional scenario threshold); verify pulse; in Handover contact the coronary/expert team and submit. Open debrief and Export JSON. No artificial time acceleration is used for this UI run.

The engine's scripted recovery is a teaching convention, not a clinical outcome prediction. Preview.2 was rebuilt and synchronized to the separate Desktop v4 directory; play.html SHA256 matches workspace: 8B616114F1BECB18DAB4100138474834DBEC461924AD1EF648B07DFC82732198. Original Desktop index.html hash remains unchanged. Screenshot of revised debrief: ../acls-v4-debrief-proof.jpg.

## Preview.4-en verification — 18 October 2026

21 automated checks passed. Browser tested current optimized build: neutral Case1 briefing, start, CPR+BVM, pause, patient/overview camera, twelve 30-degree rotation button presses, zoom-out and role toggle. Paused timer stayed fixed. No captured console warnings/errors. At768x1024 monitor content/client height270px and no document horizontal overflow. Landscape1024x768 inspected. Touch pinch/drag implementation was code-reviewed but not verified on physical hardware. Full five-case UI completions belong to earlier builds; clinical regressions cover current version. New source syntax checked and standalone rebuilt. Artistic shortcomings remain in ACADEMIC-ANIMATION-REVIEW.md.


Preview.5 checkpoint:44 automated checks pass, including Claude follow-up allowing Case1 therapies from history OR labs OR confirmed cause. Actual browser Case4 completed00:11 score75 after65mA then90mA; Case2 completed01:38 score92 with early glucose rejection and temperature-field gating; Case3 completed01:35 score95 with early cardioversion rejection. These replays preceded final visual changes and the added hyperkalemia evidence predicate. Case5 early respiratory care delayed arrest and displayed conduction-disease warning; replay still in progress. No full final-build acceptance claim.

Visual pass: shortened tapered neck with overlap at jaw/torso, pose damping, brief pad/IV/airway placement transitions and a separate bag-squeeze assistant. An attempted eyeball overlay failed visual inspection and was removed before delivery. A proper integrated eyelid/facial rig is still needed.

## Final local preview.5 functional checkpoint

45/45 tests passed. Mixed correct/wrong browser paths completed for all five cases; see PREVIEW5-REPLAY.md for exact versions, observations, times and limitations. Case1 was carried over from the preceding preview.5 visual bundle; Cases2–5 were repeated after the final rebuild. The clinical engine was not edited during these replays. Do not characterize the long Case1 session as a performance benchmark. Final Case5 also covered the intubation/tension complication branch and recovery without mandatory naloxone during arrest.

Standalone play.html rebuilt; SHA256:3505C03D69DEF41CE844C51A1C21510122714E594CB32E7A32855E2242BB6FCD. Desktop sync verification is recorded in SYNC-VERIFICATION.md. Earlier checkpoint paragraphs above are historical, not current test totals. No push/publish.

## Team-label visual follow-up
Screen-space label packing and leader lines verified in landscape/portrait browser views;47/47tests pass. Clinical engine unchanged. Updated bundle and changed source/tests synchronized to Desktop with hashes checked. LABEL-PASS.md contains the new bundle hash and exact verification scope; prior replay/sync entries remain historical.

## Build identity follow-up — 19 October 2026
49/49tests pass. New JSON/CSV reports carry a source/asset build identity; real exports matched the generated manifest. Unchanged rebuild is byte-identical. Clinical engine unchanged. BUILD-IDENTITY.md documents scope and CSV column change; BUILD-MANIFEST.json supersedes historical bundle hashes for the current file.

## Facial transition follow-up — 19 October 2026
Fixed perpetual family speech, eased concern/mouth targets and session reset.51tests pass; browser history/pause/camera smoke check with no captured errors. SeeEXPRESSION-PASS.md; clinical logic unchanged, no full facial-rig or expert-validation claim.


## Latest cartoon rebuild
See [CARTOON-REBUILD.md](CARTOON-REBUILD.md) for the current art, character orders, staged airway workflow, 54-test result and exact verification limits. Older scan-head descriptions are historical.


## Gameplay clarity update
See GAMEPLAY-CLARITY.md for compact translucent controls, ECG interpretation, shock count, team readback/Voice toggle and neutral 5H/5T evidence review.

## CPR stance clearance — 19 October
Moved the compression clinician and step outside the bed edge; reduced forward torso offset. Side and patient camera views checked in browser, with chest hand contact retained and no captured console errors. Procedural simplified posture remains; not a physical skills validation.60 tests pass. No clinical logic change.


## Clock, investigations and interactive practice update
See [PRACTICE-UPDATE.md](PRACTICE-UPDATE.md) for the new shock-check workflow, 1.5x clock, delayed labs, CPR/POCUS practice, required player alias, and verification limits. Calcium gluconate is now at the top of Medications. Treatment controls sit beside or below the scene.


## ECG, sound and interaction update
See [ECG-INTERACTION-REVIEW.md](ECG-INTERACTION-REVIEW.md). Resume CPR is always available; Sound controls charge/shock/compression tones. Action panels replace the monitor; close to see vitals. The16-strip ECG bank excludes a standalone PEA card. CPR tap feedback uses real time; POCUS remains synthetic. Unsafe discharge triggers a comic safety restart.
