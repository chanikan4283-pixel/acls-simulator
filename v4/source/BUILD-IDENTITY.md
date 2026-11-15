# Build identity and research export traceability — 19 October 2026

Every new bundled session includes a `buildId` in the saved/JSON report and a `build_id` column in CSV. The debrief displays the same identifier. It fingerprints the included source, visual assets, vendor libraries and build pipeline, independently of the clinical release label. BUILD-MANIFEST.json records each input SHA256 and the generated play.html SHA256. It is a reproducibility aid, not an authenticity signature or research validation.

Reports loaded from older versions retain their historical data; a missing identity is shown as unrecorded, never assigned the current identifier. Running index.html directly is labeled unbundled-development because a built identity cannot prove the state of subsequently edited loose modules. Build again before distributing play.html. Archive the corresponding manifest with each approved study release. CSV consumers must use column names: build_id was added after version.

Verification:49/49 automated tests passed; syntax/build passed. Rebuilding unchanged inputs produced a byte-identical bundle. A real browser practice report was exported as JSON and CSV; JSON buildId and all3CSV event rows matched the manifest:fc00ed5a82474e46dbcb2a42cde59e1a3f56b6c384b7388903ba2a01800ce5f2. This was an intentionally ended test session, not a clinical case replay. Clinical.js remains SHA2561B838407B04A47983ECB4552A4BE19406C8FDA310D517C2E3C1E60278256BC84. No clinical or scoring changes. Evidence:../acls-v4-build-report.jpg.

Desktop synchronization status is recorded below. No push/publish.

Desktop sync complete:8changed/new files verified by SHA256. Pre-overwrite app/build/bundle matched the saved baseline; backup atwork/before-build-identity. No concurrent changes found in overwritten files. No push/publish.
