# AURA HX-01 design context

- Warm broken-white background: #F3EFE7.
- Charcoal type: #302E2A; secondary type: #726C62.
- Restrained system sans typography. Small uppercase eyebrows.
- Desktop: 38% editorial text, 62% product video, vertically centered.
- Mobile: editorial text above product video.
- One 380svh storytelling section with a shared 100svh sticky stage.
- Four copy stages at 0%, 25%, 50%, 75%, with small scroll-driven fades and 8px vertical movement.
- Video first-frame hold 0-15%, scrub 15-80%, final-frame hold 80-100%.
- Reduced motion removes the vertical text movement.
- Use only the existing scrub MP4. No playback, camera changes, zoom or CSS crop.
- Raw video rectangle: no masks, feathering, blending, visual transforms, filters, framing, shadows or overlays. Native aspect ratio; contain.
- Existing source framing clips parts of the product. Do not reconstruct or change the media.
- Tokens: src/styles/global.css.


## Current desktop correction

Desktop is now 36% editorial panel and 64% full-height media. Video fills the
right panel edge to edge using cover and object-position 56% center.
No transform, masks, filters, borders, shadows or overlays were introduced.
The tall panel crops outer exploded components from the 16:9 source.
Mobile keeps the existing stacked contain presentation.
