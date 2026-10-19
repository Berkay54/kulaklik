import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './PhaseTwo.css'

gsap.registerPlugin(ScrollTrigger)

const stories = [
  { heading: <>PRECISION<br />IN EVERY LAYER</>, body: <>Acoustic, structural and electronic systems<br className="phase-two__desktop-break" /> engineered to work as one.</> },
  { heading: <>BUILT AROUND<br />THE DRIVER</>, body: <>A controlled acoustic chamber isolates<br className="phase-two__desktop-break" /> the detail that matters.</> },
  { heading: <>SILENCE,<br />ENGINEERED.</>, body: <>Adaptive processing and passive isolation<br className="phase-two__desktop-break" /> work together in real time.</> },
  { heading: <>ONE SYSTEM.<br />EVERY DETAIL.</>, body: <>A complete system shaped around sound.</> },
]
// Points use the full source frame, not the viewport crop. Internal labels
// withdraw during reassembly, when their components are no longer visible.
const annotations = [
  { id: 'driver', lines: ['40 MM', 'DYNAMIC DRIVER'], start: 0.25, internal: true, mobile: true, assembled: [465, 495], exploded: [460, 500], elbow: [460, 700], end: [450, 712], label: [450, 745] },
  { id: 'anc', lines: ['HYBRID', 'ANC ARRAY'], start: 0.42, internal: true, mobile: true, assembled: [730, 509], exploded: [680, 489], elbow: [745, 700], end: [805, 712], label: [805, 745] },
  { id: 'chamber', lines: ['ACOUSTIC', 'CHAMBER'], start: 0.58, internal: true, mobile: false, assembled: [290, 489], exploded: [230, 479], elbow: [155, 175], end: [40, 175], label: [40, 133] },
  { id: 'cushion', lines: ['MEMORY FOAM', 'CUSHION'], start: 0.62, internal: false, mobile: true, assembled: [410, 489], exploded: [345, 509], elbow: [220, 700], end: [60, 712], label: [60, 745] },
  { id: 'hinge', lines: ['ALUMINUM', 'HINGE'], start: 0.72, internal: false, mobile: false, assembled: [770, 369], exploded: [790, 299], elbow: [875, 125], end: [730, 125], label: [730, 84] },
]

