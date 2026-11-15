# Cartoon character and team-order rebuild — 19 October 2026

Replaced rendered scan heads with original procedural cartoon characters: joined head/neck, proportioned jaw and limbs, eyes with eyelids, brows and brief family expressions. Patient legs and gown were resized; the pillow is removed. Staff have clinical caps; the family member does not. Pose damping and approaching hand targets soften movement into CPR and ventilation.

Tap a character or its role label to open team orders. The persistent Compressions, Airway, Medications and Family / History buttons provide an alternative when a character is occluded. Roles toggles floating labels; team buttons remain available. Drag the room to orbit, pinch to zoom, or use camera controls.

Airway orders: establish bag-mask ventilation, then choose Intubate. A nonblocking Prepare airway → Place tube → Confirm waveform sequence runs before the existing clinical engine records the advanced airway. Duplicate orders are rejected. Pause and hands-clear hold the sequence; leaving or ending the case cancels it. The 4.8-second sequence is a presentation convention, not an actual procedural duration or a manual intubation tutorial.

## Verification
- 54 automated tests passed, including queue completion once, duplicate rejection, pause/clear hold and session/end cancellation; existing clinical tests passed.
- Browser: actual click on the airway clinician opened its order panel; BVM and staged intubation completed with visible waveform-capnography status. Repeated CPR + airway workflow on final build in Case 1; prior Case 4 smoke check.
- Browser layouts visually inspected at 1024×768 and 768×1024. These are viewport checks, not physical iPad/Safari validation.
- No captured browser warning/error during smoke checks. Full five-case replay from PREVIEW5-REPLAY.md predates this art rebuild; it is not claimed as a fresh replay.
- clinical.js unchanged. No push or publication.

## Limits / further review
Procedural stylized art, not motion-captured or AAA animation. Clinical procedure motions are simplified; intersections and hand placement across every orbit angle still need dedicated art review. The scene is not validated as an intubation skills demonstration. Physical iPads, clinician/PI acceptance and the research rubric remain external acceptance work. Archived scan assets and their licenses remain in the folder but are no longer loaded or bundled.

Use BUILD-MANIFEST.json for the exact playable build identity. Claude should review scene.js, procedure-flow.js, app.js, style.css, index.html, build.mjs and tests/procedure-flow.test.mjs. Backups are in work/before-cartoon-source and work/before-cartoon-desktop in the Documents workspace.
