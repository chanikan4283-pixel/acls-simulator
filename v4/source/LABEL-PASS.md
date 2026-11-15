# Team-label visual follow-up — 18 October 2026

Added screen-space packing for duty labels, fixed readable pixel size, leader lines to staff, offscreen hiding, and reserved upper/lower space for the room overlays. Dense views hide labels that cannot fit rather than overlap them; the Roles control still toggles the layer. No clinical or scoring edits.

47/47 automated tests passed, including crowded portrait/landscape geometry and tiny-view handling. Browser inspection:1024x768 overview and768x1024 airway, camera while paused, Roles toggle, no captured warnings/errors. Screenshots are ../acls-v4-labels-landscape.jpg and ../acls-v4-labels-portrait.jpg. These are browser viewport checks, not physical iPad results. Label positions can still change discretely as staff move or the camera rotates; further motion polish is possible.

New bundle SHA256:4370E4F7B8CB03D4FF0E6A957502F592F6A7611F31358FA0B8B6C0F88A1D17E0
Clinical.js SHA256 remains1B838407B04A47983ECB4552A4BE19406C8FDA310D517C2E3C1E60278256BC84. Prior replay and synchronization reports describe the earlier preview.5 bundle. Desktop synchronization for this follow-up is recorded below after it happens. No push/publish.

Desktop follow-up sync complete: six changed/new files verified by SHA256, plus QA report and this note. Previous scene/build/bundle backed up in work/desktop-before-label-pass. No concurrent edits found in the overwritten files.
