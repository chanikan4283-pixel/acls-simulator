# CPR posture and clear-view update

## References checked
AHA 2025 Adult BLS, sections 7.1–7.3 and 8: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support
- Hand heel on lower half to lower third of sternum, second hand overlapped.
- Torso approximately level with rescuer knees; firm supine support.
- Rate 100–120/min, depth at least 5 cm while avoiding >6 cm; full recoil, approximately equal compression/release time.
- Before advanced airway, 30:2; after advanced airway continuous compressions with appropriate ventilation.

## Implementation
- Default is 105/min and 5.2 cm. Practice adjustments and fatigue deliberately continue to show their actual values, including mistakes, instead of displaying ideal CPR while scoring poor CPR.
- Render clock is real-time, scenario clock remains 1.5x. Visible phase labels follow the scene. Fixed repeated 30:2 cycle phase restart.
- Increased rescuer scale and raised platform to place knees near chest height. Shoulder midpoint nearly over stacked hands in lateral view; straight elbows. Normal shoulder width means arms converge slightly in frontal view.
- Contact moved to lower sternum. Local anterior chest deformation follows selected depth; back remains fixed. No exaggerated depth to imply force.
- Commands occupy a dedicated side rail, replacing the expanded monitor while open; portrait puts controls below the scene. In-scene monitor remains.
- Settings → Font style: Classic technical, Humanist, System. Canvas labels also follow selection. Available local fonts determine exact glyphs; no network font download.

## Verification
Automated tests and bundle syntax checked. Browser visual QA remains blocked: local file denied by browser policy and both localhost ports timed out. No clinician or physical-iPad validation claimed.

## Latest user revision
- Font selection removed from game settings. FONT-OPTIONS.png is an external A/B/C specimen for approval; current Classic style remains until a choice is made.
- Default/fresh/coached CPR now 100/min, not 105/min. Existing rate/depth practice controls remain functional.
- Feet and raised platform moved outside the bed footprint. Forward pelvis motion uses connected thigh/knee/shin geometry; feet stay fixed on the platform.
- CPR view camera added to show hands, chest and platform.
- 109 tests passed. These are automated behavior checks, not clinician or visual validation.
