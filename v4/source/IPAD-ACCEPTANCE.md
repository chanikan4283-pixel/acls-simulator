# Physical iPad acceptance record — ACLS sim

Status: NOT YET EXECUTED. This worksheet is for actual device testing; desktop viewport checks do not count as completion. Use a device code, not participant names or patient data.

Build under review: 2b25c6575ee889eb6a07d86ff4dcdef000e1aa916ec4a02f338fb8944cc5ed54

Record device code, iPad model, iPadOS version, Safari version if available, screen orientation, graphics setting, test date, reviewer and entry method (hosted URL or local file). A localhost URL from the development PC cannot be opened as-is on a separate iPad. Publishing/network access is a separate step and has not been performed.

## Device coverage
Test the oldest/smallest supported participant device first, then a representative newer device. Use the same build for all comparisons. Record exclusions explicitly instead of claiming all iPads are supported.

| Check | How to exercise | Expected result | Result / evidence |
|---|---|---|---|
| Launch and identity | Open the supplied build; finish a short practice and inspect exported report | Same build ID as above; no blank canvas | Not tested |
| Orientation | Rotate landscape → portrait → landscape during practice | No lost actions, hidden primary controls or page overflow blocking care | Not tested |
| Touch | Tap each team button and a visible character; close/reopen a panel | Correct panel; one order per tap; room remains partly visible | Not tested |
| Orbit and pinch | Drag the room; pinch in/out; tap Overview | Camera changes smoothly; drag does not accidentally order treatment | Not tested |
| CPR/BVM | Start CPR and BVM; watch two full 30:2 cycles | Coordinated compressions/breath pauses; no freeze or detached hands | Not tested |
| Advanced airway | Start intubation; pause mid-sequence, resume | No early completed-airway status; completion occurs once after resume | Not tested |
| Hands clear | Charge with CPR, then clear and shock | Staff withdraw; shock count increases only after delivered shock | Not tested |
| ECG selection | Attach monitor and use Pause & interpret ECG in both practice modes | Six-second strip readable; record whether guided coaching reveals an answer before selection; selection recorded; scene monitor remains visible | Not tested |
| Cause review | Mark two 5H/5T items; switch panels and return | Selections retained; no automatic diagnosis or score from checklist | Not tested |
| Voice | Enable voice; give accepted and rejected orders; turn voice off | Audible English readback, accurate outcome, mute works; no overlapping backlog | Not tested |
| Interruptions | Switch apps/lock screen, return after one minute | Practice paused; no elapsed clinical-time jump; deliberate resume | Not tested |
| End/cancel | End while airway animation is pending | No later completion or stale team action | Not tested |
| Export | Save JSON and CSV using Safari share/download UI | Files reopen; build, case, study alias and simulation-speed fields match the attempt | Not tested |
| Shared instrument bay | Open Electrical, Medications and ECG interpretation; close the panel; rotate device | Action panel replaces external monitor; scene is not covered; closing restores vitals; controls remain reachable | Not tested |
| CPR after shock | Deliver a safe shock; press Resume CPR now, then scene Resume CPR twice | CPR starts immediately, stays active on repeated resume, and next-cycle timer advances | Not tested |
| Second shock | Complete 120 simulated seconds of CPR, pause/check rhythm, charge, clear and shock | Shock counter advances to2; no arbitrary rhythm-check expiry; unsafe conditions remain distinguished | Not tested |
| Clock and labs | Time a fresh lab order with an external stopwatch, including a deliberate pause |90simulated seconds takes about60real seconds while running; pause freezes countdown; duplicate order does not reset it | Not tested |
| Pacing image | In Case4 use low output, then capture output; change pacing rate | Stimuli follow selected rate; low-output display has independent slow intrinsic complexes; capture shows stimulus before each wide QRS; pulse verification still required | Not tested |
| ECG lab | Review all16strips on smallest screen and rotate | Stimuli not clipped or lost; AF irregularity visible; narrow QRS recognisable; labelled grid/gain readable; no standalone PEA card | Not tested |
| CPR tap challenge | Tap slowly, rapidly and at100–120/min; pause/resume; adjust depth | Rate feedback and combo respond in real time; pause does not corrupt first resumed tap; depth explicitly remains a simulated slider setting | Not tested |
| POCUS touch | Move/nudge probe, adjust angle/gain, capture then interpret; try wrong finding | Probe follows touch; poor window rejected; captured finding retained; team care continues; no touch scrolling conflict | Not tested |
| Sound | Enable Sound; charge, shock and run CPR; mute during play | Rising charge tone, short discharge sound and real-time compression beat audible; mute works; record actual loudness and iPad silent-mode behavior | Not tested |
| Unsafe-shock restart | Charge and press shock without Clear | Comic safety event, no clinical shock credit; same case restarts after5real seconds with clean state and same alias; last safety report retained | Not tested |
| Sustained play | Play 15 minutes using Standard, then Low if needed | No crash; controls remain responsive; record heat/battery or slowdown observations | Not tested |

For each failure record: build ID, device code, case, exact steps, expected/actual behavior, screenshot/video if appropriate, and whether it repeats. Do not enter identifiable participant details in gameplay notes.

## Clinical / research acceptance (separate reviewer)

- Review the preserved five scenarios and ECG lab against original research objectives and AHA 2025 sources listed in the app.
- Review scripted ROSC requirements, cause-validation rubric and point weights as simulation/research conventions, not claims that those actions guarantee a clinical outcome.
- Check correct and deliberately incorrect treatment paths, drug units/routes, rhythm interpretation feedback, mechanical versus electrical capture, and post-ROSC targets.
- Review the 4.8-second airway sequence and procedural character poses as simplified illustrations. Do not approve these as manual procedural-skills instruction without separate review.
- Check whether team voice/readback, hints, practice mode and the neutral cause checklist influence the study outcomes; standardize the study configuration before collecting participant results.
- Review1.5x scenario time,90-second simulated lab wait, real-time tap/metronome timing, synthetic POCUS, and comic unsafe-shock restart for suitability in the research protocol. Specify which are enabled and how safety restarts affect attempt counting.
- Record reviewer role, date, build ID, decisions, required corrections and acceptance scope. No clinician or PI acceptance is implied by automated tests.

Acceptance decision: Pending. Outstanding issues: Pending review. Next build to retest: __________.
