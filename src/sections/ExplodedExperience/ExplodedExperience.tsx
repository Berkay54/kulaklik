import { useEffect, useRef, useState } from 'react'
import Hero from '../Hero/Hero'
import { ScrollTrigger } from '../../gsap'
import './ExplodedExperience.css'

const clamp = (value: number) => Math.max(0, Math.min(1, value))

export default function ExplodedExperience() {
  const sequenceRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mediaError, setMediaError] = useState(false)

  useEffect(() => {
    const sequence = sequenceRef.current
    const video = videoRef.current
    if (!sequence || !video) return

    let targetTime = 0
    let raf = 0
    let disposed = false
    const panels = sequence.querySelectorAll<HTMLElement>('.experience-caption')
    const cue = sequence.querySelector<HTMLElement>('.scroll-cue')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Serialize decoder work and always seek to the latest scroll position.
    const seek = () => {
      raf = 0
      if (disposed || video.readyState < 2 || video.seeking) return
      if (Math.abs(video.currentTime - targetTime) > 0.0001) {
        video.currentTime = targetTime
      }
    }
    const scheduleSeek = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(seek)
    }
    const onSeeked = () => {
      video.pause()
      scheduleSeek()
    }
    const preventPlayback = () => video.pause()
    const update = (progress: number) => {
      const normalized = clamp((progress - 0.15) / 0.65)
      if (Number.isFinite(video.duration)) {
        targetTime = normalized * video.duration
        scheduleSeek()
      }

      // Short, progress-driven crossfades: reversing the scroll reverses the
      // transition immediately, with no delayed animation or React updates.
      panels.forEach((panel, index) => {
        const enter = index === 0 ? 1 : clamp((progress - index * 0.25) / 0.018)
        const exit = index === 3 ? 0 : clamp((progress - (index + 1) * 0.25) / 0.018)
        const opacity = Math.min(enter, 1 - exit)
        panel.style.opacity = String(opacity)
        panel.style.visibility = opacity > 0 ? 'visible' : 'hidden'
        panel.style.transform = reducedMotion.matches ? 'none' : 'translateY(' + ((1 - enter - exit) * 8) + 'px)'
        panel.setAttribute('aria-hidden', String(opacity < 0.5))
      })
      if (cue) cue.style.opacity = String(1 - clamp(progress / 0.1))
    }

    const trigger = ScrollTrigger.create({
      trigger: sequence,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: self => update(self.progress),
      onRefresh: self => update(self.progress),
    })
    const setup = () => {
      if (disposed || !Number.isFinite(video.duration)) return
      video.pause()
      sequence.dataset.ready = 'true'
      update(trigger.progress)
    }
    const onMotionChange = () => update(trigger.progress)

    video.addEventListener('loadeddata', setup)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('play', preventPlayback)
    reducedMotion.addEventListener('change', onMotionChange)
    update(trigger.progress)
    if (video.readyState >= 2) setup()
    video.load()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      trigger.kill()
      video.pause()
      video.removeEventListener('loadeddata', setup)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('play', preventPlayback)
      reducedMotion.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <section className="exploded-experience" id="experience" ref={sequenceRef} aria-label="AURA HX-01 acoustic architecture">
      <div className="experience-stage">
        <header className="masthead">
          <a className="wordmark" href="#experience" aria-label="AURA home">AURA</a>
          <span className="model-label">HX-01 / WIRELESS OVER-EAR</span>
        </header>
        <div className="story-composition">
          <Hero />
          <div className="product-environment">
            <video
              ref={videoRef}
              className="product-video"
              src="/media/headphones-exploded-scroll-scrub.mp4"
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              onError={() => setMediaError(true)}
              aria-label="AURA HX-01 headphones, assembled to exploded view, controlled by scrolling"
            />
          </div>
        </div>
        <span className={'media-status' + (mediaError ? ' media-error' : '')} role="status">
          {mediaError ? 'Video unavailable. Please reload to try again.' : 'Preparing the experience'}
        </span>
      </div>
    </section>
  )
}
