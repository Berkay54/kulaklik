# Media and Phase 1 validation

Source: public/media/headphones-exploded-scroll.mp4
Website media: public/media/headphones-exploded-scroll-scrub.mp4

## Encoding

H.264 High, yuv420p, CRF 10, slow preset, every frame independently seekable,
no B frames, fast-start moov atom. Original color metadata retained.
AAC packets copied; video dimensions, timing and all 240 frames retained.
No crop, scale, color filter, sharpening, frame interpolation or frame removal.

The movie duration header was restored to the source's 10.006 seconds after
FFmpeg rounded it down by 1 ms. Both files report 10.005 seconds to Chromium;
both video tracks are exactly 10 seconds long.

| Measurement | Original | Scrub |
| --- | --- | --- |
| Resolution | 1280 x 720 | 1280 x 720 |
| Video FPS | 24 | 24 |
| Video frames | 240 | 240 |
| Video timeline | 10.000 s | 10.000 s |
| Movie header duration | 10.006 s | 10.006 s |
| Chromium duration | 10.005 s | 10.005 s |
| Video timescale | 12288 | 12288 |
| Sample duration | 512 ticks | 512 ticks |
| First video timestamp | 0 | 0 |
| Last video timestamp | 9.958333 s | 9.958333 s |
| Keyframes | 1 | 240 |
| File size | 4,245,904 bytes | 27,064,681 bytes |

Source SHA-256 before and after encoding:
5f4ca2b63dbae9eedec0d6be81c322adae58102dc31abf0130a91d75d2827b93

Run the read-only metadata/hash checks:
node scripts/inspect-media.mjs

SSIM measured over all 240 decoded frames: 0.995477.
First frame: 0.999425. Last frame: 0.994427.
The identical source frame positions/content are retained, including the
first and last frames. This web-compatible H.264 re-encode is high quality,
but is not pixel-lossless. Original cropping within the source is retained.

## Browser performance

Measured in local Chromium, using actual seeked events while paused:

- Original, fully buffered, frequent seeks around 8 seconds:
  530-597 ms; the initial full-range test reached 643 ms.
- Scrub, after initial decode: 28-87 ms.
- Same 8-second sequence, scrub:
  65, 40, 87, 62, 39, 58, 45, 41 ms.
- The first seek on a newly loaded scrub element took 372 ms.
  The website loads the first frame before scrolling.
- Actual continuous forward/backward scroll test, 3.5 seconds per direction:
  137 presented frames, 50 ms median display interval, 67 ms 95th percentile.
  About 20 displayed updates per second on this test machine, not 60 fps.
- These are local measurements, not a guarantee for remote networks or devices.

## Website checks - current light redesign

- One 380svh section, one 100svh sticky stage, one video element.
- Desktop grid: 38% editorial text, 62% video. Mobile: text above video.
- Warm #F3EFE7 backdrop, charcoal type, transparent minimal navigation.
- Four requested copy stages; progress-driven fades and 8px vertical motion.
- Reduced motion removes vertical motion.
- Video mapping: hold 0-15%, scrub 15-80%, hold 80-100%.
- Video remains paused, muted, playsInline, metadata preload, controls absent.
- No autoplay, play() calls, zoom, camera changes, or CSS crop.
- object-fit: contain; source aspect ratio retained.
- Raw video rectangle: native aspect ratio, width 100%, height auto, object-fit contain. No masks, feathering, filters, transforms, borders, rounded corners, shadows or video overlays. Source framing remains unchanged.
- Forward and reverse checks across all four stages passed at 1440x900 and 390x844.
- First and final holds confirmed at currentTime 0 and 10.005.
- No horizontal overflow at desktop and mobile viewport sizes.
- Physical mobile devices have not been tested.
- Production build (including TypeScript), lint and media integrity checks pass.
- Original and scrub video hashes unchanged during this redesign.
- No new sections, commit or push.



## Latest desktop layout correction

- 36% editorial panel, 64% full-height media, shared 100svh sticky stage.
- Desktop video: 100% width and height, cover, object-position 56% center.
- Media reaches top, right content edge and bottom; only the vertical split remains.
- No media margin, padding, frame, effects, transform or scroll scaling.
- Assembled and exploded views visually inspected at 1440x900.
- Cover crops outer exploded components because the source aspect ratio differs
  from the tall panel. A contain/oversized positioning fallback cannot preserve
  all source pixels and eliminate all margins at this geometry.
- Original video and optimized video are unchanged; scrub/copy code unchanged.
- Forward/backward seek and copy checks passed; no horizontal overflow.
- Build (TypeScript + Vite) and lint pass.
