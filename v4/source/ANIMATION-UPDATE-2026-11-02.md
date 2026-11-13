# Animation update — 2 November 2026
- Focused ultrasound now reports through the clinical action, without launching the animated probe minigame.
- Routine medication nurse arms remain lowered; adenosine retains its dedicated procedure.
- Raised, wider CPR platform; forward body-weight posture and straight arm segments; hands and torso track the chest displacement without stroke smoothing.
- Scene timing uses real seconds (default 110 compressions/min), including visible 30:2 pauses, independently of the 1.5x clinical scenario timer. Sound follows the visible compression/ventilation phase.
- Rebuilt play.html; 106 automated tests passed. Browser visual review could not be completed: localhost preview connection refused/timed out. Physical iPad and clinician review not performed.
- Reference: AHA 2025 Adult Basic Life Support https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support (100–120/min; at least 5 cm, avoid >6 cm; full recoil).

## Follow-up: grounded rig and classic technical type
- Replaced independent torso translation with a hip pivot at the upper-leg attachment; torso remains attached throughout CPR.
- Clinician remains planted on the platform, including idle and hands-off states. CPR start/stop blends the hand reach rather than switching instantly between arms.
- Bahnschrift / Avenir Next / Segoe UI typography throughout DOM and canvas; tabular data and restrained heading spacing. Uses locally available fonts, no online dependency.
- Build and 106 tests passed; browser policy blocks local file inspection, so visual review remains outstanding.

## CPR contact refinement
- Default/fresh/coached compressor cadence is 105/min in real visual seconds; the practice control still determines the displayed rate when learners adjust it.
- Sternum/front chest vertices depress locally, with the posterior surface fixed against the bed. Depth continues to follow the selected CPR depth, without exaggerated chest flattening.
- Stacked hand contact adjusted; elbows settle exactly onto the shoulder–wrist line after the reach transition.
