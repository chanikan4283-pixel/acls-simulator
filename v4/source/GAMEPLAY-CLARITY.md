# Gameplay clarity pass — 19 October 2026

- Smaller 100×22 floating role labels with shorter names and translucent backgrounds. Permanent team controls retain 44px touch targets.
- Smaller translucent treatment sheets keep part of the room visible; opening a team panel no longer changes the camera. Scrolling resets when changing panels.
- Persistent CPR status and delivered-shock count; electrical charging/ready status identifies the next shock number.
- Interpret ECG is available in both practice modes. The monitor does not print the rhythm answer in advance. Scheduled rhythm checks also open the interpretation choices. Feedback/scoring remains in the original engine.
- Team command readback and result captions, with browser English speech on by default and a Voice toggle. Medication readback includes dose/unit/route; shock completion includes number/energy. Rejected/paused orders do not claim completion. Charging and lab completion report back. Speech availability and sound quality depend on the browser/OS; physical iPad sound has not been tested. Rapid orders replace earlier spoken lines to avoid a growing audio queue.
- Neutral evidence review: all 10 H/T causes, all initially Not reviewed. Learners may mark Considering / Evidence supports / Less likely. These are unscored learner notes, retained across panels and included in JSON/timeline. They do not establish the diagnosis. Provisional explanation is collapsed and includes the same full list plus other systemic/rhythm explanations in every case. Original case validation and progression are preserved.

Source: AHA 2025 adult cardiac arrest algorithm https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-ACLS-CA-Circular-250620.pdf

Verification: 60 automated tests pass; syntax/build pass. Browser checked ECG-choice opening after monitor attachment, checklist retention across panel changes, real first shock counter/readback, CPR status and 1024×768 / 768×1024 layouts. This is targeted UI verification, not a new full five-case replay or physical-device/clinical validation. Clinical engine is unchanged. See BUILD-MANIFEST.json for exact identity. Backups: work/before-flow-pass and work/desktop-before-flow-pass.
