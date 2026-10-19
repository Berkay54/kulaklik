# AURA HX-01 design context

- PHASE 1 / Hero is locked. Do not modify Hero structure, video, navigation, copy, typography, positioning, CSS, overlay, animation, height, stacking, or responsive rules. Hero TSX SHA256: 189f8fc94ee5630b7c9bbee5672bbbb4e6383636453b5a2afe8e508695c1500e; CSS SHA256: 9ff4a439929efa5f30eff4a77e7dad7705cce54bd079b04af71b7855199e51d9.
- App renders Hero followed by PhaseTwo as direct sibling sections under main, in ordinary document flow. No shared sticky wrapper, takeover, overlap, negative margins, mask or transition.
- PhaseTwo alone is 300svh with its own 100svh CSS sticky stage. Hero remains a normal-flow sibling and leaves the viewport before PhaseTwo sticks. No ScrollTrigger pinning.
- PhaseTwo uses the existing verified /media/hero-headphones-scrub.mp4, preload auto, muted, playsInline, no autoplay or controls. Its own ScrollTrigger maps 0-8% first hold, 8-92% scrub, 92-100% final hold.
- Video seeking uses refs and a single RAF-scheduled decoder request, quantized to verified 30fps frames with exact first/final endpoints. No catch-up interpolation or per-scroll React state.
- PhaseTwo visual direction: warm neutral #d5cec2 canvas, 62/38 desktop composition with source-framed contain video on the left and industrial catalogue typography/specification rules on the right. Media edges blend into the canvas without a card, border or shadow.
- Four editorial states and five SVG component annotations use a paused composition timeline driven by the existing PhaseTwo progress. No extra ScrollTrigger. Anchor points, fine line draws and labels reveal sequentially; mobile shows only driver, ANC and cushion annotations.
- The actual source reassembles at its end. Internal callouts fade during reassembly to avoid pointing at concealed parts; cushion/hinge labels can remain. Annotation anchors follow approximate visible component regions and are not CAD tracking.
- Working scrub mapping, RAF seek implementation, optimized media and 300svh/100svh CSS sticky architecture unchanged. Hero TSX/CSS unchanged. Product above editorial on mobile; reduced motion keeps fades without text displacement. No Phase 3.
