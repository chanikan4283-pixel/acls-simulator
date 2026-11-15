# Facial transition follow-up — 19 October 2026

Family mouth movement now uses a six-second response window after history is first requested, with onset/offset easing. Previously it continued for the rest of the scenario. Head nodding uses the same response window. Concern and mouth deformation approach their targets smoothly at the existing limited expression-update rate. Expression history resets when a new simulation session starts. Pausing freezes the visual clock; camera inspection remains available.

51/51 tests passed, including response-window bounds, no talking before history, no unresponsive-patient talking target, and concern targets. Scene syntax check passed. Browser smoke check:Case4 start/history, response elapsed, pause, patient camera and Roles toggle; no captured warnings/errors. The timing behavior is supported by unit tests; this is not a clinical or facial-animation expert validation. This remains restrained deformation of a shared scan, not differentiated identities or a complete eyelid rig.

Clinical engine SHA256 unchanged:1B838407B04A47983ECB4552A4BE19406C8FDA310D517C2E3C1E60278256BC84. Current bundle/source identity is in BUILD-MANIFEST.json. Before-edit source/bundle backup:work/before-expression-pass. No push/publish. Sync status follows after verification.

Desktop sync complete:7changed/new files matched SHA256. No concurrent changes found in overwritten files; backup retained. No push/publish.
