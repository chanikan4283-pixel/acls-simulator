# Preview.5 replay evidence — 18 October 2026

Manual browser replays used the local HTTP preview and ordinary UI actions, without injecting simulation state or accelerating the clock. These are mixed correct/incorrect functional paths, not demonstrations of ideal resuscitation performance or exhaustive coverage of every branch.

| Case | Observed successful path | Deliberate wrong path / guard | Completion |
| --- | --- | --- | --- |
| 1 | History-supported calcium gluconate before cause picker; three shocks separated by CPR; epinephrine, amiodarone, cause assessment; ROSC, pulse/commands, repeat potassium, dialysis plan and post-care | Repeat shock without fresh rhythm check rejected; accepted after reassessment | 303:23, 100 points, 80% CCF. Session was left running across work interruptions; these timing metrics are unsuitable as clinical performance evidence. |
| 2 | Pulse/monitor, CPR/BVM, IV, epinephrine, history/labs, metabolic cause, glucose/fluids, post-care | 10 mg epinephrine rejected; 1 mg accepted | 01:21, 87 points, 63% CCF |
| 3 | Pulse/monitor, vagal maneuver, adenosine 6 mg, subsequent synchronized 100 J conversion and handover | Cardioversion while stable rejected | 01:15, 85 points; reassessment happened at the deterioration boundary and did not earn its rubric item |
| 4 | Pads, 65 mA electrical capture with intrinsic pulse 32/min and BP 75/40; then 90 mA, pulse verification, expert care | Handover with only electrical capture rejected | 00:14, 75 points; omitted optional rubric items remain visible |

| 5 | Pulse/monitor/history, BVM, patch removal, IV and pacing; scripted PEA at90s, CPR/epinephrine, ROSC without naloxone; intubation, examination, decompression/drainage, recurrent-toxicity treatment and infusion, post-care | CPR with pulse, premature handover, decompression before indication, and incomplete temperature targets rejected | 03:15,90 points,66% CCF; first epinephrine01:40 |

Case 1 ran the preceding preview.5 bundle with the same clinical engine; Cases 2–5 ran the rebuilt bundle including final BVM anchors, camera and label changes. Earlier preview.5 runs additionally covered Case 2 early glucose rejection and independent rhythm interpretation, Case 3 reassessment credit, and Case 5 early respiratory care delaying the scripted arrest to 180 seconds.

Visual inspection of the rebuilt airway camera confirmed two staff roles, mask/bag hand targets, overlapping head/neck connection, and duty labels. Evidence: ../acls-v4-preview5-airway.jpg. The figures remain stylized procedural anatomy; labels can overlap at crowded angles. Distinct facial identities, integrated eyelids and expert review of hand technique remain outstanding. This is not physical iPad/Safari validation.

Final verification:45/45 automated tests passed; syntax checks passed for app, clinical, scene, pose, trainer and ECG modules. Playable source and bundle scan found no Thai text. No captured browser warnings/errors in the final inspected run. Saved final Case5 debrief: ../acls-v4-preview5-debrief.jpg. Desktop file:// rendering was not browser-tested; synchronization is verified by file hashes. No push or publication.