export default function PhaseTwo() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTimeRef = useRef(0)
  const requestedTimeRef = useRef(Number.NaN)
  const rafRef = useRef(0)

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return
    let disposed = false
    let trigger: ScrollTrigger | undefined
    requestedTimeRef.current = Number.NaN
    const chapters = section.querySelectorAll<HTMLElement>('.phase-two__chapter')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const clamp = (value: number) => Math.max(0, Math.min(1, value))
    const handoffs = [[0.24, 0.39], [0.51, 0.66], [0.76, 0.91]] as const
    const nodes = annotations.map(annotation => ({
      ...annotation,
      group: section.querySelector<SVGGElement>('[data-annotation="' + annotation.id + '"]')!,
      anchor: section.querySelector<SVGCircleElement>('[data-annotation="' + annotation.id + '"] circle')!,
      path: section.querySelector<SVGPathElement>('[data-annotation="' + annotation.id + '"] path')!,
      labelNode: section.querySelector<SVGTextElement>('[data-annotation="' + annotation.id + '"] text')!,
      fittedElbow: [...annotation.elbow],
      fittedEnd: [...annotation.end],
    }))
    const buildComposition = () => {
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut' } })
      timeline.to({}, { duration: 1 }, 0)
      gsap.set(chapters, { autoAlpha: 0, y: reduce.matches ? 0 : 26 })
      gsap.set(chapters[0], { autoAlpha: 1, y: 0 })
      handoffs.forEach(([start, end], index) => {
        const duration = end - start
        timeline.to(chapters[index], { autoAlpha: 0, y: reduce.matches ? 0 : -22, duration: duration * 0.8 }, start)
        timeline.to(chapters[index + 1], { autoAlpha: 1, y: 0, duration: duration * 0.8 }, start + duration * 0.2)
      })
      nodes.forEach(node => {
        gsap.set(node.group, { opacity: 1 })
        gsap.set(node.anchor, { opacity: 0 })
        gsap.set(node.path, { opacity: 0, strokeDashoffset: reduce.matches ? 0 : 1 })
        gsap.set(node.labelNode, { opacity: 0, y: reduce.matches ? 0 : 4 })
        timeline.to(node.anchor, { opacity: 1, duration: 0.02 }, node.start)
        timeline.to(node.path, { opacity: 0.75, strokeDashoffset: 0, duration: 0.045 }, node.start + 0.015)
        timeline.to(node.labelNode, { opacity: 1, y: 0, duration: 0.045 }, node.start + 0.05)
        if (node.internal) timeline.to(node.group, { opacity: 0, duration: 0.08 }, 0.79)
      })
      return timeline
    }
    let composition = buildComposition()
    const updateComposition = (progress: number) => {
      composition.progress(progress)
      const active = handoffs.filter(([start, end]) => progress >= (start + end) / 2).length
      chapters.forEach((chapter, index) => chapter.setAttribute('aria-hidden', String(index !== active)))
      // The source opens and closes symmetrically around a long exploded hold.
      const spread = Math.min(clamp((progress - 0.08) / 0.34), 1 - clamp((progress - 0.73) / 0.19))
      nodes.forEach(node => {
        const x = node.assembled[0] + (node.exploded[0] - node.assembled[0]) * spread
        const y = node.assembled[1] + (node.exploded[1] - node.assembled[1]) * spread
        node.anchor.setAttribute('cx', String(x))
        node.anchor.setAttribute('cy', String(y))
        node.path.setAttribute('d', 'M' + x + ',' + y + ' L' + node.fittedElbow.join(',') + ' L' + node.fittedEnd.join(','))
      })
    }
    const stage = section.querySelector<HTMLElement>('.phase-two__stage')!
    const drawing = section.querySelector<HTMLElement>('.phase-two__drawing')!
    const fitAnnotations = () => {
      // Fit labels in stage-relative space, then convert back to the existing
      // SVG coordinates. Only endpoints move; component anchors stay intact.
      const stageRect = stage.getBoundingClientRect()
      const drawingRect = drawing.getBoundingClientRect()
      const scale = drawingRect.width / 1000
      if (!scale) return
      const top = (stageRect.top + stageRect.height * 0.07 - drawingRect.top) / scale
      const bottom = (stageRect.top + stageRect.height * 0.88 - drawingRect.top) / scale
      const lowerLineLimit = (stageRect.top + stageRect.height * 0.84 - drawingRect.top) / scale
      const left = (stageRect.left + stageRect.width * 0.05 - drawingRect.left) / scale
      const right = (stageRect.right - stageRect.width * 0.05 - drawingRect.left) / scale
      const gap = 12 / scale
      // Batch geometry reads before writing SVG attributes; never measure on scroll.
      const measurements = nodes.map(node => {
        const box = node.labelNode.getBBox()
        const baseline = Number(node.labelNode.getAttribute('y'))
        return { node, box, ascent: baseline - box.y, tail: box.y + box.height - baseline }
      })
      measurements.forEach(({ node, box, ascent, tail }) => {
        if (!box.width) return // Desktop-only annotations are hidden on mobile.
        const x = Math.max(left, Math.min(node.label[0], right - box.width, 1000 - box.width - gap))
        const lower = node.label[1] > 600
        const row = Math.max(top + box.height + gap, Math.min(node.elbow[1], lowerLineLimit, bottom))
        const y = lower
          ? row - gap - tail
          : Math.max(top + ascent, Math.min(node.label[1], bottom - tail - gap))
        const lineY = lower ? row : y + tail + gap
        node.fittedEnd = [x, lineY]
        node.fittedElbow = [node.id === 'driver' ? x - 80 : node.elbow[0], lineY]
        node.labelNode.setAttribute('x', String(x))
        node.labelNode.setAttribute('y', String(y))
        node.labelNode.querySelectorAll('tspan').forEach(span => span.setAttribute('x', String(x)))
      })
      updateComposition(trigger?.progress ?? 0)
    }
    const annotationResize = new ResizeObserver(fitAnnotations)
    annotationResize.observe(stage)
    annotationResize.observe(drawing)
    fitAnnotations()

    const seek = () => {
      rafRef.current = 0
      if (disposed || video.readyState < 2 || video.seeking) return
      const rawTarget = targetTimeRef.current
      // Verified 30fps all-intra media: skip redundant sub-frame seeks.
      // Preserve exact first and final time endpoints.
      const endpoint = rawTarget === 0 || rawTarget === video.duration
      const target = endpoint ? rawTarget : Math.min(video.duration, Math.round(rawTarget * 30) / 30)
      const threshold = endpoint ? 0.0001 : 1 / 120
      if (Math.abs(video.currentTime - target) <= threshold || requestedTimeRef.current === target) return
      requestedTimeRef.current = target
      video.currentTime = target
    }
    const scheduleSeek = () => {
      if (!disposed && !rafRef.current) rafRef.current = requestAnimationFrame(seek)
    }
    const update = (progress: number) => {
      const normalized = Math.max(0, Math.min(1, (progress - 0.08) / 0.84))
      targetTimeRef.current = Math.max(0, Math.min(video.duration, normalized * video.duration))
      scheduleSeek()
      updateComposition(progress)
    }
    const pause = () => video.pause()
    const onSeeked = () => { pause(); scheduleSeek() }
    const initialize = () => {
      if (disposed || trigger || !Number.isFinite(video.duration) || video.duration <= 0) return
      pause()
      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: self => update(self.progress),
        onRefresh: self => update(self.progress),
      })
      update(trigger.progress)
    }
    const onData = () => {
      initialize()
      if (trigger) update(trigger.progress)
    }
    const motionChange = () => {
      composition.kill()
      gsap.set(nodes.map(node => node.group), { clearProps: 'opacity' })
      composition = buildComposition()
      updateComposition(trigger?.progress ?? 0)
    }
    reduce.addEventListener('change', motionChange)
    video.addEventListener('loadedmetadata', initialize)
    video.addEventListener('loadeddata', onData)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('play', pause)
    pause()
    if (video.readyState >= 1) initialize()

    return () => {
      disposed = true
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      trigger?.kill()
      annotationResize.disconnect()
      composition.kill()
      reduce.removeEventListener('change', motionChange)
      gsap.set([...chapters, ...nodes.flatMap(node => [node.group, node.anchor, node.path, node.labelNode])], { clearProps: 'opacity,visibility,transform,strokeDashoffset' })
      pause()
      video.removeEventListener('loadedmetadata', initialize)
      video.removeEventListener('loadeddata', onData)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('play', pause)
    }
  }, [])

  return (
    <section className="phase-two" ref={sectionRef} aria-labelledby="phase-two-title">
      <div className="phase-two__stage">
        <div className="phase-two__folio" aria-hidden="true"><span>02 / ENGINEERING STUDY</span><span>HX-01 / ACOUSTIC SYSTEM</span></div>
        <div className="phase-two__product">
          <div className="phase-two__drawing">
        <video
          ref={videoRef}
          className="phase-two__video"
          src="/media/hero-headphones-scrub.mp4"
          muted
          playsInline
          preload="auto"
          aria-label="AURA HX-01 engineering, controlled by scrolling"
        />
            <svg className="phase-two__annotations" viewBox="0 0 1000 800" aria-hidden="true">
              {annotations.map(annotation => (
                <g key={annotation.id} data-annotation={annotation.id} className={annotation.mobile ? '' : 'phase-two__annotation-desktop'}>
                  <circle cx={annotation.assembled[0]} cy={annotation.assembled[1]} r="2.5" />
                  <path d={'M' + annotation.assembled.join(',') + ' L' + annotation.elbow.join(',') + ' L' + annotation.end.join(',')} pathLength="1" />
                  <text x={annotation.label[0]} y={annotation.label[1]}>
                    {annotation.lines.map((line, index) => <tspan key={line} x={annotation.label[0]} dy={index === 0 ? 0 : 22}>{line}</tspan>)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
        <div className="phase-two__content">
          <p className="phase-two__eyebrow">AURA / INTERNAL ARCHITECTURE</p>
          <div className="phase-two__story">
            {stories.map((story, index) => (
              <div className="phase-two__chapter" key={index} aria-hidden={index !== 0}>
                <h2 id={index === 0 ? 'phase-two-title' : undefined}>{story.heading}</h2>
                <p className="phase-two__body">{story.body}</p>
              </div>
            ))}
          </div>
          <ol className="phase-two__specifications" aria-label="HX-01 specifications">
            {['40 MM DRIVER', 'ADAPTIVE ANC', 'MEMORY FOAM', 'ALUMINUM FRAME'].map((spec, index) => (
              <li key={spec}><span className="phase-two__spec-number">0{index + 1} /</span><span>{spec}</span></li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
