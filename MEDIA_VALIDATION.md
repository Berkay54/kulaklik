# Current PhaseTwo visual composition validation

Hero TSX/CSS hashes still match the locked clean versions. App sibling structure,
PhaseTwo 300svh section / 100svh CSS sticky stage, optimized media, 8-92% scrub
mapping and RAF/currentTime seek implementation remain unchanged. The only
addition to the existing progress update is driving a paused composition
timeline; there is still one ScrollTrigger. No per-scroll React state.

PhaseTwo uses a warm neutral 62/38 product/editorial layout, contained media,
four editorial states, a ruled specification list and staged SVG callouts.
Internal callouts fade as the unchanged source reassembles; visible exterior
labels remain. Source framing is retained, including its existing edge clipping.
Anchors identify approximate visible regions, not precise tracked CAD parts.
Mobile reduces annotations to three, with product above editorial.

1440x900, 390x844 and 375x667 layouts were visually inspected. Forward/reverse
progress checks pass through all text states, callout build/reversal, first/final
video times, and return-to-initial state. No console errors or horizontal
overflow. Reduced motion removes text movement. Build/TypeScript and lint pass.
Local five-second forward/backward sweep: 603 seeks, 3ms median, 12ms p95, zero
observed main-thread long tasks. These are local measurements, not physical
mobile or fixed-FPS guarantees. No commit, push or Phase 3.

The following earlier validation records are historical.

---

# Current PhaseTwo scrub validation

Hero is locked and its TSX/CSS hashes match the clean pre-Phase-2 versions.
App still renders Hero and PhaseTwo as direct siblings under main.
PhaseTwo alone is 300svh with its own CSS sticky 100svh stage. Its own
ScrollTrigger supplies progress, never pins, and never references Hero.
The verified all-intra hero-headphones-scrub.mp4 is used with preload auto;
the original source remains untouched. First hold: 0-8%, scrub: 8-92%,
final hold: 92-100%. Text and video presentation are static.

Desktop 1440x900 and mobile 390x844 tests verified normal Hero exit, adjacent
non-overlapping sections, sticky stage top 0 only after PhaseTwo entry, paused
video with changing time, exact first/final endpoints, natural reverse seeking,
no horizontal overflow, and no console errors. No per-scroll React state.
A five-second continuous forward/backward mobile-viewport scrub completed
407 seeks, with 6ms median seek latency and 17ms p95. Measurements are local,
not a fixed-FPS guarantee or a physical-device test. Build (including tsc -b)
and lint pass. No commit or push.

The following historical media-pipeline evidence remains useful for encoding
and source verification. Its former takeover/runtime description is superseded
by the independent sibling structure above.

---

 Hero takeover and scrub media validation

## Media pipeline

Original retained unchanged: public/media/hero-headphones.mp4.
SHA-256: 7b22b0802e02641cff0291d6a3a033ceab97762d4025a8ae8f023b20e39bd005.

Optimized output: public/media/hero-headphones-scrub.mp4.
H.264 High, yuv420p, BT.709 limited range, CRF 12, fast preset, GOP 1,
no B-frames, no audio, faststart. No crop, resize, retiming, interpolation,
or frame removal. Every original presentation timestamp and sample duration
matches. This is a high-quality lossy encode, not pixel-lossless.

| Measurement | Source | Optimized |
| --- | --- | --- |
| Resolution | 2560 x 1440 | 2560 x 1440 |
| FPS | 30 | 30 |
| Decoded video frames | 541 | 541 |
| Video duration | 18.033333 s | 18.033333 s |
| First presentation timestamp | 0 s | 0 s |
| Last presentation timestamp | 18 s | 18 s |
| Keyframes | 4 | 541 |
| GOP | 150 frames / 5 seconds | 1 frame |
| Video bitrate | 14.657 Mbps | 51.294 Mbps |
| File bytes | 33,511,717 | 115,628,503 |

The source container is 18.041995 s because of its audio tail. With irrelevant
audio removed, the output container is 18.033333 s; the complete video timeline,
including the first and final frames, is identical.

FFprobe counted all 541 decoded frames in each file. All optimized packets are
sync samples. The optimized moov atom precedes mdat. Complete packet PTS and
duration arrays match. SSIM across all frames: 0.996154; first frame 0.999334;
final frame 0.997408.

Reproduce:
- scripts/encode-hero-scrub.ps1 accepts a portable FFmpeg executable path.
- node scripts/verify-hero-scrub.mjs accepts a portable FFprobe path.
- Default tool paths are in ignored .tools; no build/runtime dependency added.

## Browser measurements

Local Chromium, fully loaded media, sequential paused currentTime seeks.

| Target time | Source seek ms | All-intra seek ms |
| --- | --- | --- |
| 1 | 54 | 4 |
| 5 | 20 | 5 |
| 10 | 39 | 5 |
| 16 | 68 | 8 |
| 17.9 | 125 | 9 |
| 14 (reverse) | 154 | 9 |
| 9 (reverse) | 125 | 11 |
| 4 (reverse) | 103 | 18 |
| 0 (reverse) | 10 | 21 |

Foreground continuous six-second forward/backward scroll test after optimization:
645 completed seeks, 4 ms median seek, 16 ms p95, 8 ms median seek-completion
interval, zero observed main-thread tasks above 50 ms. These are local decoder
measurements, not a claim of a fixed playback frame rate or remote/mobile speed.
The source animation itself is 30 fps.

Automated small high-frequency wheel deltas, larger wheel notches, rapid
direction changes, repeated scrubs, exact first/final frame holds, and stopping
at a target passed. Physical trackpad hardware and physical mobile devices
were not tested. The MP4 results do not justify a frame-sequence fallback
for this local environment, so none was implemented.

The all-intra file is 115.6 MB: preload=auto starts buffering on initial mount,
with one media instance and no autoplay. The larger transfer is the tradeoff
for high-quality all-intra random seeking.

## Scene composition and scroll implementation

One 440svh scroll range contains one sticky 100svh viewport. Hero and engineering
are absolute layers inside it. There is no inter-section spacer, grey media
letterbox band, panel slide, or exposed page background.

- Opening Hero holds through 12% of the overall scroll range.
- Feathered right-side mask takes over from 12% through 32%.
- Hero UI fades out first, with only 24px movement.
- Engineering copy enters only during the last 16% of the handoff.
- After 32%, the engineering sequence owns the viewport; its local progress
  retains the 0-12% first-frame hold, 12-88% scrub, 88-100% final-frame hold.
- Hero remains underneath during takeover and returns naturally on reverse.
- Both scenes use edge-to-edge imagery; cover eliminates the previous grey
  letterboxing. Tall mobile viewports crop more of the wide source.
- Reduced motion uses a crossfade and no text displacement.
- Hidden scenes are inert. Large text blocks do not compete during handoff.
- Hero files and product copy/typography are unchanged.

ScrollTrigger calculates target time; refs retain target, requested time,
video element, and RAF id. One outstanding seek is allowed. Targets are clamped,
quantized to verified 30fps frame timestamps, with exact 0/duration endpoints.
Sub-frame and redundant assignments are suppressed. No catch-up easing,
fastSeek keyframe approximation, per-scroll React state, raw scroll handler,
or perpetual animation-frame loop is used.

Build, lint, media verification, desktop/mobile overflow, sticky bounds,
console, reduced-motion, and reverse takeover checks pass. No commit or push.
